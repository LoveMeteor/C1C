module.exports = function () {
    this.When(/^I open Media Manager$/, function () {
        browser.waitForExist(selectors.home.clsButtonTriggerSideBar, 3000);

        browser.click(selectors.home.clsButtonTriggerSideBar);

        browser.waitForExist(selectors.home.idDivSidebar, 3000);
        browser.click('a[href="/media"]');
    });

    this.When(/^I click on presentation machine name$/, function () {
        browser.waitForExist('div=Reception Wall', 3000);
        browser.click('div=Reception Wall');
    });

    this.Then(/^I should see all media in this presentation machine$/, function () {
        var medias = fixtures.getMedias();

        medias.forEach(function(media) {
            browser.getText(media.name);
        });
    });
}