var gulp = require('gulp')

var uglify = require('gulp-uglify')

gulp.task('jsmin',function(){
    gulp.src(['svgcloud/*.js'])
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
})