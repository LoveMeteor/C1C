const _ = require('underscore')
const faker = require('faker')

module.exports = function() {
    this.When(/^I edit media file in media files page$/, function () {
        // 1. Select a media to edit
        const mediaEls = browser.elements('#container-medias .media-item-container').value;

        const sampleMediaEl = _.sample(mediaEls);

        this.selectedMediaId = browser.elementIdAttribute(sampleMediaEl.ELEMENT, 'data-id').value;//console.log(this.selectedMediaId);
        utils.sleep(300)
        browser.elementIdElement(sampleMediaEl.ELEMENT, 'svg.action-icon-settings').click()
        this.selectedMedia = fixtures.getMediaById(this.selectedMediaId); //console.log(this.selectedMedia);

        //console.log('1234')
        // 2. Input new media title
        browser.waitForExist('#container-upload-media-modal-body input[placeholder="Title"]', 5000);

        this.input = {};
        this.input.title = faker.name.title();
        browser.setValue('#container-upload-media-modal-body input[placeholder="Title"]', this.input.title);

        // 3. Select an industry
        browser.click('#container-upload-media-modal-body #selector-upload-media-industry');
        browser.waitForExist('#container-upload-media-modal-body #selector-upload-media-industry li', 5000);
        var liNames = browser.elements('#container-upload-media-modal-body #selector-upload-media-industry li').getText();
        var industries = fixtures.getIndustries();
        expect(liNames.length).toEqual(industries.length+1);
        liNames.forEach(function(liName, index){
            if(index == 0) {
                expect(liName).toEqual('Reset')
            } else {
                var industry = industries[index-1];
                expect(liName).toEqual(industry.name);
            }
        });
        var index = _.random(1, industries.length-1);
        this.input.industry = industries[index];
        browser.click(`#container-upload-media-modal-body #selector-upload-media-industry li:nth-child(${index+1})`);

        // 4. Select an theme
        browser.click('#container-upload-media-modal-body #selector-upload-media-theme');
        browser.waitForExist('#container-upload-media-modal-body #selector-upload-media-theme li', 5000);
        liNames = browser.elements('#container-upload-media-modal-body #selector-upload-media-theme li').getText();
        var themes = fixtures.getThemes();
        expect(liNames.length).toEqual(themes.length+1);
        liNames.forEach(function(liName, index){
            if(index == 0) {
                expect(liName).toEqual('Reset');
            } else {
                var theme = themes[index-1];
                expect(liName).toEqual(theme.name);
            }
        });
        index = _.random(1, themes.length-1);
        this.input.theme = themes[index];
        browser.click(`#container-upload-media-modal-body #selector-upload-media-theme li:nth-child(${index+1})`);


        // 5. Input some tags
        var tags = fixtures.getTags();
        index = _.random(0, tags.length-1);
        this.input.tag = tags[index];
        browser.setValue('#selector-upload-media-tag input[placeholder="Select Tags"]', this.input.tag.name);
        browser.keys('Enter');
        //console.log('123')

        // 6. Select presentation machine
        const pms = fixtures.getPresentationMachines();
        browser.click('#container-upload-media-presentation-machines #selector-upload-media-area div');
        browser.waitForExist('#container-upload-media-presentation-machines #selector-upload-media-area li.option', 5000);
        liNames = browser.elements('#container-upload-media-presentation-machines #selector-upload-media-area li.option').getText();

        expect(liNames.length).toEqual(pms.length+1);
        expect(liNames.every((name, index) => {
            if(index == 0) {
                return name === 'Reset'
            } else {
                const pm = pms[index-1]
                return name === pm.name
            }
        })).toEqual(true)
        index = _.random(0, pms.length-1);
        this.input.presentationMachine = pms[index];
        browser.click(`#container-upload-media-presentation-machines #selector-upload-media-area li.option[data-id="${this.input.presentationMachine._id}"]`);

        browser.waitForVisible('.modal-footer a.btn-update-media.enabled', 5000);
        browser.click('.modal-footer a.btn-update-media.enabled');
    });

    this.Then(/^I should see this media with updated data$/, function () {

        var media = fixtures.getMediaById(this.selectedMediaId);

        var title = this.input.title;
        var isValid = false
        //console.log(media, '1234568890')
        //console.log(`#container-medias [data-id="${media._id}"] .media-item-name`,123)

        browser.waitUntil(function () {
            var newMedia = browser.element(`#container-medias [data-id="${media._id}"] .media-item-name`);
            var elText = browser.getHTML(`#container-medias [data-id="${media._id}"] .media-item-name`)
            return elText.indexOf(title)>-1
        }, 5000);
    });

}