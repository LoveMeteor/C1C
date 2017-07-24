/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';

import { Themes } from '../themes.js';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';

Meteor.publish("themes", function () {
  if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
  {
    this.ready();
    return;
  }
  return Themes.find({});
});