var _       = require('underscore'),
    faker   = require('faker');

module.exports = function () {

    // Scenario: Admin should view media tags

    this.Then(/^I should see media tags$/, function () {
        const tags = fixtures.getTagsForMedia(this.selectedMediaId);//console.log(this.selectedMediaId,tags)
        const tagNames = _.pluck(tags, 'name')
        browser.scroll('#container-upload-media-tag');
        utils.waitForElements('#container-upload-media-tag .selected-tag',tags.length)
        const selectedNames = [].concat(browser.elements('#container-upload-media-tag .selected-tag').getText());//console.log(selectedNames, this.selectedMediaId, tags, '1234567890')
        selectedNames.forEach(function(name){//console.log(name);
            expect(tagNames.indexOf(name.trim())).toBeGreaterThan(-1);
        });
    });

    // Scenario: Admin should tag media using auto complete list from previously added tags

    this.When(/^I add existing tag using auto complete list$/, function () {
        const allTags = fixtures.getTags();
        expect(allTags.length).toBeGreaterThan(1);

        //browser.waitForExist(selectors.media.detail.idInputAddTag, 3000);
        const aTag = _.sample(allTags);
        //console.log('123456789')
        browser.setValue('#selector-upload-media-tag input[placeholder="Select Tags"]', aTag.name);
        browser.keys('Enter');
        this.selectedTagName = aTag.name;
    });

    // Scenario: Admin should tag media with new tags that is not existing in the tag list

    this.When(/^I add new tag that's not exist in the auto complete list$/, function () {
        const allTags = fixtures.getTags();
        //console.log('12345')
        let aTagName = faker.lorem.word();
        while(_.contains(_.pluck(allTags, 'name'), aTagName)) {
            aTagName = faker.lorem.word();
        }

        browser.setValue('#selector-upload-media-tag input[placeholder="Select Tags"]', aTagName);
        browser.keys('Enter');

        this.selectedTagName = aTagName;

    });

    // Scenario: Admin should remove tag media

    this.Given(/^this media has at least one tag$/, function () {
        const tags = fixtures.getTagsForMedia(this.selectedMediaId)

        //console.log(tags, this.selectedMedia, '1234567890')
        utils.waitForElements('#container-upload-media-tag .selected-tag span',tags.length)

        this.selectedTag = _.sample(tags)

        expect(tags.length).not.toBeLessThan(0)
    });

    this.When(/^I remove a tag$/, function () {
        const el = browser.element(`#container-upload-media-tag .selected-tag[data-name="${this.selectedTag.name}"] svg`)
        el.waitForVisible(500)
        el.click()
    });

    this.Then(/^I should not see this tag listed in tags list$/, function () {
        const selectedNames = [].concat(browser.getText('#container-upload-media-tag .selected-tag'))
        const selectedTag = this.selectedTag;

        const isEl = selectedNames.some((name) => {
            name === selectedTag.name
        });
        expect(isEl).toEqual(false)
    });

    // Scenario: Admin should see the available areas from list of presentation machines

    this.Then(/^I should be able to see presentation machines that has this media selected in different style$/, function () {
        const elPmNames = browser.getText('#container-upload-media-presentation-machines #selector-upload-media-area .display-selected-names'); //console.log(elPmNames);
        expect(elPmNames).not.toBeNull()
        const pmNames = elPmNames.split(', ')

        expect(pmNames.length).toEqual(this.selectedMedia.presentationMachineIds.length)
        const pms = fixtures.getPresentationMachines({_id:{$in:this.selectedMedia.presentationMachineIds}})
        expect(pmNames.every((pmName) => _.findIndex(pms, {name:pmName}))!=-1).toEqual(true)
    });

    // Scenario: Admin should set media available for other presentation machines

    this.When(/^I set this media available to another presentation machine$/, function () {
        const elPmNames = browser.getText('#container-upload-media-presentation-machines #selector-upload-media-area .display-selected-names'); //console.log(elPmNames);
        expect(elPmNames).not.toBeNull()
        const pmNames = elPmNames.split(', ')

        expect(pmNames.length).toEqual(this.selectedMedia.presentationMachineIds.length)
        const pms = fixtures.getPresentationMachines({_id:{$in:this.selectedMedia.presentationMachineIds}})
        expect(pmNames.every((pmName) => _.findIndex(pms, {name:pmName}))!=-1).toEqual(true)

        const anotherPMs = fixtures.getPresentationMachines({_id:{$nin:this.selectedMedia.presentationMachineIds}})
        if(!anotherPMs || anotherPMs.length == 0) return

        this.selectedPMId = anotherPMs[0]._id

        browser.click('#container-upload-media-presentation-machines #selector-upload-media-area div');
        browser.waitForExist('#container-upload-media-presentation-machines #selector-upload-media-area li.option', 5000);
        browser.click(`#container-upload-media-presentation-machines #selector-upload-media-area li.option[data-id="${this.selectedPMId}"]`);

        browser.click('.modal-boron .btn-update-media');
    });

    this.Then(/^I should be able to see presentation machine in different style$/, function () {
        if(!this.selectedPMId) return
        const pm = fixtures.getPresentationMachines({_id:this.selectedPMId})[0];
        browser.waitUntil(() => {
            const pmNames = browser.getText(`#container-medias .media-item-container[data-id="${this.selectedMediaId}"] .container-presentation-machines`);
            return pmNames.indexOf(pm.name) != -1
        }, 5000)
    });
}