const _ = require('underscore');

module.exports = function () {

    this.Then(/^I should see all Presentation Machines listed$/, function () {
        const pms = fixtures.getPresentationMachinesForPresenter();

        browser.waitForExist('.top-navbar .selector-area div', 5000)
        browser.click('.top-navbar .selector-area div');
        browser.waitForExist('.top-navbar .selector-area li.option', 5000);
        const liNames = browser.elements('.top-navbar .selector-area li.option').getText();

        expect(liNames.length).toEqual(pms.length);
        expect(liNames.every((name, index) => {
            const pm = pms[index]
            return name === pm.name
        })).toEqual(true)

    });

    this.When(/^I select industries tab$/, function () {
        const selector = `a[href="/presenter/${this.selectedPresentationMachine._id}/industries"]`

        browser.waitForExist(selector, 6000)
        browser.click(selector)

        browser.waitUntil(() => browser.getCssProperty(selector, 'background-color').value == 'rgba(255,255,255,1)', 1000)
    });

    this.Then(/^I should see list of system industries displayed$/, () => {
        /*const selector = '.industries-list a.list-tile';
        const industries = fixtures.getIndustries();
        let elItems;
        browser.waitUntil(() => {//console.log(browser.getCssProperty(`#leftNav a[href="/presenter/${this.selectedPresentationMachine._id}/industries"]`, 'background-color'))
            if (browser.isExisting(selector)) {
                elItems = browser.elements(selector).value
                //console.log(elItems.length, industries.length)
                return elItems.length == industries.length
            }
        }, 10000);

        var industryNames = _.pluck(industries, 'name');

        elItems.forEach(function(el){
           expect(_.contains(industryNames, browser.elementIdElement(el.ELEMENT, '.item-inner').getText()));
        });//console.log('123456')*/
    });

    this.Given(/^I am browsing content at specific presentation machine by Industry$/, function () {
        const pms = fixtures.getPresentationMachinesForPresenter();
        const index = _.random(0, pms.length-1);

        this.selectedPresentationMachine = pms[index];
        this.subUrl = 'presenter';

        browser.url(`${this.baseUrl}/${this.subUrl}/${pms[index]._id}/industries`);
        browser.waitForExist('#player', 5000)
    });

    this.Then(/^I should see all playlists in this presentation machine that has the selected Industry$/, function () {
        const playlists = fixtures.getCanoncialPlaylists({industryIds:this.selectedIndustry._id, presentationMachineId:this.selectedPresentationMachine._id}),
            playlistNames = _.pluck(playlists, 'name');

        const selector = ".playlist-list > li"

        //browser.waitUntil(() => browser.isExisting(selector), 10000);
        utils.waitForElements(selector, playlists.length)

        if(playlists.length == 0) return
        const items = [].concat(browser.elements(selector).getText());

        expect(items.length).toEqual(playlists.length);

        items.forEach((item) => {
            expect(_.contains(playlistNames, item.value));
        });
    });


    this.Then(/^I should see all media files in this presentation machine that has the selected Industry listed as media title and media type$/, function () {
        const selector = ".media-list > li";
        const medias = fixtures.getMedias({industryIds:this.selectedIndustry._id, presentationMachineIds:this.selectedPresentationMachine._id});
        const mediaNames = _.pluck(medias, 'name');

        if(medias.length == 0) return
        browser.waitUntil(() => browser.isExisting(selector), 10000);

        const items = browser.elements(`${selector  } .item-text`).getText();

        expect(items.length).toEqual(mediaNames.length);

        items.forEach((item) => {
            expect(_.contains(mediaNames, item.value));
        });
    });

    this.Given(/^I am browsing playlists at specific presentation machine by Industry$/, function () {
        const pms = fixtures.getPresentationMachinesForPresenter();
        const industries = fixtures.getIndustries();

        let index = _.random(0, pms.length-1);
        this.selectedPresentationMachine = pms[index];

        index = _.random(0, industries.length-1);
        this.selectedIndustry = industries[index];

        this.subUrl = 'presenter';

        browser.url(`${this.baseUrl}/${this.subUrl}/${this.selectedPresentationMachine._id}/industry/${this.selectedIndustry._id}`);
        browser.waitForExist('#player', 5000)
        const playlists = fixtures.getCanoncialPlaylists({presentationMachineId:this.selectedPresentationMachine._id, industryIds:this.selectedIndustry._id})
        const selector = ".playlist-list > li";
        utils.waitForElements(selector, playlists.length)

        this.playlists = playlists

        this.selectedItemType = 'playlist'
    });

    this.Given(/^I am browsing media at specific presentation machine by Industry$/, function () {
        const pms = fixtures.getPresentationMachinesForPresenter();
        const industries = fixtures.getIndustries();

        let index = _.random(0, pms.length-1);
        this.selectedPresentationMachine = pms[index];

        index = _.random(0, industries.length-1);
        this.selectedIndustry = industries[index];


        // Direct to specific presenter page
        this.subUrl = 'presenter'; //console.log('URL',`${this.baseUrl}/${this.subUrl}/${this.selectedPresentationMachine._id}/industry/${this.selectedIndustry._id}`)
        browser.url(`${this.baseUrl}/${this.subUrl}/${this.selectedPresentationMachine._id}/industry/${this.selectedIndustry._id}`);
        browser.waitForExist('#player', 5000)
        browser.waitUntil(() => browser.isExisting(selectors.presentation.idSwitchToggle), 10000);
        browser.click(selectors.presentation.idSwitchToggle)

        // Wait for media view is loaded fully
        const medias = fixtures.getMedias({industryIds:this.selectedIndustry._id, presentationMachineIds:this.selectedPresentationMachine._id});
        utils.waitForElements('#presenter-medias-view .media-list > li', medias.length)

        // Wait for current playlist is loaded fully
        const playerStatus = fixtures.getPlayerStatusForPresentationMachine(this.selectedPresentationMachine._id); //console.log(playerStatus,1233111123)

        const playlistItems = fixtures.getPlaylistItemsForPlaylist(playerStatus.playlistId); //console.log(playlistItems)
        utils.waitForElements('#player .current-playlist-container li.presenter-playlist-item-container', playlistItems.length)

        this.selectedBrowseType = 'industry'
        this.medias = medias

    });
}