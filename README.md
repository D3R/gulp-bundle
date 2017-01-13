# gulp-bundle

Moves assets into the web directory based on a config file.

### Example config:

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
