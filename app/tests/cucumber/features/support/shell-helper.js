/**
 * Created by jaross on 06/10/16.
 */
var Future = require("fibers/future");
var exec = require("child_process").exec;

module.exports = function () {
    this.Before(function () {
        this.ShellHelper = {
            run: function(cmd) {
                // this.unblock();
                var future = new Future();
                exec(cmd, function(error, stdout ) {
                    if(error) {
                        console.log(error);
                        throw new Error(500, cmd + " failed");
                    }
                    future.return(stdout.toString());
                });
                return future.wait();
            }
        };

    });
};