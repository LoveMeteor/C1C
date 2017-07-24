import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';


import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

import { Industries } from './industry.js';

export const insertIndustry = new ValidatedMethod({
  name: 'industries.insert',
  validate: Industries.simpleSchema().pick(['name', 'icon']).validator({ clean: true, filter: false }),
  run({ name, icon}) {

    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to create industry");
    }

    const industry = {
      name,
      icon,
      createdAt: new Date(),
    };
    return Industries.insert(industry);
  },
});

export const updateIndustry = new ValidatedMethod({
  name: 'industries.update',
  validate: new SimpleSchema({
    _id: Industries.simpleSchema().schema('_id'),
    name: Industries.simpleSchema().schema('name'),
    icon: Industries.simpleSchema().schema('icon'),
  }).validator({ clean: true, filter: false }),
  run({ _id, name, icon }) {

    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to update industry");
    }

    Industries.update(_id, {
      $set: {
        name: (_.isUndefined(name) ? null : name),
        icon: (_.isUndefined(icon) ? null : icon),
      },
    });
  },
});


export const removeIndustry = new ValidatedMethod({
  name: 'industries.remove',
  validate: new SimpleSchema({
    _id: Industries.simpleSchema().schema('_id'),
  }).validator({ clean: true, filter: false }),
  run({ _id }) {

    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to remove industry");
    }

    Industries.remove(_id);
  },
});

// Get client of all method names on Industries
const INDUSTRYS_METHODS = _.pluck([
  insertIndustry,
  updateIndustry,
  removeIndustry,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 industrys operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(INDUSTRYS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
