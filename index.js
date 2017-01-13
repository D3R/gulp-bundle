var glob = require("glob");
var fs = require('fs');
var path = require('path');
var through = require('through2');
var mkdirp = require('mkdirp');
var gutil = require('gulp-util');

module.exports = function (params) {
    params = params || {};

    var web = path.resolve('./web');
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

    function copyFile(target, dest, mode) {
        var isDir = isDirectory(web + '/' + dest);
        glob.glob(target, {
            root: process.cwd(),
            cwd: getDirectory(currentFile)
        }, function(err, files) {
            for (var i = 0; i < files.length; i++) {
                var output = web + '/' + dest;
                if (isDir) {
                    output += '/' + getFile(files[i]);
                }

                var file = normalizePath(files[i]);

                var outputDir = getDirectory(output);
                if (!fs.existsSync(outputDir)) {
                    mkdirp.sync(outputDir);
                }

                fs.createReadStream(file).pipe(fs.createWriteStream(output, {
                   flags: mode
                }));
            }
        });
    }

    function copyFiles(target, dest) {
        var isDir = isDirectory(web + '/' + dest);
        if (Array.isArray(target) && !isDir) {
            for (var i = 0; i < target.length; i++) {
                if (i > 0) {
                    copyFile(target[i], dest, 'a');
                } else {
                    copyFile(target[i], dest, 'w');
                }
            }
        } else {
            copyFile(target, dest, 'w');
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

            try {
                result = JSON.parse(String(file.contents));
            } catch (err) {
                throw new gutil.PluginError('gulp-d3r-bundle', 'Invalid JSON: ' + file.path);
            }

            for (dest in result.javascript) {
                target = result.javascript[dest];
                copyFiles(target, dest);
            }

            for (dest in result.css) {
                target = result.css[dest];
                copyFiles(target, dest);
            }

            for (dest in result.assets) {
                target = result.assets[dest];
                copyFiles(target, dest);
            }
        }

        callback(null, file);
    });
};
