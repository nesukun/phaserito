/**
 * Based on the work of
 * Nestor Hernandez Ojeda (Phasersito)
 */
var gulp = require("gulp");
var gutil = require("gulp-util");
var zip = require('gulp-zip');
var localtunnel = require('localtunnel');
var path = require("path");
var runSequence = require('run-sequence');
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
// WebPack configuration
var webpackConfig = require("./webpack.config.js");

gulp.task("default", ["development"]);

gulp.task("build", function() {
	runSequence('build-game');
});

gulp.task("build-game", function(callback) {
	var myConfig = Object.create(webpackConfig);
	myConfig.plugins = myConfig.plugins.concat(
		new webpack.DefinePlugin({
			"process.env": {
				"NODE_ENV": JSON.stringify("production")
			}
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
	);

	webpack(myConfig, function(err, stats) {
		if (err) throw new gutil.PluginError("webpack:build", err);
		gutil.log("[webpack:build]", stats.toString({
			colors: true
		}));
		callback();
	});
});

gulp.task("development", function() {
	runSequence(['dev-server']);
});

gulp.task("dev-server", function(callback) {
	var myConfig = Object.create(webpackConfig);
	myConfig.devtool = "eval";
	myConfig.debug = true;
	myConfig.entry.vendor.push("phaser-debug");

	new WebpackDevServer(webpack(myConfig), {
		contentBase: path.join(__dirname, "./build"),
		stats: {
			colors: true
		}
	}).listen(8080, "localhost", function(err) {
		if (err) throw new gutil.PluginError("webpack-dev-server", err);
		gutil.log("[dev-server]", "http://localhost:8080/  ->  Root");
		gutil.log("[dev-server]", "http://localhost:8080/webpack-dev-server/  ->  with LiveReload");
	});
});

gulp.task("serve-ie9", function(callback) {
	var myConfig = Object.create(webpackConfig);
	myConfig.devtool = "eval";
	myConfig.debug = true;

	new WebpackDevServer(webpack(myConfig), {
		contentBase: path.join(__dirname, "./build"),
		stats: {
			colors: true
		}
	}).listen(8080, "0.0.0.0", function(err) {
		if (err) throw new gutil.PluginError("webpack-dev-server", err);
		gutil.log("[dev-server]", "http://localhost:8080/  ->  Root");
		gutil.log("[dev-server]", "http://localhost:8080/webpack-dev-server/  ->  with LiveReload");
	});
});

gulp.task("localtunnel", function(callback) {
	localtunnel(8080, function(err, tunnel) {
		if (err) throw new gutil.PluginError("localtunnel", err);
		var myConfig = Object.create(webpackConfig);
		myConfig.devtool = "eval";
		myConfig.debug = true;
		myConfig.entry.vendor.push("phaser-debug");

		new WebpackDevServer(webpack(myConfig), {
			contentBase: path.join(__dirname, "./build"),
			stats: {
				colors: true
			}
		}).listen(8080, "localhost", function(err) {
			if (err) throw new gutil.PluginError("webpack-dev-server", err);
			gutil.log("[localtunnel]", tunnel.url + "  ->  Root");
			gutil.log("[localtunnel]", tunnel.url + "/webpack-dev-server/  ->  with LiveReload");
		});
	});
});

gulp.task("cocoon", ["build"], function(callback) {
	return gulp.src('./build/**/*')
		.pipe(zip('dist.zip'))
		.pipe(gulp.dest('./build'));
});
