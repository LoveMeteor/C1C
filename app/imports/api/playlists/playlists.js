import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import faker from 'faker';

// Playlist=EngagementPlaylist

import { Clients } from '../clients/clients.js';
import { PlaylistItems } from '../playlistitems/playlistitems.js';
import { PresentationMachines } from '../presentationmachines/presentationmachines.js';
import { PlayerStatus } from '../playerstatus/playerstatus.js';
import { Engagements } from '../engagements/engagements.js';
import { Favorites, FAVORITETYPES } from '../favorites/favorites.js'
import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';


class PlaylistsCollection extends Mongo.Collection {
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
      for(var i=0; i<playlists.length; i++) {
        itemIds.push(...playlists[i].itemIds);
        ids.push(playlists[i]._id);
      }
      if(itemIds.length > 0) {
        PlaylistItems.remove({ _id: {$in: itemIds} });
      }
      if(ids.length > 0) {
        Favorites.remove({itemId: {$in: ids}, favoriteType: FAVORITETYPES.PLAYLIST});

        // Update current playlist for player status if removeEngagement will be forced
        const statuses = PlayerStatus.find({playlistId:{$in: ids}}).fetch()
        statuses.forEach((status)=>{
          const ambientPlaylist = Playlists.findOne({presentationMachineId:status.presentationMachineId,ambientPlaylist:true})
            PlayerStatus.update({_id:status._id}, {
              $set:{
                playlistId:ambientPlaylist?ambientPlaylist._id:null,
                playerUpdate: {
                    playlistItemId:ambientPlaylist&&ambientPlaylist.itemIds&&ambientPlaylist.itemIds.length?ambientPlaylist.itemIds[0]:null,
                    playedDuration: 0
                }
              }
          })
        })
      }
    }
    const result = super.remove(selector);
    return result;
  }
}

export const Playlists = new PlaylistsCollection('Playlists');

// Deny all playlist-side updates since we will be using methods to manage this collection
Playlists.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

Playlists.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  engagementId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  ambientPlaylist: {type: Boolean, defaultValue: false},
  presentationMachineId: { type: String, regEx: SimpleSchema.RegEx.Id },
  overlay: { type: String, optional : true },
  itemIds: { type: [String], defaultValue: [] }, // Play list item Ids
  createdAt: { type: Date, denyUpdate: true }
});


Playlists.attachSchema(Playlists.schema);

// This represents the keys from Playlists objects that should be published
// to the playlist. If we add secret properties to Playlists objects, don't list
// them here to keep them private to the server.
Playlists.publicFields = {
  engagementId: 1,
  ambientPlaylist: 1,
  presentationMachineId: 1,
  overlay: 1,
  itemIds: 1,
  createdAt: 1
};

// PLAYLIST This factory has a name - This is for Testing
Factory.define('playlist', Playlists, {
  engagementId: () => Factory.get('engagement'),
  presentationMachineId: () => Factory.get('presentationmachine'),
  overlay: () => faker.lorem.words(),
  itemIds: () => [],
  createdAt: () => new Date()
});

Playlists.helpers({
  presentationMachine() {
    return PresentationMachines.findOne(this.presentationMachineId);
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
    var favorite = Favorites.findOne({itemId: this._id, favoriteType: FAVORITETYPES.PLAYLIST, userId: userId});
    if(favorite)
    {
      return true;
    }
    return false;
  }

});
