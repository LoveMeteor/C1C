import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/dburles:factory';
import { TAPi18n } from 'meteor/tap:i18n';
import faker from 'faker';

import { Medias } from '../medias/medias.js';
import { Playlists } from '../playlists/playlists.js';
import { CanoncialPlaylists } from '../canoncialplaylist/canoncialplaylists.js';

class FavoritesCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    ourDoc.createdAt = ourDoc.createdAt || new Date();
    const result = super.insert(ourDoc, callback);
    return result;
  }
  remove(selector, callback) {
    return super.remove(selector, callback);
  }
}

export const Favorites = new FavoritesCollection('Favorites');

// Deny all favorite-side updates since we will be using methods to manage this collection
Favorites.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

export const FAVORITETYPES = {
  MEDIA: "medias",
  PLAYLIST: "playlists",
  CANONCIALPLAYLIST: "canoncialplaylists"
};
Favorites.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id},
  itemId: { type: String, regEx: SimpleSchema.RegEx.Id}, // Can be Media ID or PlaylistID
  favoriteType: { type: String, defaultValue: FAVORITETYPES.MEDIA},
  createdAt: { type: Date, denyUpdate: true }
});

Favorites.attachSchema(Favorites.schema);

// This represents the keys from Favorites objects that should be published
// to the favorite. If we add secret properties to Favorite objects, don't favorite
// them here to keep them private to the server.
Favorites.publicFields = {
  name: 1,
  userId: 1,
  itemId: 1,
  favoriteType: 1,
  createdAt: 1
};

Factory.define('favorite', Favorites, {
  userId: () => Factory.get('user'),
  itemId: () => Factory.get('media'),
  favoriteType: () => FAVORITETYPES.MEDIA,
  createdAt: () => new Date()
});

Favorites.helpers({
  media() {
    if(this.favoriteType == FAVORITETYPES.MEDIA)
    {
      return Medias.findOne(this.itemId);
    }
    else
      return null;
  },
  playlist() {
    if(this.favoriteType == FAVORITETYPES.PLAYLIST)
    {
      return Playlists.findOne(this.itemId);
    }
    else
      return null;
  },
  canoncialPlaylist() {
    if(this.favoriteType == FAVORITETYPES.CANONCIALPLAYLIST)
    {
      return CanoncialPlaylists.findOne(this.itemId);
    }
    else
      return null;
  }

});
