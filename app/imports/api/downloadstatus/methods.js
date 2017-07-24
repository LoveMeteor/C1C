import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

import { DownloadStatus } from './downloadstatus.js';

// Only PM can update the status
export const updateDownloadStatus = new ValidatedMethod({
  name: 'downloadstatus.update',
  validate: DownloadStatus.simpleSchema().pick(['mediaId', 'status', 'progress']).validator({ clean: true, filter: false }),
  run({ mediaId, status, progress }) {

    if (!Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error("downloadstatus.update.denied", "Not authorized to update downloadstatus");
    }
    if(Meteor.isServer)
    {
      const user = Meteor.users.findOne(this.userId);
      const currentStatus = DownloadStatus.findOne({mediaId, presentationMachineId: user.presentationMachineId});
      if(currentStatus)
      {
        return DownloadStatus.update(currentStatus._id, {
          $set: {
            status,
            progress,
            lastUpdateAt: new Date()
          }
        });
      }
      else
      {
        return DownloadStatus.insert({
          mediaId,
          status,
          progress,
          presentationMachineId: user.presentationMachineId,
          lastUpdateAt: new Date()
        });
      }
    }
  }
});

// Remove all the download status from a PM , can be now triggered by the player but should also be aviable from admin.
export const flushDownloadStatus = new ValidatedMethod({
  name: 'downloadstatus.flush',
  // Custom validation , we don't need the pmId for a MACHINE user since it's already set in the db. Only admin need to sent the pmID
  validate : null,
  run({ presentationMachineId = null }) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.MACHINE], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error("downloadstatus.update.denied", "Not authorized to remove downloadstatus");
    }
    if(Meteor.isServer)
    {
      let pmId = presentationMachineId
      // if user is Machine
      if(Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.MACHINE], Roles.GLOBAL_GROUP)){
        const user = Meteor.users.findOne(this.userId);
        pmId = user.presentationMachineId
      }
      console.log(pmId)
      return DownloadStatus.remove({presentationMachineId: pmId});
    }
  }
});

// Get client of all method names on DownloadStatus
const DOWNLOADSTATUS_METHODS = _.pluck([
  updateDownloadStatus,
  flushDownloadStatus
], 'name');

if (Meteor.isServer) {
  // Only allow 5 downloadStatuss operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(DOWNLOADSTATUS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; }
  }, 10, 1000);
}
