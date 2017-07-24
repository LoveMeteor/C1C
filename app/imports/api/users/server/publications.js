/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { UserSchema, ROLES } from '../users.js';
import { Roles } from 'meteor/alanning:roles';

Meteor.publish("users", function () {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    return Meteor.users.find({_id:{$ne: this.userId}}, { fields: Meteor.users.publicFields });
});

Meteor.publish(null, function() {
    return Meteor.users.find({_id: this.userId}, {fields: Meteor.users.publicFields});
});