// подключение пакет пафз через константу. для корректного поиска точки входа
const path = require("path");
// `путь`=`требует`
// html выгр, подкл css, js
const HTMLWebpackPlugin = require("html-webpack-plugin");
// очистка выводной папки
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// копир файлов из корня в вывод
const CopyWebpackPlugin = require("copy-webpack-plugin");
// css + mini... css в отдельные файлы + loader
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// cssmini вывод - по документации
// ??? не раб - прибавляет очень много веса
// const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// cssmini вывод - по видео
const OptimizeCssAssetWebpackPlugin = require("optimize-css-assets-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
// analyzer подк. визуал размер кода
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

// пути в константу(QF3EcxymIcc)(для удобной смены во всем сразу)
// PATHS.src(dist) - ярлык. './src/'(./dist/) - изменяемая переменая
const PATHS = {
  src: path.join(__dirname, "./test ES4/"),
  dist: path.join(__dirname, "./dist/"),
  assets: "assets/",
};

// режимы разраб/продукт ч/з систем перем.
// $$ npm i -D cross-env - корректно задаёт системную переменную(разраб/прод). прописать в packege.json
const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

// перименовка файлов в зависимости от режима. более сложное для Prod для кэша
// const filename = (ext) => (isDev ? `[name].${ext}` : `[name].[hash].${ext}`);
// дополнил. при передаче ext, созд. идентич. папку и формат. ЛУЧШЕЕ для css, js
// const filename = (ext) =>
//   isDev ? `${ext}/[name].${ext}` : `${ext}/[name].[hash].${ext}`;

// fn для передачи объ. в optimization с проверкой на Prod
const optimization = () => {
  // объ. конфиг по умолчанию
  const config = {
    splitChunks: {
      // объедин/разъедин доп библ js (jQ, React). в один файл из 2х не связаных файлов
      chunks: "all", // async
    },
  };
  // е/и prod(true) в minimize добавл. cssmini а css объединяет в один файл
  if (isProd) {
    (config.minimizer = [
      // с видео
      // cssmini вывод
      new OptimizeCssAssetWebpackPlugin(),
      new TerserWebpackPlugin(),
      // с webpack документации
      // ??? не раб - прибавляет очень много веса, хоть и mini
      // new CssMinimizerPlugin(),
    ]),
      // CSS в один файл
      (config.splitChunks = {
        // объедин/разъедин доп библ js (jQ, React)
        chunks: "all", // async
        cacheGroups: {
          styles: {
            // путь/имя
            name: "styles",
            // убирает доп файл , хз что за js
            type: "css/mini-extract",
            // For webpack@4
            // test: /\.css$/,
            chunks: "all",
            enforce: true,
          },
        },
      });
  }
  // возращ по умолчан
  return config;
};

const filename = (ext) =>
  isDev ? `${ext}/[name].${ext}` : `${ext}/[name].[hash].${ext}`;

// убираем дубли loader в css, scss, less
const cssLoaders = (extra) => {
  // массив по умолчанию
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        // hmr: isDev,
        // reloadAll: true,
      },
    },
    // MiniCssExtractPlugin.loader,
    "css-loader",
  ];
  // если есть передаваемый параметр(extra) добовл. его в конце массива
  if (extra) {
    loaders.push(extra);
  }
  // возвращ умолч
  return loaders;
};

// убираем дубли babel options в JS, JSX, TS
const babelOptions = (preset) => {
  const opts = {
    presets: ["@babel/preset-env"],
    plugins: ["@babel/plugin-proposal-class-properties"],
  };
  if (preset) {
    opts.presets.push(preset);
  }
  return opts;
};

// eslint(анализ проблем в js коде) счас только для rules:js
const jsLoaders = () => {
  // по умолчанию. возращ массив
  // const loader = [
  const user = [
    {
      loader: "babel-loader",
      options: babelOptions(),
    },
  ];
  // е/и раработка, то добавл eslint
  if (isDev) {
    // user.push("eslint-loader");
  }
  // возвращ
  return user;
};

// analyzer(визуал размер кода) и plugin ч/з fn()
// описание plugin в plugins:стандарт + описание
const plugins = () => {
  const base = [
    new HTMLWebpackPlugin({
      minify: {
        collapseWhitespace: isProd,
      },
      chunks: ["main"],
      filename: `${PATHS.dist}index.html`,
      template: `${PATHS.src}index.html`,
    }),
    new HTMLWebpackPlugin({
      minify: {
        collapseWhitespace: isProd,
      },
      chunks: ["app"],
      filename: `${PATHS.dist}html/Catalog/Catalog.html`,
      template: `${PATHS.src}html/Catalog/Catalog.html`,
    }),
    new HTMLWebpackPlugin({
      minify: {
        collapseWhitespace: isProd,
      },
      chunks: ["app"],
      filename: `${PATHS.dist}html/Reference/Reference.html`,
      template: `${PATHS.src}html/Reference/Reference.html`,
    }),
    new MiniCssExtractPlugin({
      // filename: `${PATHS.assets}css/[name].css`,
      filename: filename("css"),
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        // {
        // from: path.resolve(__dirname, "./src/favicon.ico"),
        // to: path.resolve(__dirname, "dist"),
        // },
        {
          from: `${PATHS.src}fonts`,
          to: `${PATHS.dist}fonts`,
        },
      ],
    }),
  ];
  // analyzer подк. е/и Prod
  // if (isProd) {
  //   base.push(new BundleAnalyzerPlugin());
  // }
  return base;
};

