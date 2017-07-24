import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';


import { Clients } from './clients.js';
import { Engagements } from '/imports/api/engagements/engagements.js';

export const insertClient = new ValidatedMethod({
  name: 'clients.insert',
  validate: Clients.simpleSchema().pick(['name', 'logoFileId', 'website','industryId', 'facebook', 'twitter','instagram','cicId']).validator({ clean: true, filter: false }),
  run({ name, logoFileId, website, industryId, facebook, twitter, instagram,cicId}) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to create new users");
    }

    const client = {
      name,
      logoFileId,
      website,
      industryId,
      facebook,
      twitter,
      instagram,
      cicId,
      createdAt: new Date(),
    };
    return Clients.insert(client);
  }
});

export const updateClient = new ValidatedMethod({
  name: 'clients.update',
  validate: new SimpleSchema({
    _id: Clients.simpleSchema().schema('_id'),
    name: Clients.simpleSchema().schema('name'),
    logoFileId: Clients.simpleSchema().schema('logoFileId'),
    website: Clients.simpleSchema().schema('website'),
    industryId: Clients.simpleSchema().schema('industryId'),
    facebook: Clients.simpleSchema().schema('facebook'),
    twitter: Clients.simpleSchema().schema('twitter'),
    instagram: Clients.simpleSchema().schema('instagram'),
  }).validator({ clean: true, filter: true }),
  run({ _id, name, logoFileId, website,industryId, facebook, twitter, instagram }) {

    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to create new users");
    }

    Clients.update(_id, {
      $set: {
        name: (_.isUndefined(name) ? null : name),
        logoFileId: (_.isUndefined(logoFileId) ? null : logoFileId),
        website: (_.isUndefined(website) ? null : website),
        industryId: (_.isUndefined(industryId) ? null : industryId),
        facebook: (_.isUndefined(facebook) ? null : facebook),
        twitter: (_.isUndefined(twitter) ? null : twitter),
        instagram: (_.isUndefined(instagram) ? null : instagram)
      }
    });
  }
});




export const removeClient = new ValidatedMethod({
  name: 'clients.remove',
  validate: new SimpleSchema({
    _id: Clients.simpleSchema().schema('_id'),
    force: {type: Boolean, defaultValue: false}
  }).validator({ clean: true, filter: false }),
  run({ _id, force }) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP)) {
      throw new Meteor.Error("clients.remove", "Not authorized to create new users");
    }
    if(!force) {
      let engagementCount = Engagements.find({clientId: _id}).count();
      if(engagementCount > 0) {
        throw new Meteor.Error("clients.remove", "Client can't be deleted since they are linked to engagements");
      }
    } else {
      Engagements.remove({clientId: _id});
    }
    Clients.remove(_id);
  }
});

// Get client of all method names on Clients
const CLIENTS_METHODS = _.pluck([
  insertClient,
  updateClient,
  removeClient
], 'name');

if (Meteor.isServer) {
  // Only allow 5 clients operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(CLIENTS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; }
  }, 5, 1000);
}
