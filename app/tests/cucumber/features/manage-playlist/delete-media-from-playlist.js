
module.exports = function () {

    this.When(/^I delete media file$/, function () {
        browser.waitForExist(selectors.playlist.view.clsDivItemContainer, 3000);

        this.mediaCount = browser.elements(selectors.playlist.view.clsDisplayItemName).value.length;
        this.selectedMediaName = browser.getText(selectors.playlist.view.clsDivItemContainer+" "+selectors.playlist.view.clsDisplayItemName);
        browser.click(selectors.playlist.view.clsDivItemContainer+" "+selectors.playlist.view.clsButtonItemRemove)
    });

    this.Then(/^I should not see the deleted files in the current playlist$/, function () {
        var items = browser.elements(selectors.playlist.view.clsDivItemContainer).value;
        items.forEach(function(item){
            expect(_.contains(this.selectedMediaNames, browser.elementIdElement(item.ELEMENT).getText())).not.toBe(true);
        });
    });

}

