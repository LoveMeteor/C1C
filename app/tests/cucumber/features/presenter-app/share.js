const _ = require('underscore');

module.exports = function () {

    this.Given(/^I am on home page$/, function () {
        this.subUrl = 'presenter'

        browser.url(`${this.baseUrl}/${this.subUrl}`)
    });


    this.Then(/^I should see all media files in this playlist replaced the current playlist$/, function () {
        if(this.selectedPlaylistId) {
            const playlist = fixtures.getCanoncialPlaylistById(this.selectedPlaylistId); //console.log(playlist)
            const mediaIds = _.pluck(playlist.items, 'mediaId');

            let elItems;
            browser.waitUntil(() => {
                if(!browser.isExisting('#playlist-presenter-container .current-playlist-container')) return false

                elItems = browser.elements('#playlist-presenter-container .current-playlist-container li.presenter-playlist-item-container').value
                //console.log(elItems, mediaIds, elItems.length, mediaIds.length, '12345678')
                if(elItems.length != mediaIds.length) return false

                let match = true
                elItems.forEach((el) => {
                    const elItemId = browser.elementIdAttribute(el.ELEMENT, 'data-id').value
                    const playlistitem = fixtures.getPlaylistItemById(elItemId)
                    if(!_.contains(mediaIds, playlistitem.mediaId)) match = false
                });
                return match

            }, 10000);
        }
    });

    this.When(/^I add playlist and choose to Append to currently playing playlist$/, function () {
        browser.waitForExist('#player', 5000)

        const playlists = this.playlists.filter(p=>p.isReady)
        if(!playlists || playlists.length==0) {
            console.log('There are no downloaded playlists')
            return
        }
        this.selectedPlaylistId = _.sample(playlists)._id

        if(browser.getUrl().indexOf('search')>-1) {
            browser.click(`#playlist-group .search-results-list > li[data-id="${this.selectedPlaylistId}"] svg.action-icon-add`)
        } else {
            browser.click(`.playlist-list > li[data-id="${this.selectedPlaylistId}"] svg.action-icon-add`)
        }

        browser.waitUntil(() => browser.isExisting('.modal-addToPlayer'), 10000)
        browser.click('.modal-addToPlayer .modal-actions .action-icon-add')
    });

    this.When(/^I add playlist and choose to Overwrite the currently playing playlist$/, function () {
        browser.waitForExist('#player', 5000)

        const playlists = this.playlists.filter(p=>p.isReady)
        if(!playlists || playlists.length==0) {
            console.log('There are no downloaded playlists')
            return
        }
        this.selectedPlaylistId = _.sample(playlists)._id


        if(browser.getUrl().indexOf('search')>-1) {
            browser.click(`#playlist-group .search-results-list > li[data-id="${this.selectedPlaylistId}"] svg.action-icon-add`)
        } else {
            browser.click(`.playlist-list > li[data-id="${this.selectedPlaylistId}"] svg.action-icon-add`)
        }

        browser.waitUntil(() => browser.isExisting('.modal-addToPlayer'), 10000)
        browser.click('.modal-addToPlayer .modal-actions .action-icon-remove')

    });

    this.When(/^I add playlist to my favourites$/, function () {
        browser.waitForExist('#player', 5000)

        const favorites = _.pluck(fixtures.getFavorites({favoriteType:'canoncialplaylists'}),'itemId')
        const playlists = this.playlists.filter(p=>p.isReady&&!_.contains(favorites, p._id))
        if(!playlists || playlists.length==0) {
            console.log('There are no downloaded playlists')
            return
        }
        this.selectedPlaylist = _.sample(playlists)
        browser.click(`.playlist-list > li[data-id="${this.selectedPlaylist._id}"] .item-text`)
        browser.waitUntil(() => browser.isExisting(`.playlist-list > li[data-id="${this.selectedPlaylist._id}"] svg.action-icon-favourite`), 10000)
        browser.click(`.playlist-list > li[data-id="${this.selectedPlaylist._id}"] svg.action-icon-favourite`)
    });

    this.When(/^I add media to my favourites$/, function () {
        const medias = this.medias.filter(m=>m.isReady);
        if(!medias || medias.length==0) {
            console.log('There are no downloaded medias')
            return
        }
        this.selectedMedia = _.sample(medias)
        browser.click(`#presenter-medias-view .media-list > li[data-id="${this.selectedMedia._id}"] .item-text`)
        browser.waitUntil(() => browser.isExisting(`#presenter-medias-view .media-list > li[data-id="${this.selectedMedia._id}"] svg.action-icon-favourite`), 10000)
        browser.click(`#presenter-medias-view .media-list > li[data-id="${this.selectedMedia._id}"] svg.action-icon-favourite`)

    });

    this.Then(/^I should see it in my favourites list$/, function () {
        let selector = '';

        browser.waitUntil(() => browser.isExisting(selectors.presentation.clsNavItemFavourite), 10000);
        browser.click(selectors.presentation.clsNavItemFavourite);

        let itemNameToFind
        if(this.selectedItemType == 'playlist') {
            if(!this.selectedPlaylist) {
                console.log('There is no selected playlist'); return;
            }
            selector = '.items-list > li .item-text';
            itemNameToFind = this.selectedPlaylist.name
        }
        else {
            if(!this.selectedMedia) {
                console.log('There is no selected media'); return;
            }
            selector = '.items-list > li .item-text';

            browser.waitUntil(() => browser.isExisting(selectors.presentation.idSwitchToggle), 10000);
            browser.click(selectors.presentation.idSwitchToggle);

            itemNameToFind = this.selectedMedia.name
        }

        browser.waitUntil(() => browser.isExisting(selector), 10000);

        const items = browser.elements(selector).getText();
        const itemNames = _.pluck(items, 'value');

        expect(items.length).toBeGreaterThan(0);

        expect(_.contains(itemNames, itemNameToFind));
    });

    this.When(/^switch to media view$/, () => {
        browser.waitForExist(selectors.presentation.idSwitchToggle, 6000);
        browser.click(selectors.presentation.idSwitchToggle);
    });

    this.When(/^I add video to the currently playing playlist$/, function () {

        const medias = this.medias.filter(m=>m.isReady&&m.type=='video')
        if(!medias || medias.length==0) {
            console.log('There are no downloaded videos')
            return
        }
        this.selectedMediaId = _.sample(medias)._id
        this.currentPlaylistItemsCount = browser.elements('#player .current-playlist-container li.presenter-playlist-item-container').value.length;

        if(browser.getUrl().indexOf('search') > -1) {
            browser.click(`#video-group .search-results-list > li[data-id="${this.selectedMediaId}"] svg.action-icon-add`)
        } else {
            browser.click(`#presenter-medias-view .media-list > li[data-id="${this.selectedMediaId}"] svg.action-icon-add`)
        }
    });

    this.Then(/^I should see this video added at the end of the currently playing playlist$/, function () {
        const selectedMediaId = this.selectedMediaId
        if(selectedMediaId) {
            utils.waitForElements('#player .current-playlist-container li.presenter-playlist-item-container', this.currentPlaylistItemsCount+1)

            const selectedMedia = fixtures.getMediaById(selectedMediaId)
            expect(browser.getText('#player .current-playlist-container li.presenter-playlist-item-container:last-child .item-text')).toEqual(selectedMedia.name)
        }
    });

    this.When(/^I add image to the currently playing playlist$/, function () {
        const medias = this.medias.filter(m=>m.isReady&&m.type=='image')
        if(!medias || medias.length==0) {
            console.log('There are no downloaded images')
            return
        }
        this.selectedMediaId = _.sample(medias)._id
        this.currentPlaylistItemsCount = browser.elements('#player .current-playlist-container li.presenter-playlist-item-container').value.length;

        if(browser.getUrl().indexOf('search') > -1) {
            browser.click(`#image-group .search-results-list > li[data-id="${this.selectedMediaId}"] svg.action-icon-add`)
        } else {
            browser.click(`#presenter-medias-view .media-list > li[data-id="${this.selectedMediaId}"] svg.action-icon-add`)
        }

    });

    this.When(/^set duration to this image$/, () => {
        return;
    });

    this.Then(/^I should see this image added at the end of the currently playing playlist$/, function () {
        const selectedMediaId = this.selectedMediaId
        if(selectedMediaId) {
            utils.waitForElements('#player .current-playlist-container li.presenter-playlist-item-container', this.currentPlaylistItemsCount+1)

            const selectedMedia = fixtures.getMediaById(selectedMediaId)
            expect(browser.getText('#player .current-playlist-container li.presenter-playlist-item-container:last-child .item-text')).toEqual(selectedMedia.name)
        }
    });
}