let _ = require('underscore'),
    faker = require('faker');

module.exports = function () {

    this.When(/^I choose to add new media file$/, function () {
        this.input = {};
        // Input title
        this.input.playlistTitle = faker.lorem.word();
        browser.setValue('input[placeholder="Playlist title"]', this.input.playlistTitle);

        // Select an industry
        browser.click('#create-playlist-collapse-title .selector-industry');
        browser.waitForExist('#create-playlist-collapse-title .selector-industry li', 5000);
        var liNames = browser.elements('#create-playlist-collapse-title .selector-industry li').getText();
        const industries = fixtures.getIndustries();
        expect(liNames.length).toEqual(industries.length);
        liNames.forEach((liName, index) => {
            const industry = industries[index];
            expect(liName).toEqual(industry.name);
        });
        var index = _.random(0, industries.length-1);
        this.input.industry = industries[index];
        browser.click(`#create-playlist-collapse-title .selector-industry li:nth-child(${index+1})`);

        // Select an theme
        browser.click('#create-playlist-collapse-title .selector-theme');
        browser.waitForExist('#create-playlist-collapse-title .selector-theme li', 5000);
        var liNames = browser.elements('#create-playlist-collapse-title .selector-theme li').getText();
        const themes = fixtures.getThemes();
        expect(liNames.length).toEqual(themes.length);
        liNames.forEach((liName, index) => {
            const theme = themes[index];
            expect(liName).toEqual(theme.name);
        });
        var index = _.random(0, themes.length-1);
        this.input.theme = themes[index];
        browser.click(`#create-playlist-collapse-title .selector-theme li:nth-child(${index+1})`);

        browser.waitForExist('#create-playlist-collapse-title a.btn-continue', 5000);
        browser.click('#create-playlist-collapse-title a.btn-continue');

        // Select a presentation machine
        const pms = fixtures.getPresentationMachines();
        browser.click('#create-playlist-collapse-area .selector-area div');
        browser.waitForExist('#create-playlist-collapse-area .selector-area li.option', 5000);
        liNames = browser.elements('#create-playlist-collapse-area .selector-area li.option').getText();

        expect(liNames.length).toEqual(pms.length);
        liNames.forEach((liName, index) => {
            const pm = pms[index];
            expect(liName).toEqual(pm.name);
        });
        index = _.random(0, pms.length-1);
        this.input.presentationMachine = pms[index];
        browser.click(`#create-playlist-collapse-area .selector-area li.option[data-id="${this.input.presentationMachine._id}"]`);

        browser.click('#create-playlist-collapse-area a.btn-continue');
    });

    this.Then(/^I should see a search form to search media files by industry,theme or title$/, () => {
        browser.waitForVisible('#create-playlist-collapse-add-media #form-search-keyword', 5000);
        browser.waitForVisible('#create-playlist-collapse-add-media #form-select-industry', 5000);
        browser.waitForVisible('#create-playlist-collapse-add-media #form-select-theme', 5000);
    });


    this.Given(/^I am adding new media file to a playlist$/, function () {

        this.subUrl = 'playlists';
        browser.url(`${this.baseUrl}/${this.subUrl}/`);

        browser.waitForVisible('#btn-new-playlist', 10000);

        browser.click('#btn-new-playlist');

        browser.waitForExist('input[placeholder="Playlist title"]', 10000);
        this.input = {};
        // Input title
        this.input.playlistTitle = faker.lorem.word();
        browser.setValue('input[placeholder="Playlist title"]', this.input.playlistTitle);

        // Select an industry
        browser.click('#create-playlist-collapse-title .selector-industry');
        browser.waitForExist('#create-playlist-collapse-title .selector-industry li', 5000);
        var liNames = browser.elements('#create-playlist-collapse-title .selector-industry li').getText();
        const industries = fixtures.getIndustries();
        expect(liNames.length).toEqual(industries.length);
        liNames.forEach((liName, index) => {
            const industry = industries[index];
            expect(liName).toEqual(industry.name);
        });
        var index = _.random(0, industries.length-1);
        this.input.industry = industries[index];
        browser.click(`#create-playlist-collapse-title .selector-industry li:nth-child(${index+1})`);

        // Select an theme
        browser.click('#create-playlist-collapse-title .selector-theme');
        browser.waitForExist('#create-playlist-collapse-title .selector-theme li', 5000);
        liNames = browser.elements('#create-playlist-collapse-title .selector-theme li').getText();
        const themes = fixtures.getThemes();
        expect(liNames.length).toEqual(themes.length);
        liNames.forEach((liName, index) => {
            const theme = themes[index];
            expect(liName).toEqual(theme.name);
        });
        index = _.random(0, themes.length-1);
        this.input.theme = themes[index];
        browser.click(`#create-playlist-collapse-title .selector-theme li:nth-child(${index+1})`);

        browser.waitForExist('#create-playlist-collapse-title a.btn-continue', 5000);
        browser.click('#create-playlist-collapse-title a.btn-continue');

        // Select a presentation machine
        const pms = fixtures.getPresentationMachines();
        browser.click('#create-playlist-collapse-area .selector-area div');
        browser.waitForExist('#create-playlist-collapse-area .selector-area li.option', 5000);
        liNames = browser.elements('#create-playlist-collapse-area .selector-area li.option').getText();

        expect(liNames.length).toEqual(pms.length);
        liNames.forEach((liName, index) => {
            const pm = pms[index];
            expect(liName).toEqual(pm.name);
        });
        index = _.random(0, pms.length-1);
        this.input.presentationMachine = pms[index];
        browser.click(`#create-playlist-collapse-area .selector-area li.option[data-id="${this.input.presentationMachine._id}"]`);

        browser.click('#create-playlist-collapse-area a.btn-continue');

    });

    this.When(/^I search with keyword$/, function () {
        browser.waitForVisible('#create-playlist-collapse-add-media #form-search-keyword', 5000);

        this.keyword = faker.lorem.word().substr(0,1)//fixtures.getSampleCanoncialPlaylist().name.substr(0,5);

        browser.setValue('#form-search-keyword', this.keyword);

    });

    this.Then(/^I should see list of media and playlists that exactly or partially match the entered keyword$/, function () {
        const keywordFilter = {$regex: this.keyword, $options: 'i'};
        let tags = fixtures.getTags({name: keywordFilter}),
            tagIds = _.pluck(tags, '_id');

        let filters = {$or: [{name: keywordFilter},{tagIds: {$in:tagIds}}]},
            imageFilters = _.extend(_.clone(filters), {type:'image'}),
            videoFilters = _.extend(_.clone(filters), {type:'video'});

        if(this.input.presentationMachine) {
            filters.presentationMachineId = this.input.presentationMachine._id;
            imageFilters.presentationMachineIds = this.input.presentationMachine._id;
            videoFilters.presentationMachineIds = this.input.presentationMachine._id;
        }

        const sort = {sort:{name:1}};

        let playlists = fixtures.getCanoncialPlaylists(filters/*, sort*/),
            images = fixtures.getMedias(imageFilters/*, sort*/),
            videos = fixtures.getMedias(videoFilters/*, sort*/);

        let elNames, names;

        // 1. check playlists
        browser.waitUntil(() => {
            if(playlists.length == 0) {
                return !browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-playlist .display-playlist-name');
            } else {
                names = _.pluck(playlists, 'name'); //console.log("Should see playlist names", names);
                elNames = [].concat(browser.getText('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-playlist .display-playlist-name'));
                if(elNames.length != names.length) return false;

                const elNamesSet = new Set(elNames);
                return names.every(name => elNamesSet.has(name));
            }
        }, 5000);


        // 2. check images
        browser.waitUntil(() => {
            if(images.length == 0) {
                return !browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-image .display-playlistitem-name');
            } else {
                names = _.pluck(images, 'name'); //console.log("Should see playlist names", names);
                elNames = [].concat(browser.getText('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-image .display-playlistitem-name'));

                if(elNames.length != names.length) return false;

                let bMatch = true;
                elNames.forEach((elName) => {
                    if(names.indexOf(elName) == -1) bMatch = false;
                });
                return bMatch;
            }
        }, 5000);

        // 3. check videos
        browser.waitUntil(() => {
            if(videos.length == 0) {
                return !browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-video .display-playlistitem-name');
            } else {
                names = _.pluck(videos, 'name'); //console.log("Should see playlist names", names);
                elNames = [].concat(browser.getText('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-video .display-playlistitem-name'));

                if(elNames.length != names.length) return false;


                const elNamesSet = new Set(elNames);
                return names.every(name => elNamesSet.has(name));
            }
        }, 5000);
    });

    this.Given(/^I entered a keyword to search$/, function () {

        this.keyword = faker.lorem.word().substr(0,1); //fixtures.getSampleCanoncialPlaylist().name.substr(0,3);

        browser.setValue('#form-search-keyword', this.keyword);
    });

    this.When(/^I filter the results by theme$/, function () {
        browser.waitForExist('#create-playlist-collapse-add-media #form-select-theme', 5000);

        browser.click('#create-playlist-collapse-add-media #form-select-theme');

        browser.waitForExist('#form-select-theme li', 5000);

        const liNames = browser.elements('#form-select-theme li').getText();

        const themes = fixtures.getThemes();


        expect(liNames.length).toEqual(themes.length);


        liNames.forEach((liName, index) => {
            const theme = themes[index];
            expect(liName).toEqual(theme.name);
        });

        // Select a theme and click specific dropdown item on browser
        const index = _.random(0, themes.length-1);
        this.selectedTheme = themes[index];

        browser.waitForVisible(`#create-playlist-collapse-add-media #form-select-theme li:nth-child(${index+1})`, 3000);
        browser.click(`#create-playlist-collapse-add-media #form-select-theme li:nth-child(${index+1})`);
    });
    this.Then(/^I should see list of media and playlists that match the keyword and has the entered theme$/, function () {
        const keywordFilter = {$regex: this.keyword};
        let tags = fixtures.getTags({name: keywordFilter}),
            tagIds = _.pluck(tags, '_id');

        let filters = {$or: [{name: keywordFilter},{tagIds: {$in:tagIds}}],themeId:this.selectedTheme._id},
            imageFilters = _.extend(_.clone(filters), {type:'image'}),
            videoFilters = _.extend(_.clone(filters), {type:'video'});

        if(this.input.presentationMachine) {
            filters.presentationMachineId = this.input.presentationMachine._id;
            imageFilters.presentationMachineIds = this.input.presentationMachine._id;
            videoFilters.presentationMachineIds = this.input.presentationMachine._id;
        }

        const sort = {sort:{name:1}};

        let playlists = fixtures.getCanoncialPlaylists(filters, sort),
            images = fixtures.getMedias(imageFilters, sort),
            videos = fixtures.getMedias(videoFilters, sort);

        let elNames, names;

        // 1. check playlists
        browser.waitUntil(() => {
            if(playlists.length == 0) {
                return !browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-playlist .display-playlist-name');
            } else {
                names = _.pluck(playlists, 'name'); //console.log("Should see playlist names", names);
                elNames = [].concat(browser.getText('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-playlist .display-playlist-name'));

                if(elNames.length != names.length) return false;

                let bMatch = true;
                elNames.forEach((elName) => {
                    if(names.indexOf(elName) == -1) bMatch = false;
                });
                return bMatch;
            }
        }, 5000);


        // 2. check images
        browser.waitUntil(() => {
            if(images.length == 0) {
                return !browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-image .display-playlistitem-name');
            } else {
                names = _.pluck(images, 'name'); //console.log("Should see playlist names", names);
                elNames = [].concat(browser.getText('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-image .display-playlistitem-name'));

                if(elNames.length != names.length) return false;

                const elNamesSet = new Set(elNames);
                return names.every(name => elNamesSet.has(name));
            }
        }, 5000);

        // 3. check videos
        browser.waitUntil(() => {
            if(videos.length == 0) {
                return !browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-video .display-playlistitem-name');
            } else {
                names = _.pluck(videos, 'name'); //console.log("Should see playlist names", names);
                elNames = [].concat(browser.getText('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-video .display-playlistitem-name'));

                if(elNames.length != names.length) return false;

                const elNamesSet = new Set(elNames);
                return names.every(name => elNamesSet.has(name));
            }
        }, 5000);
    });

    this.When(/^I filter the results by industry$/, function () {
        browser.waitForExist('#create-playlist-collapse-add-media #form-select-industry', 5000);

        browser.click('#create-playlist-collapse-add-media #form-select-industry');

        browser.waitForExist('#form-select-industry li', 5000);

        const liNames = browser.elements('#form-select-industry li').getText();

        const industries = fixtures.getIndustries();


        expect(liNames.length).toEqual(industries.length);


        liNames.forEach((liName, index) => {
            const industry = industries[index];
            expect(liName).toEqual(industry.name);
        });

        // Select a theme and click specific dropdown item on browser
        const index = _.random(0, industries.length-1);
        this.selectedIndustry = industries[index]; //console.log(index, this.selectedIndustry);

        browser.waitForVisible(`#create-playlist-collapse-add-media #form-select-industry li:nth-child(${index+1})`, 5000);
        browser.click(`#create-playlist-collapse-add-media #form-select-industry li:nth-child(${index+1})`);
    });

    this.Then(/^I should see list of media and playlists that match the keyword and has the entered industry$/, function () {
        const keywordFilter = {$regex: this.keyword};
        let tags = fixtures.getTags({name: keywordFilter}),
            tagIds = _.pluck(tags, '_id');

        let filters = {$or: [{name: keywordFilter},{tagIds: {$in:tagIds}}],industryIds:{$in:[this.selectedIndustry._id]}},
            imageFilters = _.extend(_.clone(filters), {type:'image'}),
            videoFilters = _.extend(_.clone(filters), {type:'video'});

        if(this.input.presentationMachine) {
            filters.presentationMachineId = this.input.presentationMachine._id;
            imageFilters.presentationMachineIds = this.input.presentationMachine._id;
            videoFilters.presentationMachineIds = this.input.presentationMachine._id;
        }

        const sort = {sort:{name:1}};

        let playlists = fixtures.getCanoncialPlaylists(filters, sort),
            images = fixtures.getMedias(imageFilters, sort),
            videos = fixtures.getMedias(videoFilters, sort);

        let elNames, names;

        // 1. check playlists
        browser.waitUntil(() => {
            if(playlists.length == 0) {
                return !browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-playlist .display-playlist-name');
            } else {
                names = _.pluck(playlists, 'name'); //console.log("Should see playlist names", names);
                elNames = [].concat(browser.getText('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-playlist .display-playlist-name'));

                if(elNames.length != names.length) return false;

                const elNamesSet = new Set(elNames);
                return names.every(name => elNamesSet.has(name));
            }
        }, 5000);

        // 2. check images
        browser.waitUntil(() => {
            if(images.length == 0) {
                return !browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-image .display-playlistitem-name');
            } else {
                names = _.pluck(images, 'name'); //console.log("Should see playlist names", names);
                elNames = [].concat(browser.getText('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-image .display-playlistitem-name'));

                if(elNames.length != names.length) return false;

                const elNamesSet = new Set(elNames);
                return names.every(name => elNamesSet.has(name));
            }
        }, 5000);

        // 3. check videos
        browser.waitUntil(() => {
            if(videos.length == 0) {
                return !browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-video .display-playlistitem-name');
            } else {
                names = _.pluck(videos, 'name'); //console.log("Should see playlist names", names);
                elNames = [].concat(browser.getText('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-video .display-playlistitem-name'));

                if(elNames.length != names.length) return false;

                const elNamesSet = new Set(elNames);
                return names.every(name => elNamesSet.has(name));
            }
        }, 5000);
    });

    this.When(/^I filter the results by "([^"]*)"$/, function (media_type) {
        browser.waitForExist('#div-playlist-media-search-form', 5000);

        if(media_type == 'all') {
            browser.element('#div-playlist-media-search-form').element('div=All media').click();
        } else if(media_type == 'video') {
            browser.element('#div-playlist-media-search-form').element('div=Videos').click();
        } else if(media_type == 'image') {
            browser.element('#div-playlist-media-search-form').element('div=Images').click();
        }

        this.selectedMediaType = media_type;
    });

    this.Then(/^I should see list of media according to the selected type$/, function () {
        const keywordFilter = {$regex: this.keyword};
        let tags = fixtures.getTags({name: keywordFilter}),
            tagIds = _.pluck(tags, '_id');

        const filters = {$or: [{name: keywordFilter},{tagIds: {$in:tagIds}}]};
        if(this.input.presentationMachine) {
            filters.presentationMachineIds = this.input.presentationMachine._id;
        }

        const sort = {sort:{name:1}};

        let images = fixtures.getMedias(_.extend(filters,{type:'image'}), sort),
            videos = fixtures.getMedias(_.extend(filters,{type:'video'}), sort);

        let els, elNames, names;

        if(this.selectedMediaType == 'image') {
            browser.waitUntil(() => {
                if(browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-video .display-playlistitem-name')) return false;

                if(images.length == 0) {
                    return !browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-image .display-playlistitem-name');
                } else {
                    names = _.pluck(images, 'name'); //console.log("Should see playlist names", names);
                    elNames = [].concat(browser.getText('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-image .display-playlistitem-name'));

                    if(elNames.length != names.length) return false;

                    const elNamesSet = new Set(elNames);
                    return names.every(name => elNamesSet.has(name));
                }
            }, 5000);

        } else if(this.selectedMediaType == 'video') {
            browser.waitUntil(() => {
                if(browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-image .display-playlistitem-name')) return false;

                if(videos.length == 0) {
                    return !browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-video .display-playlistitem-name');
                } else {
                    names = _.pluck(videos, 'name'); //console.log("Should see playlist names", names);
                    elNames = [].concat(browser.getText('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-video .display-playlistitem-name'));

                    if(elNames.length != names.length) return false;

                    const elNamesSet = new Set(elNames);
                    return names.every(name => elNamesSet.has(name));
                }
            }, 5000);
        } else {
            // 1. check images
            browser.waitUntil(() => {
                if(images.length == 0) {
                    return !browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-image .display-playlistitem-name');
                } else {
                    names = _.pluck(images, 'name'); //console.log("Should see playlist names", names);
                    elNames = [].concat(browser.getText('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-image .display-playlistitem-name'));

                    if(elNames.length != names.length) return false;

                    const elNamesSet = new Set(elNames);
                    return names.every(name => elNamesSet.has(name));
                }
            }, 5000);

            // 2. check videos
            browser.waitUntil(() => {
                if(videos.length == 0) {
                    return !browser.isExisting('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-video .display-playlistitem-name');
                } else {
                    names = _.pluck(videos, 'name'); //console.log("Should see playlist names", names);
                    elNames = [].concat(browser.getText('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-video .display-playlistitem-name'));

                    if(elNames.length != names.length) return false;

                    const elNamesSet = new Set(elNames);
                    return names.every(name => elNamesSet.has(name));
                }
            }, 5000);
        }

    });

    this.When(/^I select media$/, function () {
        let imageEls;
        browser.waitUntil(() => {
            imageEls = browser.elements('#create-playlist-collapse-add-media .div-media-wrapper-image .container-media-item').value;
            return imageEls.length>0;
        })

        const sampleImageEl = _.sample(imageEls); //console.log(pliEls, samplePliEl);

        browser.elementIdElement(sampleImageEl.ELEMENT, '.action-icon-add').waitForVisible(3000);
        browser.elementIdElement(sampleImageEl.ELEMENT, '.action-icon-add').click();

        const mediaId = browser.elementIdAttribute(sampleImageEl.ELEMENT, 'data-id').value; //console.log("Media Id=", mediaId);
        this.selectedMedia = fixtures.getMediaById(mediaId); //console.log("Selected media", this.selectedMedia);

        browser.click('#create-playlist-collapse-add-media .div-playlist-media-search-result a.btn-continue.enabled')

    });

    this.Then(/^I should see this media added to the current playlist$/, function () {
        const itemSelector = '#create-playlist-collapse-review .container-review-media .container-item-playlist-media .display-playlistitem-name'

        const mediaNames = [].concat(browser.elements(itemSelector).getText()); //console.log(mediaNames); console.log(this.selectedMedia);
        expect(_.contains(mediaNames, this.selectedMedia.name)).toEqual(true);
    });

    this.When(/^I select to append a playlist$/, function () {
        let pliEls;
        browser.waitUntil(() => {
            pliEls = browser.elements('#create-playlist-collapse-add-media .container-item-playlist').value;
            return pliEls.length>0;
        })
        // Select some playlists to add and click Continue button

        const samplePliEl = _.sample(pliEls); //console.log(pliEls, samplePliEl);

        browser.elementIdElement(samplePliEl.ELEMENT, '.action-icon-add').click()

        const plId = browser.elementIdAttribute(samplePliEl.ELEMENT, 'data-id').value; //console.log("Playlist Id", plId);
        this.selectedPlaylist = fixtures.getCanoncialPlaylistById(plId); //console.log("Selected playlist", this.selectedPlaylist);

        browser.click('#create-playlist-collapse-add-media .div-playlist-media-search-result a.btn-continue')
    });

    this.When(/^I delete already added media file$/, function () {
        const mediaEls = browser.elements('#create-playlist-collapse-review .container-review-media .container-item-playlist-media').value;

        let sampleMediaEl = _.sample(mediaEls),
            sampleMediaId = browser.elementIdAttribute(sampleMediaEl.ELEMENT, 'data-id').value; //console.log("SampleMediaId", sampleMediaId);

        this.selectedMedia = fixtures.getMediaById(sampleMediaId); //console.log("Selected Media", this.selectedMedia);

        browser.elementIdElement(sampleMediaEl.ELEMENT, '.action-icon-remove').click()

    });

    this.Then(/^I should not see it in the current playlist$/, function () {
        const selectedMediaName = this.selectedMedia.name;
        browser.waitUntil(() => {
           const selector = '#create-playlist-collapse-add-media .div-media-wrapper-selected-medias .display-playlistitem-name'
           // If there no media anymore , return true.
           if(!browser.isExisting(selector)) return true
           return browser.getText(selector).indexOf(selectedMediaName) == -1
        }, 5000);
    });

    this.When(/^I choose to change selected media files order$/, function () {
        browser.waitForExist('#create-playlist-collapse-add-media .container-medias-summary .div-media-wrapper-selected-medias .container-media-item', 5000);

        const itemEls = browser.elements('#create-playlist-collapse-add-media .container-medias-summary .div-media-wrapper-selected-medias .container-media-item').value;

        let sampleItemEls = _.sample(itemEls, 2),
            index1 = _.indexOf(itemEls, sampleItemEls[0]),
            index2 = _.indexOf(itemEls, sampleItemEls[1]);

        let srcElSelector = `#create-playlist-collapse-add-media .container-medias-summary .div-media-wrapper-selected-medias .container-media-item:nth-child(${index1+2})`,
            destElSelector = `#create-playlist-collapse-add-media .container-medias-summary .div-media-wrapper-selected-medias .container-media-item:nth-child(2)`;

        this.selectedItemSelector1 = srcElSelector;
        this.selectedItemSelector2 = destElSelector;
        this.selectedMediaName1 = browser.getText(`${srcElSelector} .display-playlistitem-name`);
        this.selectedMediaName2 = browser.getText(`${destElSelector} .display-playlistitem-name`);

        console.log(srcElSelector,destElSelector)
        browser.dragAndDrop(srcElSelector,destElSelector)

    });

    this.Then(/^I should see the updated media files order$/, function () {
        expect(browser.getText(`${this.selectedItemSelector1} .display-playlistitem-name`)).toEqual(this.selectedMediaName2);
        expect(browser.getText(`${this.selectedItemSelector2} .display-playlistitem-name`)).toEqual(this.selectedMediaName1);
    });

    this.When(/^I select image file$/, function () {
        // Select some playlists to add and click Continue button
        let imageEls = browser.elements('#create-playlist-collapse-add-media .div-media-wrapper-image .container-media-item').value,
            sampleImageEl = _.sample(imageEls); //console.log(pliEls, samplePliEl);

        browser.elementIdElement(sampleImageEl.ELEMENT, '.action-icon-add').waitForVisible(3000);
        browser.elementIdElement(sampleImageEl.ELEMENT, '.action-icon-add').click();

        const mediaId = browser.elementIdAttribute(sampleImageEl.ELEMENT, 'data-id').value; //console.log("Media Id=", mediaId);
        this.selectedMedia = fixtures.getMediaById(mediaId); //console.log("Selected media", this.selectedMedia);

        browser.click('#create-playlist-collapse-add-media .div-playlist-media-search-result a.btn-continue')
    });

    this.When(/^I set it's duaration in seconds$/, function () {
        // Set duration time for image media and click Continue button
        const itemSelector = '#create-playlist-collapse-review .container-review-media .container-item-playlist-media'

        const itemEls = browser.elements(itemSelector).value
        const durations = []
        itemEls.forEach((el) => {
            const mediaTypeClass = browser.elementIdElement(el.ELEMENT, 'svg:first-child').getAttribute('class')
            //console.log(mediaTypeClass)
            if(mediaTypeClass === 'action-icon-image') {
                browser.elementIdElement(el.ELEMENT, '.display-playlistitem-duration').click()
                const timeInputSelector = '.modal-boron .time-input input'
                browser.waitForExist(timeInputSelector, 6000)
                const duration = _.random(30, 600)
                browser.setValue(timeInputSelector, utils.convertSecondsToString(duration))
                browser.click('.modal-boron a.btn-set-duration.enabled')
                browser.waitUntil(() => !browser.isExisting(timeInputSelector), 6000)

                durations.push(duration)
            }
        })
        //console.log('end')

        const elDurations = [].concat(browser.elements('#create-playlist-collapse-review .container-review-media .display-playlistitem-duration').getText());

        expect(elDurations.length).toEqual(durations.length);
        elDurations.forEach((duration, index) => {
            expect(duration).toEqual(utils.convertedDuration(durations[index]));
        });

        this.currentPlaylistsCnt = fixtures.getCanoncialPlaylists().length
        this.selectedDurations = durations
        //console.log('1')
        utils.sleep(300)
        browser.click('#create-playlist-collapse-review a.btn-save.enabled')
    });
    this.Then(/^I should see the image with duration added to this playlist media$/, function () {
        utils.waitForElements('#container-playlists .container-item-playlist', this.currentPlaylistsCnt+1);

        const playlist = fixtures.getCanoncialPlaylists({name:this.input.playlistTitle}, {}, {items:true})[0]; //console.log("New playlist", playlist);

        this.selectedElement = browser.element(`#container-playlists .container-item-playlist[data-id="${playlist._id}"]`).value; //console.log(this.selectedElement);

        browser.elementIdElement(this.selectedElement.ELEMENT, 'a.btn-playlist-details').click();


        const images = [];
        playlist.items.forEach((item) => {
           if(item.media.type == 'image') images.push(item.media);
        });

        const imageElNames = [].concat(browser.elementIdElements(this.selectedElement.ELEMENT, '.container-playlistitems .container-media-item[data-type=image] .display-playlistitem-name').getText());
        const imageElDurations = [].concat(browser.elementIdElements(this.selectedElement.ELEMENT, '.container-playlistitems .container-media-item[data-type=image] .display-playlistitem-duration').getText());

        expect(imageElNames.length).toEqual(images.length);
        expect(imageElDurations.length).toEqual(images.length);

        imageElNames.forEach((name) => {
           expect(_.contains(_.pluck(images, 'name'), name)).toEqual(true);
        });

        const durations = this.selectedDurations
        imageElDurations.forEach((duration, index) => {
           expect(duration).toEqual(utils.convertedDuration(durations[index]));
        });

    });

    /*this.When(/^I select to overwrite a playlist$/, function () {
        browser.element(selectors.playlist.addForm.clsDivSearchItemPlaylistContainer).waitForVisible(3000);
        browser.moveToObject(selectors.playlist.addForm.clsDivSearchItemPlaylistContainer+":first-child");
        browser.element(selectors.playlist.addForm.clsButtonPlaylistOverwrite).waitForVisible(3000);
        browser.click(selectors.playlist.addForm.clsButtonPlaylistOverwrite);

        this.selectedPlayListId = browser.getAttribute(selectors.playlist.addForm.clsDivSearchItemPlaylistContainer+":first-child", "data-id");
    });


    this.When(/^I filter the results by media,playlist or all type$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });
    this.Then(/^I should see list of media,playlist or both accorfing to the selected type$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });*/

}

