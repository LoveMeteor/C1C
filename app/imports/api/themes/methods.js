import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';


import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

import { Themes } from './themes.js';

export const insertTheme = new ValidatedMethod({
  name: 'themes.insert',
  validate: Themes.simpleSchema().pick(['name', 'icon']).validator({ clean: true, filter: false }),
  run({ name, icon}) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to add theme");
    }
    const theme = {
      name,
      icon,
      createdAt: new Date(),
    };
    return Themes.insert(theme);
  },
});

export const updateTheme = new ValidatedMethod({
  name: 'themes.update',
  validate: new SimpleSchema({
    _id: Themes.simpleSchema().schema('_id'),
    name: Themes.simpleSchema().schema('name'),
    icon: Themes.simpleSchema().schema('icon'),
  }).validator({ clean: true, filter: false }),
  run({ _id, name, icon }) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to update theme");
    }
    Themes.update(_id, {
      $set: {
        name: (_.isUndefined(name) ? null : name),
        icon: (_.isUndefined(icon) ? null : icon),
      },
    });
  },
});


export const removeTheme = new ValidatedMethod({
  name: 'themes.remove',
  validate: new SimpleSchema({
    _id: Themes.simpleSchema().schema('_id'),
  }).validator({ clean: true, filter: false }),
  run({ _id }) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to remove theme");
    }
    Themes.remove(_id);
  },
});

// Get client of all method names on Themes
const THEMES_METHODS = _.pluck([
  insertTheme,
  updateTheme,
  removeTheme,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 themes operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(THEMES_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
