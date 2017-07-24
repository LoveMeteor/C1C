const _ = require('underscore');

module.exports = function () {
    this.When(/^I delete media file in media files page$/, function () {
        // Select a media not linked to any playlistitem
        const mediaIdsLinkedToPlaylistItem = _.uniq(_.pluck(fixtures.getPlaylistItems(), 'mediaId'));
        const medias = fixtures.getMedias({_id:{$nin:mediaIdsLinkedToPlaylistItem}}); //console.log(mediaIdsLinkedToPlaylistItem, medias, mediaIdsLinkedToPlaylistItem.length, medias.length)

        const sampleMedia = _.sample(medias)

        if(sampleMedia) {

            browser.click(`#container-medias .media-item-container[data-id="${sampleMedia._id}"] svg.action-icon-settings`)

            const deleteBtnSelector = '.modal-boron a.btn-delete-media.enabled'
            browser.waitUntil(()=>{
                return browser.isExisting(deleteBtnSelector)
            })

            browser.click(deleteBtnSelector)

            this.selectedMediaId = sampleMedia._id
        }
    });

    this.Then(/^I should not see it in the media list$/, function () {
        const selectedMediaId = this.selectedMediaId;

        if(selectedMediaId) {
            browser.waitUntil(function(){
                const mediaIds = browser.getAttribute('#container-medias .media-item-container', 'data-id');

                return !_.contains(mediaIds, selectedMediaId);
            }, 3000);
        }
    });
}