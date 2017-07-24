/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';

import { CanoncialPlaylists } from '../canoncialplaylists.js';
import { Engagements } from '../../engagements/engagements.js';
import { PlaylistItems } from '/imports/api/playlistitems/playlistitems.js';
import { Medias } from '/imports/api/medias/medias.js';
import { MediaFiles } from '/imports/api/mediafiles/mediafiles.js';


Meteor.publish("canoncialPlaylists", function () {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    return CanoncialPlaylists.find({});
});


Meteor.publishComposite('canoncialPlaylists.single', function canoncialPlaylistsSingle(params) {
    new SimpleSchema({
        playlistId: { type: String },
    }).validate(params);
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    const { playlistId } = params;

    return {
        find() {
            return CanoncialPlaylists.find({_id: playlistId});
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

