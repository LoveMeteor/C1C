var _ = require('underscore');

module.exports = function () {

    this.Given(/^I am on list playlists page$/, function () {

        this.subUrl = 'playlists';
        browser.url(`${this.baseUrl}/${this.subUrl}`);

        browser.waitForExist('div=Playlists', 10000);
    });

    this.Then(/^I should see all saved playlists$/, function () {
        var playlists = fixtures.getCanoncialPlaylists({}, {sort:{createdAt:-1}});

        utils.waitForElements('#container-playlists .container-item-playlist', playlists.length);
        var elNames = browser.elements('#container-playlists .container-item-playlist .display-playlist-name').getText(); //console.log(elNames);

        expect(elNames.length).toEqual(playlists.length);

        var playlistNames = _.pluck(playlists, 'name');
        elNames.forEach(function(elName, index){
            expect(elName).toEqual(playlistNames[index]);
        });
    });
    this.Then(/^I should see the presentation machines that have each playlist$/, function () {
        var playlists = fixtures.getCanoncialPlaylists({},{sort:{name:1}},{presentationMachine:true}); //console.log(_.pluck(playlists, 'name'));

        var itemEls = browser.elements('#container-playlists .container-item-playlist').value; //console.log(itemEls);

        expect(itemEls.length).toEqual(playlists.length);

        itemEls.forEach(function(itemEl, index){
            var pmIds = browser.elementIdElements(itemEl.ELEMENT, '.container-presentation-machines .container-presentation-machine-item').getAttribute('data-id'); //console.log(pmIds);
            var visibilities = browser.elementIdElements(itemEl.ELEMENT, '.container-presentation-machines .container-presentation-machine-item').getCssProperty('visibility'); //console.log(visibilities);
            var playlist = playlists[index]; //console.log(playlist.name, playlist.presentationMachineId);

            var pmIndex = _.indexOf(pmIds, playlist.presentationMachineId); //console.log(pmIndex);

            visibilities.forEach(function(visibility, i){
                if(pmIndex == i) {
                    expect(visibility.value).toEqual('visible');
                } else {
                    expect(visibility.value).toEqual('hidden');
                }
            });
        });
    });

    this.Then(/^I should see the presentation machine that have each playlist$/, function () {
      const playlists = fixtures.getCanoncialPlaylists({},{sort:{createdAt:-1}},{presentationMachine:true});
      const itemEls = browser.elements('#container-playlists .container-item-playlist').value;

      expect(itemEls.length).toEqual(playlists.length);

      const allEqual = itemEls.every((itemEl, index) => {
        const pmId = browser.elementIdElements(itemEl.ELEMENT, '.container-presentation-machine').getAttribute('data-id');
        const playlistPm = playlists[index].presentationMachineId;
        return pmId === playlistPm
      });
      expect(allEqual).toEqual(true)
    });

    this.When(/^I search by a keyword with available matches$/, function () {
        browser.waitForExist('#form-search-keyword', 5000);

        var playlists = fixtures.getCanoncialPlaylists({},{sort:{name:1}});

        this.keyword = _.sample(playlists).name.substr(0,2);

        browser.setValue('#form-search-keyword', this.keyword);

    });
    this.Then(/^I should see all playlists that exactly\/partially match the search keyword$/, function () {

        var keywordFilter = {$regex: this.keyword};
        var tags = fixtures.getTags({name: keywordFilter}),
            tagIds = _.pluck(tags, '_id');

        var filters = {$or: [{name: keywordFilter},{tagIds: {$in:tagIds}}]};
        if(this.selectedPresentationMachine) {
            filters.presentationMachineId = this.selectedPresentationMachine._id;
        }

        var sort = {sort:{name:1}};

        var playlists = fixtures.getCanoncialPlaylists(filters, sort);

        var els, elNames, names;

        if(playlists.length == 0) {
            expect(browser.isExisting('#container-playlists .container-item-playlist')).toEqual(false);
        } else {
            utils.waitForElements('#container-playlists .container-item-playlist .display-playlist-name', playlists.length);
            names = _.pluck(playlists, 'name'); //console.log("Should see playlist names", names);
            els = browser.elements('#container-playlists .container-item-playlist .display-playlist-name');
            elNames = [].concat(els.getText()); //console.log("Playlist ElNames:", elNames);
            expect(elNames.length).toEqual(names.length);

            elNames.forEach(function(elName){
                expect(_.contains(names, elName)).toEqual(true);
            });
        }
    });

    this.Then(/^I should see all playlists that has this theme$/, function () {
        var playlists = fixtures.getCanoncialPlaylists({themeId:this.selectedTheme._id}, {sort:{name:1}});

        var els, elNames, names;

        if(playlists.length == 0) {
            expect(browser.isExisting('#container-playlists .container-item-playlist')).toEqual(false);
        } else {
            names = _.pluck(playlists, 'name'); //console.log("Should see playlist names", names);
            els = browser.elements('#container-playlists .container-item-playlist .display-playlist-name');
            elNames = [].concat(els.getText()); //console.log("Playlist ElNames:", elNames);
            expect(elNames.length).toEqual(names.length);

            elNames.forEach(function(elName){
                expect(_.contains(names, elName)).toEqual(true);
            });
        }
    });



    this.Then(/^I should see all playlists that has this industry$/, function () {
        var playlists = fixtures.getCanoncialPlaylists({industryIds:{$in:[this.selectedIndustry._id]}}, {sort:{name:1}});

        var els, elNames, names;

        if(playlists.length == 0) {
            expect(browser.isExisting('#container-playlists .container-item-playlist')).toEqual(false);
        } else {
            utils.waitForElements('#container-playlists .container-item-playlist .display-playlist-name', playlists.length);
            names = _.pluck(playlists, 'name'); //console.log("Should see playlist names", names);
            els = browser.elements('#container-playlists .container-item-playlist .display-playlist-name');
            elNames = [].concat(els.getText()); //console.log("Playlist ElNames:", elNames);
            expect(elNames.length).toEqual(names.length);

            elNames.forEach(function(elName){
                expect(_.contains(names, elName)).toEqual(true);
            });
        }
    });

    this.Then(/^I should see only playlists on this presentation machine$/, function () {
        var playlists = fixtures.getCanoncialPlaylists({presentationMachineId:this.selectedPresentationMachine._id}, {sort:{name:1}});

        var els, elNames, names;

        if(playlists.length == 0) {
            expect(browser.isExisting('#container-playlists .container-item-playlist')).toEqual(false);
        } else {
            utils.waitForElements('#container-playlists .container-item-playlist .display-playlist-name', playlists.length);
            names = _.pluck(playlists, 'name'); //console.log("Should see playlist names", names);
            els = browser.elements('#container-playlists .container-item-playlist .display-playlist-name');
            elNames = [].concat(els.getText()); //console.log("Playlist ElNames:", elNames);
            expect(elNames.length).toEqual(names.length);

            elNames.forEach(function(elName){
                expect(_.contains(names, elName)).toEqual(true);
            });
        }
    });

    this.Then(/^I should see all playlists whatever its presentation machine$/, function () {
        var playlists = fixtures.getCanoncialPlaylists({}, {sort:{name:1}});

        var els, elNames, names;

        if(playlists.length == 0) {
            expect(browser.isExisting('#container-playlists .container-item-playlist')).toEqual(false);
        } else {
            utils.waitForElements('#container-playlists .container-item-playlist .display-playlist-name', playlists.length);
            names = _.pluck(playlists, 'name'); //console.log("Should see playlist names", names);
            els = browser.elements('#container-playlists .container-item-playlist .display-playlist-name');
            elNames = [].concat(els.getText()); //console.log("Playlist ElNames:", elNames);
            expect(elNames.length).toEqual(names.length);

            elNames.forEach(function(elName){
                expect(_.contains(names, elName)).toEqual(true);
            });
        }
    });

    this.When(/^I search with a keyword with no available matches$/, function () {
        browser.waitForExist('#form-search-keyword', 5000);

        var playlists = fixtures.getCanoncialPlaylists({},{sort:{name:1}});

        this.keyword = 'xxxxxxx';

        browser.setValue('#form-search-keyword', this.keyword);
    });

    this.Then(/^I should see no results found message$/, function () {
        browser.waitUntil(function(){
            return browser.getText("div*=No results found");
        }, 5000);
    });

    this.When(/^I sort playlists by title \(A\-Z\)$/, function () {
        browser.waitForExist(selectors.playlists.idSelectSorting, 5000);

        browser.click(selectors.playlists.idSelectSorting);

        var liEl = browser.element(selectors.playlists.idSelectSorting).element('li=Title (A–Z)');
        liEl.click();
    });

    this.Then(/^I should see all playlists sorted alphabetically ascending$/, function () {
        var playlists = fixtures.getCanoncialPlaylists({}, {sort:{name:1}});

        var els, elNames, names;

        if(playlists.length == 0) {
            expect(browser.isExisting('#container-playlists .container-item-playlist')).toEqual(false);
        } else {
            utils.waitForElements('#container-playlists .container-item-playlist .display-playlist-name', playlists.length);
            names = _.pluck(playlists, 'name'); //console.log("Should see playlist names", names);
            els = browser.elements('#container-playlists .container-item-playlist .display-playlist-name');
            elNames = [].concat(els.getText()); //console.log("Playlist ElNames:", elNames);
            expect(elNames.length).toEqual(names.length);

            elNames.forEach(function(elName){
                expect(_.contains(names, elName)).toEqual(true);
            });
        }
    });

    this.When(/^I sort playlists by Newest$/, function () {
        browser.waitForExist(selectors.playlists.idSelectSorting, 5000);

        browser.click(selectors.playlists.idSelectSorting);

        var liEl = browser.element(selectors.playlists.idSelectSorting).element('li=Newest');
        liEl.click();
    });

    this.Then(/^I should see all playlists sorted by creation time descending$/, function () {
        var playlists = fixtures.getCanoncialPlaylists({}, {sort:{createdAt:-1}});

        var els, elNames, names;

        if(playlists.length == 0) {
            expect(browser.isExisting('#container-playlists .container-item-playlist')).toEqual(false);
        } else {
            utils.waitForElements('#container-playlists .container-item-playlist .display-playlist-name', playlists.length);
            names = _.pluck(playlists, 'name'); //console.log("Should see playlist names", names);
            els = browser.elements('#container-playlists .container-item-playlist .display-playlist-name');
            elNames = [].concat(els.getText()); //console.log("Playlist ElNames:", elNames);
            expect(elNames.length).toEqual(names.length);

            elNames.forEach(function(elName){
                expect(_.contains(names, elName)).toEqual(true);
            });
        }
    });

    this.When(/^I sort playlists by Oldest$/, function () {
        browser.waitForExist(selectors.playlists.idSelectSorting, 5000);

        browser.click(selectors.playlists.idSelectSorting);

        var liEl = browser.element(selectors.playlists.idSelectSorting).element('li=Oldest');
        liEl.click();
    });

    this.Then(/^I should see all playlists sorted by creation time ascending$/, function () {
        var playlists = fixtures.getCanoncialPlaylists({}, {sort:{createdAt:1}});

        var els, elNames, names;

        if(playlists.length == 0) {
            expect(browser.isExisting('#container-playlists .container-item-playlist')).toEqual(false);
        } else {
            utils.waitForElements('#container-playlists .container-item-playlist .display-playlist-name', playlists.length);
            names = _.pluck(playlists, 'name'); //console.log("Should see playlist names", names);
            els = browser.elements('#container-playlists .container-item-playlist .display-playlist-name');
            elNames = [].concat(els.getText()); //console.log("Playlist ElNames:", elNames);
            expect(elNames.length).toEqual(names.length);

            elNames.forEach(function(elName){
                expect(_.contains(names, elName)).toEqual(true);
            });
        }
    });

    this.When(/^I sort playlists by verified$/, function () {
        browser.waitForExist(selectors.playlists.idSelectSorting, 5000);

        browser.click(selectors.playlists.idSelectSorting);

        var liEl = browser.element(selectors.playlists.idSelectSorting).element('li=Verified');
        liEl.click();
    });
    this.Then(/^I should see all playlists sorted by verification status ascending$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^I should see list of its content$/, function () {
        browser.waitForExist(`#container-playlists .container-item-playlist[data-id="${this.selectedPlaylist._id}"] .container-playlistitems`, 5000)
        //console.log(this.selectedPlaylist)
        browser.waitUntil(()=>{return browser.elements(`#container-playlists .container-item-playlist[data-id="${this.selectedPlaylist._id}"] .container-playlistitems .container-media-item`).value.length == this.selectedPlaylist.items.length})
        var piNames = [].concat(browser.elements(`#container-playlists .container-item-playlist[data-id="${this.selectedPlaylist._id}"] .container-playlistitems .container-media-item .display-playlistitem-name`).getText());

        var playlistitems = this.selectedPlaylist.items;
        var mediaNames = playlistitems.map(function(item){
            return item.media.name;
        });

        const piNamesSet = new Set(piNames);
        expect(piNames.every(name => mediaNames.indexOf(name)>-1)).toEqual(true);

    });
}