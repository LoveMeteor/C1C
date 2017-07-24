const _ = require('underscore')
const moment = require('moment')
const faker = require('faker')

module.exports = function () {
    // Scenario: Admin should list media files for each presentation machine

    this.Given(/^I am on engagement details page$/, function () {
        // 1. Go to engagement page
        this.subUrl = 'engagements';
        browser.url(`${this.baseUrl}/${this.subUrl}`);

        browser.waitForExist('div=Engagements', 10000);

        const engagements = fixtures.getEngagements({startTime: {$gte: moment().toDate()}})
        const selectedEngagement = _.sample(engagements)
        const selector = `#container-engagements-list-view .container-item-engagement[data-id="${selectedEngagement._id}"]`

        //console.log(`Selector to edit: ${selector}`)
        // 2. Select an engagement to update
        browser.waitUntil(() => browser.isExisting(selector), 5000)

        browser.click(`${selector} svg.action-icon-settings`)

        this.selectedEngagement = selectedEngagement

        // 3. Just click Continue button to go to next collapse
        browser.waitForExist('#create-engagement-collapse-title a.btn-continue.enabled', 5000);
        browser.click('#create-engagement-collapse-title a.btn-continue.enabled');

        browser.waitForExist('#create-engagement-collapse-client a.btn-continue.enabled', 5000);
        browser.click('#create-engagement-collapse-client a.btn-continue.enabled');

    });

    this.Then(/^I should see playlist for each presentation machine$/, function () {
        const pms = fixtures.getPresentationMachines({}, true)
        const playlists = fixtures.getPlaylists({engagementId: this.selectedEngagement._id}, {}, {playlistitems: true})
        //console.log(this.selectedEngagement, playlists)

        pms.forEach((pm) => {
            browser.waitForExist(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${pm._id}"]`, 5000)
            browser.click(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${pm._id}"]`)

            const canoncialPlaylists = fixtures.getCanoncialPlaylists({presentationMachineId: pm._id})
            utils.waitForElements(`#create-engagement-collapse-media .media-search-container[data-id="${pm._id}"] .container-item-playlist`, canoncialPlaylists.length)

            const playlistsInPM = _.filter(playlists, {presentationMachineId: pm._id})

            if (playlistsInPM && playlistsInPM.length) {

                const medias = []
                playlistsInPM.forEach((playlist) => {
                    if (playlist.items && playlist.items.length) {
                        playlist.items.forEach((item) => {
                            const media = item.media
                            //console.log(playlist, media, pm._id, '12345678')
                            browser.waitUntil(() => browser.isExisting(`#create-engagement-collapse-media .media-search-container[data-id="${pm._id}"] .container-media-item[data-id="${media._id}"] svg.action-icon-added`), 5000)
                        })
                    }
                })
            }
        })

    });

    // Scenario: Admin should add media file to a playlist

    const addMediaName = null;

    this.When(/^I add media file to presentation machine playlist$/, function () {
        // 1. Select a PM
        const pms = fixtures.getPresentationMachines({}, true)

        browser.waitForExist('#create-engagement-collapse-media .tab-presentation-machine', 5000)
        const elPms = browser.elements('#create-engagement-collapse-media .tab-presentation-machine').getAttribute('data-id');
        expect(elPms.length).toEqual(pms.length)
        this.selectedPresentationMachine = _.sample(pms)
        browser.click(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${this.selectedPresentationMachine._id}"]`)

        // 2. Click some medias to append to playlist
        const elMedias = browser.elements(`#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachine._id}"] .container-media-item`).value

        if (elMedias && elMedias.length) {
            let mediaIds = elMedias.map((el) => {
                if (browser.elementIdElement(el.ELEMENT, 'svg.action-icon-add').value) {
                    const mediaId = browser.elementIdAttribute(el.ELEMENT, 'data-id').value
                    //console.log(mediaId, el)
                    return mediaId
                }
            })

            if (mediaIds.length) {//console.log('MediaIds', mediaIds)
                mediaIds = mediaIds.filter((mediaId) => mediaId != undefined)
                const sampleMediaIds = _.sample(mediaIds, _.random(1, mediaIds.length)); //console.log('sampleMediaIds', sampleMediaIds)
                sampleMediaIds.forEach((mediaId) => {
                    const selector = `#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachine._id}"] .container-media-item[data-id="${mediaId}"] svg.action-icon-add`
                    //console.log(selector)
                    browser.click(selector)
                })

                this.selectedMediaIds = sampleMediaIds
            }
        }

        browser.waitForExist(`#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachine._id}"] .div-playlist-media-search-result a.btn-continue.enabled`, 5000)
        browser.click(`#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachine._id}"] .div-playlist-media-search-result a.btn-continue.enabled`)


    });

    this.Then(/^I should see this media file in the playlist$/, function () {
        browser.waitUntil(() => browser.elements(`#create-engagement-collapse-review .container-review-media .container-item-playlist-media`).value.length >= this.selectedMediaIds.length, 5000)
    });

    this.Then(/^I should see icon to determine its type$/, function () {
        const medias = fixtures.getMedias({_id: {$in: this.selectedMediaIds}})

        medias.forEach((media) => {
            const selector = `#create-engagement-collapse-review .container-review-media .container-item-playlist-media[data-id="${media._id}"]`
            if (media.type == 'image') {//console.log(`${selector} svg.action-icon-image`)
                expect(browser.isExisting(`${selector} svg.action-icon-image`)).toEqual(true)
            } else if (media.type == 'video') {
                expect(browser.isExisting(`${selector} svg.action-icon-video`)).toEqual(true)
            }
        })
    });

    this.Then(/^I should be able to enter text to be displayed as overlay$/, function () {
        // Select Reception Hall PM
        const pm = fixtures.getPresentationMachines({name: 'Reception Hall'})[0]

        this.selectedPresentationMachine = pm
        browser.click(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${this.selectedPresentationMachine._id}"]`)

        // Select some playlists and add
        const playlists = fixtures.getCanoncialPlaylists({presentationMachineId: this.selectedPresentationMachine._id})
        utils.waitForElements(`#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachine._id}"] .container-item-playlist`, playlists.length);

        let samplePlaylist = null
        for (let i = 0; i < playlists.length; i++) {
            const playlist = playlists[i]
            if (browser.isExisting(`#create-engagement-collapse-media .container-item-playlist[data-id="${playlist._id}"] svg.action-icon-add`)) {
                samplePlaylist = playlist;
                break;
            }
        }

        expect(samplePlaylist).not.toBeNull()
        console.log(samplePlaylist)
        browser.click(`#create-engagement-collapse-media .container-item-playlist[data-id="${samplePlaylist._id}"] svg.action-icon-add`)

        browser.waitForExist(`#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachine._id}"] .div-playlist-media-search-result a.btn-continue.enabled`, 5000)
        browser.click(`#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachine._id}"] .div-playlist-media-search-result a.btn-continue.enabled`)

        // Check if input exists
        expect(browser.isExisting(`#create-engagement-collapse-media .media-summary-container[data-id="${this.selectedPresentationMachine._id}"] input[placeholder="Enter your welcome message (max 50 characters)"]`)).toEqual(true)
    });

    this.Given(/^I entered overlay text$/, function () {
        // Select Reception Hall PM
        const pm = fixtures.getPresentationMachines({name: 'Reception Hall'})[0]

        this.selectedPresentationMachine = pm
        browser.click(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${this.selectedPresentationMachine._id}"]`)

        // Select some playlists and add
        const playlists = fixtures.getCanoncialPlaylists({presentationMachineId: this.selectedPresentationMachine._id})
        utils.waitForElements(`#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachine._id}"] .container-item-playlist`, playlists.length);

        let samplePlaylist = null
        for (let i = 0; i < playlists.length; i++) {
            const playlist = playlists[i]
            if (browser.isExisting(`#create-engagement-collapse-media .container-item-playlist[data-id="${playlist._id}"] svg.action-icon-add`)) {
                samplePlaylist = playlist;
                break;
            }
        }

        expect(samplePlaylist).not.toBeNull()
        //console.log(samplePlaylist)
        browser.click(`#create-engagement-collapse-media .container-item-playlist[data-id="${samplePlaylist._id}"] svg.action-icon-add`)

        browser.waitForExist(`#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachine._id}"] .div-playlist-media-search-result a.btn-continue.enabled`, 5000)
        browser.click(`#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachine._id}"] .div-playlist-media-search-result a.btn-continue.enabled`)

        this.selectedPlaylist = samplePlaylist

        // Check if input exists
        const inputSelector = `#create-engagement-collapse-media .media-summary-container[data-id="${this.selectedPresentationMachine._id}"] input[placeholder="Enter your welcome message (max 50 characters)"]`
        expect(browser.isExisting(`#create-engagement-collapse-media .media-summary-container[data-id="${this.selectedPresentationMachine._id}"] input[placeholder="Enter your welcome message (max 50 characters)"]`))

        // Input some overlay text
        browser.setValue(inputSelector, faker.lorem.sentence())
    });

    this.When(/^I choose enable overlay for a media file$/, function () {
        const selector = `#create-engagement-collapse-media .media-summary-container[data-id="${this.selectedPresentationMachine._id}"]`
        const mediaSelector = `${selector} .div-media-wrapper-selected-medias .container-media-item`

        // Set duration time for image media and click Continue button
        browser.waitUntil(() => browser.elements(mediaSelector).value.length >= this.selectedPlaylist.itemIds.length)
        if (browser.isExisting(`${mediaSelector} .time-input input`)) {
            browser.addValue(`${mediaSelector} .time-input input`, '1010');
        }

        const mediaEls = browser.elements(mediaSelector).value

        if (mediaEls && mediaEls.length) {
            const sampleMediaEls = _.sample(mediaEls, _.random(1, mediaEls.length))

            this.selectedMediaIds = []
            sampleMediaEls.forEach((el) => {
                const activeSwitch = browser.elementIdElement(el.ELEMENT, 'span.switch-icon.active')
                if (activeSwitch.value) {
                    activeSwitch.click()
                    const mediaId = browser.elementIdAttribute(el.ELEMENT, 'data-id').value
                    //console.log(mediaId)
                    this.selectedMediaIds.push(mediaId)
                }
            })
        }

        browser.waitForExist(`${selector} a.btn-continue.enabled`, 5000);
        browser.click(`${selector} a.btn-continue.enabled`)

        // Click Save button
        browser.waitForExist('#create-engagement-collapse-review a.btn-save', 5000);
        browser.click('#create-engagement-collapse-review a.btn-save')

    });
    this.Then(/^I should see this media file marked as overlay enabled$/, function () {
        if (this.selectedMediaIds && this.selectedMediaIds.length) {
            const selectedMediaIds = this.selectedMediaIds;

            browser.waitUntil(() => {
                const selectedPlaylist = fixtures.getPlaylists({engagementId: this.selectedEngagement._id}, {}, {playlistitems: true})[0]
                const playlistitems = selectedPlaylist.items

                if (!selectedMediaIds.every(mediaId => _.contains(_.pluck(playlistitems, 'mediaId'), mediaId))) return false

                return playlistitems.every((item) => {
                    if (_.contains(selectedMediaIds, item.mediaId)) {
                        return item.showOverlay == true
                    } else {
                        return true
                    }
                })
            }, 6000)
        }
    });

    this.When(/^I choose disable overlay for a media file$/, function () {
        const selector = `#create-engagement-collapse-media .media-summary-container[data-id="${this.selectedPresentationMachine._id}"]`
        const mediaSelector = `${selector} .div-media-wrapper-selected-medias .container-media-item`

        // Set duration time for image media and click Continue button
        browser.waitUntil(() => browser.elements(mediaSelector).value.length >= this.selectedPlaylist.itemIds.length)
        if (browser.isExisting(`${mediaSelector} .time-input input`)) {
            browser.addValue(`${mediaSelector} .time-input input`, '1010');
        }

        const mediaEls = browser.elements(mediaSelector).value

        if (mediaEls && mediaEls.length) {
            const sampleMediaEls = _.sample(mediaEls, _.random(1, mediaEls.length))

            this.selectedMediaIds = []
            sampleMediaEls.forEach((el) => {
                const activeSwitch = browser.elementIdElement(el.ELEMENT, 'span.switch-icon')
                if (activeSwitch.value) {
                    activeSwitch.click()
                    const mediaId = browser.elementIdAttribute(el.ELEMENT, 'data-id').value
                    //console.log(mediaId)
                    this.selectedMediaIds.push(mediaId)
                }
            })
        }

        browser.waitForExist(`${selector} a.btn-continue.enabled`, 5000);
        browser.click(`${selector} a.btn-continue.enabled`)

        // Click Save button
        browser.waitForExist('#create-engagement-collapse-review a.btn-save', 5000);
        browser.click('#create-engagement-collapse-review a.btn-save')
    });
    this.Then(/^I should see this media file marked as overlay disabled$/, function () {
        if (this.selectedMediaIds && this.selectedMediaIds.length) {
            const selectedMediaIds = this.selectedMediaIds; //console.log('===== selectedMediaIds',selectedMediaIds,'1')

            browser.waitUntil(() => {
                const selectedPlaylist = fixtures.getPlaylists({engagementId: this.selectedEngagement._id}, {}, {playlistitems: true})[0]
                const playlistitems = selectedPlaylist.items

                if (!selectedMediaIds.every(mediaId => _.contains(_.pluck(playlistitems, 'mediaId'), mediaId))) return false

                return playlistitems.every((item) => {
                    if (_.contains(selectedMediaIds, item.mediaId)) {
                        return item.showOverlay == false
                    } else {
                        return true
                    }
                })
            }, 6000)
        }

    });

    // Scenario: Admin should delete media file from a playlist

    this.When(/^I delete media file in engagement detail$/, function () {
        // Select the PM of playlist with most playlistitems for selected engagement
        const playlists = fixtures.getPlaylists({engagementId: this.selectedEngagement._id}, {}, {playlistitems: true})
        playlists.sort((p1, p2) => p2.itemIds.length - p1.itemIds.length)

        const samplePlaylist = playlists[0]
        const pmId = samplePlaylist.presentationMachineId

        console.log(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${pmId}"]`, '1')
        browser.waitForExist(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${pmId}"]`, 5000)
        browser.click(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${pmId}"]`)
        this.selectedPresentationMachineId = pmId
        this.selectedPlaylist = samplePlaylist


        browser.waitForExist(`#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachineId}"] .div-playlist-media-search-result a.btn-continue.enabled`, 5000)
        browser.click(`#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachineId}"] .div-playlist-media-search-result a.btn-continue.enabled`)

        // Set duration of playlistitems with duration 0
        _.filter(samplePlaylist.items, (item) => item.duration == 0).forEach((item) => {
            browser.setValue(`#create-engagement-collapse-media .media-summary-container[data-id="${this.selectedPresentationMachineId}"] .div-media-wrapper-selected-medias .container-media-item .time-input input`, '1111')
        })

        // Select sample playlistitem to remove
        const samplePlaylistItemId = _.sample(samplePlaylist.itemIds)

        browser.click(`#create-engagement-collapse-media .media-summary-container[data-id="${this.selectedPresentationMachineId}"] .div-media-wrapper-selected-medias .container-media-item svg.action-icon-remove`)
        this.selectedPlaylistItemId = samplePlaylistItemId


        browser.waitForExist(`#create-engagement-collapse-media .media-summary-container[data-id="${this.selectedPresentationMachineId}"] a.btn-continue.enabled`, 5000);
        browser.click(`#create-engagement-collapse-media .media-summary-container[data-id="${this.selectedPresentationMachineId}"] a.btn-continue.enabled`)

        // Click Save button
        browser.waitForExist('#create-engagement-collapse-review a.btn-save', 5000);
        browser.click('#create-engagement-collapse-review a.btn-save')

    });

    this.Then(/^I should not see it in its old playlist$/, function () {
        browser.waitUntil(() => {
            const selectedPlaylist = fixtures.getPlaylistById(this.selectedPlaylist._id)
            return !_.contains(selectedPlaylist.itemIds, this.selectedPlaylistItemId)
        }, 5000)
    });

    this.Given(/^I am on engagement creation page$/, function () {
        this.subUrl = 'engagements';
        browser.url(`${this.baseUrl}/${this.subUrl}`);

        browser.waitForExist('div=Engagements', 10000);

        browser.waitForExist('a#btn-new-engagement', 5000)
        browser.click('#btn-new-engagement')
    });

    this.When(/^I search for previous engagement and select it$/, function () {
        browser.waitForExist('input[placeholder="Search Engagement templates"]', 5000)

        const keyword = faker.lorem.word().substr(0, 1)

        utils.sleep(500)
        browser.element('#search-templates input[placeholder="Search Engagement templates"]').setValue(keyword)

        const engagements = fixtures.getEngagements({name: {$regex: keyword, $options: 'i'}}, {
            sort: {
                name: 1,
                startTime: 1
            }
        })

        if (engagements && engagements.length) {
            const liSelector = '#search-templates>ul li'
            browser.waitForExist(liSelector, 5000);

            const liNames = [].concat(browser.elements(`${liSelector} .engagement-name`).getText()); //console.log(liNames)

            expect(liNames.length).toEqual(engagements.length);

            liNames.forEach((liName, index) => {
                const engagement = engagements[index];
                expect(liName).toEqual(engagement.name);
            });

            const index = _.random(0, engagements.length - 1);

            this.selectedEngagement = engagements[index]; //console.log(this.selectedIndustry);

            browser.click(`${liSelector}:nth-child(${index + 1})`);


        }

    });

    this.Then(/^I should see engagement title and date empty$/, function () {
        const sampleEngagement = this.selectedEngagement
        browser.waitUntil(() => browser.getValue('#create-engagement-collapse-title input[placeholder="Engagement title"]') == sampleEngagement.name, 5000)

        // Confirm if date selector is empty and select a date
        expect(browser.getText('#create-engagement-collapse-title .selector-date .display-selected-names')).toEqual('Select date')
        browser.click('#create-engagement-collapse-title .selector-date div')
        browser.waitForExist('#create-engagement-collapse-title .selector-date li', 5000)
        const liDates = browser.elements('#create-engagement-collapse-title .selector-date li').getAttribute('data-id')
        let index = _.random(0, liDates.length - 1)
        this.selectedDate = liDates[index]
        browser.click(`#create-engagement-collapse-title .selector-date li:nth-child(${index + 1})`)

        // Confirm if time selector is empty and select a time
        expect(browser.getText('#create-engagement-collapse-title .selector-time .display-selected-names')).toEqual('Select time')
        browser.click('#create-engagement-collapse-title .selector-time div')
        browser.waitForExist('#create-engagement-collapse-title .selector-time li', 5000)
        const liTimes = browser.elements('#create-engagement-collapse-title .selector-time li').getAttribute('data-id')
        index = _.random(0, liTimes.length - 1)
        this.selectedTime = liTimes[index]
        browser.click(`#create-engagement-collapse-title .selector-time li:nth-child(${index + 1})`)

        // Confirm if duration selector is empty and select a duration
        expect(browser.getText('#create-engagement-collapse-title .selector-duration .display-selected-names')).toEqual('Select duration')
        browser.click('#create-engagement-collapse-title .selector-duration div')
        browser.waitForExist('#create-engagement-collapse-title .selector-duration li', 5000)
        const liDurations = browser.elements('#create-engagement-collapse-title .selector-duration li').getAttribute('data-id')
        index = _.random(0, liDurations.length - 1)
        this.selectedDuration = liDurations[index]
        browser.click(`#create-engagement-collapse-title .selector-duration li:nth-child(${index + 1})`)

        // Click Continue button
        browser.waitForExist('#create-engagement-collapse-title a.btn-continue.enabled', 5000);
        browser.click('#create-engagement-collapse-title a.btn-continue.enabled');
    });
    this.Then(/^I should see playlist content filled with the content from the selected playlist$/, function () {
        // Select a client
        browser.click('#create-engagement-collapse-client .selector-client div');
        browser.waitForExist('#create-engagement-collapse-client .selector-client li', 5000);
        const liClients = browser.elements('#create-engagement-collapse-client .selector-client li').getText();
        const clients = fixtures.getClients()
        expect(liClients.length).toEqual(clients.length + 1)
        liClients.forEach((liClientName, index) => {
            if (index == 0) {
                expect(liClientName).toEqual('Reset')
            } else {
                const client = clients[index - 1]
                expect(liClientName).toEqual(client.name)
            }
        });
        const index = _.random(1, clients.length - 1);
        this.selectedClient = clients[index];
        browser.click(`#create-engagement-collapse-client .selector-client li:nth-child(${index + 1})`);

        // Click Continue button
        browser.waitForExist('#create-engagement-collapse-client a.btn-continue.enabled', 5000);
        browser.click('#create-engagement-collapse-client a.btn-continue.enabled');

        // Select the PM of playlist with most playlistitems for selected engagement
        const playlists = fixtures.getPlaylists({engagementId: this.selectedEngagement._id}, {}, {playlistitems: true})
        playlists.sort((p1, p2) => p2.itemIds.length - p1.itemIds.length)

        const samplePlaylist = playlists[0]
        const pmId = samplePlaylist.presentationMachineId

        //console.log(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${pmId}"]`, '1')
        browser.waitForExist(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${pmId}"]`, 5000)
        browser.click(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${pmId}"]`)
        this.selectedPresentationMachineId = pmId
        this.selectedPlaylist = samplePlaylist


        browser.waitForExist(`#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachineId}"] .div-playlist-media-search-result a.btn-continue.enabled`, 5000)
        browser.click(`#create-engagement-collapse-media .media-search-container[data-id="${this.selectedPresentationMachineId}"] .div-playlist-media-search-result a.btn-continue.enabled`)

        const existingEngagementIds = _.pluck(fixtures.getEngagements(), '_id'); //console.log(existingEngagementIds)
        // Click Save button
        browser.waitForExist('#create-engagement-collapse-review a.btn-save.enabled', 5000);
        browser.click('#create-engagement-collapse-review a.btn-save.enabled')

        const templateEngagement = fixtures.getEngagementById(this.selectedEngagement._id); //console.log(templateEngagement)

        browser.waitUntil(() => {
            const newEngagementIds = _.pluck(fixtures.getEngagements(), '_id')
            if (newEngagementIds.length != existingEngagementIds.length + 1) return false

            const newEngagementId = _.difference(newEngagementIds, existingEngagementIds)[0]

            const newEngagement = fixtures.getEngagementById(newEngagementId);

            return newEngagement.playlists.every((playlist) => playlist.items.every((item) => {
                const templatePlaylist = _.find(templateEngagement.playlists, {presentationMachineId: playlist.presentationMachineId})

                const templatePlaylistItem = _.find(templatePlaylist.items, {mediaId: item.mediaId})

                return item.duration == templatePlaylistItem.duration && item.showOverlay == templatePlaylistItem.showOverlay
            }))
        }, 5000)
    });

}