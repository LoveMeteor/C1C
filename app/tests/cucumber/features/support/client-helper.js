/**
 * Created by lionstar on 10/7/16.
 */

module.exports = function () {

    this.Given(/^I am on clients management page$/, function () {
        this.subUrl = 'client';
        browser.url(`${this.baseUrl}/${this.subUrl}/`);

        browser.waitForExist('div=Clients', 10000);

        utils.waitForElements('#container-clients .container-client-item', fixtures.getClients().length);
    });

    this.Given(/^I am on client page$/, function () {
        fixtures.createClients();

        client.url(`${this.baseUrl}/client`);
        client.element(selectors.client.itemClient).waitForExist(5000);
        client.click(selectors.client.itemClient);
        client.element(selectors.client.detail.nameSection).waitForExist(5000);
    });
};