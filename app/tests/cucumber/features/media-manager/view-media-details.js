var _ = require('underscore');

module.exports = function () {
    this.Then(/^I should see media title$/, function () {
        browser.waitForExist('#container-upload-media-modal-body input[placeholder="Title"]', 5000);

        expect(browser.getValue('#container-upload-media-modal-body input[placeholder="Title"]')).toEqual(this.selectedMedia.name);
    });

    this.Then(/^I should see media industry and theme$/, function () {
        // 1. Checking media industries
        var industries = fixtures.getIndustries({_id:{$in:this.selectedMedia.industryIds}}),
            industryNames = _.pluck(industries, 'name'); //console.log(industries, industryNames);

        browser.waitUntil(function(){
            var selectedNames = browser.getText('#selector-upload-media-industry .display-selected-names');

            selectedNames = selectedNames.split(',');
            if(selectedNames.length != industryNames.length) return false;

            var bMatch = true;
            selectedNames.forEach(function(name){//console.log(name);
                if(industryNames.indexOf(name.trim()) == -1) bMatch = false;
            });

            return bMatch;
        }, 5000);


        // 2. Checking media theme
        var theme = fixtures.getThemeById(this.selectedMedia.themeId);

        browser.waitUntil(function(){
            var selectedName = browser.getText('#selector-upload-media-theme .display-selected-names');

            return (selectedName == theme.name);
        }, 5000);
    });

    this.Then(/^I should see list of presentation machines that have this media file$/, function () {
        const elPmNames = browser.getText('#container-upload-media-presentation-machines #selector-upload-media-area .display-selected-names'); //console.log(elPmNames);
        expect(elPmNames).not.toBeNull()
        const pmNames = elPmNames.split(', ')

        expect(pmNames.length).toEqual(this.selectedMedia.presentationMachineIds.length)
        const pms = fixtures.getPresentationMachines({_id:{$in:this.selectedMedia.presentationMachineIds}})
        expect(pmNames.every((pmName) => _.findIndex(pms, {name:pmName}))!=-1).toEqual(true)
    });
}