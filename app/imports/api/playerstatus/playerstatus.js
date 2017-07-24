import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Playlists } from '../playlists/playlists.js';
import { PresentationMachines } from '../presentationmachines/presentationmachines.js';

class PlayerStatusCollection extends Mongo.Collection {
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

export const PlayerStatus = new PlayerStatusCollection('PlayerStatus');

// Deny all playerStatus-side updates since we will be using methods to manage this collection
PlayerStatus.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

export const PLAYINGSTATUS = {
  PLAYING: "playing",
  PAUSE: "pause",
  STOP: "stop",
};

export const SPECIALCOMMAND = {
  STARTPLAY: "startplay",
  STARTPLAYAMBIENT: "startplayambient",
};

PlayerStatus.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  presentationMachineId: { type: String, regEx: SimpleSchema.RegEx.Id },
  playlistId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  playingStatus: { type: String, defaultValue: "" }, // This will be updated from the Presenter. Not sure about having two playing status.
  playlistLoop: { type: Boolean, defaultValue: false }, // This will be updated from the Presenter. Not sure about having two playing status.
  "playerUpdate.playlistItemId": {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
  "playerUpdate.updatedTime": {type: Date, optional: true}, // This is the time when current play list item have been updated last time.
  "playerUpdate.playedDuration": {type: Number, defaultValue: 0}, // This is the milliseconds already played when last time updated
  "specialCommand.command": {type: String, optional: true},
  "specialCommand.playlistItemId": {type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  createdAt: { type: Date, denyUpdate: true }
});


PlayerStatus.attachSchema(PlayerStatus.schema);

// This represents the keys from PlayerStatuss objects that should be published
// to the playerStatus. If we add secret properties to PlayerStatuss objects, don't list
// them here to keep them private to the server.
PlayerStatus.publicFieldsForPresenter = {
  presentationMachineId: 1,
  playlistId: 1,
  playingStatus: 1,
  createdAt: 1,
  playerUpdate: 1,
  playlistLoop: 1
  //specialCommand: 1
};

PlayerStatus.publicFieldsForMachine = {
  presentationMachineId: 1,
  playlistId: 1,
  playingStatus: 1,
  specialCommand: 1,
  playlistLoop: 1,
  playerUpdate: 1,
  createdAt: 1
};



// PLAYLIST This factory has a name - This is for Testing
Factory.define('playerstatus', PlayerStatus, {
    presentationMachineId: () => Factory.get('presentationmachine'),
    playlistId: () => Factory.get('playlist'),
    playingStatus: () => _.sample(Object.values(PLAYINGSTATUS)),
    playlistLoop: () => _.sample([true,false]),
    playerUpdate: () => {},
    createdAt: () => new Date()
});

PlayerStatus.helpers({
  presentationMachine() {
    return PresentationMachines.findOne(this.presentationMachineId);
  },
  playlist() {
    if(!this.playlistId)
    {
      return null;
    }
    return Playlists.find({_id:this.playlistId});
  }
});
