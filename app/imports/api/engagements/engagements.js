import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Roles } from 'meteor/alanning:roles';
import faker from 'faker';

import { Clients } from '../clients/clients.js';
import { Playlists } from '../playlists/playlists.js';
import { PlaylistItems } from '../playlistitems/playlistitems.js';
import { PlayerStatus } from '../playerstatus/playerstatus.js';
import { PresentationMachines } from '../presentationmachines/presentationmachines.js';
import { DownloadStatus, DOWNLOAD_STATUS } from '../downloadstatus/downloadstatus.js';

import { ROLES } from '../users/users.js';

class EngagementsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    ourDoc.createdAt = ourDoc.createdAt || new Date();
    const result = super.insert(ourDoc, callback);
    return result;
  }
  remove(selector) {
    const engagements = this.find(selector).fetch();
    if (engagements && engagements.length > 0) {
      const ids = [];
      for (let i = 0; i < engagements.length; i++) {
        ids.push(engagements[i]._id);
      }
      if (ids.length > 0) {
        Playlists.remove({ engagementId: { $in: ids } });
      }
    }
    const result = super.remove(selector);
    return result;
  }
}

export const Engagements = new EngagementsCollection('Engagements');

// Deny all client-side updates since we will be using methods to manage this collection
Engagements.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


Engagements.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  clientId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  cicId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  startTime: { type: Date, optional: true },
  endTime: { type: Date, optional: true },
  star: { type: Boolean, optional: true },
  createdAt: { type: Date, denyUpdate: true },
});


Engagements.attachSchema(Engagements.schema);

// This represents the keys from Engagements objects that should be published
// to the engagement. If we add secret properties to Engagements objects, don't list
// them here to keep them private to the server.
Engagements.publicFields = {
  clientId: 1,
  cicId: 1,
  name: 1,
  startTime: 1,
  endTime: 1,
  createdAt: 1,
};

// ENGAGEMENT This factory has a name - This is for Testing
Factory.define('engagement', Engagements, {
  clientId: () => Factory.get('client'),
  cicId: () => Factory.get('cic'),
  name: () => faker.lorem.words(),
  startTime: () => new Date(),
  endTime: () => new Date(),
  createdAt: () => new Date(),
});

Engagements.helpers({
  client() {
    return Clients.findOne(this.clientId);
  },
  playlists() {
    return Playlists.find({ engagementId: this._id });
  },
  presentationMachines() {
    const playlists = Playlists.find({ engagementId: this._id}).fetch()
    if(!playlists || playlists.length==0) return null

    return PresentationMachines.find({_id:{$in:_.uniq(_.pluck(playlists, 'presentationMachineId'))}}).fetch()
  },
  editableBy(userId) {
    if (!userId) {
      return false;
    }
    if (!Roles.userIsInRole(userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP) && (userId !== this.presenterId)) {
      return false;
    }
    return true;
  },
  isReady(presentationMachineId) {
    let playlistsId = [];
    Playlists.find({ engagementId: this._id, presentationMachineId }).forEach((playlist) => {
      if (playlist.itemIds && playlist.itemIds.length) {
        playlistsId = [...playlistsId, ...playlist.itemIds]
      }
    });
    if (playlistsId.length) {
      const mediasIds = PlaylistItems.find({ _id: { $in: playlistsId } }).map(playlistitem => playlistitem.mediaId)
      const downloadedItems = DownloadStatus.find({ mediaId: { $in: mediasIds }, status: DOWNLOAD_STATUS.DOWNLOADED, presentationMachineId }).fetch()
      return mediasIds.length === downloadedItems.length;
    }
    return false;
  },
  isPlaying() {
    const playlists = Playlists.find({ engagementId: this._id }).fetch();
    const playerStatusCount = PlayerStatus.find({ playlistId: { $in: _.pluck(playlists, '_id') } }).count()
    return playerStatusCount > 0
  },
});
