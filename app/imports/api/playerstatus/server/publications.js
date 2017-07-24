/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';

import { PlayerStatus } from '../playerstatus.js';
import { Engagements } from '../../engagements/engagements.js';
import { Playlists } from '../../playlists/playlists.js';
import { PlaylistItems } from '../../playlistitems/playlistitems.js';


Meteor.publish("playerstatus", function () {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    if (Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        // If Machine, then
        var user = Meteor.users.findOne(this.userId);
        return PlayerStatus.find({presentationMachineId: user.presentationMachineId}, {fields: PlayerStatus.publicFieldsForMachine});
    }
    return PlayerStatus.find({}, {fields: PlayerStatus.publicFieldsForPresenter});
});


Meteor.publishComposite('playerstatusAndPlaylist', function() {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }

    return {
        find() {
            if (Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
            {
                // If Machine, then
                var user = Meteor.users.findOne(this.userId);
                return PlayerStatus.find({presentationMachineId: user.presentationMachineId}, {fields: PlayerStatus.publicFieldsForMachine});
            }
            return PlayerStatus.find({}, {fields: PlayerStatus.publicFieldsForPresenter});
        },

        children: [{
            find(playerstatus) {
                return Playlists.find({ _id: playerstatus.playlistId }, { fields: Playlists.publicFields });
            },

            children: [{
                find(playlist) {
                    return PlaylistItems.find({ _id: {$in: playlist.itemIds} }, { fields: PlaylistItems.publicFields });
                }
            }]
        }]
    };
});


Meteor.publish("playerstatus.single", function (presentationMachineId) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    if (Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        // If Machine, then
        this.ready();
        return;
    }
    return PlayerStatus.find({presentationMachineId: presentationMachineId}, {fields: PlayerStatus.publicFieldsForPresenter});
});
