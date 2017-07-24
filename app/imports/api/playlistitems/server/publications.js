/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';

import { PlaylistItems } from '../playlistitems.js';
import { Playlists } from '../../playlists/playlists.js';


Meteor.publish("playlistitems", function () {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    return PlaylistItems.find({});
});

