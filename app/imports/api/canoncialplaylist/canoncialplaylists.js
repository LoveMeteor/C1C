import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import faker from 'faker';
import { PlaylistItems } from '../playlistitems/playlistitems.js';
import { Tags } from '../tags/tags.js';
import { PresentationMachines } from '../presentationmachines/presentationmachines.js';
import { DownloadStatus, DOWNLOAD_STATUS } from '../downloadstatus/downloadstatus.js';
import { Themes } from '../themes/themes.js';
import { Industries } from '../industry/industry.js';
import { Favorites, FAVORITETYPES } from '../favorites/favorites.js'

class CanoncialPlaylistsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    ourDoc.createdAt = ourDoc.createdAt || new Date();
    const result = super.insert(ourDoc, callback);
    return result;
  }
  remove(selector) {
    const playlists = this.find(selector).fetch();
    if(playlists && playlists.length > 0)
    {
      var itemIds = [];
      let ids = [];
      for(var i=0; i<playlists.length; i++)
      {
        itemIds.push(...playlists[i].itemIds);
        ids.push(playlists[i]._id);
      }
      if(itemIds.length > 0) {
        PlaylistItems.remove({ _id: {$in: itemIds} });
      }
      if(ids.length > 0) {
        Favorites.remove({itemId: {$in: ids}, favoriteType: FAVORITETYPES.CANONCIALPLAYLIST});
      }
    }
    const result = super.remove(selector);
    return result;
  }
}

export const CanoncialPlaylists = new CanoncialPlaylistsCollection('CanoncialPlaylists');

// Deny all canoncialPlaylist-side updates since we will be using methods to manage this collection
CanoncialPlaylists.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

CanoncialPlaylists.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  itemIds: { type: [String], defaultValue: [] }, // Play list item Ids
  industryIds: { type: [String], defaultValue: [] }, // Industry Ids
  themeId: { type: String, optional: true }, // Theme Ids
  tagIds: { type: [String], defaultValue: [] },
  presentationMachineId: {  type: String, regEx: SimpleSchema.RegEx.Id},
  createdAt: { type: Date, denyUpdate: true }
});


CanoncialPlaylists.attachSchema(CanoncialPlaylists.schema);

// This represents the keys from CanoncialPlaylists objects that should be published
// to the canoncialPlaylist. If we add secret properties to CanoncialPlaylists objects, don't list
// them here to keep them private to the server.
CanoncialPlaylists.publicFields = {
  name: 1,
  itemIds: 1,
  industryIds:1,
  themeId:1,
  tagIds: 1,
  presentationMachineId: 1,
  createdAt: 1
};

// CanoncialPlaylist This factory has a name - This is for Testing
Factory.define('canoncialplaylist', CanoncialPlaylists, {
  name: () => faker.lorem.words(),
  itemIds: () => [],
  industryIds: () => [],
  themeId: () => Factory.get('theme'),
  tagIds: () => [],
  presentationMachineId: () => Factory.get('presentationmachine'),
  createdAt: () => new Date()
});

CanoncialPlaylists.helpers({
  tags() {
    return Tags.find({ _id: {$in: this.tagIds} });
  },
  industries() {
    return Industries.find({ _id: {$in: this.industryIds} });
  },
  theme() {
    if(this.themeId)
    {
      return Themes.findOne(this.themeId);
    }
    return null;
  },
  presentationMachine() {
    if(this.themeId){
      return PresentationMachines.findOne(this.presentationMachineId);
    }
    return null;
  },
  items() {
    return PlaylistItems.find({_id:{$in: this.itemIds}});
  },
  itemsInOrder() {
    var itemsList =  PlaylistItems.find({_id:{$in: this.itemIds}}).fetch();
    var sortedOrder = [];
    for(var i=0; i<this.itemIds.length; i++){
      for(var j=0; j< itemsList.length; j++)
      {
        if(this.itemIds[i] == itemsList[j]._id)
        {
          sortedOrder.push(itemsList[j]);
          break;
        }
      }
    }
    return sortedOrder;
  },
  isFavoritedBy(userId)
  {
    var favorite = Favorites.findOne({itemId: this._id, favoriteType: FAVORITETYPES.CANONCIALPLAYLIST, userId: userId});
    if(favorite)
    {
      return true;
    }
    return false;
  },
  isReady() {
      const mediasIds = PlaylistItems.find({_id: {$in : this.itemIds}}).map(playlistitem => playlistitem.mediaId)
      const downloadedItems = DownloadStatus.find({mediaId :  {$in : mediasIds }, status : DOWNLOAD_STATUS.DOWNLOADED , presentationMachineId:this.presentationMachineId}).fetch()
      return mediasIds.length === downloadedItems.length;
  }
});
