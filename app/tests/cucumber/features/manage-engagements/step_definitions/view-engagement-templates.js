/**
 * Created by jaross on 27/10/16.
 */
module.exports = function () {

    // Scenario: Admin should see most used engagement templates

    this.Then(/^I should see list of most used engagement templates$/, function () {
        const selector = selectors.engagement.templates.templateItem;
        client.elements(selectors.engagement.templates.templateItem).waitForExist(5000);
        expect(client.getHTML(selectors.engagement.templates.templateItem).length).toEqual(3);
    });

    // Scenario: Admin should search engagement templates by title


    this.Then(/^I should see all engagement templates that exactly\/partially match the entered keyword$/, function () {
        client.elements(selectors.engagement.templates.templateItem).waitForExist(5000);
        expect(client.getHTML(selectors.engagement.templates.templateItem).length).toEqual(2);
    });

    // Scenario: Admin should filter engagement templates with theme

    this.When(/^I filter data with specific theme$/, function () {
        client.element(selectors.engagement.templates.themeFilter).setValue("template1");
    });

    this.Then(/^I should see all engagement templates that exactly\/partially match the entered keyword and the selected theme$/, function () {
        client.elements(selectors.engagement.templates.templateItem).waitForExist(5000);
        expect(client.getHTML(selectors.engagement.templates.templateItem).length).toEqual(1);
    });

    // Scenario: Admin should filter engagement templates with industry

    this.When(/^I filter data with specific industry$/, function () {
        client.element(selectors.engagement.templates.industryFilter).setValue("online");
    });

    this.Then(/^I should see all engagement templates that exactly\/partially match the entered keyword and the selected industry$/, function () {
        client.elements(selectors.engagement.templates.templateItem).waitForExist(5000);
        expect(client.getHTML(selectors.engagement.templates.templateItem).length).toEqual(1);
    });

    // Admin should see an empty state if he search for a keyword that doesn't exist

    this.When(/^I search with a keyword with no available matches for templates$/, function () {
        client.element(selectors.engagement.templates.search).setValue("XXXX XXXX");
        client.element(selectors.engagement.templates.search).keys('Enter');
    });

    this.Then(/^I should see no templates found message$/, function () {
        expect(client.getHTML(selectors.engagement.templates.templateItem).length).toEqual(0);
    });
}