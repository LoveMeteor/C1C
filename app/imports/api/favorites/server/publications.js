/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';

import { Favorites, FAVORITETYPES } from '../favorites.js';

Meteor.publish("favorites", function () {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }

    return Favorites.find({userId:this.userId});
});

Meteor.publish("favorites.medias", function () {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }

    return Favorites.find({userId:this.userId, favoriteType: FAVORITETYPES.MEDIA});
});

Meteor.publish("favorites.canoncialplaylists", function () {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }

    return Favorites.find({userId:this.userId, favoriteType: FAVORITETYPES.CANONCIALPLAYLIST});
});

Meteor.publish("favorites.playlists", function () {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }

    return Favorites.find({userId:this.userId, favoriteType: FAVORITETYPES.PLAYLIST});
});