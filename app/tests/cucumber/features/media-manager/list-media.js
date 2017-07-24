var _ = require('underscore');

module.exports = function () {

    this.Then(/^I should see all uploaded media files$/, function () {

        var medias = fixtures.getMedias({},{sort:{createdAt:-1}});

        var mediaNames = [].concat(browser.elements('#container-medias .media-item-container .media-item-name').getText()); //console.log(mediaNames);

        expect(mediaNames.length).toEqual(medias.length);

        mediaNames.forEach(function(mediaName, index){
            expect(mediaName).toEqual(medias[index].name);
        });
    });

    this.Then(/^I should see it's duration$/, function () {
        var mediaIds = browser.elements('#container-medias .media-item-container').getAttribute('data-id'); //console.log(mediaIds);
        var durations = browser.elements('#container-medias .media-item-container .media-item-time').getText(); //console.log(durations);
        mediaIds.forEach(function(mediaId, index) {
            var media = fixtures.getMediaById(mediaId);
            if(media.type == 'video') {
                var duration = durations[index];

                if(media.videoDuration && media.videoDuration>0) {
                    expect(duration).toEqual(utils.convertedDuration(media.videoDuration));
                } else {
                    expect(duration).toEqual('');
                }
            }
        });
    });

    this.Then(/^I should see the presentation machines that have this media file$/, function () {
        const medias = fixtures.getMedias({},{sort:{name:1}});

        const itemEls = browser.elements('#container-medias .media-item-container').value; //console.log(itemEls);

        expect(itemEls.length).toEqual(medias.length);

        itemEls.forEach(function(itemEl, index){
            const mediaId = browser.elementIdAttribute(itemEl.ELEMENT, 'data-id').value;
            const media = _.findWhere(medias, {_id:mediaId});
            const elPmNames = browser.elementIdElement(itemEl.ELEMENT, '.container-presentation-machines').getText();

            expect(elPmNames).not.toBeNull()
            const pmNames = elPmNames.split(', ')

            expect(pmNames.length).toEqual(media.presentationMachineIds.length)
            const pms = fixtures.getPresentationMachines({_id:{$in:media.presentationMachineIds}})
            expect(pmNames.every((pmName) => _.findIndex(pms, {name:pmName}))!=-1).toEqual(true)

        });
    });

    this.Then(/^I should see all media type beside each media file$/, function () {
        var medias = fixtures.getMedias({},{sort:{name:1}});

        var itemEls = browser.elements('#container-medias .media-item-container').value; //console.log(itemEls);

        expect(itemEls.length).toEqual(medias.length);

        itemEls.forEach(function(itemEl, index){
            var mediaId = browser.elementIdAttribute(itemEl.ELEMENT, 'data-id').value; //console.log(mediaId);
            var mediaType = browser.elementIdAttribute(itemEl.ELEMENT, 'data-type').value; //console.log(mediaType);
            var media = _.findWhere(medias, {_id:mediaId}); //console.log(media);

            expect(mediaType).toEqual(media.type);
        });
    });

    this.When(/^I sort medias by Title \(A\-Z\)$/, function () {
        const selector = '#select-sorter'
        browser.waitForExist(selector, 5000);

        browser.click(selector);

        var liEl = browser.element(selector).element('li=Title (A–Z)');
        liEl.click();
    });
    this.Then(/^I should see all medias sorted by alphabetically ascending$/, function () {
        var medias = fixtures.getMedias({},{sort:{name:1}});

        var mediaNames = [].concat(browser.elements('#container-medias .media-item-container .media-item-name').getText()); //console.log(mediaNames);

        expect(mediaNames.length).toEqual(medias.length);

        mediaNames.forEach(function(mediaName, index){
            expect(mediaName).toEqual(medias[index].name);
        });
    });
    this.When(/^I sort medias by Title \(Z\-A\)$/, function () {
        const selector = '#select-sorter'
        browser.waitForExist(selector, 5000);

        browser.click(selector);

        var liEl = browser.element(selector).element('li=Title (Z–A)');
        liEl.click();
    });
    this.Then(/^I should see all medias sorted by alphabetically descending$/, function () {
        var medias = fixtures.getMedias({},{sort:{name:-1}});

        var mediaNames = [].concat(browser.elements('#container-medias .media-item-container .media-item-name').getText()); //console.log(mediaNames);

        expect(mediaNames.length).toEqual(medias.length);

        mediaNames.forEach(function(mediaName, index){
            expect(mediaName).toEqual(medias[index].name);
        });
    });
    this.When(/^I sort medias by Newest$/, function () {
        const selector = '#select-sorter'
        browser.waitForExist(selector, 5000);

        browser.click(selector);

        var liEl = browser.element(selector).element('li=Newest');
        liEl.click();
    });
    this.Then(/^I should see all medias sorted by creation time descending$/, function () {
        var medias = fixtures.getMedias({},{sort:{createdAt:-1}});

        var mediaNames = [].concat(browser.elements('#container-medias .media-item-container .media-item-name').getText()); //console.log(mediaNames);

        expect(mediaNames.length).toEqual(medias.length);

        mediaNames.forEach(function(mediaName, index){
            expect(mediaName).toEqual(medias[index].name);
        });
    });
    this.When(/^I sort medias by Oldest$/, function () {
        const selector = '#select-sorter'
        browser.waitForExist(selector, 5000);

        browser.click(selector);

        var liEl = browser.element(selector).element('li=Oldest');
        liEl.click();
    });
    this.Then(/^I should see all medias sorted by creation time ascending$/, function () {
        var medias = fixtures.getMedias({},{sort:{createdAt:1}});

        var mediaNames = [].concat(browser.elements('#container-medias .media-item-container .media-item-name').getText()); //console.log(mediaNames);

        expect(mediaNames.length).toEqual(medias.length);

        mediaNames.forEach(function(mediaName, index){
            expect(mediaName).toEqual(medias[index].name);
        });
    });

}