const _ = require('underscore');

module.exports = function () {
    this.When(/^I select multiple media files$/, function () {
        let clsItemContainer, clsDisplayItemName;

        if (this.subUrl == 'receptionwall') {
            clsItemContainer = selectors.playlist.view.clsDivItemContainer;
            clsDisplayItemName = selectors.playlist.view.clsDisplayItemName;
        } else if (this.subUrl == 'media') {
            clsItemContainer = selectors.media.clsMediaItemContainer;
            clsDisplayItemName = selectors.media.clsMediaItemName;
        }

        const items = browser.elements(clsItemContainer).value;
        expect(items.length).toBeGreaterThan(1);

        const selectedItems = _.sample(items, _.random(2, items.length));

        const selectedMediaNames = [];
        selectedItems.forEach((item) => {
            const itemEl = browser.elementIdElement(item.ELEMENT);
            itemEl.click('input[type=checkbox]');
            selectedMediaNames.push(itemEl.getText(clsDisplayItemName));
        });

        this.selectedMediaCount = selectedMediaNames.length;
        this.selectedMediaNames = selectedMediaNames;
    });

    this.When(/^press enter$/, () => {
        // Write code here that turns the phrase above into concrete actions
        browser.keys('\uE007');

    });


    this.When(/^delete these files$/, function () {

        let idDropdownBulkActions, nth;
        if (this.subUrl == 'receptionwall') {
            idDropdownBulkActions = selectors.playlist.view.idDropdownBulkActions;
            nth = 3;
        } else if (this.subUrl == 'media') {
            idDropdownBulkActions = selectors.media.idDropdownBulkActions;
            nth = 0;
        }

        browser.click(idDropdownBulkActions);

        // Should be replaced as correct selector for Disabling Overlay
        browser.click(`ul[aria-labelledby=${idDropdownBulkActions.substring(1)}] li:nth-child(${nth})`);
    });

    this.Then(/^I should see all media files in this playlist added to the current playlist$/, function () {
        if (this.subUrl == 'presenter') {
            if(this.selectedPlaylistId) {
                const playlist = fixtures.getCanoncialPlaylistById(this.selectedPlaylistId);
                const playlistItemIds = _.pluck(playlist.items, '_id');
                //console.log(`${selectors.presentation.idPlayerContainer  } li`, '123456')
                browser.waitUntil(() => browser.isExisting(`${selectors.presentation.idPlayerContainer  } li`), 10000);

                const itemIds = browser.elements(`${selectors.presentation.idPlayerContainer  } li`).getAttribute('data-id');

                playlistItemIds.forEach((itemId) => {
                    expect(_.contains(_.pluck(itemIds, 'value'), itemId));
                });
            }
        } else if (this.subUrl == 'playlists') {
            const selectedPlaylist = this.selectedPlaylist;

            const names = selectedPlaylist.items.map((item) => item.media.name);

            //console.log(selectedPlaylist, names, 123)
            const selector = '#create-playlist-collapse-review .container-review-media .container-item-playlist-media .display-playlistitem-name'
            utils.waitForElements(selector, names.length);
            const mediaNames = [].concat(browser.getText(selector));

            //console.log("Added Media Names", mediaNames);

            expect(mediaNames.length).toEqual(this.selectedPlaylist.items.length);


            mediaNames.forEach((name) => {
                expect(_.contains(names, name)).toEqual(true);
            });
        }
    });


    this.When(/^I select a theme$/, function () {
        if (this.subUrl == 'presenter') {
            const selector = '.themes-list a.list-tile';

            browser.waitUntil(() => browser.isExisting(selector), 10000);

            const themes = fixtures.getThemes();
            const selectedPMId = this.selectedPresentationMachine._id
            const items = browser.elements(selector).value;

            expect(items.length).toEqual(themes.length);
            // We filter to only pick a theme with Medias and Playlists
            const filteredThemes = themes.filter(theme => {
                const medias = fixtures.getMedias({themeId: theme._id, presentationMachineIds: selectedPMId}).length
                const playlists = fixtures.getCanoncialPlaylists({
                    themeId: theme._id,
                    presentationMachineId: selectedPMId
                }).length
                return !!medias && !!playlists
            })

            const index = _.random(0, filteredThemes.length - 1);
            this.selectedTheme = filteredThemes[index];

            browser.element(`${selector}[data-id="${this.selectedTheme._id}"]`).click()
        }
        else if (this.subUrl == 'playlists') {
            // Find theme selection element
            browser.waitForExist('#form-select-theme', 5000);

            // Click theme selection element
            browser.click('#form-select-theme');

            browser.waitForExist('#form-select-theme li', 5000);
            // Get 'li' tags from selection element
            var liNames = browser.elements('#form-select-theme li').getText();

            var themes = fixtures.getThemes();

            // Check dropdown items count is equal to themes count
            expect(liNames.length).toEqual(themes.length);

            // Check dropdown item name is equal to every theme name
            liNames.forEach((liName, index) => {
                const theme = themes[index];
                expect(liName).toEqual(theme.name);
            });

            // Select a theme and click specific dropdown item on browser
            var index = _.random(0, themes.length - 1);
            this.selectedTheme = themes[index];

            browser.click(`#form-select-theme li:nth-child(${index + 1})`);
        } else if (this.subUrl == 'media') {
            // Find theme selection element
            browser.waitForExist('#search-theme', 5000);

            // Click theme selection element
            browser.click('#search-theme');

            browser.waitForExist('#search-theme li', 5000);
            // Get 'li' tags from selection element
            var liNames = browser.elements('#search-theme li').getText();

            var themes = fixtures.getThemes();

            // Check dropdown items count is equal to themes count
            expect(liNames.length).toEqual(themes.length);

            // Check dropdown item name is equal to every theme name
            liNames.forEach((liName, index) => {
                const theme = themes[index];
                expect(liName).toEqual(theme.name);
            });

            // Select a theme and click specific dropdown item on browser
            var index = _.random(0, themes.length - 1);
            this.selectedTheme = themes[index];

            browser.click(`#search-theme li:nth-child(${index + 1})`);
        }
    });

    this.When(/^I select an industry$/, function () {
        if (this.subUrl == 'presenter') {
            const selector = '.industries-list a.list-tile';

            browser.waitUntil(() => browser.isExisting(selector), 10000);

            var industries = fixtures.getIndustries();

            const items = browser.elements(selector).value;

            expect(items.length).toEqual(industries.length);

            const index = _.random(0, items.length - 1);

            browser.elementIdClick(items[index].ELEMENT);

            this.selectedIndustry = industries[index];
        }
        if (this.subUrl == 'playlists') {
            browser.waitForExist('#form-select-industry', 5000);

            browser.click('#form-select-industry');

            browser.waitForExist('#form-select-industry li', 5000);

            var liNames = browser.elements('#form-select-industry li').getText();

            var industries = fixtures.getIndustries();

            expect(liNames.length).toEqual(industries.length);

            liNames.forEach((liName, index) => {
                const industry = industries[index];
                expect(liName).toEqual(industry.name);
            });

            var index = _.random(0, industries.length - 1);
            this.selectedIndustry = industries[index]; //console.log(this.selectedIndustry);

            browser.click(`#form-select-industry li:nth-child(${index + 1})`);
        }
        if (this.subUrl == 'client') {
            browser.waitForExist('#form-select-industry', 5000);

            browser.click('#form-select-industry');

            browser.waitForExist('#form-select-industry li', 5000);

            const liNames = browser.elements('#form-select-industry li').getText();

            const industries = fixtures.getIndustries({},{sort: {name:1}});
            expect(liNames.length).toEqual(industries.length);

            liNames.forEach((liName, index) => {
                const industry = industries[index];
                expect(liName).toEqual(industry.name);
            });

            var index = _.random(0, industries.length - 1);
            this.selectedIndustry = industries[index]; //console.log(this.selectedIndustry);

            browser.click(`#form-select-industry li:nth-child(${index + 1})`);
        }
        if (this.subUrl == 'media') {
            browser.waitForExist('#search-industry', 5000);

            browser.click('#search-industry');

            browser.waitForExist('#search-industry li', 5000);

            var liNames = browser.elements('#search-industry li').getText();

            var industries = fixtures.getIndustries();

            expect(liNames.length).toEqual(industries.length);

            liNames.forEach((liName, index) => {
                const industry = industries[index];
                expect(liName).toEqual(industry.name);
            });

            var index = _.random(0, industries.length - 1);
            this.selectedIndustry = industries[index]; //console.log(this.selectedIndustry);

            browser.click(`#search-industry li:nth-child(${index + 1})`);
        }
        return false
    });

    this.When(/^I select specific presentation machine$/, function () {
        if (this.subUrl == 'playlists') {
            const pms = fixtures.getPresentationMachines();
            const index = _.random(0, pms.length - 1);
            this.selectedPresentationMachine = pms[index];

            utils.waitForElements('.DivPresentationMachines', pms.length)
            const pmIds = browser.elements('.DivPresentationMachines').getAttribute('data-id'); //console.log(pmIds);

            expect(pmIds.length).toEqual(pms.length);

            browser.elementIdClick(browser.elements('.DivPresentationMachines').value[index].ELEMENT);
        }
        if (this.subUrl == 'presenter') {
            const pms = fixtures.getPresentationMachinesForPresenter();
            const index = _.random(0, pms.length - 1);
            this.selectedPresentationMachine = pms[index];

            browser.waitForExist('.top-navbar .selector-area div', 5000)
            browser.click('.top-navbar .selector-area div');
            browser.waitForExist('.top-navbar .selector-area li.option', 5000);
            const liNames = browser.elements('.top-navbar .selector-area li.option').getText();

            expect(liNames.length).toEqual(pms.length);
            expect(liNames.every((name, index) => {
                const pm = pms[index]
                return name === pm.name
            })).toEqual(true)

            browser.click(`.top-navbar .selector-area li.option[data-id="${this.selectedPresentationMachine._id}"]`);

        }
    });

    this.When(/^I select all areas filter$/, function () {
        if (this.subUrl == 'media') {
            return 'pending';
        } else if (this.subUrl == 'playlists') {
            browser.waitForExist('#SelectAllAreas', 5000);

            browser.click('#SelectAllAreas');
        }
    });

    this.When(/^I select a playlist$/, function () {
        const url = browser.getUrl()

        if(this.subUrl == 'playlists')
        {
            if(url.indexOf('createPlaylist') > -1 || url.indexOf('editPlaylist') > -1) {
                const playlists = fixtures.getCanoncialPlaylists({presentationMachineId:this.input.presentationMachine._id}, {}, {items:true})

                utils.waitForElements('#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-playlist .container-item-playlist', playlists.length)

                this.selectedPlaylist = _.sample(playlists)
                //console.log(playlists, this.selectedPlaylist, 1234)

                browser.click(`#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-playlist .container-item-playlist[data-id="${this.selectedPlaylist._id}"] a.btn-playlist-details`)
            } else {
                const playlists = fixtures.getCanoncialPlaylists({}, {sort:{name:1}}, {items:true})

                utils.waitForElements('#container-playlists .container-item-playlist', playlists.length)

                this.selectedPlaylist = _.sample(playlists)

                browser.click(`#container-playlists .container-item-playlist[data-id="${this.selectedPlaylist._id}"] a.btn-playlist-details`)
            }
        }
        else if(this.subUrl == 'engagements') {
            // 1 Select a PM
            const pms = fixtures.getPresentationMachines({},true)
            const elPms = browser.elements('#create-engagement-collapse-media .tab-presentation-machine').getAttribute('data-id');
            expect(elPms.length).toEqual(pms.length)
            this.input.presentationMachine = _.sample(pms)
            browser.click(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${this.input.presentationMachine._id}"]`)

            // 2 Select some playlists and add
            const playlists = fixtures.getCanoncialPlaylists({presentationMachineId:this.input.presentationMachine._id}, {}, {items:true});
            utils.waitForElements(`#create-engagement-collapse-media .media-search-container[data-id="${this.input.presentationMachine._id}"] .container-item-playlist`, playlists.length);

            this.selectedPlaylist = _.sample(playlists)

            browser.click(`#create-engagement-collapse-media .media-search-container[data-id="${this.input.presentationMachine._id}"] .container-item-playlist[data-id="${this.selectedPlaylist._id}"] a.btn-playlist-details`)
        }
    });

    this.When(/^I choose to preview a media file$/, function () {
        const url = browser.getUrl()

        if (this.subUrl == 'presenter') {
            const medias = this.medias.filter(m=>m.isReady);
            if(!medias || medias.length==0) {
                console.log('There are no downloaded medias')
                return
            }
            this.selectedMedia = _.sample(medias)
            this.selectedMediaId = this.selectedMedia._id
            browser.click(`#presenter-medias-view .media-list > li[data-id="${this.selectedMediaId}"] .item-text`)
            browser.waitUntil(() => browser.isExisting(`#presenter-medias-view .media-list > li[data-id="${this.selectedMedia._id}"] svg.action-icon-play`), 10000)
            browser.click(`#presenter-medias-view .media-list > li[data-id="${this.selectedMediaId}"] svg.action-icon-play`)
        } else if(this.subUrl == 'media') {
            const medias = fixtures.getMedias({}, {sort:{name:1}})

            browser.waitUntil(() => browser.elements('#container-medias .media-item-container').value.length == medias.length)

            const sampleMedia = _.sample(medias)

            browser.click(`#container-medias .media-item-container[data-id="${sampleMedia._id}"] .action-preview-media`)
            this.selectedMedia = sampleMedia
            this.selectedMediaId = sampleMedia._id
        } else {
            let selector
            if (this.subUrl == 'playlists') {
                if(url.indexOf('createPlaylist')>-1 || url.indexOf('editPlaylist')>-1) {
                    selector = `#create-playlist-collapse-add-media .div-playlist-media-search-result .div-media-wrapper-playlist .container-item-playlist[data-id="${this.selectedPlaylist._id}"] .container-playlistitems`
                } else {
                    selector = `#container-playlists .container-item-playlist[data-id="${this.selectedPlaylist._id}"] .container-playlistitems`
                }

            } else if (this.subUrl == 'engagements') {
                selector = `#create-engagement-collapse-media .container-item-playlist[data-id="${this.selectedPlaylist._id}"] .container-playlistitems`
            }

            //console.log(this.selectedPlaylist)
            browser.waitForExist(selector, 5000)
            browser.waitUntil(() => browser.elements(`${selector} .container-media-item`).value.length == this.selectedPlaylist.items.length)

            const playlistitems = this.selectedPlaylist.items
            const samplePlaylistitem = _.sample(playlistitems)

            browser.click(`${selector} .container-media-item[data-id="${samplePlaylistitem.media._id}"] .action-preview-media`)

            this.selectedMedia = samplePlaylistitem.media
            this.selectedMediaId = samplePlaylistitem.media._id;
        }

    });

    this.Then(/^I should see a preview of this media file$/, function () {
        const mediaLink = fixtures.getMediaLinkById(this.selectedMedia._id, this.selectedMedia.type == 'image' ? 'preview' : null);

        if (mediaLink) {
            const src = browser.elementIdElement(browser.elementActive().value.ELEMENT, this.selectedMedia.type == 'image' ? 'img' : 'video').getAttribute('src'); //console.log(browser.elementActive());
            expect(src).toEqual(mediaLink);
        } else {
            expect(browser.elementIdElement(browser.elementActive().value.ELEMENT, 'div=No media').isExisting()).toEqual(true);
        }

    });

    this.Given(/^I am viewing currently playing playlist in a presentation machine$/, function () {
        const userId = browser.execute(() => Meteor.userId());

        const pms = fixtures.getPresentationMachines();
        const index = _.random(0, pms.length - 1);
        this.selectedPresentationMachine = pms[index];

        if (fixtures.userIsInRole(userId.value, 'admin')) {

        }
        else if (fixtures.userIsInRole(userId.value, 'presenter')) {
            this.subUrl = 'presenter';
            browser.url(`${this.baseUrl}/${this.subUrl}`);

            browser.waitUntil(() => browser.isExisting('a.top-nav-button'), 10000)

            // 1. Check presentation machine selection buttons exist
            const pms = fixtures.getPresentationMachinesForPresenter()

            browser.waitForExist('.top-navbar .selector-area div', 5000)
            browser.click('.top-navbar .selector-area div');
            browser.waitForExist('.top-navbar .selector-area li.option', 5000);
            const liNames = browser.elements('.top-navbar .selector-area li.option').getText();

            expect(liNames.length).toEqual(pms.length);
            expect(liNames.every((name, index) => {
                const pm = pms[index]
                return name === pm.name
            })).toEqual(true)

            // 2. Select a prensentation machine
            const pm = _.sample(pms)
            browser.click(`.top-navbar .selector-area li.option[data-id="${pm._id}"]`)

            browser.waitForExist('#media-control-container', 5000)

            this.selectedPresentationMachine = pm

            // 3. Get player status for selected presentation machine
            const status = fixtures.getPlayerStatusForPresentationMachine(pm._id)
            //console.log("Player last status", status)
            this.currentPlayerStatus = status

            // 4. Get playlist due to current player status
            //console.log(status.playlistId,'1')
            const playlist = fixtures.getPlaylists({_id: status.playlistId}, {}, {playlistitems:true})[0]
            //console.log("Current playlist", playlist)

            this.selectedPlaylist = playlist
        }
    });

    this.Then(/^I should see list of media files titles,type and duration in this playlist$/, function () {
        const playlistItems = this.selectedPlaylist.items,
            medias = _.pluck(playlistItems, 'media');
        //console.log(this.selectedPlaylist)
        let mediaIds = [],
            mediaItemNames = [],
            playlistItemDurations = [];

        if (this.subUrl == 'presenter') {
            const selector = '#playlist-presenter-container li.presenter-playlist-item-container'

            utils.waitForElements(selector, medias.length)

            const els = browser.elements(selector).value

            els.forEach(el => {
                mediaIds.push(browser.elementIdAttribute(el.ELEMENT, 'data-id').value)
                mediaItemNames.push(browser.elementIdElement(el.ELEMENT, '.item-text').getText())
                playlistItemDurations.push(browser.elementIdElement(el.ELEMENT, '.item-duration').getText())
            })

        } else if (this.subUrl == 'playlists') {
            // Create a variable with the selector to get a code cleaner
            const els = `#container-playlists .container-item-playlist[data-id="${this.selectedPlaylist._id}"] .container-playlistitems .container-media-item`
            // Create the variables that will receive the datas
            // Wait until we get the full list loaded
            //console.log(this.selectedPlaylist)
            browser.waitUntil(() => browser.elements(els).value.length == this.selectedPlaylist.items.length)
            // Get the elements
            const elIds = browser.elements(els).value

            // Loop over the whole list
            elIds.forEach(media => {
                mediaIds.push(browser.elementIdAttribute(media.ELEMENT, 'data-id').value)
                mediaItemNames.push(browser.elementIdElement(media.ELEMENT, '.display-playlistitem-name').getText())
                playlistItemDurations.push(browser.elementIdElement(media.ELEMENT, '.display-playlistitem-duration').getText())
            })
        }

        expect(mediaIds.length).toEqual(medias.length);
        mediaIds.forEach((mediaId, index) => {
            const item = playlistItems[index],
                itemName = mediaItemNames[index],
                itemDuration = playlistItemDurations[index];

            //console.log("Item", mediaId, item, index);
            expect(itemName).toEqual(item.media.name);

            if (item.media.type == 'image') {
                if (item.duration == null || item.duration == 0) {
                    expect(itemDuration).toEqual('');
                } else {
                    expect(itemDuration).toEqual(utils.convertedDuration(item.duration));
                }
            } else if (item.media.type == 'video') {
                if (item.media.videoDuration == null || item.media.videoDuration == 0) {
                    expect(itemDuration).toEqual('');
                } else {
                    expect(itemDuration).toEqual(utils.convertedDuration(item.media.videoDuration));
                }
            }
        });
    });


}