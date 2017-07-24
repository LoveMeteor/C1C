const _ = require('underscore');

module.exports = function () {
    this.Given(/^I am browsing content at specific presentation machine$/, function () {
        const pms = fixtures.getPresentationMachinesForPresenter();
        const index = _.random(0, pms.length-1);

        this.selectedPresentationMachine = pms[index];
        this.subUrl = 'presenter';

        browser.url(`${this.baseUrl}/${this.subUrl}/${pms[index]._id}`);
        browser.waitForExist('#player', 5000)
    });

    this.When(/^I select browsing by themes$/, function () {
        const selector = `a[href="/presenter/${this.selectedPresentationMachine._id}/themes"]`

        browser.waitForExist(selector, 6000)
        browser.click(selector)

        browser.waitUntil(() => browser.getCssProperty(selector, 'background-color').value == 'rgba(255,255,255,1)', 1000)
    });

    this.Then(/^I should see list of system themes displayed$/, () => {
        const selector = '.themes-list a.list-tile';

        browser.waitUntil(() => browser.isExisting(selector), 10000);

        const themes = fixtures.getThemes();
        const items = browser.elements(selector).value;

        expect(items.length).toEqual(themes.length);

        const themeNames = _.pluck(themes, 'name');

        items.forEach((item) => {
            expect(_.contains(themeNames, browser.elementIdElement(item.ELEMENT, '.item-inner').getText()));
        });
    });

    this.Given(/^I am browsing content at specific presentation machine by theme$/, function () {
        const pms = fixtures.getPresentationMachinesForPresenter();
        const index = _.random(0, pms.length-1);

        this.selectedPresentationMachine = pms[index];
        this.subUrl = 'presenter';

        browser.url(`${this.baseUrl}/${this.subUrl}/${pms[index]._id}/themes`);
        browser.waitForExist('#player', 5000)
    });

    this.Then(/^I should see all playlists in this presentation machine that has the selected theme$/, function () {
        const playlists = fixtures.getCanoncialPlaylists({themeId:this.selectedTheme._id, presentationMachineId:this.selectedPresentationMachine._id}),
            playlistNames = _.pluck(playlists, 'name');


        const selector = ".playlist-list > li"

        utils.waitForElements(selector, playlists.length)

        if(playlists.length == 0) return

        const items = browser.elements(selector).value
        expect(items.length).toEqual(playlists.length);

        items.forEach((item) => {
            expect(_.contains(playlistNames, item.value));
        });
    });

    this.Given(/^I am browsing playlists at specific presentation machine by theme$/, function () {
        const pms = fixtures.getPresentationMachinesForPresenter();
        const themes = fixtures.getThemes();

        let index = _.random(0, pms.length-1);
        this.selectedPresentationMachine = pms[index];

        const filteredThemes = themes.filter(theme => {
            const medias = fixtures.getMedias({themeId:theme._id,presentationMachineIds:this.selectedPresentationMachine._id}).length
            const playlists = fixtures.getCanoncialPlaylists({themeId:theme._id,presentationMachineId:this.selectedPresentationMachine._id}).length
            return !!medias && !!playlists
        })

        index = _.random(0, filteredThemes.length-1);
        this.selectedTheme = filteredThemes[index];



        this.subUrl = 'presenter';

        browser.url(`${this.baseUrl}/${this.subUrl}/${this.selectedPresentationMachine._id}/theme/${this.selectedTheme._id}`);

        const playlists = fixtures.getCanoncialPlaylists({presentationMachineId:this.selectedPresentationMachine._id, themeId:this.selectedTheme._id})
        const selector = ".playlist-list > li";
        utils.waitForElements(selector, playlists.length)

        this.playlists = playlists

        this.selectedItemType = 'playlist'
    });

    this.Then(/^I should see all media files in this presentation machine that has the selected theme listed as media title and media type$/, function () {
        const selector = ".media-list > li";
        const medias = fixtures.getMedias({themeId:this.selectedTheme._id, presentationMachineIds:this.selectedPresentationMachine._id});
        const mediaNames = _.pluck(medias, 'name');

        if(medias.length == 0) return
        browser.waitUntil(() => browser.isExisting(selector), 10000);

        const items = browser.elements(`${selector  } .item-text`).value;

        expect(items.length).toEqual(mediaNames.length);

        items.forEach((item) => {
            expect(_.contains(mediaNames, item.value));
        });
    });

    this.Given(/^I am browsing media at specific presentation machine by theme$/, function () {
        const pms = fixtures.getPresentationMachinesForPresenter();
        const themes = fixtures.getThemes();

        let cnt = 0
        do {
            let index = _.random(0, pms.length-1);
            this.selectedPresentationMachine = pms[index];

            const filteredThemes = themes.filter(theme => {
                const medias = fixtures.getMedias({themeId:theme._id,presentationMachineIds:this.selectedPresentationMachine._id}).length
                const playlists = fixtures.getCanoncialPlaylists({themeId:theme._id,presentationMachineId:this.selectedPresentationMachine._id}).length
                return !!medias && !!playlists
            })

            index = _.random(0, filteredThemes.length-1);
            this.selectedTheme = filteredThemes[index];
            cnt ++
            if(cnt>10) break;
        } while(this.selectedPresentationMachine==undefined || this.selectedTheme==undefined)

        // Direct to specific presenter page
        this.subUrl = 'presenter';
        browser.url(`${this.baseUrl}/${this.subUrl}/${this.selectedPresentationMachine._id}/theme/${this.selectedTheme._id}`);
        browser.waitForExist('#player', 5000)
        browser.waitUntil(() => browser.isVisible(selectors.presentation.idSwitchToggle), 10000);
        browser.click(selectors.presentation.idSwitchToggle)

        // Wait for media view is loaded fully
        const medias = fixtures.getMedias({themeId:this.selectedTheme._id, presentationMachineIds:this.selectedPresentationMachine._id});
        utils.waitForElements('#presenter-medias-view .media-list > li', medias.length)

        // Wait for current playlist is loaded fully
        const playerStatus = fixtures.getPlayerStatusForPresentationMachine(this.selectedPresentationMachine._id); //console.log(playerStatus,'1')

        const playlistItems = fixtures.getPlaylistItemsForPlaylist(playerStatus.playlistId)
        utils.waitForElements('#player .current-playlist-container li.presenter-playlist-item-container', playlistItems.length)

        this.selectedBrowseType = 'theme'
        this.medias = medias

    });

}