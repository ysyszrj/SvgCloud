/**
 * Created by ysysz on 2016/7/24.
 */
var gulp = require("gulp");
var gls = require('gulp-live-server');
var plugins = require('gulp-load-plugins')();

var src_fold = "svg_cloud_v1/";
var remoteUrl = "git@github.com:ysyszrj/SvgCloud.git";
var server;

gulp.task('serve', function() {
    //1. serve with default settings
    server = gls.static(src_fold,3000); //equals to gls.static('public', 3000);
    server.start();
});

gulp.task('deploy',function () {
    return gulp.src(src_fold + '**/*')
        .pipe(plugins.ghPages({
            remoteUrl: remoteUrl
        }));
})

//use gulp.watch to trigger server actions(notify, start or stop)
gulp.watch(['./svg_cloud_v1'], function (file) {
  server.notify.apply(server, [file]);
});
