import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

import { Tags } from './tags.js';

export const insertTag = new ValidatedMethod({
  name: 'tags.insert',
  validate: Tags.simpleSchema().pick(['name']).validator({ clean: true, filter: false }),
  run({ name}) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to add tag");
    }
    // Check whether same Tag exist and return the existing id if exist

    var regExString = new RegExp("^" + name + "$", "i");
    var currentTag = Tags.findOne({ name: regExString});
    if(currentTag)
    {
      return currentTag._id;
    }
    const tag = {
      name
    };
    return Tags.insert(tag);
  }
});
export const insertMultipleTags = new ValidatedMethod({
  name: 'tags.insertmulti',
  validate: new SimpleSchema({
    names: {type:[String]}
  }).validator({ clean: true, filter: false }),
  run({ names}) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to add tag");
    }
    // Check whether same Tag exist and return the existing id if exist
    var ids = [];

    for (var i=0; i<names.length; i++)
    {
      var name = names[i];

      var regExString = new RegExp("^" + name + "$", "i");
      var currentTag = Tags.findOne({ name: regExString});
      if(currentTag)
      {
        ids.push(currentTag._id);
      }
      else
      {
        const tag = {
          name
        };
        ids.push(Tags.insert(tag));
      }
    }
    return ids;
  }
});

export const removeTag = new ValidatedMethod({
  name: 'tags.remove',
  validate: new SimpleSchema({
    _id: Tags.simpleSchema().schema('_id')
  }).validator({ clean: true, filter: false }),
  run({ _id }) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to remove tag");
    }
    Tags.remove(_id);
  }
});

// Get client of all method names on Tags
const TAGS_METHODS = _.pluck([
  insertTag,
  insertMultipleTags,
  removeTag
], 'name');

if (Meteor.isServer) {
  // Only allow 5 tags operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(TAGS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; }
  }, 5, 1000);
}
