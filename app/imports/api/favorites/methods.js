import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';


import { Favorites, FAVORITETYPES } from './favorites.js';


export const insertFavorite = new ValidatedMethod({
  name: 'favorites.insert',
  validate: Favorites.simpleSchema().pick(['itemId', 'favoriteType']).validator({ clean: true, filter: false }),
  run({ itemId, favoriteType}) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error("favorites.insert.denied", "Not authorized");
    }
    let favorite = Favorites.findOne({itemId,favoriteType, userId:this.userId});
    if(favorite) {
      throw new Meteor.Error("favorites.insert.duplicated", "Already inserted");
    }
    favorite = {
      itemId,
      favoriteType,
      userId:this.userId,
      createdAt: new Date()
    };
    return Favorites.insert(favorite);
  }
});


export const removeFavorite = new ValidatedMethod({
  name: 'favorites.remove',
  validate: new SimpleSchema({
    _id: Favorites.simpleSchema().schema('_id')
  }).validator({ clean: true, filter: false }),
  run({ _id }) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error("favorites.remove.denied", "Not logged in");
    }
    const favorite = Favorites.findOne(_id);
    if(favorite && favorite.userId!=this.userId)
    {
      throw new Meteor.Error("favorites.remove.denied", "Not authorized");
    }
    Favorites.remove(_id);
  }
});


export const removeFavoriteWithItem = new ValidatedMethod({
  name: 'favorites.removewithitem',
  validate: new SimpleSchema({
    itemId: Favorites.simpleSchema().schema('itemId'),
    favoriteType: Favorites.simpleSchema().schema('favoriteType')
  }).validator({ clean: true, filter: false }),
  run({ itemId, favoriteType }) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error("favorites.remove.denied", "Not logged in");
    }
    const favorite = Favorites.findOne({itemId: itemId, favoriteType: favoriteType, userId: this.userId});
    if (favorite && favorite.userId != this.userId) {
      throw new Meteor.Error("favorites.remove.denied", "Not authorized");
    }
    if (favorite) {
      Favorites.remove(favorite._id);
    }
  }
});
// Get favorite of all method names on Favorites
const FAVORITES_METHODS = _.pluck([
  insertFavorite,
  removeFavorite,
  removeFavoriteWithItem
], 'name');

if (Meteor.isServer) {
  // Only allow 5 favorites operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(FAVORITES_METHODS, name);
    },
    // Rate limit per connection ID
    connectionId() { return true; }
  }, 5, 1000);
}
