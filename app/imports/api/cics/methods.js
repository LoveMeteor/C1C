import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';


import { Cics } from './cics.js';


export const insertCic = new ValidatedMethod({
  name: 'cics.insert',
  validate: Cics.simpleSchema().pick(['name', 'logo', 'website']).validator({ clean: true, filter: false }),
  run({ name, logo, website}) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to create new users");
    }

    const cic = {
      name,
      logo,
      website,
      createdAt: new Date()
    };
    return Cics.insert(cic);
  }
});

export const updateCic = new ValidatedMethod({
  name: 'cics.update',
  validate: new SimpleSchema({
    _id: Cics.simpleSchema().schema('_id'),
    name: Cics.simpleSchema().schema('name'),
    logo: Cics.simpleSchema().schema('logo'),
    website: Cics.simpleSchema().schema('website')
  }).validator({ clean: true, filter: false }),
  run({ _id, name, logo, website }) {

    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to create new users");
    }

    Cics.update(_id, {
      $set: {
        name: (_.isUndefined(name) ? null : name),
        logo: (_.isUndefined(logo) ? null : logo),
        website: (_.isUndefined(website) ? null : website)
      }
    });
  }
});




export const removeCic = new ValidatedMethod({
  name: 'cics.remove',
  validate: new SimpleSchema({
    _id: Cics.simpleSchema().schema('_id')
  }).validator({ clean: true, filter: false }),
  run({ _id }) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to create new users");
    }
    Cics.remove(_id);
  }
});

// Get cic of all method names on Cics
const CICS_METHODS = _.pluck([
  insertCic,
  updateCic,
  removeCic
], 'name');

if (Meteor.isServer) {
  // Only allow 5 cics operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(CICS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; }
  }, 5, 1000);
}
