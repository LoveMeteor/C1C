import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import faker from 'faker';

import { Tags } from '../tags/tags.js';
import { PresentationMachines } from '../presentationmachines/presentationmachines.js';
import { MediaFiles } from '../mediafiles/mediafiles.js';
import { Favorites, FAVORITETYPES } from '../favorites/favorites.js';
import { PlaylistItems } from '../playlistitems/playlistitems.js';
import { Playlists } from '../playlists/playlists.js';
import { CanoncialPlaylists } from '../canoncialplaylist/canoncialplaylists.js';
import { Themes } from '../themes/themes.js';
import { Industries } from '../industry/industry.js';
import { Engagements } from '/imports/api/engagements/engagements';
import { DownloadStatus, DOWNLOAD_STATUS } from '../downloadstatus/downloadstatus.js';

class MediasCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    ourDoc.createdAt = ourDoc.createdAt || new Date();
    const result = super.insert(ourDoc, callback);
    // mediasCountDenormalizer.afterInsertMedia(ourDoc);
    return result;
  }
  remove(selector) {
    // Here we removed media. In this case, if there's a playlist with the media, the playlist items should be removed.
    // or should we restrict from users deleting media that's associated with playlist?
    const medias = this.find(selector).fetch();
    if (medias && medias.length > 0) {
      const ids = [];
      const mediaFileIds = [];
      for (let i = 0; i < medias.length; i++) {
        ids.push(medias[i]._id);
        mediaFileIds.push(medias[i].mediaFileId);
      }
      Favorites.remove({ itemId: { $in: ids }, favoriteType: FAVORITETYPES.MEDIA });
      MediaFiles.remove({ _id: { $in: mediaFileIds } });
      PlaylistItems.remove({ mediaId: { $in: ids } });
    }
    const result = super.remove(selector);
    return result;
  }
}

export const Medias = new MediasCollection('Medias');
export const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
};
// Deny all media-side updates since we will be using methods to manage this collection
Medias.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Medias.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  type: { type: String }, // MediaType, Video, Image, Music
  mediaFileId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true }, // this optional is temporary for testing
  width: { type: Number, optional: true },
  height: { type: Number, optional: true },
  videoDuration: { type: Number, optional: true }, // This is only for Video. Length of Video in Seconds
  themeId: { type: String, optional: true }, // Theme is not optional. Only one theme
  industryIds: { type: [String], defaultValue: [] }, // Can be zero or more industries
  tagIds: { type: [String], defaultValue: [] }, // Can me zero or more keywords
  presentationMachineIds: { type: [String], defaultValue: [] },
  createdAt: { type: Date, denyUpdate: true },
});

Medias.attachSchema(Medias.schema);

// This represents the keys from Medias objects that should be published
// to the media. If we add secret properties to Medias objects, don't list
// them here to keep them private to the server.
Medias.publicFields = {
  name: 1,
  type: 1,
  mediaFileId: 1,
  width: 1,
  height: 1,
  videoDuration: 1,
  themeId: 1,
  industryIds: 1,
  tagIds: 1,
  presentationMachineIds: 1,
  createdAt: 1,
};

// MEDIA This factory has a name - This is for Testing
Factory.define('media', Medias, {
  name: () => faker.lorem.words(),
  type: () => _.sample(Object.values(MEDIA_TYPES)),
  themeId: () => Factory.get('theme'),
  industryIds: () => [],
  tagIds: () => [],
  presentationMachineIds: () => [],
  mediaFileId: () => null,
  createdAt: () => new Date(),
});

Medias.helpers({
  mediaFile() {
    return MediaFiles.findOne(this.mediaFileId);
  },
  theme() {
    return Themes.findOne(this.themeId);
  },
  industries() {
    return Industries.find({ _id: { $in: this.industryIds } });
  },
  tags() {
    return Tags.find({ _id: { $in: this.tagIds } });
  },
  presentationMachines() {
    return PresentationMachines.find({ _id: { $in: this.presentationMachineIds } }).fetch();
  },
  canDelete() {
    const items = PlaylistItems.find({ mediaId: this._id }).fetch();
    if (items && items.length > 0) {
      const itemIds = [];
      for (let i = 0; i < items.length; i++) {
        itemIds.push(items[i]._id);
      }

      const canoncialPlaylist = CanoncialPlaylists.findOne({ itemIds: { $in: itemIds } });
      if (canoncialPlaylist) {
        return false;
      }
      const playlist = Playlists.findOne({ itemIds: { $in: itemIds } });
      if (playlist) {
        return false;
      }
      return true;
    }
    return true;
  },
  machinesUsedMedia() {
    const items = PlaylistItems.find({ mediaId: this._id }, { fields: { _id: 1 } }).fetch();
    const pmIds = [];
    if (items && items.length > 0) {
      const itemIds = [];
      for (let i = 0; i < items.length; i++) {
        itemIds.push(items[i]._id);
      }
      const canoncialPlaylists = CanoncialPlaylists.find({ itemIds: { $in: itemIds } }, { fields: { presentationMachineId: 1 } }).fetch();
      canoncialPlaylists.forEach((canoncialPlaylist) => {
        pmIds.push(canoncialPlaylist.presentationMachineId);
      });
      const playlists = Playlists.find({ itemIds: { $in: itemIds } }, { fields: { presentationMachineId: 1 } }).fetch();
      playlists.forEach((playlist) => {
        pmIds.push(playlist.presentationMachineId);
      });
    }
    return PresentationMachines.find({ _id: { $in: pmIds } }).fetch();
  },
  canoncialPlaylists() {
    const items = PlaylistItems.find({ mediaId: this._id }).fetch();
    const itemIds = [];
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        itemIds.push(items[i]._id);
      }
    }
    return CanoncialPlaylists.find({ itemIds: { $in: itemIds } });
  },
  playlists() {
    const items = PlaylistItems.find({ mediaId: this._id }).fetch();
    const itemIds = [];
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        itemIds.push(items[i]._id);
      }
    }
    return Playlists.find({ itemIds: { $in: itemIds } });
  },
  engagements() {
    const items = PlaylistItems.find({ mediaId: this._id }, { fields: { _id: 1 } }).fetch();
    const engagementIds = [];
    if (items && items.length > 0) {
      const itemIds = [];
      for (let i = 0; i < items.length; i++) {
        itemIds.push(items[i]._id);
      }
      const playlists = Playlists.find({ itemIds: { $in: itemIds } }, { fields: { engagementId: 1 } }).fetch();
      playlists.forEach((playlist) => {
        engagementIds.push(playlist.engagementId);
      });
    }
    return Engagements.find({ _id: { $in: engagementIds } });
  },
  isFavoritedBy(userId) {
    const favorite = Favorites.findOne({ itemId: this._id, favoriteType: FAVORITETYPES.MEDIA, userId });
    if (favorite) {
      return true;
    }
    return false;
  },
  isReady(presentationMachineId) {
    const downloadedItems = DownloadStatus.find({ mediaId: this._id, status: DOWNLOAD_STATUS.DOWNLOADED, presentationMachineId }).fetch()
    return downloadedItems.length > 0;
  },
});
