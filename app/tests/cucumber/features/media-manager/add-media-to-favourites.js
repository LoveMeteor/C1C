module.exports = function() {

    this.When(/^add these files to my favourites list$/, function () {
        browser.click(selectors.media.idDropdownBulkActions);

        // Should be replaced as correct selector for Enabling Overlay
        browser.click(`ul[aria-labelledby=${selectors.media.idDropdownBulkActions.substring(1)}] li:nth-child(1)`);
    });
    this.Then(/^I should see these files in my favourites list$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

}