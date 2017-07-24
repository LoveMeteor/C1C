/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';


import { DownloadStatus } from '../downloadstatus.js';
import { PresentationMachines } from '../../presentationmachines/presentationmachines.js';
import { Engagements } from '../../engagements/engagements.js';


Meteor.publish("downloadstatus", function () {
  if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
  {
    this.ready();
    return;
  }
  if (Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.PRESENTER], Roles.GLOBAL_GROUP))
  {
    return DownloadStatus.find({});
  }
  return this.ready();
});


Meteor.publish('downloadstatus.presentationmachine', function presentationAndEngagements() {
  if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
  {
    this.ready();
    return;
  }
  if (Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
  {
    const user = Meteor.users.findOne(this.userId);
    return DownloadStatus.find({presentationMachineId: user.presentationMachineId});
  }
  return this.ready();
});
