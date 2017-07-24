var _ = require('underscore'),
    faker = require('faker');

module.exports = function () {
    this.Then(/^I should see media assets$/, function () {
        var assets = fixtures.getAssetsForMedia(this.selectedMediaItemId);

        expect(assets.length).toBeGreaterThan(1);

        var items = browser.elements(selectors.media.details.clsDisplayAssetUrl).value;

        expect(assets.length).toEqual(items.length);

        items.forEach(function(item){
           expect(_.contains(_.pluck(assets,'url'),browser.elementId(item.ELEMENT).getText())).toEqual(true);
        });
    });


    this.When(/^I add new asset by adding title and url$/, function () {
        this.selectedAssetTitle = faker.lorem.word();
        this.selectedAssetUrl = faker.internet.url();

        browser.setValue(selectors.media.details.idInputMediaAssetTitle, this.selectedAssetTitle);
        browser.setValue(selectors.media.details.idInputMediaAssetUrl, this.selectedAssetUrl);
        browser.click(selectors.media.details.idButtonAddAsset);
    });
    this.Then(/^I should see this asset lised in assets list$/, function () {
        var items = browser.elements(selectors.media.details.clsDisplayAssetUrl).value;

        expect(items.length).toBeGreaterThan(1);

        var bFound = false;
        items.forEach(function(item){
            if(browser.elementId(item.ELEMENT).getText() == this.selectedAssetUrl)
                bFound = true;
        });

        expect(bFound).toEqual(true);
    });

    this.Given(/^this media has at least on asset$/, function () {
        var assets = fixtures.getAssetsForMedia(this.selectedMediaItemId);

        expect(assets.length).toBeGreaterThan(1);
    });
    this.When(/^I remove a media asset$/, function () {
        var btn = browser.element(selectors.media.details.clsButtonRemoveAsset);
        this.selectedAssetId = btn.getAttribute('data-id');
        btn.click();
    });

    this.Then(/^I should not see this asset listed in assets list$/, function () {
        var bFound = false;

        var items = browser.elements(selectors.media.details.clsDisplayAssetUrl).value;

        items.forEach(function(item){
            if(browser.elementId(item.ELEMENT).getText() == this.selectedAssetUrl)
                bFound = true;
        });

        expect(bFound).not.toEqual(true);
    });


}