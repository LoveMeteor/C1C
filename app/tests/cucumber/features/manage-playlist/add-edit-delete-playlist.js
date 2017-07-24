let _ = require('underscore'),
    faker = require('faker');

module.exports = function () {
    this.When(/^I enter playlist name, theme, industry and tags$/, function () {
        this.input = {};
        // Input title
        this.input.playlistTitle = faker.lorem.word();
        browser.waitForExist('input[placeholder="Playlist title"]', 5000);
        browser.setValue('input[placeholder="Playlist title"]', this.input.playlistTitle);

        // Select an industry
        browser.click('#create-playlist-collapse-title .selector-industry div');
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
        browser.click('#create-playlist-collapse-title .selector-theme div');
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

        // Input some tags
        browser.setValue('#create-playlist-collapse-title input[placeholder="Select Tags"]', faker.lorem.word());
        browser.keys('Enter');

        browser.waitForExist('#create-playlist-collapse-title a.btn-continue', 5000);
        browser.click('#create-playlist-collapse-title a.btn-continue');
    });
    this.When(/^choose the suitable area$/, function () {
        // Select a presentation machine
        const pms = fixtures.getPresentationMachines();
        browser.click('#create-playlist-collapse-area .selector-area div');
        browser.waitForExist('#create-playlist-collapse-area .selector-area li.option', 5000);
        var liNames = browser.elements('#create-playlist-collapse-area .selector-area li.option').getText();

        expect(liNames.length).toEqual(pms.length);
        liNames.forEach((liName, index) => {
            const pm = pms[index];
            expect(liName).toEqual(pm.name);
        });
        var index = _.random(0, pms.length-1);
        this.input.presentationMachine = pms[index];
        browser.click(`#create-playlist-collapse-area .selector-area li.option[data-id="${this.input.presentationMachine._id}"]`);

        browser.click('#create-playlist-collapse-area a.btn-continue');

    });
    this.When(/^add medias$/, function () {

        // Select some playlists to add and click Continue button
        const playlists = fixtures.getCanoncialPlaylists({presentationMachineId:this.input.presentationMachine._id});
        utils.waitForElements('#create-playlist-collapse-add-media .container-item-playlist', playlists.length);

        const samplePlaylist = _.sample(playlists)

        browser.click(`#create-playlist-collapse-add-media .container-item-playlist[data-id="${samplePlaylist._id}"] svg.action-icon-add`)


        browser.click('#create-playlist-collapse-add-media .div-playlist-media-search-result a.btn-continue');

        // Set duration time for image media and click Continue button
        const itemSelector = '#create-playlist-collapse-review .container-review-media .container-item-playlist-media'

        const itemEls = browser.elements(itemSelector).value
        const durations = []
        itemEls.forEach((el) => {
            const mediaTypeClass = browser.elementIdElement(el.ELEMENT, 'svg:first-child').getAttribute('class')

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

        //console.log('123456')
        utils.sleep(300)
        browser.click('#create-playlist-collapse-review a.btn-save.enabled')
    });

    this.Then(/^new playlist should be created in the selected area$/, function () {
        const inputedTitle = this.input.playlistTitle;
        browser.waitUntil(() => {
            const titles = browser.getText(`#container-playlists .container-item-playlist .display-playlist-name`);

            return _.contains(titles, inputedTitle);
        }, 50000);
    });

    this.When(/^I delete a playlist$/, function () {
        const playlists = fixtures.getCanoncialPlaylists({}, {sort:{name:1}});

        utils.waitForElements('#container-playlists .container-item-playlist', playlists.length);

        this.selectedPlaylist = _.sample(playlists)

        browser.click(`#container-playlists .container-item-playlist[data-id="${this.selectedPlaylist._id}"] .action-delete-playlist`)

        const btnElDel = browser.element('.modal-boron .btn-delete');
        btnElDel.waitForExist(500);
        btnElDel.scroll();
        btnElDel.click();
    });

    this.Then(/^I shouldn't see this playlist in the list$/, function () {

        const playlistName = this.selectedPlaylist.name;

        browser.waitUntil(() => {
            const elNames = [].concat(browser.getText('#container-playlists .container-item-playlist .display-playlist-name'));

            return !_.contains(elNames, playlistName);
        }, 5000);
    });

    this.Given(/^I am viewing a playlist$/, function () {
        this.subUrl = 'playlists/';
        browser.url(`${this.baseUrl}/${this.subUrl}`);

        browser.waitForExist('div=Playlists', 10000);


        const playlists = fixtures.getCanoncialPlaylists({}, {sort:{name:1}}, {items:true});

        utils.waitForElements('#container-playlists .container-item-playlist', playlists.length);


        this.selectedPlaylist = _.sample(playlists);

        browser.click(`#container-playlists .container-item-playlist[data-id="${this.selectedPlaylist._id}"] svg.action-icon-settings`)
    });

    this.When(/^I edit a playlist by changing playlist name, theme, industry or tags$/, function () {
        this.input = {}
        // 1. Input title
        this.input.playlistTitle = faker.lorem.word()
        browser.waitForExist('input[placeholder="Playlist title"]', 5000)
        browser.setValue('input[placeholder="Playlist title"]', this.input.playlistTitle)

        // 2. Select an industry
        browser.click('#create-playlist-collapse-title .selector-industry div')
        browser.waitForExist('#create-playlist-collapse-title .selector-industry li', 5000)
        let liNames = browser.elements('#create-playlist-collapse-title .selector-industry li').getText()
        const industries = fixtures.getIndustries()
        expect(liNames.length).toEqual(industries.length+1)
        expect(liNames.every((name, index) => {
            if(index == 0) {
                return name === 'Reset'
            } else {
                const industry = industries[index-1]
                return name === industry.name;
            }
        })).toEqual(true)

        browser.click(`#create-playlist-collapse-title .selector-industry li:first-child`)
        browser.click('#create-playlist-collapse-title .selector-industry div');
        browser.waitForExist('#create-playlist-collapse-title .selector-industry li', 5000)

        let index = _.random(0, industries.length-1)
        this.input.industry = industries[index];
        browser.click(`#create-playlist-collapse-title .selector-industry li:nth-child(${index+1})`)

        // 3. Select an theme
        browser.click('#create-playlist-collapse-title .selector-theme div')
        browser.waitForExist('#create-playlist-collapse-title .selector-theme li', 5000)
        liNames = browser.elements('#create-playlist-collapse-title .selector-theme li').getText()
        const themes = fixtures.getThemes();
        expect(liNames.length).toEqual(themes.length+1)
        expect(liNames.every((name, index) => {
            if(index == 0) {
                return name === 'Reset'
            } else {
                const theme = themes[index-1]
                return name === theme.name
            }
        })).toEqual(true)

        browser.click(`#create-playlist-collapse-title .selector-theme li:first-child`)
        browser.click('#create-playlist-collapse-title .selector-theme div')
        browser.waitForExist('#create-playlist-collapse-title .selector-theme li', 5000)

        index = _.random(0, themes.length-1)
        this.input.theme = themes[index]
        browser.click(`#create-playlist-collapse-title .selector-theme li:nth-child(${index+1})`)

        // 4. Input some tags
        browser.setValue('#create-playlist-collapse-title input[placeholder="Select Tags"]', faker.lorem.word())
        browser.keys('Enter');

        browser.waitForExist('#create-playlist-collapse-title a.btn-continue', 5000)
        browser.click('#create-playlist-collapse-title a.btn-continue')

        // 5. Select a presentation machine
        const pms = fixtures.getPresentationMachines()
        browser.click('#create-playlist-collapse-area .selector-area div');
        browser.waitForExist('#create-playlist-collapse-area .selector-area li.option', 5000);
        liNames = browser.elements('#create-playlist-collapse-area .selector-area li.option').getText();

        expect(liNames.length).toEqual(pms.length+1);
        expect(liNames.every((name, index) => {
            if(index == 0) {
                return name === 'Reset'
            } else {
                const pm = pms[index-1]
                return name === pm.name
            }
        })).toEqual(true)

        index = _.random(0, pms.length-1);
        this.input.presentationMachine = pms[index];
        browser.click(`#create-playlist-collapse-area .selector-area li.option[data-id="${this.input.presentationMachine._id}"]`);

        browser.click('#create-playlist-collapse-area a.btn-continue')


        // 6. Select some playlists to add and click Continue button
        const playlists = fixtures.getCanoncialPlaylists({presentationMachineId:this.input.presentationMachine._id},{},{items:true})
        utils.waitForElements('#create-playlist-collapse-add-media .container-item-playlist', playlists.length)

        const editingPlaylist = this.selectedPlaylist
        const samplePlaylist = _.sample(playlists.filter((p) => p._id!=editingPlaylist._id))
        //console.log(samplePlaylist)

        browser.click(`#create-playlist-collapse-add-media .container-item-playlist[data-id="${samplePlaylist._id}"] svg.action-icon-add`)
        browser.click('#create-playlist-collapse-add-media .div-playlist-media-search-result a.btn-continue')

        // 7. Set duration time for image media and click Continue button
        const samplePlaylistMediaIds = _.pluck(samplePlaylist.items, 'mediaId')
        const editingPlaylistMediaIds = _.pluck(editingPlaylist.items, 'mediaId')

        const itemSelector = '#create-playlist-collapse-review .container-review-media .container-item-playlist-media'
        utils.waitForElements(itemSelector, editingPlaylist.presentationMachineId===samplePlaylist.presentationMachineId ? _.uniq(editingPlaylistMediaIds.concat(samplePlaylistMediaIds)).length : samplePlaylistMediaIds.length)

        const itemEls = browser.elements(itemSelector).value
        const durations = []
        itemEls.forEach((el) => {
            const mediaTypeClass = browser.elementIdElement(el.ELEMENT, 'svg:first-child').getAttribute('class')

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

        //console.log('123456')
        utils.sleep(300)
        browser.click('#create-playlist-collapse-review a.btn-save.enabled')
    });

    this.Then(/^I should see the playlist with the updated information$/, function () {
        const newPlaylistName = this.input.playlistTitle
        const playlist = fixtures.getCanoncialPlaylistById(this.selectedPlaylist._id)
        expect(browser.getText(`#container-playlists .container-item-playlist[data-id="${playlist._id}"] .display-playlist-name`)).toEqual(newPlaylistName)
    });
}