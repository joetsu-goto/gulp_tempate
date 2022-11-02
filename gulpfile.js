// gulp本体
const gulp = require("gulp");
const rename = require("gulp-rename");

// ejs関係
const ejs = require("gulp-ejs");
const fs = require("fs");
const replace = require("gulp-replace");

// sass関係
const sass = require("gulp-sass");
const dartSass = require("gulp-dart-sass");
const notify = require("gulp-notify");
const debug = require("gulp-debug");
const sassGlob = require("gulp-sass-glob-use-forward");
const csscomb = require("gulp-csscomb");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");

// webpack関係
const webpackStream = require("webpack-stream");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config");

// ローカルサーバー関係
const browserSync = require("browser-sync");
const plumber = require("gulp-plumber");

// 画像圧縮関係
const imagemin = require("gulp-imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");
const webp = require("gulp-webp");

const del = require("del");

// ファイルパス：コンパイル前
const srcJsonFiles = "./src/json/**/*.json";
const srcDataJson = "./src/json/data.json";
const srcEjsFiles = "./src/ejs/**/*.ejs";
const srcEjsPartial = "!./src/ejs/**/_*.ejs";
const srcScssFiles = "./src/scss/**/*.scss";
const srcTsFiles = "./src/ts/**/*.ts";
const srcImgFiles = "./src/img/**/*";
const srcImgFileType = "{jpg,jpeg,png,gif}";

// ファイルパス：コンパイル後
const destDir = "./dest/";
const destFiles = "./dest/**/*";
const destHtmlFiles = "./dest/*.html";
const destIndexHtml = "index.html";
const destCssDir = "./dest/css";
const destCssFiles = "./dest/css/*.css";
const destJsDir = "./dest/js";
const destJSFiles = "./dest/js/*.js";
const destImtDir = "./dest/img";
const destImgFiles = "./dest/img/*";

// EJSコンパイル
const compileEjs = (done) => {
    const data = JSON.parse(fs.readFileSync(srcDataJson));
    gulp.src([srcEjsFiles, srcEjsPartial])
        .pipe(plumber())
        .pipe(ejs(data))
        .pipe(ejs({}, {}, { ext: ".html" }))
        .pipe(rename({ extname: ".html" }))
        .pipe(replace(/^[ \t]*\n/gim, ""))
        .pipe(gulp.dest(destDir));
    done();
};

// sassコンパイル
const compileSass = (done) => {
    gulp.src(srcScssFiles)

        .pipe(
            dartSass({
                outputStyle: "compressed",
            })
        )
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>"),
            })
        )
        .pipe(sassGlob())
        .pipe(csscomb())
        .pipe(sourcemaps.init())
        .pipe(
            dartSass({
                outputStyle: "expanded",
            })
        )
        .pipe(
            autoprefixer({
                cascade: true,
            })
        )
        .pipe(sourcemaps.write("/maps"))

        .pipe(gulp.dest(destCssDir));
    done();
};

// TypeScriptをwebpackでバンドル
// const bundleWebpack = (done) => {
//     webpackStream(webpackConfig, webpack).pipe(gulp.dest(destJsDir));
//     done();
// };

// リロードするhtml
const reloadFile = (done) => {
    browserSync.init({
        server: {
            baseDir: destDir,
            index: destIndexHtml,
        },
    });
    done();
};

// リロード設定
const reloadBrowser = (done) => {
    browserSync.reload();
    done();
};

// 画像圧縮
const minifyImage = (done) => {
    gulp.src(srcImgFiles + "svg")
        .pipe(imagemin([pngquant({ quality: "65-80", speed: 1 }), mozjpeg({ quality: 80 }), imagemin.svgo(), imagemin.gifsicle()]))
        .pipe(gulp.dest(destImtDir));
    done();
};

// webP変換
const webpImage = (done) => {
    gulp.src(srcImgFiles + srcImgFileType)
        .pipe(webp())
        .pipe(gulp.dest(destImtDir));
    done();
};

// destフォルダのファイル削除
const clean = (done) => {
    del([destFiles, "!" + destCssDir, "!" + destJsDir, "!" + destImtDir]);
    done();
};

// HTMLファイル削除
const htmlClean = (done) => {
    del([destHtmlFiles]);
    done();
};

// 画像ファイル削除
const imgClean = (done) => {
    del([destImgFiles]);
    done();
};

// タスク化
exports.compileEjs = compileEjs;
exports.compileSass = compileSass;
// exports.bundleWebpack = bundleWebpack;
exports.reloadFile = reloadFile;
exports.reloadBrowser = reloadBrowser;
exports.minifyImage = minifyImage;
exports.webpImage = webpImage;

exports.clean = clean;
exports.htmlClean = htmlClean;
exports.imgClean = imgClean;

// 監視ファイル
const watchFiles = (done) => {
    gulp.watch([srcEjsFiles, srcJsonFiles], gulp.series(htmlClean, compileEjs));
    gulp.watch(destHtmlFiles, reloadBrowser);
    gulp.watch(srcScssFiles, compileSass);
    gulp.watch(destCssFiles, reloadBrowser);
    gulp.watch(srcImgFiles, gulp.series(imgClean, minifyImage));
    gulp.watch(destImgFiles, reloadBrowser);
    // gulp.watch([srcTsFiles, srcJsonFiles], bundleWebpack);
    // gulp.watch(destJSFiles, reloadBrowser);
    done();
};

// タスク実行

// exports.default = gulp.series(clean, watchFiles, reloadFile, compileEjs, compileSass, bundleWebpack, minifyImage);
exports.default = gulp.series(clean, watchFiles, reloadFile, compileEjs, compileSass, minifyImage, webpImage);

