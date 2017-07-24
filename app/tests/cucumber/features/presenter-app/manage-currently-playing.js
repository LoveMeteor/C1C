const _ = require('underscore');
module.exports = function () {

    this.When(/^I select another presentation machine$/, function () {
        const pms = fixtures.getPresentationMachinesForPresenter()

        const samplePM = _.sample(pms.filter(pm => pm._id!=this.selectedPresentationMachine._id))

        browser.waitForExist('.top-navbar .selector-area div', 5000)
        browser.click('.top-navbar .selector-area div')
        browser.waitForExist('.top-navbar .selector-area li.option', 5000);
        browser.click(`.top-navbar .selector-area li.option[data-id="${samplePM._id}"]`)
        this.selectedPresentationMachine = samplePM
    });

    this.Then(/^I should see playlist of the selected presentation machine$/, function () {

        const status = fixtures.getPlayerStatusForPresentationMachine(this.selectedPresentationMachine._id)
        const playlist = fixtures.getPlaylists({_id: status.playlistId}, {}, {playlistitems:true})[0]

        this.selectedPlaylist = playlist

        const playlistItems = this.selectedPlaylist.items;
        //console.log(this.selectedPlaylist)
        const elPlaylistItemIds = [],
            mediaItemNames = [],
            playlistItemDurations = [];

        const selector = '#playlist-presenter-container li.presenter-playlist-item-container'

        utils.waitForElements(selector, playlistItems.length)

        const els = browser.elements(selector).value

        els.forEach(el => {
            elPlaylistItemIds.push(browser.elementIdAttribute(el.ELEMENT, 'data-id').value)
            mediaItemNames.push(browser.elementIdElement(el.ELEMENT, '.item-text').getText())
            playlistItemDurations.push(browser.elementIdElement(el.ELEMENT, '.item-duration').getText())
        })

        expect(elPlaylistItemIds.length).toEqual(playlistItems.length);
        elPlaylistItemIds.forEach((itemId, index) => {
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
            } else if (item.media.type == 'video') {//console.log(item, '1234567')
                if (item.media.videoDuration == null || item.media.videoDuration == 0) {
                    expect(itemDuration).toEqual('');
                } else {
                    expect(itemDuration).toEqual(utils.convertedDuration(item.media.videoDuration));
                }
            }
        });
    });

    this.Then(/^I should see the currently playing media in different style$/, function () {
        const currentPlaylistItem = _.find(this.selectedPlaylist.items, {_id:this.currentPlayerStatus.playerUpdate.playlistItemId})

        //console.log(currentPlaylistItem, this.selectedPlaylist.items, this.currentPlayerStatus, '1')
        const selector = `#playlist-presenter-container li.presenter-playlist-item-container[data-id="${currentPlaylistItem._id}"]`
        const style = browser.getCssProperty(selector, 'color')
        //console.log(selector, style, '1234')
        expect(style.value).toEqual('rgba(255,87,0,1)')
    });

    this.Then(/^I should see playlist total duration$/, function () {
        //console.log("Current presentation machine", this.selectedPresentationMachine)
        const status = fixtures.getPlayerStatusForPresentationMachine(this.selectedPresentationMachine._id); //console.log(status,1)
        const playlistItem = fixtures.getPlaylistItemById(status.playerUpdate.playlistItemId)

        //console.log("Current PlaylistItem", playlistItem)
        browser.waitUntil(() => {
            const selector = '#media-control-container span.total-time'
            if(!browser.isExisting(selector)) return false

            //console.log(browser.getText(selector), playlistItem.duration)
            return browser.getText(selector) == utils.convertedDuration(playlistItem.duration)
        }, 5000)

        this.currentPlayingStatus = status
        this.currentPlaylistItem = playlistItem

    });

    this.Then(/^I should see passed time from the whole playlist duration$/, function () {
        const status = this.currentPlayingStatus
        const playlistItem = this.currentPlaylistItem

        browser.waitUntil(() => {
            const selector = '#media-control-container span.current-time'
            if(!browser.isExisting(selector)) return false

            return browser.getText(selector) == utils.convertedDuration(status.playerUpdate.playedDuration)
        }, 5000)
    });

    this.Given(/^this playlist is being played$/, () => {
        if(browser.isExisting('#media-control-container svg.action-icon-play')) {
            browser.click('#media-control-container svg.action-icon-play')
        }
    });

    this.When(/^I click pause$/, () => {
        browser.waitForExist('#media-control-container svg.action-icon-pause', 5000);
        browser.click('#media-control-container svg.action-icon-pause');
    });
    this.Then(/^the playing of the currently playing media should be paused$/, () => {
        const prevWidth = browser.getElementSize('#media-playing-played-bar', 'width'); //console.log('PrevWidth', prevWidth);

        utils.sleep(3000)

        const curWidth = browser.getElementSize('#media-playing-played-bar', 'width'); //console.log('CurWidth', curWidth);

        expect(prevWidth).toEqual(curWidth)

    });

    this.Given(/^this playlist is paused$/, () => {
        if(browser.isExisting('#media-control-container svg.action-icon-pause')) {
            browser.click('#media-control-container svg.action-icon-pause')
        }
    });

    this.When(/^I click play$/, function () {
        this.previousWidth = browser.getElementSize('#media-playing-played-bar', 'width');
        browser.waitForExist('#media-control-container svg.action-icon-play', 5000);
        browser.click('#media-control-container svg.action-icon-play');
    });

    this.Then(/^the playing should be started from the same pausing position$/, function () {
        const prevWidth = browser.getElementSize('#media-playing-played-bar', 'width'); //console.log('PrevWidth', prevWidth);
        expect(prevWidth).toEqual(this.previousWidth);

        utils.sleep(3000)

        const curWidth = browser.getElementSize('#media-playing-played-bar', 'width'); //console.log('CurWidth', curWidth);

        expect(curWidth).toBeGreaterThan(prevWidth)
    });

    this.When(/^I click next$/, function () {
        const selector = '#media-control-container svg.action-icon-forward'
        browser.waitUntil(() => browser.isExisting(selector), 5000)

        const status = fixtures.getPlayerStatusForPresentationMachine(this.selectedPresentationMachine._id)
        const playlist = fixtures.getPlaylists({_id:status.playlistId})[0]
        //console.log(playlist)
        const index = playlist.itemIds.indexOf(status.playerUpdate.playlistItemId)
        //console.log(status.playerUpdate.playlistItemId,index)
        if(index>=0 && index<=playlist.itemIds.length-2) {
            this.nextPlaylistItemId = playlist.itemIds[index+1]
        }

        const styleOpacity = browser.getCssProperty(selector, 'opacity')
        //console.log(styleOpacity, '1')
        if(this.nextPlaylistItemId) {
            expect(styleOpacity.value).toEqual(1)
            browser.click(selector)
        } else {
            expect(styleOpacity.value).toEqual(0.2)
        }
    });

    this.Then(/^the next track in the playlist should be started$/, function () {
        if(this.nextPlaylistItemId) {
            const playlistItem = fixtures.getPlaylistItemById(this.nextPlaylistItemId)

            browser.waitUntil(() => {
                const elPlaylistItemName = browser.getText('#media-control-container .current-playing-item-container .display-playlistitem-name')
                //console.log(elPlaylistItemName, playlistItem.media.name)
                return elPlaylistItemName == playlistItem.media.name
            }, 5000)

            // should be updated for playing test but not implemented yet on the frontend
        }
    });

    this.When(/^I click previous$/, function () {
        const selector = '#media-control-container svg.action-icon-rewind'
        browser.waitUntil(() => browser.isExisting(selector), 5000)

        const status = fixtures.getPlayerStatusForPresentationMachine(this.selectedPresentationMachine._id)
        const playlist = fixtures.getPlaylists({_id:status.playlistId})[0]
        const index = playlist.itemIds.indexOf(status.playerUpdate.playlistItemId)
        if(index>0) {
            this.prevPlaylistItemId = playlist.itemIds[index-1]
        }

        const styleOpacity = browser.getCssProperty(selector, 'opacity')
        if(this.prevPlaylistItemId) {
            expect(styleOpacity.value).toEqual(1)
            browser.click(selector)
        } else {
            expect(styleOpacity.value).toEqual(0.2)
        }
    });

    this.Then(/^the previous track in the playlist should be started$/, function () {
        if(this.prevPlaylistItemId) {
            const playlistItem = fixtures.getPlaylistItemById(this.prevPlaylistItemId)

            browser.waitUntil(() => {
                const elPlaylistItemName = browser.getText('#media-control-container .current-playing-item-container .display-playlistitem-name')
                return elPlaylistItemName == playlistItem.media.name
            }, 5000)

            // should be updated for playing test but not implemented yet on the frontend
        }
    });

    this.When(/^I change order of the items in the playlist$/, function () {
        const selector = `${selectors.presentation.idPlayerContainer  } li`;

        browser.waitUntil(() => browser.isExisting(selector), 10000);

        const itemNames = browser.elements(`${selector  } .item-text`).getText();
        const items = browser.elements(selector).value;
        const source = `${selector  }:first-child span[draggable=true]`;
        const destination = `${selector  }:nth-child(${items.length}) span[draggable=true]`;

        browser.waitUntil(() => browser.isExisting(source) && browser.isExisting(destination), 10000);

        browser.dragAndDrop(source, destination);
        this.beforeMediaNames = [].concat(...itemNames.splice(1, itemNames.length-1), itemNames[0]);

        // browser.debug();
    });

    this.Then(/^the new order should be saved$/, function () {
        browser.refresh();
        const selector = `${selectors.presentation.idPlayerContainer  } li`;

        browser.waitUntil(() => browser.isExisting(selector), 10000);

        const itemNames = browser.elements(`${selector  } .item-text`).getText(); //console.log(this.beforeMediaNames, itemNames);
        expect(itemNames.length).toEqual(this.beforeMediaNames.length);

        itemNames.forEach((name, i) => {
            expect(this.beforeMediaNames[i]).toEqual(name);
        });
    });


    this.Then(/^I should see the passed time from the whole playlist duration updated$/, () => 
        // Write code here that turns the phrase above into concrete actions
         'pending');


}