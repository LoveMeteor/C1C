/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';

import { MediaFiles } from '../mediafiles.js';
import { Medias } from '../../medias/medias.js';

Meteor.publish("mediafiles", function(){
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    return MediaFiles.find({}).cursor;
});
