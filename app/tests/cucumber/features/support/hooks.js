/**
 * Created by jaross on 06/10/16.
 */
(function () {

    'use strict';

    var _ = require('underscore');

    function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
                break;
            }
        }
    }

    module.exports = function () {

        this.Before(function (scenario) {
            this.baseUrl = "http://localhost:3000";
            if(browser.getUrl().indexOf(this.baseUrl) === -1){
                browser.setViewportSize({
                    width: 1440,
                    height: 900
                })
                browser.url(this.baseUrl)
            }

        });

    };
})();