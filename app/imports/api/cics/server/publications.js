/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';

import { Cics } from '../cics.js';

Meteor.publish('cics', function () {
  if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.PRESENTER], Roles.GLOBAL_GROUP)) {
    this.ready();
    return;
  }

  return Cics.find({});
});
