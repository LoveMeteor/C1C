import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

import { Medias } from './medias.js';
import { PlaylistItems } from '/imports/api/playlistitems/playlistitems.js';
import { CanoncialPlaylists } from '/imports/api/canoncialplaylist/canoncialplaylists.js';
import { Playlists } from '/imports/api/playlists/playlists.js';
import { Engagements } from '/imports/api/engagements/engagements.js';

export const insertMedia = new ValidatedMethod({
  name: 'medias.insert',
  validate: Medias.simpleSchema().pick(['name', 'type', 'mediaFileId','width','height','videoDuration', 'themeId', 'industryIds', 'industryIds.$', 'tagIds', 'tagIds.$', 'presentationMachineIds', 'presentationMachineIds.$']).validator({ clean: true, filter: false }),
  run({name, type,mediaFileId, width, height, videoDuration, themeId, industryIds, tagIds, presentationMachineIds}) {

      if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
      {
        throw new Meteor.Error("medias.insert.denied", "Not authorized to create media");
      }

      const media = {
        name,
        type,
        mediaFileId,
        themeId,
        industryIds,
        tagIds,
        presentationMachineIds,
        width,
        height,
        videoDuration,
        createdAt: new Date()
      };
      return Medias.insert(media);

  }
});

export const updateMedia = new ValidatedMethod({
  name: 'medias.update',
  validate: Medias.simpleSchema().pick(['_id', 'name', 'themeId', 'industryIds', 'industryIds.$', 'tagIds', 'tagIds.$', 'presentationMachineIds', 'presentationMachineIds.$']).validator({ clean: true, filter: false }),
  run({ _id, name, themeId, industryIds, tagIds, presentationMachineIds }) {

    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error("medias.update.denied", "Not authorized to update media");
    }
    // TODO : Need to do validation check whether current media is used in playlist that's associated with certain presentation machines, and that presentation machines is removed from current media's
    Medias.update(_id, {
      $set: {
        name: name,
        themeId: themeId,
        industryIds: industryIds,
        tagIds: tagIds,
        presentationMachineIds: presentationMachineIds
      }
    });
  }
});


export const removeMedia = new ValidatedMethod({
  name: 'medias.remove',
  validate: new SimpleSchema({
    _id: Medias.simpleSchema().schema('_id')
  }).validator({ clean: true, filter: false }),
  run({ _id }) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error("medias.remove", "Not authorized to remove media");
    }
    // TODO: Need to do validation check whether it's ok to remove media. The media can be associated with canoncial playlist or future engagement list. It's ok to remove media that's only associated with past engagement playlist

    if(Meteor.isServer)
    {
      const items = PlaylistItems.find({mediaId: _id}).fetch();
      if(items && items.length > 0)
      {
        let itemIds = [];
        for(let i=0; i<items.length; i++)
        {
          itemIds.push(items[i]._id);
        }

        const canoncialPlaylist = CanoncialPlaylists.findOne({ itemIds: {$in: itemIds} });
        if(canoncialPlaylist)
        {
          throw new Meteor.Error("medias.remove", "Media is linked with Canoncial Playlist");
        }
        const playlists = Playlists.find({ itemIds: {$in: itemIds} }).fetch();
        let engagementIds = [];
        playlists.forEach(playlist => {
          engagementIds.push(playlist.engagementId);
        });

        const engagementCount = Engagements.find({_id: {$in: engagementIds}, endTime:{$gt: new Date()}}).count();

        if(engagementCount > 0)
        {
          throw new Meteor.Error("medias.remove", "Media is linked with Future Playlist");
        }
      }
      Medias.remove(_id);
    }
  }
});

// Get client of all method names on Medias
const MEDIAS_METHODS = _.pluck([
  insertMedia,
  removeMedia,
  updateMedia
], 'name');

if (Meteor.isServer) {
  // Only allow 5 medias operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(MEDIAS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; }
  }, 5, 1000);
}
