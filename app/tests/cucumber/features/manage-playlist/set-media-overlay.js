var _ = require('underscore');

module.exports = function () {
    this.When(/^I choose overlay$/, function () {
        browser.waitForExist(selectors.playlist.view.idButtonOverlayEditor, 3000);
        browser.click(selectors.playlist.view.idButtonOverlayEditor);
    });



    this.Then(/^see a preview of this overlay style$/, function () {
        expect(browser.getText(selectors.playlist.view.idDisplayOverlayTitle)).toEqual(fixtures.overlayTitle);
    });




    this.When(/^I choose enable overlay from bulk actions list$/, function () {
        browser.click(selectors.playlist.view.idDropdownBulkActions);

        // Should be replaced as correct selector for Enabling Overlay
        browser.click(`ul[aria-labelledby=${selectors.playlist.view.idDropdownBulkActions.substring(1)}] li:first-child`);
    });
    this.Then(/^I should see these media files marked as overlay enabled$/, function () {
        var elements = browser.elements(selectors.playlist.view.clsDivItemContainer);

        expect(elements.value.length).toEqual(this.selectedMediaCount);

        elements.value.forEach(function(el){
           expect(browser.elementIdElement(el.ELEMENT, selectors.playlist.view.clsSwitchItemOverlayOn).isExisting()).not.toBe(true);
        });

    });

    this.When(/^I choose disable overlay from bulk actions list$/, function () {
        browser.click(selectors.playlist.view.idDropdownBulkActions);

        // Should be replaced as correct selector for Disabling Overlay
        browser.click(`ul[aria-labelledby=${selectors.playlist.view.idDropdownBulkActions.substring(1)}] li:first-child`);
    });

    this.Then(/^I should see these media files marked as overlay disabled$/, function () {
        var elements = browser.elements(selectors.playlist.view.clsDivItemContainer);

        expect(elements.value.length).toEqual(this.selectedMediaCount);

        elements.value.forEach(function(el){
            expect(browser.elementIdElement(el.ELEMENT, selectors.playlist.view.clsSwitchItemOverlayOn).isExisting()).not.toBe(true);
        });
    });
}

