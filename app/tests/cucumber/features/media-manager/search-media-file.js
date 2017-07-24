var _ = require('underscore');

module.exports = function () {

    // Scenario: Admin should search media files with title

    this.When(/^I search with a keyword with available matches on list media files page$/, function () {

        var medias = fixtures.getMedias(),
            media = _.sample(medias);

        this.searchKeyword = media.name.substr(0, 2);

        browser.setValue(selectors.media.idSearchFiles, this.searchKeyword);
        browser.keys('Enter');
    });

    this.Then(/^I should see all media files that exactly\/partially match the search keyword$/, function () {
        var keywordFilter = {$regex: this.searchKeyword};
        var tags = fixtures.getTags({name: keywordFilter}),
            tagIds = _.pluck(tags, '_id');

        var filters = {$or: [{name: keywordFilter},{tagIds: {$in:tagIds}}]};
        if(this.selectedPresentationMachine) {
            filters.presentationMachineIds = this.selectedPresentationMachine._id;
        }

        var sort = {sort:{name:1}};

        var medias = fixtures.getMedias(filters, sort);

        var elNames, names;

        if(medias.length == 0) {
            expect(browser.isExisting('#container-medias .media-item-container')).toEqual(false);
        } else {
            names = _.pluck(medias, 'name'); //console.log("Should see playlist names", names);
            utils.waitForElements('#container-medias .media-item-container .media-item-name', medias.length);
            elNames = [].concat(browser.elements('#container-medias .media-item-container .media-item-name').getText()); //console.log("Playlist ElNames:", elNames);
            expect(elNames.length).toEqual(names.length);

            elNames.forEach(function(elName){
                expect(_.contains(names, elName)).toEqual(true);
            });
        }
    });

    this.Then(/^I should see all media files that has this theme$/, function () {
        const searchThemeId = this.selectedTheme._id;
        const medias = fixtures.getMedias({themeId: searchThemeId}); //console.log(medias, medias.length);

        utils.waitForElements('#container-medias .media-item-container', medias.length);

        if(medias.length == 0) {
            expect(browser.isExisting('#container-medias .media-item-container')).toEqual(false);
        } else {
            var els, elNames, names;
            names = _.pluck(medias, 'name'); //console.log("Should see media names", names);
            els = browser.elements('#container-medias .media-item-container .media-item-name');
            elNames = [].concat(els.getText()); //console.log("Media ElNames:", elNames);
            expect(elNames.length).toEqual(names.length);

            elNames.forEach(function(elName){
                expect(_.contains(names, elName)).toEqual(true);
            });
        }
    });

    this.Then(/^I should see all media files that has this industry$/, function () {
        const medias = fixtures.getMedias({industryIds:{$in:[this.selectedIndustry._id]}}, {sort:{name:1}}); //console.log(medias, medias.length);

        utils.waitForElements('#container-medias .media-item-container', medias.length);

        if(medias.length == 0) {
            expect(browser.isExisting('#container-medias .media-item-container')).toEqual(false);
        } else {
            var els, elNames, names;
            names = _.pluck(medias, 'name'); //console.log("Should see media names", names);
            els = browser.elements('#container-medias .media-item-container .media-item-name');
            elNames = [].concat(els.getText()); //console.log("Media ElNames:", elNames);
            expect(elNames.length).toEqual(names.length);

            elNames.forEach(function(elName){
                expect(_.contains(names, elName)).toEqual(true);
            });
        }
    });

    // Scenario: Admin should filter media files to show only images

    this.When(/^I select images filter$/, function () {
        browser.waitForExist(selectors.media.idFilterImage, 5000);
        browser.click(selectors.media.idFilterImage);
    });

    this.Then(/^I should see only images files$/, function () {
        const medias = fixtures.getMedias({type: "image"});
        const items = browser.elements(selectors.media.clsMediaItemContainer).value;

        expect(items.length).toEqual(medias.length);
    });

    // Scenario: Admin should filter media files to show only videos

    this.When(/^I select videos filter$/, function () {
        browser.waitForExist(selectors.media.idFilterVideo, 5000);
        browser.click(selectors.media.idFilterVideo);
    });

    this.Then(/^I should see only videos files$/, function () {
        const medias = fixtures.getMedias({type: "video"});
        const items = browser.elements(selectors.media.clsMediaItemContainer).value;

        expect(items.length).toEqual(medias.length);
    });

    // Scenario: Admin should be able to reset filtering by media type

    this.When(/^I select all media filter$/, function () {
        browser.waitForExist(selectors.media.idFilterAllMedia, 1000);
        browser.click(selectors.media.idFilterAllMedia);
    });

    this.Then(/^I should see all media files whatever its type$/, function () {
        const medias = fixtures.getMedias();
        const items = browser.elements(selectors.media.clsMediaItemContainer).value;

        expect(items.length).toEqual(medias.length);
    });

    // Scenario: Admin should filter media files by presentation machine

    this.When(/^I select specific presentation machine on list media files page$/, function () {
        browser.waitForExist(selectors.media.clsFilterMachine, 5000);

        const areas = browser.getAttribute(selectors.media.clsFilterMachine, "data-id");
        this.searchAreaId = _.sample(areas);

        browser.click(`${selectors.media.clsFilterMachine}[data-id="${this.searchAreaId}"]`);
    });

    this.Then(/^I should see only media files on this presentation machine$/, function () {
        const searchAreaId = this.searchAreaId;
        const medias = fixtures.getMedias({presentationMachineIds: searchAreaId });
        const items = browser.elements(selectors.media.clsMediaItemContainer).value;

        expect(items.length).toEqual(medias.length);
    });

    // Scenario: Admin should be able to reset filtering by presentation machine

    this.When(/^I select all areas filter on list media files page$/, function () {
        browser.waitForExist(selectors.media.idFilterAllArea, 5000);
        browser.click(selectors.media.idFilterAllArea);
    });

    this.Then(/^I should see all media files whatever its presentation machine$/, function () {
        const medias = fixtures.getMedias();
        const items = browser.elements(selectors.media.clsMediaItemContainer).value;

        expect(items.length).toEqual(medias.length);
    });

    // Scenario: Admin should see an empty state if he search for a keyword that doesn't exist

    this.When(/^I search with a keyword with no available matches for media files$/, function () {
        browser.waitForExist(selectors.media.idSearchFiles, 5000);
        this.searchKeyword = 'XXXXXXXX';
        browser.setValue(selectors.media.idSearchFiles, this.searchKeyword);
        browser.keys('Enter');
    });

    this.Then(/^I should see no results found message for media files$/, function () {
        var items = browser.elements(selectors.media.clsMediaItemName).value;
        expect(items.length).toEqual(0);

        browser.waitUntil(function(){
            return browser.getText("div*=No results found");
        }, 5000);
    });

}
