const faker = require('faker'),
    _       = require('underscore'),
    moment  = require('moment')

module.exports = function () {

    // Scenario: Admin should add new engagement by selecting client, engagement name, start time and end time

    this.When(/^I add new engagement by entering engagement client name and engagement name$/, function () {
        browser.waitForExist('a#btn-new-engagement', 5000)
        browser.click('#btn-new-engagement')

        this.input = {}

        // 1. Input Title information

        // 1.1 Input title
        this.input.engagementTitle = faker.lorem.word()
        browser.waitForExist('#create-engagement-collapse-title input[placeholder="Engagement title"]', 5000)
        browser.setValue('#create-engagement-collapse-title input[placeholder="Engagement title"]', this.input.engagementTitle)

        // 1.2 Select a date
        browser.click('#create-engagement-collapse-title .selector-date div')
        browser.waitForExist('#create-engagement-collapse-title .selector-date li', 5000)
        const liDates = browser.elements('#create-engagement-collapse-title .selector-date li').getAttribute('data-id')
        let index = _.random(0, liDates.length-1)
        this.input.date = liDates[index]
        browser.click(`#create-engagement-collapse-title .selector-date li:nth-child(${index+1})`)

        // 1.3 Select a time
        browser.click('#create-engagement-collapse-title .selector-time div')
        browser.waitForExist('#create-engagement-collapse-title .selector-time li', 5000)
        const liTimes = browser.elements('#create-engagement-collapse-title .selector-time li').getAttribute('data-id')
        index = _.random(0, liTimes.length-1)
        this.input.time = liTimes[index]
        browser.click(`#create-engagement-collapse-title .selector-time li:nth-child(${index+1})`)

        // 1.4 Select a duration
        browser.click('#create-engagement-collapse-title .selector-duration div')
        browser.waitForExist('#create-engagement-collapse-title .selector-duration li', 5000)
        const liDurations = browser.elements('#create-engagement-collapse-title .selector-duration li').getAttribute('data-id')
        index = _.random(0, liDurations.length-1)
        this.input.duration = liDurations[index]
        browser.click(`#create-engagement-collapse-title .selector-duration li:nth-child(${index+1})`)

        // 1.5 Click Continue button
        browser.waitForExist('#create-engagement-collapse-title a.btn-continue.enabled', 5000);
        browser.click('#create-engagement-collapse-title a.btn-continue.enabled');


        // 2. Input Client

        // 2.1 Select a client
        browser.click('#create-engagement-collapse-client .selector-client div');
        browser.waitForExist('#create-engagement-collapse-client .selector-client li', 5000);
        const liClients = browser.elements('#create-engagement-collapse-client .selector-client li').getText();
        const clients = fixtures.getClients()
        expect(liClients.length).toEqual(clients.length);
        liClients.forEach(function(liClientName, index){
            const client = clients[index];
            expect(liClientName).toEqual(client.name);
        });
        index = _.random(0, clients.length-1);
        this.input.client = clients[index];
        browser.click(`#create-engagement-collapse-client .selector-client li:nth-child(${index+1})`);

        // 2.2 Click Continue button
        browser.waitForExist('#create-engagement-collapse-client a.btn-continue.enabled', 5000);
        browser.click('#create-engagement-collapse-client a.btn-continue.enabled');

        // 3. Add Medias

        // 3.1 Select a PM
        const pms = fixtures.getPresentationMachines({},true)
        const elPms = browser.elements('#create-engagement-collapse-media .tab-presentation-machine').getAttribute('data-id');
        expect(elPms.length).toEqual(pms.length)
        this.input.presentationMachine = _.sample(pms)
        browser.click(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${this.input.presentationMachine._id}"]`)

        // 3.2 Select some playlists and add
        const playlists = fixtures.getCanoncialPlaylists({presentationMachineId:this.input.presentationMachine._id});
        //console.log(`#create-engagement-collapse-media .media-search-container[data-id="${this.input.presentationMachine._id}"] .container-item-playlist`, playlists);
        utils.waitForElements(`#create-engagement-collapse-media .media-search-container[data-id="${this.input.presentationMachine._id}"] .container-item-playlist`, playlists.length);

        const samplePlaylist = _.sample(playlists)  //;console.log(samplePlaylist)

        browser.click(`#create-engagement-collapse-media .container-item-playlist[data-id="${samplePlaylist._id}"] svg.action-icon-add`)

        browser.waitForExist(`#create-engagement-collapse-media .media-search-container[data-id="${this.input.presentationMachine._id}"] .div-playlist-media-search-result a.btn-continue.enabled`, 5000)
        browser.click(`#create-engagement-collapse-media .media-search-container[data-id="${this.input.presentationMachine._id}"] .div-playlist-media-search-result a.btn-continue.enabled`)

        // 3.3 Set duration time for image media and click Continue button
        const itemSelector = '#create-engagement-collapse-review .container-review-media .container-item-playlist-media'

        browser.waitUntil(()=>{
            //console.log(browser.elements(itemSelector), samplePlaylist.itemIds.length)
            return browser.elements(itemSelector).value.length==samplePlaylist.itemIds.length
        })

        const itemEls = browser.elements(itemSelector).value
        let durations = []
        itemEls.forEach((el)=>{
            const mediaTypeClass = browser.elementIdElement(el.ELEMENT, 'svg:first-child').getAttribute('class')
            //console.log(mediaTypeClass)
            if(mediaTypeClass === 'action-icon-image') {
                browser.elementIdElement(el.ELEMENT, '.display-playlistitem-duration').click()
                const timeInputSelector = '.modal-boron .time-input input'
                browser.waitForExist(timeInputSelector, 6000)
                const duration = _.random(30, 600)
                browser.setValue(timeInputSelector, utils.convertSecondsToString(duration))
                browser.click('.modal-boron a.btn-set-duration.enabled')
                browser.waitUntil(()=>!browser.isExisting(timeInputSelector), 6000)

                durations.push(duration)
            }
        })
        browser.waitForExist('#create-engagement-collapse-review a.btn-save.enabled')

        browser.waitUntil(()=>{
            browser.click('#create-engagement-collapse-review a.btn-save.enabled')
            //utils.sleep(100)

            return (!browser.isExisting('#create-engagement-collapse-review a.btn-save.enabled'))
        }, 6000)
    });

    this.Then(/^new engagement should be created with the entered information$/, function () {
        const inputedTitle = this.input.engagementTitle;
        const inputedDate = this.input.date;
        const inputedTime = this.input.time;
        const inputedDuration = this.input.duration;

        const day = moment(inputedDate).startOf('day')
        const startTime = day.add(inputedTime,'minutes')
        const endTime = moment(startTime).add(inputedDuration,'minutes')


        const els = browser.elements('#container-engagements-list-view .container-item-engagement').value

        browser.waitUntil(function(){
            var titles = browser.getText(`#container-engagements-list-view .container-item-engagement .engagement-item-name`);

            return _.contains(titles, inputedTitle);
        }, 50000);

        let bFound = false
        els.forEach((el, index) => {
            const elName = browser.elementIdElement(el.ELEMENT, '.engagement-item-name').getText()
            const elDuration = browser.elementIdElement(el.ELEMENT, '.engagement-item-duration').getText()

            if(elName == inputedTitle && elDuration == utils.convertedStartEndTime(startTime, endTime)) {
                bFound = true
            }
        })

        expect(bFound).toEqual(true)

    });

    this.Then(/^I should see this slot reserved in the daily view$/, function () {
        const engagements = client.getHTML(selectors.engagement.dailyView.engagementItemNew);
        expect(engagements.length).toBeGreaterThan(1);
    });

    // Scenario: Admin should edit existing engagement

    this.When(/^I edit any scheduled engagement by entering engagement name, client name and time$/, function () {
        const engagements = fixtures.getEngagements({startTime:{$gte:moment().toDate()}})
        const selectedEngagement = _.sample(engagements)
        const selector = `#container-engagements-list-view .container-item-engagement[data-id="${selectedEngagement._id}"]`

        //console.log(`Selector to edit: ${selector}`)
        // 1. Select an engagement to update
        browser.waitUntil(()=>{
            return browser.isExisting(selector)
        }, 5000)

        browser.click(`${selector} svg.action-icon-settings`)

        this.selectedEngagement = selectedEngagement

        // 2. Edit selected engagement

        this.input = {}

        // 2.1. Input Title information

        // 2.1.1 Input title
        const title = faker.lorem.word();
        browser.waitForExist('#create-engagement-collapse-title input[placeholder="Engagement title"]', 5000)
        browser.setValue('#create-engagement-collapse-title input[placeholder="Engagement title"]', title)
        this.input.engagementTitle = browser.getValue('#create-engagement-collapse-title input[placeholder="Engagement title"]')
        // 2.1.2 Select a date
        browser.click('#create-engagement-collapse-title .selector-date div')
        browser.waitForExist('#create-engagement-collapse-title .selector-date li', 5000)
        const liDates = browser.elements('#create-engagement-collapse-title .selector-date li').value.map((el)=>{
            return browser.elementIdAttribute(el.ELEMENT, 'data-id').value
        })
        //console.log(liDates)
        let index = _.random(1, liDates.length-1)
        this.input.date = liDates[index]
        browser.click(`#create-engagement-collapse-title .selector-date li:nth-child(${index+1})`)

        // 2.1.3 Select a time
        browser.click('#create-engagement-collapse-title .selector-time div')
        browser.waitForExist('#create-engagement-collapse-title .selector-time li', 5000)
        const liTimes = browser.elements('#create-engagement-collapse-title .selector-time li').value.map((el)=>{
            return browser.elementIdAttribute(el.ELEMENT, 'data-id').value
        })
        //console.log(liTimes)
        index = _.random(1, liTimes.length-1)
        this.input.time = liTimes[index]
        browser.click(`#create-engagement-collapse-title .selector-time li:nth-child(${index+1})`)

        // 2.1.4 Select a duration
        browser.click('#create-engagement-collapse-title .selector-duration div')
        browser.waitForExist('#create-engagement-collapse-title .selector-duration li', 5000)
        const liDurations = browser.elements('#create-engagement-collapse-title .selector-duration li').value.map((el)=>{
            return browser.elementIdAttribute(el.ELEMENT, 'data-id').value
        })
        index = _.random(1, liDurations.length-1)
        this.input.duration = liDurations[index]
        browser.click(`#create-engagement-collapse-title .selector-duration li:nth-child(${index+1})`)

        // 2.1.5 Click Continue button
        browser.waitForExist('#create-engagement-collapse-title a.btn-continue.enabled', 5000);
        browser.click('#create-engagement-collapse-title a.btn-continue.enabled');


        // 2.2. Input Client

        // 2.2.1 Select a client
        browser.click('#create-engagement-collapse-client .selector-client div');
        browser.waitForExist('#create-engagement-collapse-client .selector-client li', 5000);
        const liClients = browser.elements('#create-engagement-collapse-client .selector-client li').getText();
        const clients = fixtures.getClients()
        expect(liClients.length).toEqual(clients.length+1)
        liClients.forEach(function(liClientName, index){
            if(index == 0) {
                expect(liClientName).toEqual('Reset')
            } else {
                const client = clients[index-1]
                expect(liClientName).toEqual(client.name)
            }
        });
        index = _.random(1, clients.length-1);
        this.input.client = clients[index];
        browser.click(`#create-engagement-collapse-client .selector-client li:nth-child(${index+1})`);

        // 2.2.2 Click Continue button
        browser.waitForExist('#create-engagement-collapse-client a.btn-continue.enabled', 5000);
        browser.click('#create-engagement-collapse-client a.btn-continue.enabled');

        // 2.3. Add Medias

        // 2.3.1 Select a PM
        const pms = fixtures.getPresentationMachines({},true)
        const elPms = browser.elements('#create-engagement-collapse-media .tab-presentation-machine').getAttribute('data-id');
        expect(elPms.length).toEqual(pms.length)
        this.input.presentationMachine = _.sample(pms)
        browser.click(`#create-engagement-collapse-media .tab-presentation-machine[data-id="${this.input.presentationMachine._id}"]`)

        // 2.3.2 Select some playlists and add
        const playlists = fixtures.getCanoncialPlaylists({presentationMachineId:this.input.presentationMachine._id})
        utils.waitForElements(`#create-engagement-collapse-media .media-search-container[data-id="${this.input.presentationMachine._id}"] .container-item-playlist`, playlists.length);

        let samplePlaylist = null
        for(let i=0; i<playlists.length; i++) {
            let playlist = playlists[i]
            if(browser.isExisting(`#create-engagement-collapse-media .container-item-playlist[data-id="${playlist._id}"] svg.action-icon-add`)) {
                samplePlaylist = playlist; break;
            }
        }

        expect(samplePlaylist).not.toBeNull()
        //console.log(samplePlaylist)
        browser.click(`#create-engagement-collapse-media .container-item-playlist[data-id="${samplePlaylist._id}"] svg.action-icon-add`)

        browser.waitForExist(`#create-engagement-collapse-media .media-search-container[data-id="${this.input.presentationMachine._id}"] .div-playlist-media-search-result a.btn-continue.enabled`, 5000)
        browser.click(`#create-engagement-collapse-media .media-search-container[data-id="${this.input.presentationMachine._id}"] .div-playlist-media-search-result a.btn-continue.enabled`)

        // 2.3.3 Set duration time for image media and click Continue button
        const itemSelector = '#create-engagement-collapse-review .container-review-media .container-item-playlist-media'
        browser.waitUntil(()=>{
            //console.log(browser.elements(itemSelector), samplePlaylist.itemIds.length)
            return browser.elements(itemSelector).value.length>=samplePlaylist.itemIds.length
        })
        let itemEls = browser.elements(itemSelector).value
        let durations = []
        itemEls = _.sample(itemEls, itemEls.length>3 ? 3 : itemEls.length)
        itemEls.forEach((el)=>{
            const mediaTypeClass = browser.elementIdElement(el.ELEMENT, 'svg:first-child').getAttribute('class')
            //console.log(mediaTypeClass)
            if(mediaTypeClass === 'action-icon-image') {
                browser.elementIdElement(el.ELEMENT, '.display-playlistitem-duration').click()
                const timeInputSelector = '.modal-boron .time-input input'
                browser.waitForExist(timeInputSelector, 6000)
                const duration = _.random(30, 600)
                browser.setValue(timeInputSelector, utils.convertSecondsToString(duration))
                console.log(duration, browser.getValue(timeInputSelector))
                browser.waitForExist('.modal-boron a.btn-set-duration.enabled', 500)
                browser.click('.modal-boron a.btn-set-duration.enabled')
                browser.waitUntil(()=>!browser.isExisting(timeInputSelector), 6000)

                durations.push(duration)
            }
        })

        browser.waitForExist('#create-engagement-collapse-review a.btn-save.enabled')

        browser.waitUntil(()=>{
            browser.click('#create-engagement-collapse-review a.btn-save.enabled')
            //utils.sleep(100)

            return (!browser.isExisting('#create-engagement-collapse-review a.btn-save.enabled'))
        }, 6000)
    });

    this.Then(/^I should see the engagement with the updated information$/, function () {
        const inputedTitle = this.input.engagementTitle;
        const inputedDate = this.input.date;
        const inputedTime = this.input.time;
        const inputedDuration = this.input.duration;

        const day = moment(inputedDate).startOf('day')
        const startTime = day.add(inputedTime,'minutes')
        const endTime = moment(startTime).add(inputedDuration,'minutes')


        const els = browser.elements('#container-engagements-list-view .container-item-engagement').value

        browser.waitUntil(function(){
            const titles = [].concat(browser.getText(`#container-engagements-list-view .container-item-engagement .engagement-item-name`));
            //console.log(titles, inputedTitle)
            return _.contains(titles, inputedTitle);
        }, 5000);

        let bFound = false
        els.forEach((el, index) => {
            const elName = browser.elementIdElement(el.ELEMENT, '.engagement-item-name').getText()
            const elDuration = browser.elementIdElement(el.ELEMENT, '.engagement-item-duration').getText()

            if(elName == inputedTitle && elDuration == utils.convertedStartEndTime(startTime, endTime)) {
                bFound = true
            }
        })

        expect(bFound).toEqual(true)
    });

    this.Given(/^I am adding new media file to a engagement$/, function () {
        this.subUrl = 'engagements';
        browser.url(`${this.baseUrl}/${this.subUrl}`);

        browser.waitForExist('div=Engagements', 10000);

        browser.waitForExist('a#btn-new-engagement', 5000)
        browser.click('#btn-new-engagement')

        this.input = {}

        // 1. Input Title information

        // 1.1 Input title
        this.input.engagementTitle = faker.lorem.word()
        browser.waitForExist('#create-engagement-collapse-title input[placeholder="Engagement title"]', 5000)
        browser.setValue('#create-engagement-collapse-title input[placeholder="Engagement title"]', this.input.engagementTitle)

        // 1.2 Select a date
        browser.click('#create-engagement-collapse-title .selector-date div')
        browser.waitForExist('#create-engagement-collapse-title .selector-date li', 5000)
        const liDates = browser.elements('#create-engagement-collapse-title .selector-date li').getAttribute('data-id')
        let index = _.random(0, liDates.length-1)
        this.input.date = liDates[index]
        browser.click(`#create-engagement-collapse-title .selector-date li:nth-child(${index+1})`)

        // 1.3 Select a time
        browser.click('#create-engagement-collapse-title .selector-time div')
        browser.waitForExist('#create-engagement-collapse-title .selector-time li', 5000)
        const liTimes = browser.elements('#create-engagement-collapse-title .selector-time li').getAttribute('data-id');
        index = _.random(0, liTimes.length-1)
        this.input.time = liTimes[index]
        browser.click(`#create-engagement-collapse-title .selector-time li:nth-child(${index+1})`)

        // 1.4 Select a duration
        browser.click('#create-engagement-collapse-title .selector-duration div')
        browser.waitForExist('#create-engagement-collapse-title .selector-duration li', 5000)
        const liDurations = browser.elements('#create-engagement-collapse-title .selector-duration li').getAttribute('data-id')
        index = _.random(0, liDurations.length-1)
        this.input.duration = liDurations[index]
        browser.click(`#create-engagement-collapse-title .selector-duration li:nth-child(${index+1})`)

        // 1.5 Click Continue button
        browser.waitForExist('#create-engagement-collapse-title a.btn-continue.enabled', 5000);
        browser.click('#create-engagement-collapse-title a.btn-continue.enabled');


        // 2. Input Client

        // 2.1 Select a client
        browser.click('#create-engagement-collapse-client .selector-client div');
        browser.waitForExist('#create-engagement-collapse-client .selector-client li', 5000);
        const liClients = browser.elements('#create-engagement-collapse-client .selector-client li').getText();
        const clients = fixtures.getClients()
        expect(liClients.length).toEqual(clients.length);
        liClients.forEach(function(liClientName, index){
            const client = clients[index];
            expect(liClientName).toEqual(client.name);
        });
        index = _.random(0, clients.length-1);
        this.input.client = clients[index];
        browser.click(`#create-engagement-collapse-client .selector-client li:nth-child(${index+1})`);

        // 2.2 Click Continue button
        browser.waitForExist('#create-engagement-collapse-client a.btn-continue.enabled', 5000);
        browser.click('#create-engagement-collapse-client a.btn-continue.enabled');



    });

}