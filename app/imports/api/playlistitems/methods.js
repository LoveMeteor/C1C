import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';


import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

import { PlaylistItems } from './playlistitems.js';

export const insertPlaylistItem = new ValidatedMethod({
    name: 'playlistitems.insert',
    validate: PlaylistItems.simpleSchema().pick(['mediaId', 'duration', 'showOverlay']).validator({ clean: true, filter: false }),
    run({ mediaId, duration, showOverlay}) {
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playlistitems.insert", "Not authorized to add media");
        }

        const playlistitem = {
            mediaId,
            duration,
            showOverlay,
            createdAt: new Date()
        };
        return PlaylistItems.insert(playlistitem);
    }
});


export const insertPlaylistItemBulk = new ValidatedMethod({
    name: 'playlistitems.insertbulk',
    validate: new SimpleSchema({listItems: {type: [Object]},
        "listItems.$.mediaId":PlaylistItems.simpleSchema().schema('mediaId'),
        "listItems.$.duration":PlaylistItems.simpleSchema().schema('duration'),
        "listItems.$.showOverlay":PlaylistItems.simpleSchema().schema('showOverlay')
    }).validator({ clean: true, filter: false }),
    run({ listItems}) {
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playlistitems.bulkinsert.denied", "Need to login");
        }
        var ids=new Array();
        for (var i=0; i<listItems.length; i++)
        {
            var listItem = listItems[i];
            var itemId = PlaylistItems.insert(listItem);
            ids.push(itemId);
        }
        return ids;
    }
});


export const upsertPlaylistItemBulk = new ValidatedMethod({
    name: 'playlistitems.upsertbulk',
    validate: new SimpleSchema({listItems: {type: [Object]},
        "listItems.$._id":{type: String, optional : true},
        "listItems.$.mediaId":PlaylistItems.simpleSchema().schema('mediaId'),
        "listItems.$.duration":PlaylistItems.simpleSchema().schema('duration'),
        "listItems.$.showOverlay":PlaylistItems.simpleSchema().schema('showOverlay')
    }).validator({ clean: true, filter: false }),
    run({ listItems}) {
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playlistitems.upsertbulk.denied", "Need to login");
        }
        let ids=new Array();
        for (let i=0; i<listItems.length; i++)
        {
            let listItem = listItems[i];
            if(listItem._id)
            {
                PlaylistItems.update(listItem._id, {$set: {
                    duration: listItem.duration,
                    mediaId: listItem.mediaId,
                    showOverlay: listItem.showOverlay
                }});
                ids.push(listItem._id);
            }
            else
            {
                let itemId = PlaylistItems.insert(listItem);
                ids.push(itemId);
            }
        }
        return ids;
    }
});

export const updatePlaylistItemDuration = new ValidatedMethod({
    name: 'playlistitems.updateDuration',
    validate: new SimpleSchema({
        _id: PlaylistItems.simpleSchema().schema('_id'),
        duration: PlaylistItems.simpleSchema().schema('duration')
    }).validator({ clean: true, filter: false }),
    run({ _id, duration }) {

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playlistitems.updateDuration", "Not authorized to update");
        }

        PlaylistItems.update(_id, {
            $set: {
                duration: (_.isUndefined(duration) ? null : duration)
            }
        });
    }
});

export const updatePlaylistItemShowOverlay = new ValidatedMethod({
    name: 'playlistitems.updateShowOverlay',
    validate: new SimpleSchema({
        _id: PlaylistItems.simpleSchema().schema('_id'),
        showOverlay: PlaylistItems.simpleSchema().schema('showOverlay')
    }).validator({ clean: true, filter: false }),
    run({ _id, showOverlay }) {

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.PRESENTER], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playlistitems.updateShowOverlay", "Not authorized to update");
        }

        PlaylistItems.update(_id, {
            $set: {
                showOverlay: (_.isUndefined(showOverlay) ? null : showOverlay)
            }
        });
    }
});


export const removePlaylistItem = new ValidatedMethod({
    name: 'playlistitems.remove',
    validate: new SimpleSchema({
        _id: PlaylistItems.simpleSchema().schema('_id')
    }).validator({ clean: true, filter: false }),
    run({ _id }) {

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.PRESENTER], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playlistitems.remove", "Not authorized to remove");
        }

        PlaylistItems.remove(_id);
    }
});

// Get client of all method names on Playlistitems
const PLAYLISTITEMS_METHODS = _.pluck([
    insertPlaylistItem,
    updatePlaylistItemShowOverlay,
    updatePlaylistItemDuration,
    removePlaylistItem,
    insertPlaylistItemBulk,
    upsertPlaylistItemBulk
], 'name');

if (Meteor.isServer) {
    // Only allow 5 playlistitems operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(PLAYLISTITEMS_METHODS, name);
        },
        // Rate limit per connection ID
        connectionId() { return true; }
    }, 25, 1000);
}
