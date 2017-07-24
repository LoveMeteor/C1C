/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Engagements } from '../engagements.js';
import { Playlists } from '/imports/api/playlists/playlists.js';
import { PlaylistItems } from '/imports/api/playlistitems/playlistitems.js';
import { MediaFiles } from '/imports/api/mediafiles/mediafiles.js';
import { Medias } from '/imports/api/medias/medias.js';
import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';

Meteor.publish("engagements", function () {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.PRESENTER], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    return Engagements.find({});
});


//TODO: Future & Past Engagement Publication


Meteor.publishComposite('engagements.today', function presentationAndEngagements(params) {
    new SimpleSchema({
        todayStartTime: { type: Date },
        todayEndTime: {type: Date}
    }).validate(params);

    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.PRESENTER], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    const { todayStartTime, todayEndTime } = params;

    return {
        find() {
            return Engagements.find({startTime:{$lt:todayEndTime}}, {endTime: {$gt: todayStartTime}});
        },

        children: [{
            find(engagement) {
                return Playlists.find({ engagementId: engagement._id });
            }
        }],
    };
});



Meteor.publishComposite('engagement.single', function engagementSingle(params) {
    new SimpleSchema({
        engagementId: { type: String },
    }).validate(params);
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    const { engagementId } = params;

    return {
        find() {
            return Engagements.find({_id: engagementId});
        },

        children: [{
            find(engagement) {
                return Playlists.find({ engagementId: engagement._id});
            },
            children: [{
                find(playlist) {
                    return PlaylistItems.find({ _id: {$in: playlist.itemIds }});
                }
                // Commented this out, since current Edit Engagement Fetch all medias and mediafiles. Will need to uncomment this, if that's not the case
                //children: [{
                //    find(playlistitem) {
                //        return Medias.find({ _id: playlistitem.mediaId });
                //    },
                //    children: [{
                //        find(media) {
                //            return MediaFiles.find({ _id: media.mediaFileId }).cursor;
                //        }
                //    }]
                //}]
            }]

        }]
    };
});

