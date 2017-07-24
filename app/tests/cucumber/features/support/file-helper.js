/**
 * Created by jaross on 06/10/16.
 */
const fs = require('fs');

module.exports = function () {
    this.Before(function () {

        this.FileHelper = {

            getRootDir: function(dir) {
                const dirs = __dirname.split('/');
                const index = dirs.indexOf(dir);
                if(index > -1) {
                    const length = dirs.length;
                    for(let i=index+1; i<length; i++) {
                        dirs.splice(index+1, 1);
                    }

                    return dirs.join('/');
                }
                else {
                    return '';
                }
            },

            checkDirExist: function( dir, baseDir) {
                return fs.existsSync(baseDir + dir);
            }
        };

    });
};