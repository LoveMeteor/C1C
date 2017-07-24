const _ = require('underscore')
const moment = require('moment')

module.exports = function () {

    // Scenario: Admin should delete engagement

    this.When(/^I delete a scheduled engagement$/, function () {
        const filters = {}
        const weekStartTime = moment().startOf('isoWeek')
        filters.startTime = {$gte: weekStartTime.toDate()}
        filters.endTime = {$lte: moment(weekStartTime).add(7, 'day').subtract(1, 'seconds').toDate()}

        const engagements = fixtures.getDeletableEngagements({endTime:{$gte:moment().startOf('day').toDate()}}, {sort:{startTime:1}})
        //console.log(filters, engagements)

        const selectedEngagement = _.sample(engagements);
        if(selectedEngagement) {
            const selector = `#container-engagements-list-view .container-item-engagement[data-id="${selectedEngagement._id}"]`
            //console.log(`Selector: ${selector}`)
            browser.waitUntil(() => browser.isExisting(selector), 5000)

            browser.click(`${selector} svg.action-icon-remove`)

            browser.waitForExist('.modal-boron a.btn-delete.enabled', 5000)
            browser.click('.modal-boron a.btn-delete.enabled')

            this.selectedEngagement = selectedEngagement
        }
    });

    this.Then(/^I shouldn't see this engagement in list view$/, function () {
        const selectedEngagement = this.selectedEngagement
        if(selectedEngagement) {
            browser.waitUntil(() => {
                const elDataIds = browser.getAttribute('#container-engagements-list-view .container-item-engagement', 'data-id')
                return !_.contains(elDataIds, selectedEngagement._id)
            }, 5000)
        }
    });

    this.Then(/^I shouldn't see this engagement in weekly view$/, function () {
        browser.click('#engagements-view-switch svg.action-icon-cal')

        this.selectedViewStyle = 'calendar'

        const selectedEngagement = this.selectedEngagement
        if(selectedEngagement) {
            browser.waitUntil(() => {
                const selector = `#container-engagements-calendar-view .rbc-time-view .rbc-event[title="${utils.convertedStartEndTime1(selectedEngagement.startTime, selectedEngagement.endTime)}: ${selectedEngagement.name}"]`
                //console.log(selector)

                return !browser.isExisting(selector)
            }, 5000)
        }

    });
}