var glob = require("glob");
var fs = require('fs');
var path = require('path');
var through = require('through2');
var gutil = require('gulp-util');
var Vinyl = require('vinyl');

module.exports = function (params) {
    params = params || {};

    var currentFile;

    function isDirectory(file) {
        var filename = file.split('/').pop();
        return filename.search(/\./) === -1;
    }

    function getFile(file) {
        return file.split('/').pop();
    }

    function getDirectory(file) {
        var arr = file.split('/');
        arr.pop();
        return arr.join('/');
    }

    function normalizePath(target) {
        if (target.match(/^\//)) {
            return target;
        }

        target = target.replace(/^\.\//, '');

        return path.resolve(getDirectory(currentFile) + '/' + target);
    }

    function copyFile(target, dest, callback, pos) {
        var isDir = isDirectory(dest);
        glob.glob(target, {
            root: process.cwd(),
            cwd: getDirectory(currentFile)
        }, function(err, files) {
            for (var i = 0; i < files.length; i++) {
                var output = dest;
                if (isDir) {
                    output += '/' + getFile(files[i]);
                }

                var file = normalizePath(files[i]);

                fs.readFile(file, function (err, data) {
                    if (err) {
                        throw new gutil.PluginError('gulp-d3r-bundle', 'Error reading file: ' + output);
                    }

                    var vnl = new Vinyl({
                        path: output,
                        contents: data
                    });

                    callback.call(null, vnl, pos);
                });
            }
        });
    }

    function copyFiles(target, dest, callback) {
        var isDir = isDirectory(dest);
        if (Array.isArray(target) && !isDir) {
            var partial = {
                count: target.length,
                fragments: []
            };

            for (var i = 0; i < target.length; i++) {
                copyFile(target[i], dest, function (vnl, pos) {
                    partial.fragments[pos] = vnl.contents;

                    if (partial.fragments.length == partial.count) {
                        var compiled = new Vinyl({
                            path: vnl.path,
                            contents: Buffer.concat(partial.fragments)
                        });

                        callback.call(null, compiled);
                    }
                }, i);
            }
        } else {
            copyFile(target, dest, callback);
        }

    }

    return through.obj(function (file, enc, callback) {
        currentFile = file.path;

        if (file.isNull()) {
          return callback(null, file);
        }

        if (file.isStream()) {
            throw new gutil.PluginError('gulp-d3r-bundle', 'stream not supported');
        }

        if (file.isBuffer()) {
            var result, dest, target;

            var that = this;

            var returnFile = function(vnl) {
                that.push(vnl);
            };

            try {
                result = JSON.parse(String(file.contents));
            } catch (err) {
                throw new gutil.PluginError('gulp-d3r-bundle', 'Invalid JSON: ' + file.path);
            }

            for (dest in result.javascript) {
                target = result.javascript[dest];
                copyFiles(target, dest, returnFile);
            }

            for (dest in result.css) {
                target = result.css[dest];
                copyFiles(target, dest, returnFile);
            }

            for (dest in result.assets) {
                target = result.assets[dest];
                copyFiles(target, dest, returnFile);
            }

            return;
        }
    });
};
