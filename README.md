# gulp-bundle

Moves assets into the web directory based on a config file. This is so that by specifying a config in composer packages and locally in a folder we can move all relevant files needed for the site frontend into the relevant directories.

## Config file:

The main thing that you'll need to know about this plugin is how to create your config files.

There should always be the 3 keys javascript, css, and assets. These have been kept separate in case of any future development and if they get handled differently in the future. For now however there is no difference between these keys.

The rest of the set up involves a key pair set up.

- Key: This is the destination for the file or files. If this is a directory files will be just copied into the directory. If you specify a file then files will be written to that exact file. When used in single file mode each entry represents a single file/
- Value: This takes a file reference a glob or an array of files/globs. This is where you select the source files. Paths starting in / are relative to the project directory and relative directories are relative to the config file.

### Concatenation

This plugin provides some very basic concatenation. If your key is a single file and you provide an array of files it concatenates them together into the specified key.

## Examples

### Bundle config:

```json
{
    "javascript": {
        "javascript/plupload/plupload.js": "/node_modules/plupload/js/plupload.full.min.js"
    },
    "css": {},
    "assets": {
        "images/plupload": "/node_modules/plupload/js/**/*.{swf,xap}"
    }
}
```

### Gulp task set up:

```javascript
gulp.task('bundle', function() {
    return gulp.src([
            'resources/bundles/*.bundle.json',
            'vendor/*/*/*.bundle.js'
        ])
        .pipe(bundle())
        .pipe(notify("Bundle complete: <%=file.relative%>"))
});
```
