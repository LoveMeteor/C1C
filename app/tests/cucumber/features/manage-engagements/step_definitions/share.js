const _ = require('underscore')

module.exports = function () {
    this.Given(/^I am viewing engagements in list view$/, function () {

        this.subUrl = 'engagements';
        browser.url(`${this.baseUrl}/${this.subUrl}`);

        browser.waitForExist('div=Engagements', 10000);

        this.selectedViewStyle = 'list'
    });

    this.When(/^I search with a keyword with available matches$/, function () {
        browser.waitForExist('#form-search-keyword', 5000);

        var engagements = fixtures.getEngagements();

        this.keyword = _.sample(engagements).name.substr(0,2);

        browser.setValue('#form-search-keyword', this.keyword);
    });

}