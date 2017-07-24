const moment = require('moment')
const _ = require('underscore')

module.exports = function () {

    // Scenario: Admin should see today engagements in calendar view showing its start and end time
    this.Then(/^I should see list of all engagements scheduled today$/, function () {

        let filters = {endTime:{$gte:moment().startOf('day').toDate()}}

        if(this.keyword) {
            filters.name = {$regex: this.keyword}
        }
        if(this.selectedClient) {
            filters.clientId = this.selectedClient._id;
        }

        let sort = {sort: this.selectedSort || {startTime:1}}

        const engagements = fixtures.getEngagements(filters, sort); //console.log(engagements)

        if(engagements.length == 0) {
            expect(browser.isExisting('#container-engagements-list-view .container-item-engagement')).toEqual(false);
        } else {
            utils.waitForElements('#container-engagements-list-view .container-item-engagement', engagements.length)

            const els = browser.elements('#container-engagements-list-view .container-item-engagement').value
            els.forEach((el, index) => {
                const elId = browser.elementIdAttribute(el.ELEMENT, 'data-id').value;
                const elName = browser.elementIdElement(el.ELEMENT, '.engagement-item-name').getText()

                const engagement = _.findWhere(engagements, {_id: elId})
                expect(elName).toEqual(engagement.name)
            })
        }
        this.searchedEngagements = engagements
    });


    this.Then(/^I should see it's start and end time$/, function () {
        const engagements = this.searchedEngagements

        if(this.selectedViewStyle == 'list') {
            const els = browser.elements('#container-engagements-list-view .container-item-engagement').value
            els.forEach((el, index)=>{
                const elId = browser.elementIdAttribute(el.ELEMENT, 'data-id').value;
                const elDuration = browser.elementIdElement(el.ELEMENT, '.engagement-item-duration').getText()
                const engagement = _.findWhere(engagements, {_id:elId})
                expect(elDuration).toEqual(utils.convertedStartEndTime(engagement.startTime, engagement.endTime))
            })
        } else if(this.selectedViewStyle == 'calendar') {
            const engagementNames = _.pluck(engagements, 'name')
            const els = browser.elements('#container-engagements-calendar-view .rbc-calendar .rbc-time-content .rbc-event .rbc-event-label').value
            els.forEach((el, index)=>{
                const elName = browser.elementIdText(el.ELEMENT).value

                expect(_.contains(engagementNames, elName)).toEqual(true)
            })

        }
    });


    this.Given(/^I am viewing this week engagements in weekly view$/, function () {
        this.subUrl = 'engagements';
        browser.url(`${this.baseUrl}/${this.subUrl}`);

        browser.waitForExist('div=Engagements', 10000);

        browser.click('#engagements-view-switch svg.action-icon-cal')

        this.selectedViewStyle = 'calendar'
    });

    this.Then(/^I should see names and start, end times of all engagements scheduled in this week$/, function () {
        let filters = {}

        if(this.keyword) {
            filters.name = {$regex: this.keyword}
        }
        if(this.selectedClient) {
            filters.clientId = this.selectedClient._id;
        }


        let weekStartTime = moment().startOf('isoWeek')
        filters.startTime = {$gte: weekStartTime.toDate()}
        filters.endTime = {$lte: moment(weekStartTime).add(7, 'day').subtract(1, 'seconds').toDate()}

        const engagements = fixtures.getEngagements(filters)
        //console.log(filters, engagements)

        const elDayColumns = browser.elements('#container-engagements-calendar-view .rbc-time-view .rbc-day-slot.rbc-time-column').value
        elDayColumns.forEach((elDayColumn, index)=>{
            const elEvents = browser.elementIdElements(elDayColumn.ELEMENT, '.rbc-event').value

            const date = moment(weekStartTime).add(index, 'day')
            //console.log(date)
            const dailyEngagements = engagements.filter((engagement)=>{
                return moment(engagement.startTime) >= date && moment(engagement.endTime) <= moment(date).add(1, 'day').subtract(1, 'seconds')
            })
            //console.log(dailyEngagements)
            expect(elEvents.length).toEqual(dailyEngagements.length)

            const dailyEngagementNames = _.pluck(dailyEngagements, 'name')
            //console.log(dailyEngagementNames)
            elEvents.forEach((elEvent)=>{
                const eventName = browser.elementIdElement(elEvent.ELEMENT, '.rbc-event-content').getText()
                //console.log(eventName)
                const timeEngagements = _.where(dailyEngagements, {name:eventName})
                expect(timeEngagements.length).toBeGreaterThan(0)
                if(timeEngagements.length == 1) {

                    const engagementStartTime = moment(timeEngagements[0].startTime),
                        engagementEndTime = moment(timeEngagements[0].endTime),
                        baseStartTime = moment(date).hour(0).minutes(0),
                        baseEndTime = moment(date).hour(24).minutes(0)

                    //console.log(`EngagementTime=>${engagementStartTime.format()}~${engagementEndTime.format()}, baseTime=>${baseStartTime.format()}~${baseEndTime.format()}, baseTimeDiff=>${baseEndTime.diff(baseStartTime)}`)
                    // just test only engagements around 8:00AM ~ 8:00PM since UI frontend implemented so
                    if(engagementStartTime>=baseStartTime && engagementStartTime<=baseEndTime && engagementEndTime>=baseStartTime && engagementEndTime<=baseEndTime) {
                        // On calendar view every event tiles(having class .rbc-event) have style in the following format {top:13.3456%; height:6.7857%; width:100px;...}
                        // Here `top` and `height` style attribute values calculated by event time related to calendar time view
                        // So we will just check `top` and `height` style attribute value to measure accuracy time

                        const eventStyle = browser.elementIdAttribute(elEvent.ELEMENT, 'style')
                        //console.log(eventStyle.value)

                        const styleString = eventStyle.value
                        //console.log(eventStyle.value, timeEngagements[0])

                        // Get `top` and `height` number value from "top: 38.4615%; height: 7.69231%; left: 0%; width: 100%;" format style string
                        const topStr = utils.getValueFromStyleStringByKey(styleString, 'top'),
                            heightStr = utils.getValueFromStyleStringByKey(styleString, 'height'),
                            top = Number(topStr.substr(0,topStr.length-1)),
                            height = Number(heightStr.substr(0,heightStr.length-1))

                        //console.log(timeEngagements[0])
                        //console.log(top, height)
                        //console.log(engagementStartTime.diff(baseStartTime)*100/baseEndTime.diff(baseStartTime), engagementEndTime.diff(engagementStartTime)*100/baseEndTime.diff(baseStartTime))

                        // `top`, `height` is value from DOM style
                        // `engagementStartTime.diff(baseStartTime)*100/baseEndTime.diff(baseStartTime)` is percentage value calculated by real engagement startTime and base times(8:00AM~8:00PM)
                        // `engagementEndTime.diff(engagementStartTime)*100/baseEndTime.diff(baseStartTime)` is percentage value calculated by real engagement startTime, endTime and base times(8:00AM~8:00PM)
                        // and if delta is less than 0.1 we will assume time showing is correct.
                        expect(Math.abs(engagementStartTime.diff(baseStartTime)*100/baseEndTime.diff(baseStartTime) - top)).toBeLessThan(0.1)
                        expect(Math.abs(engagementEndTime.diff(engagementStartTime)*100/baseEndTime.diff(baseStartTime) - height)).toBeLessThan(0.1)

                    }
                }
            })
        })


        this.searchedEngagements = engagements
    });

    // Scenario: Admin should navigate through days to see engagements in each day

    this.When(/^I choose another date$/, function () {
        client.element(selectors.engagement.dailyView.searchDate).waitForExist(5000);
        const now = new Date();
        client.element(selectors.engagement.dailyView.searchDate).setValue(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 7));
    });

    this.Then(/^I should see list of all engagements scheduled in that date$/, function () {
        client.elements(selectors.engagement.dailyView.engagementItem).waitForExist(5000);
        expect(client.getHTML(selectors.engagement.dailyView.engagementItem).length).toEqual(2);
    });




    // Scenario: Admin should navigate through weeks to see engagements in each week

    this.When(/^I choose another week$/, function () {
        browser.click('#container-engagements-calendar-view .container-calendar-toolbar svg.action-icon-arrow-right')
    });

    this.Then(/^I should see names and start, end times of all engagements scheduled in that week$/, function () {
        let filters = {}

        if(this.keyword) {
            filters.name = {$regex: this.keyword}
        }
        if(this.selectedClient) {
            filters.clientId = this.selectedClient._id;
        }


        let weekStartTime = moment().startOf('isoWeek').add(7, 'day')
        filters.startTime = {$gte: weekStartTime.toDate()}
        filters.endTime = {$lte: moment(weekStartTime).add(7, 'day').subtract(1, 'seconds').toDate()}

        const engagements = fixtures.getEngagements(filters)
        //console.log(filters, engagements)

        const elDayColumns = browser.elements('#container-engagements-calendar-view .rbc-time-view .rbc-day-slot.rbc-time-column').value
        elDayColumns.forEach((elDayColumn, index)=>{
            const elEvents = browser.elementIdElements(elDayColumn.ELEMENT, '.rbc-event').value

            const date = moment(weekStartTime).add(index, 'day')
            //console.log(date)
            const dailyEngagements = engagements.filter((engagement)=>{
                return moment(engagement.startTime) >= date && moment(engagement.endTime) <= moment(date).add(1, 'day').subtract(1, 'seconds')
            })
            //console.log(dailyEngagements)
            expect(elEvents.length).toEqual(dailyEngagements.length)

            const dailyEngagementNames = _.pluck(dailyEngagements, 'name')
            //console.log(dailyEngagementNames)
            elEvents.forEach((elEvent)=>{
                const eventName = browser.elementIdElement(elEvent.ELEMENT, '.rbc-event-content').getText()
                //console.log(eventName)
                const timeEngagements = _.where(dailyEngagements, {name:eventName})
                expect(timeEngagements.length).toBeGreaterThan(0)
                if(timeEngagements.length == 1) {

                    const engagementStartTime = moment(timeEngagements[0].startTime),
                        engagementEndTime = moment(timeEngagements[0].endTime),
                        baseStartTime = moment(date).hour(0).minutes(0),
                        baseEndTime = moment(date).hour(24).minutes(0)

                    if(engagementStartTime>=baseStartTime && engagementStartTime<=baseEndTime && engagementEndTime>=baseStartTime && engagementEndTime<=baseEndTime) {
                        const eventStyle = browser.elementIdAttribute(elEvent.ELEMENT, 'style')
                        //console.log(eventStyle.value)

                        const styleString = eventStyle.value
                        //console.log(eventStyle.value, timeEngagements[0])

                        const topStr = utils.getValueFromStyleStringByKey(styleString, 'top'),
                            heightStr = utils.getValueFromStyleStringByKey(styleString, 'height'),
                            top = Number(topStr.substr(0,topStr.length-1)),
                            height = Number(heightStr.substr(0,heightStr.length-1))

                        //console.log(timeEngagements[0])
                        //console.log(top, height)
                        //console.log(engagementStartTime.diff(baseStartTime)*100/baseEndTime.diff(baseStartTime), engagementEndTime.diff(engagementStartTime)*100/baseEndTime.diff(baseStartTime))

                        expect(Math.abs(engagementStartTime.diff(baseStartTime)*100/baseEndTime.diff(baseStartTime) - top)).toBeLessThan(0.1)
                        expect(Math.abs(engagementEndTime.diff(engagementStartTime)*100/baseEndTime.diff(baseStartTime) - height)).toBeLessThan(0.1)
                    }
                }
            })
        })

        this.searchedEngagements = engagements
    });

    this.Then(/^I should see all engagements that exactly\/partially match the search keyword$/, function () {
        let filters = {endTime:{$gte:moment().startOf('day').toDate()}}

        if(this.keyword) {
            filters.name = {$regex: this.keyword}
        }
        if(this.selectedClient) {
            filters.clientId = this.selectedClient._id;
        }

        let sort = {sort: this.selectedSort || {startTime:1}}

        const engagements = fixtures.getEngagements(filters, sort); //console.log(engagements)

        if(engagements.length == 0) {
            expect(browser.isExisting('#container-engagements-list-view .container-item-engagement')).toEqual(false);
        } else {
            utils.waitForElements('#container-engagements-list-view .container-item-engagement', engagements.length)

            const els = browser.elements('#container-engagements-list-view .container-item-engagement').value
            els.forEach((el, index) => {
                const elId = browser.elementIdAttribute(el.ELEMENT, 'data-id').value;
                const elName = browser.elementIdElement(el.ELEMENT, '.engagement-item-name').getText()

                const engagement = _.findWhere(engagements, {_id: elId})
                expect(elName).toEqual(engagement.name)
            })
        }

        this.searchedEngagements = engagements
    });

    this.When(/^I select a client$/, function () {
        browser.waitForExist('#form-select-client', 5000)

        browser.click('#form-select-client')

        browser.waitForExist('#form-select-client li', 5000)

        const liNames = browser.elements('#form-select-client li').getText()

        const clients = fixtures.getClients()

        expect(liNames.length).toEqual(clients.length)

        liNames.forEach(function (liName, index) {
            const client = clients[index]
            expect(liName).toEqual(client.name)
        });

        const index = _.random(0, clients.length - 1)
        this.selectedClient = clients[index]

        browser.click(`#form-select-client li:nth-child(${index + 1})`)
    });

    this.Then(/^I should see this client's engagements$/, function () {
        let filters = {endTime:{$gte:moment().startOf('day').toDate()}}

        if(this.keyword) {
            filters.name = {$regex: this.keyword}
        }
        if(this.selectedClient) {
            filters.clientId = this.selectedClient._id;
        }

        let sort = {sort: this.selectedSort || {startTime:1}}

        const engagements = fixtures.getEngagements(filters, sort); //console.log(engagements)

        if(engagements.length == 0) {
            expect(browser.isExisting('#container-engagements-list-view .container-item-engagement')).toEqual(false);
        } else {
            utils.waitForElements('#container-engagements-list-view .container-item-engagement', engagements.length)

            const els = browser.elements('#container-engagements-list-view .container-item-engagement').value
            els.forEach((el, index) => {
                const elId = browser.elementIdAttribute(el.ELEMENT, 'data-id').value;
                const elName = browser.elementIdElement(el.ELEMENT, '.engagement-item-name').getText()

                const engagement = _.findWhere(engagements, {_id: elId})
                expect(elName).toEqual(engagement.name)
            })
        }

        this.searchedEngagements = engagements
    });

    this.When(/^I select a specific date$/, function () {

        browser.waitForExist('#form-select-date', 5000)

        browser.click('#form-select-date')

        browser.waitForExist('#form-select-date li', 5000)

        const liDates = browser.elements('#form-select-date li').getAttribute('data-id')
        //console.log(liDates)

        const dates = [...new Set(
            fixtures.getEngagements({endTime : { $gte: moment().startOf('day').toDate() }}).map(engagement => moment(engagement.startTime).format('YYYY-MM-DD'))
        )].sort()

        //console.log(dates)

        expect(liDates.length).toEqual(dates.length)

        liDates.forEach(function (liDate, index) {
            const date = dates[index]
            expect(liDate).toEqual(date)
        })

        const index = _.random(0, dates.length - 1)
        this.selectedDate = dates[index]

        browser.click(`#form-select-date li:nth-child(${index + 1})`)
    });

    this.Then(/^I should see all engagementsthis scheduled on this date$/, function () {
        let filters = {endTime:{$gte:moment().startOf('day').toDate()}}

        if(this.keyword) {
            filters.name = {$regex: this.keyword}
        }
        if(this.selectedClient) {
            filters.clientId = this.selectedClient._id;
        }
        if(this.selectedDate) {
            const date = moment(this.selectedDate)
            filters.startTime  = {
                $gte: date.startOf('day').toDate(),
                $lt: date.endOf('day').toDate()
            }
        }

        let sort = {sort: this.selectedSort || {startTime:1}}

        const engagements = fixtures.getEngagements(filters, sort); //console.log(engagements)

        if(engagements.length == 0) {
            expect(browser.isExisting('#container-engagements-list-view .container-item-engagement')).toEqual(false);
        } else {
            utils.waitForElements('#container-engagements-list-view .container-item-engagement', engagements.length)

            const els = browser.elements('#container-engagements-list-view .container-item-engagement').value
            els.forEach((el, index) => {
                const elId = browser.elementIdAttribute(el.ELEMENT, 'data-id').value;
                const elName = browser.elementIdElement(el.ELEMENT, '.engagement-item-name').getText()

                const engagement = _.findWhere(engagements, {_id: elId})
                expect(elName).toEqual(engagement.name)
            })
        }

        this.searchedEngagements = engagements
    });

    this.When(/^I sort engagements by Chronological$/, function () {
        const selector = '#select-sorter'
        browser.waitForExist(selector, 5000);

        browser.click(selector);

        var liEl = browser.element(selector).element('li=Chronological');
        liEl.click();
    });
    this.Then(/^I should see all engagements sorted chronologically$/, function () {
        let filters = {endTime:{$gte:moment().startOf('day').toDate()}}

        let sort = {sort: {startTime:1}}

        const engagements = fixtures.getEngagements(filters, sort); //console.log(engagements)

        if(engagements.length == 0) {
            expect(browser.isExisting('#container-engagements-list-view .container-item-engagement')).toEqual(false);
        } else {
            utils.waitForElements('#container-engagements-list-view .container-item-engagement', engagements.length)

            const els = browser.elements('#container-engagements-list-view .container-item-engagement').value
            els.forEach((el, index) => {
                const elId = browser.elementIdAttribute(el.ELEMENT, 'data-id').value;
                const elName = browser.elementIdElement(el.ELEMENT, '.engagement-item-name').getText()

                const engagement = _.findWhere(engagements, {_id: elId})
                expect(elName).toEqual(engagement.name)
            })
        }
    });
    this.When(/^I sort engagements by Title \(A\-Z\)$/, function () {
        const selector = '#select-sorter'
        browser.waitForExist(selector, 5000);

        browser.click(selector);

        var liEl = browser.element(selector).element('li=Title (A–Z)');
        liEl.click();
    });
    this.Then(/^I should see all engagements sorted ascending alphabetically$/, function () {
        let filters = {endTime:{$gte:moment().startOf('day').toDate()}}

        let sort = {sort: {name:1}}

        const engagements = fixtures.getEngagements(filters, sort); //console.log(engagements)

        if(engagements.length == 0) {
            expect(browser.isExisting('#container-engagements-list-view .container-item-engagement')).toEqual(false);
        } else {
            utils.waitForElements('#container-engagements-list-view .container-item-engagement', engagements.length)

            const els = browser.elements('#container-engagements-list-view .container-item-engagement').value
            els.forEach((el, index) => {
                const elId = browser.elementIdAttribute(el.ELEMENT, 'data-id').value;
                const elName = browser.elementIdElement(el.ELEMENT, '.engagement-item-name').getText()

                const engagement = _.findWhere(engagements, {_id: elId})
                expect(elName).toEqual(engagement.name)
            })
        }
    });
    this.When(/^I sort engagements by Title \(Z\-A\)$/, function () {
        const selector = '#select-sorter'
        browser.waitForExist(selector, 5000);

        browser.click(selector);

        var liEl = browser.element(selector).element('li=Title (Z–A)');
        liEl.click();
    });
    this.Then(/^I should see all engagements sorted descending alphabetically$/, function () {
        let filters = {endTime:{$gte:moment().startOf('day').toDate()}}

        let sort = {sort: {name:-1}}

        const engagements = fixtures.getEngagements(filters, sort); //console.log(engagements)

        if(engagements.length == 0) {
            expect(browser.isExisting('#container-engagements-list-view .container-item-engagement')).toEqual(false);
        } else {
            utils.waitForElements('#container-engagements-list-view .container-item-engagement', engagements.length)

            const els = browser.elements('#container-engagements-list-view .container-item-engagement').value
            els.forEach((el, index) => {
                const elId = browser.elementIdAttribute(el.ELEMENT, 'data-id').value;
                const elName = browser.elementIdElement(el.ELEMENT, '.engagement-item-name').getText()

                const engagement = _.findWhere(engagements, {_id: elId})
                expect(elName).toEqual(engagement.name)
            })
        }
    });

}