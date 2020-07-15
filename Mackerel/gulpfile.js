//////////////////////////////////////////////////
//
// Import
//
//////////////////////////////////////////////////

// Common
const browserSync = require('browser-sync');
const gulp = require('gulp');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');

// HTML
const htmlhint = require('gulp-htmlhint');
const pug = require('gulp-pug');

// CSS
const autoprefixer = require('autoprefixer');
const cssDeclarationSorter = require('css-declaration-sorter');
const cssnano = require('cssnano');
const gulpStylelint = require('gulp-stylelint');
const postcss = require('gulp-postcss');
const reporter = require('postcss-reporter');
const sass = require('gulp-sass');
const stylelint = require('stylelint');

// JS
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');

// Image
const imagemin = require('gulp-imagemin');

//////////////////////////////////////////////////
//
// パスの定義
//
//////////////////////////////////////////////////

const root = './',
    src = root + 'src/',
    dest = root + 'dist/',
    filepath = {
        html: dest + 'html/',
        css: dest + 'css/',
        js: dest + 'js/',
        images: dest + 'images/',

        src_pug: src + 'pug/',
        src_scss: src + 'scss/',
        src_js: src + 'js/',
        src_images: src + 'images/'
    };

//////////////////////////////////////////////////
//
// HTML
//
//////////////////////////////////////////////////

gulp.task('html', done => {
    gulp.src([filepath.src_pug + 'index.pug'], { allowEmpty: true })
        .pipe(plumber())
        .pipe(pug({ pretty: '    ' }))
        .pipe(htmlhint())
        .pipe(gulp.dest(filepath.html));

    done();
});

//////////////////////////////////////////////////
//
// CSS
//
//////////////////////////////////////////////////

gulp.task('css', done => {
    const plugin = [
        autoprefixer(),
        cssDeclarationSorter({
            order: 'alphabetical'
        })
    ];

    gulp.src([filepath.src_scss + 'index.scss'], { allowEmpty: true })
        .pipe(plumber())
        .pipe(
            sass({
                outputStyle: 'expanded',
                indentType: 'space',
                indentWidth: 4
            })
        )
        .pipe(
            gulpStylelint({
                fix: true
            })
        )
        .pipe(postcss([stylelint(), reporter()]))
        .pipe(postcss(plugin))
        .pipe(gulp.dest(filepath.css))
        .pipe(
            postcss([
                cssnano({
                    autoprefixer: false
                })
            ])
        )
        .pipe(
            rename(path => {
                path.extname = '.min.css';
            })
        )
        .pipe(gulp.dest(filepath.css));

    done();
});

//////////////////////////////////////////////////
//
// JS
//
//////////////////////////////////////////////////

gulp.task('js', done => {
    gulp.src([filepath.src_js + '**/*.js'], { allowEmpty: true })
        .pipe(plumber())
        .pipe(concat('index.js'))
        .pipe(babel())
        .pipe(eslint({ useEslintrc: true }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(gulp.dest(filepath.js))
        .pipe(uglify())
        .pipe(
            rename(path => {
                path.extname = '.min.js';
            })
        )
        .pipe(gulp.dest(filepath.js));

    done();
});

//////////////////////////////////////////////////
//
// Images
//
//////////////////////////////////////////////////

gulp.task('images', done => {
    gulp.src([filepath.src_images + '**/*.{gif,jpg,png,svg}'], { allowEmpty: true })
        .pipe(imagemin())
        .pipe(gulp.dest(filepath.images));

    done();
});

//////////////////////////////////////////////////
//
// Browser-sync
//
//////////////////////////////////////////////////

gulp.task('browserSync-init', done => {
    browserSync({
        server: {
            baseDir: dest,
            directory: true
        }
    });

    done();
});

gulp.task('browserSync-reload', done => {
    browserSync.reload();

    done();
});

//////////////////////////////////////////////////
//
// Watch
//
//////////////////////////////////////////////////

gulp.task('watch', done => {
    gulp.watch(filepath.src_pug + '**/*.pug').on('change', gulp.series('html', 'browserSync-reload'));
    gulp.watch(filepath.src_scss + '**/*.scss').on('change', gulp.series('css', 'browserSync-reload'));
    gulp.watch(filepath.src_js + '**/*.js').on('change', gulp.series('js', 'browserSync-reload'));
    gulp.watch(filepath.src_images + '**/*.{gif,jpg,png,svg}').on(
        'change',
        gulp.series('images', 'browserSync-reload')
    );

    done();
});

//////////////////////////////////////////////////
//
// Default
//
//////////////////////////////////////////////////

gulp.task('default', gulp.series('browserSync-init', gulp.parallel('html', 'css', 'js', 'images'), 'watch'));
