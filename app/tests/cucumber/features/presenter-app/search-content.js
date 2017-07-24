var _ = require('underscore'),
    faker = require('faker');

module.exports = function () {
    this.Given(/^I am searching with a keyword$/, function () {
        const pms = fixtures.getPresentationMachinesForPresenter();
        const index = _.random(0, pms.length - 1);

        this.selectedPresentationMachine = pms[index];
        this.subUrl = 'presenter';

        browser.url(`${this.baseUrl}/${this.subUrl}/${this.selectedPresentationMachine._id}/search`);

        const selector = 'input#search-keyword'
        browser.waitForExist(selector, 6000)

        this.keyword = faker.lorem.word().substr(0, 1)

        browser.setValue(selector, this.keyword)
    });

    this.When(/^I select playlists accordian$/, function () {
        const keywordFilter = {$regex: this.keyword, $options: 'i'}
        const tags = fixtures.getTags({name: keywordFilter}),
            tagIds = _.pluck(tags, '_id')

        const filters = {
            $or: [{name: keywordFilter}, {tagIds: {$in: tagIds}}],
            presentationMachineId: this.selectedPresentationMachine._id
        }

        this.searchedPlaylists = fixtures.getCanoncialPlaylists(filters)

        if (this.searchedPlaylists && this.searchedPlaylists.length) {
            const selector = '#playlist-group svg.action-icon-arrow-down'
            browser.waitForExist(selector, 6000)
            browser.click(selector);
        }

    });

    this.Then(/^I should see all playlists that exactly or partially match the entered keyword$/, function () {
        const playlists = this.searchedPlaylists

        if (playlists && playlists.length) {
            const items = [].concat(browser.element(selectors.presentation.idGroupPlaylists).elements(selectors.presentation.clsSearchResultsList + " .item-text").getText())

            expect(items.length).toEqual(playlists.length);
            items.forEach(function (item) {
                expect(_.contains(_.pluck(playlists, 'name'), item)).toEqual(true);
            });
        }
    });

    this.When(/^I select images accordian$/, function () {
        const keywordFilter = {$regex: this.keyword, $options: 'i'}
        const tags = fixtures.getTags({name: keywordFilter}),
            tagIds = _.pluck(tags, '_id')

        const filters = {
            type: 'image',
            $or: [{name: keywordFilter}, {tagIds: {$in: tagIds}}],
            presentationMachineIds: this.selectedPresentationMachine._id
        }


        this.searchedImages = fixtures.getMedias(filters);
        if (this.searchedImages && this.searchedImages.length) {
            const selector = '#image-group svg.action-icon-arrow-down'
            browser.waitForExist(selector, 6000)
            browser.click(selector);
        }
    });

    this.Then(/^I should see all images that exactly or partially match the entered keyword$/, function () {

        const images = this.searchedImages

        if(images && images.length) {
            const items = [].concat(browser.element(selectors.presentation.idGroupImages).elements(selectors.presentation.clsSearchResultsList + " .item-text").getText())

            expect(items.length).toEqual(images.length);
            items.forEach(function (item) {
                expect(_.contains(_.pluck(images, 'name'), item)).toEqual(true);
            });
        }
    });

    this.When(/^I select videos accordian$/, function () {
        const keywordFilter = {$regex: this.keyword, $options: 'i'}
        const tags = fixtures.getTags({name: keywordFilter}),
            tagIds = _.pluck(tags, '_id')

        const filters = {
            type: 'video',
            $or: [{name: keywordFilter}, {tagIds: {$in: tagIds}}],
            presentationMachineIds: this.selectedPresentationMachine._id
        }

        this.searchedVideos = fixtures.getMedias(filters);

        if(this.searchedVideos && this.searchedVideos.length) {
            const selector = '#video-group svg.action-icon-arrow-down'
            browser.waitForExist(selector, 6000)
            browser.click(selector);
        }
    });

    this.Then(/^I should see all videos that exactly or partially match the entered keyword$/, function () {
        const videos = this.searchedVideos

        if(videos && videos.length) {
            const items = [].concat(browser.element(selectors.presentation.idGroupVideos).elements(selectors.presentation.clsSearchResultsList + " .item-text").getText())

            expect(items.length).toEqual(videos.length);

            items.forEach(function (item) {
                expect(_.contains(_.pluck(videos, 'name'), item)).toEqual(true)
            })
        }
    });

    this.When(/^I select medias accordian$/, function () {
        browser.waitForExist(selectors.presentation.idGroupMedias, 3000);

        browser.click(selectors.presentation.idGroupMedias);
    });

    this.Then(/^I should see all images and videos that exactly or partially match the entered keyword$/, function () {
        var medias = fixtures.getMedias({name: {'$regex': this.keyword}});

        var items = browser.element(selectors.presentation.idDivSearchResultConntainer).elements(selectors.presentation.clsDisplayItemName).value;

        expect(items.length).toEqual(medias.length);

        items.forEach(function (item) {
            expect(_.contains(_.pluck(medias, 'name'), browser.elementIdElement(item.ELEMENT).getText())).toEqual(true);
        });
    });

    this.Given(/^I am searching for playlist with a keyword$/, function () {
        const pms = fixtures.getPresentationMachinesForPresenter();
        let index = _.random(0, pms.length - 1);

        this.selectedPresentationMachine = pms[index];
        this.subUrl = 'presenter';

        browser.url(`${this.baseUrl}/${this.subUrl}/${this.selectedPresentationMachine._id}/search`);

        utils.waitForElements(selectors.presentation.idInputSearchKeyword, 1);

        // 1. Select available playlist on selected presentation machine and input keyword based on it and click down arrow button on playlist collapse
        this.keyword = faker.lorem.word().substr(0, 1)

        browser.setValue(selectors.presentation.idInputSearchKeyword, this.keyword)

        // 2. Check if search result is correct
        const keywordFilter = {$regex: this.keyword, $options: 'i'}
        const tags = fixtures.getTags({name: keywordFilter}),
            tagIds = _.pluck(tags, '_id')

        let filters = {$or: [{name: keywordFilter}, {tagIds: {$in: tagIds}}]}

        if (this.selectedPresentationMachine) {
            filters.presentationMachineId = this.selectedPresentationMachine._id
        }

        const playlists = fixtures.getCanoncialPlaylists(filters)

        if(playlists && playlists.length) {
            browser.waitForExist('#playlist-group .action-icon-arrow-down')
            browser.click('#playlist-group .action-icon-arrow-down')
            utils.waitForElements('#playlist-group ul.search-results-list > li', playlists.length)
        }

        this.playlists = playlists

        this.selectedItemType = 'playlist'
    });

    this.Given(/^I am searching for video with a keyword$/, function () {
        const pms = fixtures.getPresentationMachinesForPresenter();
        let index = _.random(0, pms.length - 1);

        this.selectedPresentationMachine = pms[index];
        this.subUrl = 'presenter';

        browser.url(`${this.baseUrl}/${this.subUrl}/${this.selectedPresentationMachine._id}/search`);

        utils.waitForElements(selectors.presentation.idInputSearchKeyword, 1);

        // 1.
        this.keyword = faker.lorem.word().substr(0, 1)

        browser.setValue(selectors.presentation.idInputSearchKeyword, this.keyword)


        // 2.
        const keywordFilter = {$regex: this.keyword, $options: 'i'}
        const tags = fixtures.getTags({name: keywordFilter}),
            tagIds = _.pluck(tags, '_id')

        let filters = {type: 'video', $or: [{name: keywordFilter}, {tagIds: {$in: tagIds}}]}

        if (this.selectedPresentationMachine) {
            filters.presentationMachineIds = this.selectedPresentationMachine._id
        }

        this.medias = fixtures.getMedias(filters)
        if(_.findIndex(this.medias, {type:'video'}) > -1) {
            browser.waitForExist('#video-group .action-icon-arrow-down')
            browser.click('#video-group .action-icon-arrow-down')
            utils.waitForElements('#video-group ul.search-results-list > li', this.medias.length)
        }

    });

    this.Given(/^I am searching for image with a keyword$/, function () {
        const pms = fixtures.getPresentationMachinesForPresenter();
        let index = _.random(0, pms.length - 1);

        this.selectedPresentationMachine = pms[index];
        this.subUrl = 'presenter';

        browser.url(`${this.baseUrl}/${this.subUrl}/${this.selectedPresentationMachine._id}/search`);

        utils.waitForElements(selectors.presentation.idInputSearchKeyword, 1);

        // 1.
        let images = fixtures.getMedias({
            type: 'image',
            presentationMachineIds: {$in: [this.selectedPresentationMachine._id]}
        })
        this.keyword = _.sample(images).name.substr(0, 2)

        browser.setValue(selectors.presentation.idInputSearchKeyword, this.keyword)

        // 2.
        const keywordFilter = {$regex: this.keyword, $options: 'i'}
        const tags = fixtures.getTags({name: keywordFilter}),
            tagIds = _.pluck(tags, '_id')

        let filters = {type: 'image', $or: [{name: keywordFilter}, {tagIds: {$in: tagIds}}]}

        if (this.selectedPresentationMachine) {
            filters.presentationMachineIds = this.selectedPresentationMachine._id
        }

        const sort = {sort: {name: 1}};

        this.medias = fixtures.getMedias(filters)

        if(_.findIndex(this.medias, {type:'image'}) > -1) {
            browser.waitForExist('#image-group .action-icon-arrow-down')
            browser.click('#image-group .action-icon-arrow-down')
            utils.waitForElements('#image-group ul.search-results-list > li', this.medias.length)
        }
    });

}
