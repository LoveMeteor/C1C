var _ = require('underscore'),
    faker = require('faker');

module.exports = function () {

    this.When(/^I upload media file$/, function () {
        browser.waitForExist('#btn-upload-media', 5000);
        browser.click('#btn-upload-media');

        var path = require('path');
        var toUpload = path.join(__dirname, 'test-video.mp4'); //console.log("Paht to upload", toUpload);

        browser.waitForExist('#container-upload-media-modal-body input[type="file"]', 3000);
        browser.chooseFile('#container-upload-media-modal-body input[type="file"]', toUpload);

        browser.waitForExist('#container-upload-media-modal-body .container-media-preview', 500000);
    });
    this.When(/^input title$/, function () {
        this.input = {};
        this.input.title = faker.lorem.words();

        browser.setValue('#container-upload-media-modal-body input[placeholder="Title"]', this.input.title);
    });
    this.When(/^select industry, theme, tags$/, function () {

        // Select an industry
        browser.click('#container-upload-media-modal-body #selector-upload-media-industry');
        browser.waitForExist('#container-upload-media-modal-body #selector-upload-media-industry li', 5000);
        var liNames = browser.elements('#container-upload-media-modal-body #selector-upload-media-industry li').getText();
        var industries = fixtures.getIndustries();
        expect(liNames.length).toEqual(industries.length);
        liNames.forEach(function(liName, index){
            var industry = industries[index];
            expect(liName).toEqual(industry.name);
        });
        var index = _.random(0, industries.length-1);
        this.input.industry = industries[index];
        browser.click(`#container-upload-media-modal-body #selector-upload-media-industry li:nth-child(${index+1})`);



        // Input some tags
        var tags = fixtures.getTags();
        var index = _.random(0, tags.length-1);
        this.input.tag = tags[index];
        browser.setValue('#selector-upload-media-tag input[placeholder="Select Tags"]', this.input.tag.name);
        browser.keys('Enter');

        // Select an theme
        browser.click('#container-upload-media-modal-body #selector-upload-media-theme');
        browser.waitForExist('#container-upload-media-modal-body #selector-upload-media-theme li', 5000);
        var liNames = browser.elements('#container-upload-media-modal-body #selector-upload-media-theme li').getText();
        var themes = fixtures.getThemes();
        expect(liNames.length).toEqual(themes.length);
        liNames.forEach(function(liName, index){
            var theme = themes[index];
            expect(liName).toEqual(theme.name);
        });
        var index = _.random(0, themes.length-1);
        this.input.theme = themes[index];
        browser.click(`#container-upload-media-modal-body #selector-upload-media-theme li:nth-child(${index+1})`);
    });

    this.When(/^select the target presentation machines$/, function () {

        const pms = fixtures.getPresentationMachines();
        browser.click('#container-upload-media-presentation-machines #selector-upload-media-area div');
        browser.waitForExist('#container-upload-media-presentation-machines #selector-upload-media-area li.option', 5000);
        const liNames = browser.elements('#container-upload-media-presentation-machines #selector-upload-media-area li.option').getText();

        expect(liNames.length).toEqual(pms.length);
        expect(liNames.every((name, index) => {
            const pm = pms[index]
            return name === pm.name
        })).toEqual(true)
        const index = _.random(0, pms.length-1);
        this.input.presentationMachine = pms[index];
        browser.click(`#container-upload-media-presentation-machines #selector-upload-media-area li.option[data-id="${this.input.presentationMachine._id}"]`);

        this.mediasLength = browser.elements('#container-medias .media-item-container').value.length;
    });

    this.When(/^submit the form$/,  () => {
        browser.waitForExist('.modal-footer a.btn-submit.enabled', 10000);
        browser.click('.modal-footer a.btn-submit.enabled')
    });


    this.Then(/^I should see the uploaded media file in the media list$/, function () {
        var oldLength = this.mediasLength;
        var title = this.input.title

        //console.log(title,123456789)
        utils.waitForElements('#container-medias .media-item-container', oldLength+1);

        var media = fixtures.getMediaByName(this.input.title);

        var isValid = false
        function getElement(){
            var newMedia = browser.element(`#container-medias [data-id="${media._id}"] .media-item-name`);
            if(browser.elementIdText(newMedia.value.ELEMENT )){
                isValid = browser.elementIdText(newMedia.value.ELEMENT).value === title
            }
            return isValid
        }
        browser.waitUntil(function () {
            return getElement()
        }, 5000);
    });

    this.Then(/^I should see the presentation machines that have the uploaded media file$/, function () {
        const media = fixtures.getMedias({name:this.input.title})[0];

        const elPmNames = browser.getText(`#container-medias .media-item-container[data-id="${media._id}"] .container-presentation-machines`)

        expect(elPmNames).not.toBeNull()
        const pmNames = elPmNames.split(', ')

        expect(pmNames.length).toEqual(media.presentationMachineIds.length)
        const pms = fixtures.getPresentationMachines({_id:{$in:media.presentationMachineIds}})
        expect(pmNames.every((pmName) => _.findIndex(pms, {name:pmName}))!=-1).toEqual(true)
    });

}