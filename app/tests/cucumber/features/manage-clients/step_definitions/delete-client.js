const _ = require('underscore');

module.exports = function() {

    // Scenario: Admin should delete client from clients list
    let deleteClientName = null;

    this.When(/^I delete client having no engagements$/, function () {
        let clients = fixtures.getClients()
        const engagements = fixtures.getEngagements()
        const clientIdsWithEngagement = _.pluck(engagements, 'clientId')

        clients = clients.filter((client)=>!_.contains(clientIdsWithEngagement, client._id))

        if(clients && clients.length) {
            const sampleClient = _.sample(clients)
            browser.click(`#container-clients .container-client-item[data-id="${sampleClient._id}"] svg.action-icon-remove`)

            this.selectedClientId = sampleClient._id

            var btnElDel = browser.element('div=Yes\, delete it');
            btnElDel.waitForExist(500);
            btnElDel.scroll();
            btnElDel.click();
        }
    });

    this.When(/^I delete client having engagements$/, function () {
        let clients = fixtures.getClients()
        const engagements = fixtures.getEngagements()
        const clientIdsWithEngagement = _.pluck(engagements, 'clientId')

        clients = clients.filter((client)=>_.contains(clientIdsWithEngagement, client._id))

        //console.log(clients)
        const sampleClient = _.sample(clients)
        browser.click(`#container-clients .container-client-item[data-id="${sampleClient._id}"] svg.action-icon-remove`)

        this.selectedClientId = sampleClient._id
    });

    this.When(/^confirm deletion$/, function () {

        var btnElDel = browser.element('div=Yes\, delete it');
        btnElDel.waitForExist(500);
        btnElDel.scroll();
        btnElDel.click();
    });

    this.Then(/^I should not see him in the clients list$/, function () {
        const selectedClientId = this.selectedClientId;

        if(selectedClientId) {
            browser.waitUntil(function(){
                const clientIds = browser.getAttribute('#container-clients .container-client-item', 'data-id');

                return !_.contains(clientIds, selectedClientId);
            }, 4500);
        }
    });

    this.Then(/^I should not see his upcoming scheduled engagements in the engagements list$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

};