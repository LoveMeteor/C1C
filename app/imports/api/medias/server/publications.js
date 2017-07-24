/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';


import { Medias } from '../medias.js';
import { MediaFiles } from '../../mediafiles/mediafiles.js';
import { PresentationMachines } from '../../presentationmachines/presentationmachines.js';
import { Engagements } from '../../engagements/engagements.js';


Meteor.publish("medias", function () {
  if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
  {
    this.ready();
    return;
  }
  if (Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
  {
    // If Machine, then
    const user = Meteor.users.findOne(this.userId);
    return Medias.find({presentationMachineIds: {$in:[user.presentationMachineId]}});
  }
  if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
  {
    // If not admin, then presenter, in this case, we will return different media sets
    return Medias.find({});
  }
  return Medias.find({});
});

// This Publication should be mainly used my Presentation Machine. The Admin And Presenter will need to fetch all media files information, so they will use mediafiles publication instead. No need for composite.
Meteor.publishComposite('medias.andMediaFiles', function() {

  return {
    find() {
      if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
      {
        this.ready();
        return;
      }
      if (Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
      {
        // If Machine, then
        const user = Meteor.users.findOne(this.userId);
        return Medias.find({presentationMachineIds: {$in:[user.presentationMachineId]}});
      }
      if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
      {
        // If not admin, then presenter, in this case, we will return different media sets
        return Medias.find({});
      }
      return Medias.find({});
    },

    children: [{
      find(media) {
        return MediaFiles.find({ _id: media.mediaFileId }).cursor;
      }
    }]
  };
});


//Returns Medias and Media Files for Presentation Machine
Meteor.publishComposite('medias.inPresentationMachine', function presentationAndEngagements(params) {
  new SimpleSchema({
    presentationMachineId: { type: String },
  }).validate(params);

  if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
  {
    this.ready();
    return;
  }
  const { presentationMachineId } = params;

  return {
    find() {
      if (Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
      {
        // If Machine, then
        const user = Meteor.users.findOne(this.userId);
        return Medias.find({presentationMachineIds: {$in:[user.presentationMachineId]}});
      }
      return Medias.find({presentationMachineIds: {$in:[presentationMachineId]}});
    },

    children: [{
      find(media) {
        return MediaFiles.find({ _id: media.mediaFileId }).cursor;
      }
    }],
  };
});


