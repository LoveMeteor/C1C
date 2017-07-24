import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';


import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

import { Playlists } from './playlists.js';
import { PlaylistItems } from '/imports/api/playlistitems/playlistitems'
import { CanoncialPlaylists } from '/imports/api/canoncialplaylist/canoncialplaylists'
import { Medias } from '/imports/api/medias/medias'
import { PlayerStatus } from '/imports/api/playerstatus/playerstatus'

export const insertPlaylist = new ValidatedMethod({
    name: 'playlists.insert',
    validate: Playlists.simpleSchema().pick(['engagementId', 'presentationMachineId', 'overlay','itemIds','itemIds.$']).validator({ clean: true, filter: false }),
    run({ engagementId, presentationMachineId, overlay,itemIds}) {
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error(403, "Not authorized to add playlist");
        }

        const playlist = {
            engagementId,
            presentationMachineId,
            overlay,
            itemIds,
            createdAt: new Date()
        };
        return Playlists.insert(playlist);
    }
});

export const updatePlaylist = new ValidatedMethod({
    name: 'playlists.update',
    validate: Playlists.simpleSchema().pick(['_id', 'overlay','itemIds','itemIds.$']).validator({ clean: true, filter: false }),
    run({ _id, overlay,itemIds }) {
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.PRESENTER], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playlists.update", "Not authorized to update playlist");
        }
        const playlist = Playlists.findOne(_id);
        if(!playlist)
        {
            throw new Meteor.Error("playlists.update", "Playlist not found", `Could not find the playlist with id "${_id}"`);
        }

        const diffItemIds = _.difference(playlist.itemIds, itemIds);
        if(diffItemIds && diffItemIds.length > 0)
        {
            PlaylistItems.remove({_id: {$in: diffItemIds}});
        }

        Playlists.update(_id, {
            $set: {
                overlay: (_.isUndefined(overlay) ? null : overlay),
                itemIds: (_.isUndefined(itemIds) ? null : itemIds)
            }
        });
    }
});

// This method will overwrite the playlistId (Engagement Playlist) with the ones from canoncialPlaylistId
export const overwritePlaylist = new ValidatedMethod({
    name: 'playlists.overwrite',
    validate: new SimpleSchema({
        playlistId: Playlists.simpleSchema().schema('_id'),
        canoncialPlaylistId: CanoncialPlaylists.simpleSchema().schema('_id')
    }).validator({ clean: true, filter: false }),
    run({ playlistId, canoncialPlaylistId }) {
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.PRESENTER], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playlists.overwrite", "Not authorized to overwrite playlist");
        }

        const canoncialPlaylist = CanoncialPlaylists.findOne(canoncialPlaylistId);
        if(!canoncialPlaylist)
        {
            throw new Meteor.Error("playlists.overwrite", "Canoncial Playlist not found");
        }

        const playlist = Playlists.findOne(playlistId);
        if(!playlist)
        {
            throw new Meteor.Error("playlists.overwrite", "Playlist not found");
        }

        // Playlist and Canoncial Playlist should be for same presentation machine. otherwise, we may have issue in media sync
        if(playlist.presentationMachineId != canoncialPlaylist.presentationMachineId)
        {
            throw new Meteor.Error("playlists.overwrite", "Presentation Machine of Playlist and Canoncial Playlist not match");
        }

        PlaylistItems.remove({_id: {$in: playlist.itemIds}});

        // Duplicate all item ids from canoncial Playlist

        const newItemIds = [];
        const itemsFromCanoncial = PlaylistItems.find({_id: {$in: canoncialPlaylist.itemIds}}).fetch();

        itemsFromCanoncial.forEach(item => {
            const itemId = PlaylistItems.insert({mediaId: item.mediaId, duration: item.duration, showOverlay: item.showOverlay});
            newItemIds.push(itemId);
        });

        // Doing Update
        Playlists.update(playlistId, {
            $set: {
                itemIds: newItemIds
            }
        });

        PlayerStatus.update({presentationMachineId:playlist.presentationMachineId, playlistId:playlist._id}, {
            $set: {
                playerUpdate: {
                    playlistItemId: newItemIds[0],
                    playedDuration: 0
                }
            }
        })
    }
});


export const appendMediaToPlaylist = new ValidatedMethod({
    name: 'playlists.append.media',
    validate: new SimpleSchema({
        playlistId: Playlists.simpleSchema().schema('_id'),
        mediaId: Playlists.simpleSchema().schema('_id')
    }).validator({ clean: true, filter: false }),
    run({ playlistId, mediaId }) {
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.PRESENTER], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playlists.append.media", "Not authorized to overwrite playlist");
        }

        const playlist = Playlists.findOne(playlistId);
        if(!playlist)
        {
            throw new Meteor.Error("playlists.append.media", "Playlist not found");
        }
        const media = Medias.findOne(mediaId);
        if(media.presentationMachineIds.indexOf(playlist.presentationMachineId) == -1)
        {
            throw new Meteor.Error("playlists.append.media", "Media is not available on the presentation machine");
        }

        // Duplicate all item ids from canoncial Playlist

        const itemId = PlaylistItems.insert({mediaId});
        playlist.itemIds.push(itemId);

        // Doing Update
        Playlists.update(playlistId, {
            $set: {
                itemIds: playlist.itemIds
            }
        });
    }
});

export const removePlaylist = new ValidatedMethod({
    name: 'playlists.remove',
    validate: new SimpleSchema({
        _id: Playlists.simpleSchema().schema('_id')
    }).validator({ clean: true, filter: false }),
    run({ _id }) {

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.PRESENTER], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playlists.remove", "Not authorized to remove playlist");
        }
        Playlists.remove(_id);
    }
});

// Get client of all method names on Playlists
const PLAYLISTS_METHODS = _.pluck([
    insertPlaylist,
    updatePlaylist,
    removePlaylist,
    overwritePlaylist,
    appendMediaToPlaylist
], 'name');

if (Meteor.isServer) {
    // Only allow 5 playlists operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(PLAYLISTS_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; }
    }, 25, 1000);
}