// экспорт настроек плагинов объ., из док.(config)
module.exports = {
  // укажем где исходники. путает в fn(), PATHS, наборе имени
  // context: path.resolve(__dirname, "src"),
  // `режим разработки`
  mode: "development",
  // точка входа, начало сборки
  entry: {
    main: PATHS.src,
    // найдёт в src/js/indexReact.jsx. синтаксис ES6
    app: `${PATHS.src}js/indexReact.jsx`,
  },
  // точка вывода
  output: {
    filename: filename("js"),
    path: PATHS.dist,
  },
  // доп. узкие настр.
  // plugins(),
  //[
  plugins: plugins(),
  // ! е/и не нужен analyzer - раскомит `стандарт + описание` всё с [] один раз и закомит вызов fn()`plugins()` в analyzer для Prod
  // конфигурация модулей(загрузчиков)
  module: {
    // `правила` для модулей (настройка, параметры парсера и т. д.)
    rules: [
      {
        // для js. синтаксис регулярных выражений
        test: /\.js?$/,
        // исключ. папка node_modules
        exclude: /(node_modules)/,
        use: jsLoaders(),
      },
      // JSX
      {
        test: /\.jsx?$/i, // есть такой test: /\.(js|jsx)$/,
        // исключ. папка node_modules
        exclude: /(node_modules)/,
        // указ. webpack какой loader использовать
        use: {
          // загрузчик - babel (собирает jsx файлы)
          loader: "babel-loader",
          // в опциях доп. настр.
          options: babelOptions("@babel/preset-react"),
        },
      },
      // },
      // CSS (стили|4 варианта) {
      // обраб. ccs файлы с импортами и возвращает ccs код.
      // $$ npm i -D css-loader
      // CSS + mini{
      // для отдельных css файлов
      // $$ npm i --D mini-css-extract-plugin
      // +++ const MiniCssExtractPlugin
      // +++ plugins:[new MiniCssExtractPlugin()]
      // подкл. .css в src/.js
      // +++ import './test2.css';
      // подкл. css в html. не нежен с html плагин
      // +++ <link rel="stylesheet" href="./static/build/styles.css">
      {
        test: /\.css$/,
        // с fn() cssLoaders без дублей. ЛУЧШЕЕ!!!
        // use: cssLoaders(),s
        // стандарт
        use: [
          // без опций
          "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
        ],
      },
      {
        // sass/scss
        //test: /\.s[ac]ss$/i,
        // css, sass, scss
        test: /\.scss/,
        // с fn() cssLoaders без дублей. ЛУЧШЕЕ!!!
        // use: cssLoaders("sass-loader"),
        // без fn()
        use: [
          // 3. Создает узлы `MiniCss` из строк JS в файлы
          {
            // прямо указ какой loader
            loader: MiniCssExtractPlugin.loader,
            options: {},
          },
          // 2. Переводит CSS в обычный JS
          "css-loader",
          // 1. Компилирует Sass в CSS
          "sass-loader",
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        // use: ["file-loader"],
        // use не раб с options
        loader: "file-loader",
        // задаём имя
        // ??? не раб - только имя ../ работает, однако созд папку с файлом за dist
        // такой же файл как из CopyWebPlug., но при уник. имени созд ещё один
        options: {
          // без ничего только hash.png
          // name: '[name].[ext]', // файл в dist
          // name: '../[name].[ext]', // файл за dist
          name: "img/[name][hash].[ext]", // файл в img/ с hash. созд отдельный файл от копир.
          // name: '/img/[name].[ext]', // файл в img/
          // name: './img/[name].[ext]', // файл в img/
          // name: '../img/[name].[ext]', // парка с файлом за dist
          // name:`${PATHS.dist}img/[name].[ext]` // не раб - созд. двойной путь до папки от корня
        },
      },
      // },
      // xml {
      // устан. $$, подкл в js, добавл в файл
      // $$ npm i -D xml-loader
      //               {
      //                 test: /\.xml$/,
      //                 use: ["xml-loader"],
      // }
      // // },
      // // подкл. csv {
      // // устан. $$, подкл в js, добавл в файл
      // // $$ npm i -D csv-loader
      // // зависит от пакета papaparse который парсит csv в js
      // // $$ npm i -D papaparse
      // {
      //   test: /\.csv$/,
      //   use: ["csv-loader"],
      // }
      // },
    ],
  },
  // расшир/сокращ
  resolve: {
    // расшир. по умолч. чтоб не указыв. в import/export
    extensions: [".js", ".json", ".png"],
    // сокращение/пседвоним указ. на путь
    alias: {
      "@models": path.resolve(__dirname, "src/models"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  // доп настр. знач. можно передать через fn с проверкой на Prod
  optimization: optimization(),
  // ч/з fn() возращ. сгенерированый объ. ЛУЧШЕЕ!!!
  // optimization:
  //   // объектом
  //   {
  //     // выгружать библ(jQuery, ) в один файл из 2х не связаных файлов
  //     splitChunks: {
  //       chunks: "all",
  //     },
  //   },
  // подкл dev-server к webpack для живой перезагрузки
  devServer: {
    // порт для запуска. рекоменд 8081, реже 8080
    port: 8081, // 8080 // 4200,
    // только в разраб
    hot: isDev,
    // показ ошб. на экране а не в консоле
    overlay: true,
  },
  // показ в консоле исходный код файла. для разраб(isDev)
  // ??? не раб - при npm build прибавляет очень много веса объед. файлу js
  devtool: isDev ? "source-map" : "eval",
  // или
  // devtool: "eval-source-map",
  // пояснения {
  // eval - мини/строка, source-map - как есть + копия в мини, eval-source-map - рекомендуется
  // после запуска npm run build(start, ) появится app.js.map (мини версия при source-map)
  // source-map технология позволяет посмотреть в браузере какие файлы были подкл. к выходному файлу
  // }
};
