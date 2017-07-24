import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';


import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

import { CanoncialPlaylists } from './canoncialplaylists.js';
import { PlaylistItems } from '/imports/api/playlistitems/playlistitems.js';

export const insertCanoncialPlaylist = new ValidatedMethod({
    name: 'canoncialplaylists.insert',
    validate: CanoncialPlaylists.simpleSchema().pick(['name', 'presentationMachineId','tagIds','tagIds.$','themeId','industryIds','industryIds.$','itemIds','itemIds.$']).validator({ clean: true, filter: false }),
    run({ name, presentationMachineId,tagIds,themeId,industryIds,itemIds}) {

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("canoncialplaylists.insert", "Not authorized to add canoncial playlist");
        }

        const canoncialPlaylist = {
            name,
            presentationMachineId,
            tagIds,
            themeId,
            industryIds,
            itemIds,
            createdAt: new Date()
        };
        return CanoncialPlaylists.insert(canoncialPlaylist);
    }
});

export const updateCanoncialPlaylist = new ValidatedMethod({
    name: 'canoncialplaylists.update',
    validate: CanoncialPlaylists.simpleSchema().pick(['_id','name', 'presentationMachineId','tagIds','tagIds.$','themeId','industryIds','industryIds.$','itemIds','itemIds.$']).validator({ clean: true, filter: false }),
    run({ _id, name, presentationMachineId,tagIds,themeId,industryIds,itemIds }) {

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("canoncialplaylists.update", "Not authorized to update canoncial playlist");
        }

        const playlist = CanoncialPlaylists.findOne({_id: _id});

        const diffItemIds = _.difference(playlist.itemIds, itemIds);
        if(diffItemIds && diffItemIds.length > 0)
        {
            PlaylistItems.remove({_id: {$in: diffItemIds}});
        }


        CanoncialPlaylists.update(_id, {
            $set: {
                name: name,
                presentationMachineId: presentationMachineId,
                tagIds: tagIds,
                themeId: themeId,
                industryIds: industryIds,
                itemIds: itemIds
            }
        });
    }
});


export const updateCanoncialPlaylistItems = new ValidatedMethod({
    name: 'canoncialplaylists.update.items',
    validate: CanoncialPlaylists.simpleSchema().pick(['_id','itemIds','itemIds.$']).validator({ clean: true, filter: false }),
    run({ _id, itemIds }) {

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("canoncialplaylists.update", "Not authorized to update canoncial playlist");
        }

        const playlist = CanoncialPlaylists.findOne({_id: _id});

        const diffItemIds = _.difference(playlist.itemIds, itemIds);
        if(diffItemIds && diffItemIds.length > 0)
        {
            PlaylistItems.remove({_id: {$in: diffItemIds}});
        }


        CanoncialPlaylists.update(_id, {
            $set: {
                itemIds: itemIds
            }
        });
    }
});

export const removeCanoncialPlaylist = new ValidatedMethod({
    name: 'canoncialplaylists.remove',
    validate: new SimpleSchema({
        _id: CanoncialPlaylists.simpleSchema().schema('_id')
    }).validator({ clean: true, filter: false }),
    run({ _id }) {

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error(403, "Not authorized to remove canoncial playlist");
        }
        CanoncialPlaylists.remove(_id);
    }
});
// Get client of all method names on CanoncialPlaylists
const CANONCIALPLAYLISTS_METHODS = _.pluck([
    insertCanoncialPlaylist,
    updateCanoncialPlaylist,
    removeCanoncialPlaylist,
    updateCanoncialPlaylistItems
], 'name');

if (Meteor.isServer) {
    // Only allow 5 canoncialPlaylists operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(CANONCIALPLAYLISTS_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; }
    }, 5, 1000);
}
