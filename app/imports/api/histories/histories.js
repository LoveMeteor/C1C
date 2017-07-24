import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import faker from 'faker';

import { Medias } from '../medias/medias.js';
import { Engagements } from '../engagements/engagements.js';
import { Playlists } from '../playlists/playlists.js';

class HistoriesCollection extends Mongo.Collection {
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

export const Histories = new HistoriesCollection('Histories');

// Deny all history-side updates since we will be using methods to manage this collection
Histories.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

Histories.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  mediaId: { type: String, regEx: SimpleSchema.RegEx.Id },
  playedAt:{ type: Date, denyUpdate: true },
  playlistId: { type: String, regEx: SimpleSchema.RegEx.Id },
  engagementId: { type: String, regEx: SimpleSchema.RegEx.Id },
  createdAt: { type: Date, denyUpdate: true }
});


Histories.attachSchema(Histories.schema);

// This represents the keys from Histories objects that should be published
// to the history. If we add secret properties to Histories objects, don't list
// them here to keep them private to the server.
Histories.publicFields = {
  playlistId: 1,
  mediaId: 1,
  engagementId: 1,
  playedAt: 1,
  createdAt: 1
};

// HISTORY This factory has a name - This is for Testing
Factory.define('history', Histories, {
  mediaId: () => Factory.get('media'),
  playlistId: () => Factory.get('playlist'),
  engagementId: () => Factory.get('engagement'),
  playedAt: () => new Date(),
  createdAt: () => new Date()
});

Histories.helpers({
  media() {
    return Medias.findOne(this.mediaId);
  },
  playlist() {
    return Playlists.findOne(this.playlistId);
  },
  engagement() {
    return Engagements.findOne(this.engagementId);
  }
});
