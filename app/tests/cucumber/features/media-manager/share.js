const _ = require('underscore')

module.exports = function () {

    this.Given(/^I am on list media files page$/, function () {
        this.subUrl = 'media';
        browser.url(`${this.baseUrl}/${this.subUrl}`);

        const medias = fixtures.getMedias({}, {sort:{createdAt: -1}});
        const selector = '#container-medias .media-item-container'
        browser.waitUntil(() => {
            if((!browser.isExisting(selector))|| (browser.elements(selector).value.length != medias.length)) return false
            const elDataIds = browser.getAttribute(selector, 'data-id')
            return medias.every(({_id}, index) => _id === elDataIds[index]);
        }, 5000)
    });

    this.Given(/^I am on Media Manager with any presentation machine selected$/, function () {


        this.subUrl = 'media';
        browser.url(`${this.baseUrl}/${this.subUrl}`);

        browser.waitForExist(selectors.media.clsFilterMachine, 5000);
        browser.click(selectors.media.clsFilterMachine);
    });

    this.Given(/^I am viewing media information$/, function () {

        this.subUrl = 'media';
        browser.url(`${this.baseUrl}/${this.subUrl}`);

        const medias = fixtures.getMedias({}, {sort:{createdAt: -1}});
        const selector = '#container-medias .media-item-container'
        browser.waitUntil(() => {
            if(!browser.isExisting(selector)) return false

            if(browser.elements(selector).value.length != medias.length) return false

            const elDataIds = [].concat(browser.getAttribute(selector, 'data-id'))
            const mediaIds = _.pluck(medias, '_id')
            return mediaIds.every((id, index) => id == elDataIds[index]);
        }, 5000)

        let sampleMedia = _.sample(medias);

        utils.sleep(300)
        browser.click(`#container-medias .media-item-container[data-id="${sampleMedia._id}"] svg.action-icon-settings`)

        this.selectedMediaId = sampleMedia._id;
        this.selectedMedia = sampleMedia;
    });

    this.Given(/^I am viewing media information at any presentation machine$/, function () {
        this.subUrl = 'media';
        browser.url(`${this.baseUrl}/${this.subUrl}`);



        const medias = fixtures.getMedias({}, {sort:{createdAt: -1}}); //console.log(medias);
        const selector = '#container-medias .media-item-container'
        browser.waitUntil(() => {
            if(!browser.isExisting(selector)) return false

            if(browser.elements(selector).value.length != medias.length) return false

            const elDataIds = [].concat(browser.getAttribute(selector, 'data-id'))
            const mediaIds = _.pluck(medias, '_id')
            return mediaIds.every((id, index) => id == elDataIds[index]);
        }, 5000)

        const sampleMedia = _.sample(fixtures.getMedias({$where:'this.presentationMachineIds.length<4'}))
        utils.sleep(100)
        //console.log(`#container-medias .media-item-container[data-id="${sampleMedia._id}"] .link-edit-media`);
        browser.click(`#container-medias .media-item-container[data-id="${sampleMedia._id}"] .action-icon-settings`)

        this.selectedMediaId = sampleMedia._id;
        this.selectedMedia = sampleMedia; //console.log(this.selectedMedia);
    });

    this.When(/^I click on the cog icon$/, function () {
        const mediaEls = browser.elements('#container-medias .media-item-container').value;


        const sampleMediaEl = _.sample(mediaEls);

        this.selectedMediaId = browser.elementIdAttribute(sampleMediaEl.ELEMENT, 'data-id').value;//console.log(this.selectedMediaId);
        utils.sleep(200)
        browser.elementIdElement(sampleMediaEl.ELEMENT, 'svg.action-icon-settings').click()
        this.selectedMedia = fixtures.getMediaById(this.selectedMediaId); //console.log(this.selectedMedia);
    });

    this.Then(/^I should see this tag listed in tags list$/, function () {
        //console.log(this.selectedMediaId)
        const tags = fixtures.getTagsForMedia(this.selectedMediaId);//console.log(this.selectedMediaId, tags)
        const selectedTagName = this.selectedTagName
        //console.log(selectedTagName, '1234567')
        browser.waitUntil(() => {
            //console.log(browser.elements('#container-upload-media-tag .selected-tag').value.length, tags.length)
            // This should be uncommented after same Theme and Tag name bug fixed
            if(browser.elements('#container-upload-media-tag .selected-tag').value.length < tags.length) return false

            //console.log(browser.getText('#container-upload-media-tag .selected-tag span'))
            return _.contains([].concat(browser.getText('#container-upload-media-tag .selected-tag span')), selectedTagName)
        }, 5000)
    });

}
