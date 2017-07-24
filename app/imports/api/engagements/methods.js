import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';


import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

import { Engagements } from './engagements.js';
import { Playlists } from '../playlists/playlists';
import { PlayerStatus } from '../playerstatus/playerstatus';

export const insertEngagement = new ValidatedMethod({
  name: 'engagements.insert',
  validate: Engagements.simpleSchema().pick(['name', 'clientId', 'startTime', 'endTime', 'star', 'cicId']).validator({ clean: true, filter: false }),
  run({ name, clientId, startTime, endTime, star, cicId }) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP)) {
      throw new Meteor.Error('engagement.insert.denied', 'Need to login to create');
    }

    const engagement = {
      name,
      clientId,
      startTime,
      endTime,
      star,
      cicId,
      createdAt: new Date(),
    };

    return Engagements.insert(engagement);
  },
});

export const updateEngagement = new ValidatedMethod({
  name: 'engagements.update',
  validate: Engagements.simpleSchema().pick(['_id', 'name', 'startTime', 'endTime', 'star', 'clientId']).validator({ clean: true, filter: false }),
  run({ _id, name, startTime, endTime, star, clientId }) {
    const engagement = Engagements.findOne(_id);
    if (!engagement.editableBy(this.userId)) {
      throw new Meteor.Error('engagements.update.denied', 'Not authorized to update engagement');
    }

    Engagements.update(_id, {
      $set: {
        name,
        startTime,
        endTime,
        star,
        clientId,
      },
    });
  },
});
export const removeEngagement = new ValidatedMethod({
  name: 'engagements.remove',
  validate: new SimpleSchema({
    _id: Engagements.simpleSchema().schema('_id'),
    force: { type: Boolean, defaultValue: false },
  }).validator({ clean: true, filter: false }),
  run({ _id, force }) {
    const engagement = Engagements.findOne(_id);
    if (!engagement.editableBy(this.userId)) {
      throw new Meteor.Error('engagements.update.denied', 'Not authorized to update engagement');
    }

    if (!force) {
      const playlists = Playlists.find({ engagementId: _id }).fetch();
      const playerStatusCount = PlayerStatus.find({ playlistId: { $in: _.pluck(playlists, '_id') } }).count()
      if (playerStatusCount > 0) {
        throw new Meteor.Error('engagements.remove', "Engagement can't be deleted since it has current playing list");
      }
    }

    Engagements.remove(_id);
  },
});

// Get client of all method names on Engagements
const ENGAGEMENTS_METHODS = _.pluck([
  insertEngagement,
  updateEngagement,
  removeEngagement,
], 'name');

if (Meteor.isServer) {
    // Only allow 5 engagements operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(ENGAGEMENTS_METHODS, name);
    },

        // Rate limit per connection ID
    connectionId() { return true; },
  }, 15, 1000);
}
