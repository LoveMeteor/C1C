var _ = require('underscore');

module.exports = function () {

    // Scenario: Admin should list all customers

    this.Then(/^I should see all clients listed by name, team and industry$/, function () {
        var clients = fixtures.getClients({}, {sort:{name:1}});

        browser.waitUntil(function(){
            if(clients.length == 0) {
                return !browser.isExisting('#container-clients .container-client-item.display-client-name');
            } else {
                const names = _.pluck(clients, 'name'); //console.log("Should see playlist names", names);
                const elNames = [].concat(browser.getText('#container-clients .container-client-item .display-client-name'));

                if(elNames.length != names.length) return false;

                const elNamesSet = new Set(elNames);
                return names.every(name => elNamesSet.has(name));
            }
        }, 5000);
    });

    // Scenario: Admin should search clients by client name

    this.When(/^I search client names with a keyword with available matches$/, function () {
        browser.waitForExist('input[placeholder="Client name"]', 5000);

        var clients = fixtures.getClients({},{sort:{name:1}});

        this.keyword = _.sample(clients).name.substr(0,2);

        browser.setValue('input[placeholder="Client name"]', this.keyword);
    });

    this.Then(/^I should see all clients that exactly\/partially match the entered keyword with client name$/, function () {
        const keywordFilter = {$regex: this.keyword};

        const filters = {name: keywordFilter};
        const sort = {sort:{name:1}};

        const clients = fixtures.getClients(filters, sort);

        browser.waitUntil(function(){
            if(clients.length == 0) {
                return !browser.isExisting('#container-clients .container-client-item.display-client-name');
            } else {
                const names = _.pluck(clients, 'name'); //console.log("Should see playlist names", names);
                const elNames = [].concat(browser.getText('#container-clients .container-client-item .display-client-name'));

                if(elNames.length != names.length) return false;

                const elNamesSet = new Set(elNames);
                return names.every(name => elNamesSet.has(name));
            }
        }, 5000);
    });

    this.Then(/^I should see all clients that has this industry$/, function () {
        const clients = fixtures.getClients({industryId:this.selectedIndustry._id}, {sort:{name:1}});

        browser.waitUntil(function(){
            if(clients.length == 0) {
                return !browser.isExisting('#container-clients .container-client-item.display-client-name');
            } else {
                const names = _.pluck(clients, 'name'); //console.log("Should see playlist names", names);
                const elNames = [].concat(browser.getText('#container-clients .container-client-item .display-client-name'));

                if(elNames.length != names.length) return false;

                const elNamesSet = new Set(elNames);
                return names.every(name => elNamesSet.has(name));
            }
        }, 5000);
    });


    // Scenario: Admin should see an empty state if he search for a keyword that doesn't exist

    this.When(/^I search with a keyword with no available matches for clients$/, function () {
        browser.waitForExist('input[placeholder="Client name"]', 5000);

        browser.setValue('input[placeholder="Client name"]', 'XXXXXX');
    });

    this.Then(/^I should see no clients found message$/, function () {
        expect(browser.isExisting('#container-clients .container-client-item')).toEqual(false);

        browser.waitUntil(function(){
            return browser.getText("div*=No results found");
        }, 5000);
    });

    this.When(/^I sort clients by title \(A\-Z\)$/, function () {
        var sorterEl = browser.element('#sorter-clients');
        sorterEl.waitForExist(5000);
        sorterEl.click();

        sorterEl.waitForVisible('li=Title (A–Z)', 5000);
        sorterEl.element('li=Title (A–Z)').click();
    });

    this.Then(/^I should see all clients sorted alphabetically ascending$/, function () {
        const clients = fixtures.getClients({}, {sort:{name:1}});

        browser.waitUntil(function(){
            if(clients.length == 0) {
                return !browser.isExisting('#container-clients .container-client-item.display-client-name');
            } else {
                const names = _.pluck(clients, 'name'); //console.log("Should see playlist names", names);
                const elNames = [].concat(browser.getText('#container-clients .container-client-item .display-client-name'));

                if(elNames.length != names.length) return false;

                return elNames.every((elName, index) => elName == names[index]);
            }
        }, 5000);
    });

    this.When(/^I sort clients by Newest$/, function () {

        var sorterEl = browser.element('#sorter-clients');
        sorterEl.waitForExist(5000);
        sorterEl.click();

        sorterEl.waitForVisible('li=Newest', 5000);
        sorterEl.element('li=Newest').click();
    });

    this.Then(/^I should see all clients sorted by creation time descending$/, function () {
        const clients = fixtures.getClients({}, {sort:{createdAt:-1}});

        browser.waitUntil(function(){
            if(clients.length == 0) {
                return !browser.isExisting('#container-clients .container-client-item.display-client-name');
            } else {
                const names = _.pluck(clients, 'name'); //console.log("Should see playlist names", names);
                const elNames = [].concat(browser.getText('#container-clients .container-client-item .display-client-name'));

                if(elNames.length != names.length) return false;

                return elNames.every((elName, index) => elName == names[index]);
            }
        }, 5000);
    });

    this.When(/^I sort clients by Oldest$/, function () {

        var sorterEl = browser.element('#sorter-clients');
        sorterEl.waitForExist(5000);
        sorterEl.click();

        sorterEl.waitForVisible('li=Oldest', 5000);
        sorterEl.element('li=Oldest').click();
    });

    this.Then(/^I should see all clients sorted by creation time ascending$/, function () {
        const clients = fixtures.getClients({}, {sort:{createdAt:1}});

        browser.waitUntil(function(){
            if(clients.length == 0) {
                return !browser.isExisting('#container-clients .container-client-item.display-client-name');
            } else {
                const names = _.pluck(clients, 'name'); //console.log("Should see playlist names", names);
                const elNames = [].concat(browser.getText('#container-clients .container-client-item .display-client-name'));

                if(elNames.length != names.length) return false;

                return elNames.every((elName, index) => elName == names[index]);
            }
        }, 5000);
    });

};