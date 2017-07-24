import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';


import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

import { PlayerStatus, SPECIALCOMMAND, PLAYINGSTATUS } from './playerstatus.js';
import { Playlists } from '../playlists/playlists.js';


export const updatePlayerStatus = new ValidatedMethod({
    name: 'playerstatus.update',
    validate: PlayerStatus.simpleSchema().pick(['presentationMachineId', 'playlistLoop', 'playlistId','playingStatus']).validator({ clean: true, filter: false }),
    run({ presentationMachineId, playlistId, playlistLoop, playingStatus }) {
        if (!Roles.userIsInRole(this.userId, [ROLES.PRESENTER, ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playerstatus.update.special", "Not authorized to do the action");
        }

        const playerstatusObj = {
            playlistId,
            playlistLoop,
            playingStatus
        };
        return PlayerStatus.update({presentationMachineId}, {
            $set: playerstatusObj
        });
    }
});


export const runAmbientPlaylist = new ValidatedMethod({
    name: 'playerstatus.runambient',
    validate: PlayerStatus.simpleSchema().pick(['presentationMachineId']).validator({ clean: true, filter: false }),
    run({ presentationMachineId}) {
        if (!Roles.userIsInRole(this.userId, [ROLES.PRESENTER, ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playerstatus.runambient", "Not authorized to do the action");
        }
        const playlist = Playlists.findOne({presentationMachineId, ambientPlaylist: true});
        let playlistItemId = null;
        if(playlist.itemsInOrder().length){
            playlistItemId = playlist.itemsInOrder()[0]._id
        }
        if(playlist) {
            const playerstatusObj = {
                playlistId: playlist._id,
                playingStatus: PLAYINGSTATUS.PLAYING,
                playlistLoop: true,
                playerUpdate: {
                    playlistItemId,
                    playedDuration : 0
                }
            };
            return PlayerStatus.update({presentationMachineId}, {
                $set: playerstatusObj
            });
        }
    }
});

export const runEngagementPlaylist = new ValidatedMethod({
    name: 'playerstatus.runengagement',
    //validate: PlayerStatus.simpleSchema().pick(['presentationMachineId', 'engagementId']).validator({ clean: true, filter: false }),
    validate: new SimpleSchema({
        presentationMachineId: PlayerStatus.simpleSchema().schema('presentationMachineId'),
        engagementId: { type: String, regEx: SimpleSchema.RegEx.Id }
    }).validator({ clean: true, filter: false }),
    run({ presentationMachineId, engagementId}) {
        if (!Roles.userIsInRole(this.userId, [ROLES.PRESENTER, ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playerstatus.runengagement", "Not authorized to do the action");
        }
        const playlist = Playlists.findOne({presentationMachineId, engagementId});

        if(playlist && playlist.itemsInOrder().length)
        {
            const playerstatusObj = {
                playlistId: playlist._id,
                playingStatus: PLAYINGSTATUS.PLAYING,
                playlistLoop: true,
                playerUpdate: {
                    playlistItemId : playlist.itemsInOrder()[0]._id,
                    playedDuration : 0
                }
            };

            return PlayerStatus.update({presentationMachineId}, {
                $set: playerstatusObj
            });
        }
        return false;
    }
});

export const runSpecificPlaylistItem = new ValidatedMethod({
    name: 'playerstatus.run.playlistitem',
    validate: new SimpleSchema({
        presentationMachineId: PlayerStatus.simpleSchema().schema('presentationMachineId'),
        playlistId: { type: String, regEx: SimpleSchema.RegEx.Id },
        playlistItemId: { type: String, regEx: SimpleSchema.RegEx.Id }
    }).validator({ clean: true, filter: false }),
    run({ presentationMachineId, playlistId, playlistItemId}) {
        if (!Roles.userIsInRole(this.userId, [ROLES.PRESENTER, ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playerstatus.run.playlistitem", "Not authorized to do the action");
        }

        const playerstatusObj = {
            playlistId,
            playingStatus: PLAYINGSTATUS.PLAYING,
            playerUpdate: {
                playlistItemId,
                playedDuration : 0
            }
        };

        return PlayerStatus.update({presentationMachineId}, {
            $set: playerstatusObj
        });
    }
});

export const updatePlaylistItemId = new ValidatedMethod({
    name: 'playerstatus.update.playlistItemId',
    validate: new SimpleSchema({
        playlistItemId: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
        updatedTime: {type: Date},
        playedDuration: {type: Number, defaultValue: 0}
    }).validator({ clean: true, filter: false }),
    run({ playlistItemId, updatedTime, playedDuration }) {
        if (!Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playerstatus.update.playlistItemId", "Not authorized to do the action");
        }
        const user = Meteor.users.findOne(this.userId);
        const playerUpdateObj = {
            updatedTime,
            playedDuration,
            playlistItemId
        };
        try
        {
            PlayerStatus.update({presentationMachineId: user.presentationMachineId}, {$set: {playerUpdate: playerUpdateObj}});
        }catch(err)
        {
            console.log(err)
        }
    }
});

export const updateDuration = new ValidatedMethod({
    name: 'playerstatus.update.duration',
    validate: new SimpleSchema({
        updatedTime: {type: Date},
        playedDuration: {type: Number, defaultValue: 0}
    }).validator({ clean: true, filter: false }),
    run({ updatedTime, playedDuration }) {
        if (!Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playerstatus.update.duration", "Not authorized to do the action");
        }
        const user = Meteor.users.findOne(this.userId);
        try
        {
            PlayerStatus.update({presentationMachineId: user.presentationMachineId}, {$set: {'playerUpdate.updatedTime' : updatedTime, 'playerUpdate.playedDuration' : playedDuration  }});
        }catch(err)
        {
            console.log(err)
        }
    }
});


export const runAmbientPlaylistFromPlayer = new ValidatedMethod({
    name: 'playerstatus.runambient.player',
    validate: new SimpleSchema({}).validator({ clean: true, filter: false }),
    run({ }) {
        if (!Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("playerstatus.runambient.player", "Not authorized to do the action");
        }
        const user = Meteor.users.findOne(this.userId);
        if(user)
        {
            const playlist = Playlists.findOne({presentationMachineId: user.presentationMachineId, ambientPlaylist: true});

            if(playlist) {

                const playerstatusObj = {
                    playlistId: playlist._id,
                    playingStatus: PLAYINGSTATUS.PLAYING,
                    playlistLoop: true,
                };
                return PlayerStatus.update({presentationMachineId: user.presentationMachineId}, {
                    $set: playerstatusObj
                });
            }
        }
        return false;

    }
});


// Get client of all method names on Playerstatuss
const PLAYERSTATUS_METHODS = _.pluck([
    updatePlayerStatus,
    updateDuration,
    updatePlaylistItemId,
    runAmbientPlaylist,
    runEngagementPlaylist,
    runSpecificPlaylistItem,
    runAmbientPlaylistFromPlayer
], 'name');

if (Meteor.isServer) {
    // Only allow 5 playerstatuss operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(PLAYERSTATUS_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; }
    }, 50, 1000);
}
