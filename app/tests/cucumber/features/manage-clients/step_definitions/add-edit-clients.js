const _ = require('underscore'),
    faker = require('faker');

module.exports = function() {

    //Scenario: Admin should add new client

    this.When(/^I add new client by entering client name, logo, industry and social links$/, function () {
        browser.click('a[href="/client/createClient"]');


        this.input = {};
        // Input client name
        this.input.clientName = faker.lorem.word();
        browser.waitForExist('#create-client-collapse-title input[placeholder="Client name"]', 5000);
        browser.setValue('#create-client-collapse-title input[placeholder="Client name"]', this.input.clientName);

        // Select an industry
        browser.click('#create-client-collapse-title .selector-industry div');
        browser.waitForExist('#create-client-collapse-title .selector-industry li', 5000);
        const liNames = browser.elements('#create-client-collapse-title .selector-industry li').getText();
        const industries = fixtures.getIndustries({},{sort:{name:1}}); //console.log(_.pluck(industries, 'name'))
        expect(liNames.length).toEqual(industries.length);
        liNames.forEach(function(liName, index){
            const industry = industries[index];
            expect(liName).toEqual(industry.name);
        });
        const index = _.random(0, industries.length-1);
        this.input.industry = industries[index];
        browser.click(`#create-client-collapse-title .selector-industry li:nth-child(${index+1})`);


        browser.waitForExist('#create-client-collapse-title a.btn-continue', 5000);
        browser.click('#create-client-collapse-title a.btn-continue');

        // Upload logo
        const path = require('path');
        const toUpload = path.join(__dirname, '../test-logo.png'); //console.log("Path to upload", toUpload);
        browser.waitForExist('#create-client-collapse-logo input[type="file"]', 3000);
        browser.chooseFile('#create-client-collapse-logo input[type="file"]', toUpload);
        browser.waitForExist('#create-client-collapse-logo .container-media-preview', 500000);
        browser.click('#create-client-collapse-logo a.btn-continue');

        // Input Social Links
        browser.waitForExist('#create-client-collapse-social input[placeholder="facebook link"]', 5000);
        this.input.facebook = faker.internet.url();
        browser.setValue('#create-client-collapse-social input[placeholder="facebook link"]', this.input.facebook);

        browser.waitForExist('#create-client-collapse-social input[placeholder="twitter link"]', 5000);
        this.input.twitter = faker.internet.url();
        browser.setValue('#create-client-collapse-social input[placeholder="twitter link"]', this.input.twitter);

        browser.waitForExist('#create-client-collapse-social input[placeholder="instagram link"]', 5000);
        this.input.instagram = faker.internet.url();
        browser.setValue('#create-client-collapse-social input[placeholder="instagram link"]', this.input.instagram);

        browser.click('#create-client-collapse-social a.btn-continue');


        // Click save button
        browser.waitForExist('#create-client-collapse-review a.btn-save');
        browser.click('#create-client-collapse-review a.btn-save');
    });

    this.Then(/^I should see the newely added client in the clients list$/, function () {
        const inputedClientName = this.input.clientName
        const inputedIndustryName = this.input.industry.name
        browser.waitUntil(function(){
            const clientNames = browser.getText(`#container-clients .container-client-item .display-client-name`)
            const industryNames = browser.getText(`#container-clients .container-client-item .display-industry-name`)

            return _.contains(clientNames, inputedClientName) && _.contains(industryNames, inputedIndustryName)
        }, 50000)

    });

    // Scenario: Admin should edit existing client

    this.When(/^I edit existing client by changing client name, logo, industry and social links$/, function () {
        // Select a client to edit and click edit button on client page
        const selectedClient = _.sample(fixtures.getClients({}, {name:1}))
        browser.click(`#container-clients .container-client-item[data-id="${selectedClient._id}"] svg.action-icon-settings`)


        this.input = {};
        // 1. Input client name
        this.input.clientName = faker.lorem.word();
        browser.waitForExist('#create-client-collapse-title input[placeholder="Client name"]', 5000);
        browser.setValue('#create-client-collapse-title input[placeholder="Client name"]', this.input.clientName);

        // 2. Select an industry
        browser.click('#create-client-collapse-title .selector-industry div');
        browser.waitForExist('#create-client-collapse-title .selector-industry li', 5000);
        const liNames = browser.elements('#create-client-collapse-title .selector-industry li').getText();
        const industries = fixtures.getIndustries({},{sort:{name:1}});//console.log(_.pluck(industries, 'name'))
        expect(liNames.length).toEqual(industries.length+1);
        liNames.forEach(function(liName, index){
            if(index == 0) {
                expect(liName).toEqual('Reset')
            } else {
                const industry = industries[index-1];
                expect(liName).toEqual(industry.name);
            }
        });
        const index = _.random(0, industries.length-1);
        this.input.industry = industries[index];
        browser.click(`#create-client-collapse-title .selector-industry li:nth-child(${index+2})`);


        browser.waitForExist('#create-client-collapse-title a.btn-continue', 5000);
        browser.click('#create-client-collapse-title a.btn-continue');

        // 3. Upload logo
        //const path = require('path');
        //const toUpload = path.join(__dirname, '../test-logo.png'); //console.log("Path to upload", toUpload);
        //browser.moveToObject('#create-client-collapse-logo .container-media-preview')
        //browser.waitForExist('#create-client-collapse-logo input[type="file"]', 3000);
        //browser.chooseFile('#create-client-collapse-logo input[type="file"]', toUpload);
        browser.waitForExist('#create-client-collapse-logo .container-media-preview', 500000);
        browser.click('#create-client-collapse-logo a.btn-continue');

        // 4. Input Social Links
        browser.waitForExist('#create-client-collapse-social input[placeholder="facebook link"]', 5000);
        this.input.facebook = faker.internet.url();
        browser.setValue('#create-client-collapse-social input[placeholder="facebook link"]', this.input.facebook);

        browser.waitForExist('#create-client-collapse-social input[placeholder="twitter link"]', 5000);
        this.input.twitter = faker.internet.url();
        browser.setValue('#create-client-collapse-social input[placeholder="twitter link"]', this.input.twitter);

        browser.waitForExist('#create-client-collapse-social input[placeholder="instagram link"]', 5000);
        this.input.instagram = faker.internet.url();
        browser.setValue('#create-client-collapse-social input[placeholder="instagram link"]', this.input.instagram);

        browser.click('#create-client-collapse-social a.btn-continue');


        // 5. Click save button
        browser.waitForExist('#create-client-collapse-review a.btn-save');
        browser.click('#create-client-collapse-review a.btn-save');
    });

    this.Then(/^I should see the client with updated data$/, function () {
        const inputedClientName = this.input.clientName
        const inputedIndustryName = this.input.industry.name

        browser.waitUntil(function(){
            const clientNames = browser.getText(`#container-clients .container-client-item .display-client-name`)
            const industryNames = browser.getText(`#container-clients .container-client-item .display-industry-name`)

            return _.contains(clientNames, inputedClientName) && _.contains(industryNames, inputedIndustryName)
        }, 50000)
    });

};