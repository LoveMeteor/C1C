/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Industries } from '../industry.js';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';

Meteor.publish("industries", function () {
  if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER], Roles.GLOBAL_GROUP))
  {
    this.ready();
    return;
  }

  return Industries.find({});
});