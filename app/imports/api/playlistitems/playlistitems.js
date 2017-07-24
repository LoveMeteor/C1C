import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import faker from 'faker';

import { Medias } from '../medias/medias.js';

// This is to be used in both canoncial playlist and also in playlists(Engagement)
class PlaylistItemsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    ourDoc.createdAt = ourDoc.createdAt || new Date();
    const result = super.insert(ourDoc, callback);
    return result;
  }
  remove(selector) {
    const result = super.remove(selector);
    return result;
  }
}

export const PlaylistItems = new PlaylistItemsCollection('PlaylistItems');

// Deny all playlistitem-side updates since we will be using methods to manage this collection
PlaylistItems.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

PlaylistItems.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  mediaId: { type: String, regEx: SimpleSchema.RegEx.Id  },
  duration: { type: Number, decimal: true, optional: false, defaultValue: 60  },//This is for image only
  showOverlay: { type: Boolean, defaultValue: false },
  createdAt: { type: Date, denyUpdate: true }
});


PlaylistItems.attachSchema(PlaylistItems.schema);

// This represents the keys from Playlistitems objects that should be published
// to the playlistitem. If we add secret properties to Playlistitems objects, don't list
// them here to keep them private to the server.
PlaylistItems.publicFields = {
  mediaId: 1,
  duration: 1,
  showOverlay: 1,
  createdAt: 1
};

// PLAYLISTITEM This factory has a name - This is for Testing
Factory.define('playlistitem', PlaylistItems, {
  mediaId: () => Factory.get('media'),
  duration: () => parseInt(Random.fraction() * 100),
  showOverlay: () => false,
  createdAt: () => new Date()
});

PlaylistItems.helpers({
  media() {
    return Medias.findOne(this.mediaId);
  }
});
