/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';

import { Playlists } from '../playlists.js';
import { Engagements } from '../../engagements/engagements.js';
import { PlaylistItems } from '../../playlistitems/playlistitems.js';
import { Medias } from '/imports/api/medias/medias.js';
import { MediaFiles } from '/imports/api/mediafiles/mediafiles.js';


Meteor.publish("playlists", function () {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    if (Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        // If Machine, then we will find playlists for that MACHINE ONLY
        var user = Meteor.users.findOne(this.userId);
        return Playlists.find({presentationMachineId: user.presentationMachineId});
    }

    return Playlists.find({});
});

Meteor.publishComposite('playlists.andItems', function() {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }

    return {
        find() {
            if (Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
            {
                // If Machine, then we will find playlists for that MACHINE ONLY
                var user = Meteor.users.findOne(this.userId);
                return Playlists.find({presentationMachineId: user.presentationMachineId});
            }
            return Playlists.find({});
        },

        children: [{
            find(playlist) {
                return PlaylistItems.find({ _id: {$in: playlist.itemIds} }, { fields: PlaylistItems.publicFields });
            }
        }]
    };
});


Meteor.publishComposite('playlists.inEngagement', function playlistsInEngagement(idOfEngagement) {
    new SimpleSchema({
        engagementId: { type: String },
    }).validate(idOfEngagement);
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    const { engagementId } = idOfEngagement;

    return {
        find() {
            const query = {
                _id: engagementId,
            };

            const options = {
                fields: Engagements.publicFields,
            };

            return Engagements.find(query, options);
        },

        children: [{
            find(engagement) {
                return Playlists.find({ engagementId: engagement._id }, { fields: Playlists.publicFields });
            },
        }],
    };
});


Meteor.publishComposite('playlists.single', function playlistsInEngagement(params) {
    new SimpleSchema({
        playlistId: { type: String },
    }).validate(params);
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    const { playlistId } = params;

    return {
        find() {
            return Playlists.find({_id: playlistId});
        },

        children: [{
            find(playlist) {
                return PlaylistItems.find({ _id: {$in: playlist.itemIds }});
            },

            children: [{
                find(playlistitem) {
                    return Medias.find({ _id: playlistitem.mediaId });
                },
                children: [{
                    find(media) {
                        return MediaFiles.find({ _id: media.mediaFileId }).cursor;
                    }
                }]
            }]
        }]
    };
});

