var _ = require('underscore');

module.exports = function () {

    this.Given(/^I am on create playlist page$/, function () {

        this.subUrl = 'playlists/';
        browser.url(`${this.baseUrl}/${this.subUrl}`);

        browser.waitForExist('div=Playlists', 10000);

        browser.click('#btn-new-playlist');

        browser.waitForExist('input[placeholder="Playlist title"]', 5000);
    });
}