/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { PresentationMachines } from '../presentationmachines.js';
import { Playlists } from '../../playlists/playlists.js';
import { Engagements } from '../../engagements/engagements.js';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';

Meteor.publish("presentationmachines", function () {
  if (Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
  {
    const user = Meteor.users.findOne(this.userId);
    return PresentationMachines.find({_id:user.presentationMachineId});
  }
  if (Roles.userIsInRole(this.userId, [ROLES.PRESENTER], Roles.GLOBAL_GROUP))
  {
    const user = Meteor.users.findOne(this.userId);
    return PresentationMachines.find({cicId: user.cicId});
  }
  if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.PRESENTER], Roles.GLOBAL_GROUP))
  {
    this.ready();
    return;
  }
  return PresentationMachines.find({},{sort:{position:1}});
});

//Meteor.publish(null, function() {
//  if(!Roles.userIsInRole(this.userId, [ROLES.MACHINE], Roles.GLOBAL_GROUP))
//  {
//    this.ready();
//    return;
//  }
//  var user = Meteor.users.findOne(this.userId);
//  return PresentationMachines.find({_id:user.presentationMachineId});
//});

Meteor.publishComposite('presentationAndEngagements', function presentationAndEngagements(params) {
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
      const query = {
        _id: presentationMachineId
      };
      if(Roles.userIsInRole(this.userId, [ROLES.PRESENTER], Roles.GLOBAL_GROUP)){
        const user = Meteor.users.findOne(this.userId);
        query.cicId = user.cicId
      }
      const options = {
        fields: PresentationMachines.publicFields,
      };
      return PresentationMachines.find(query, options);
    },

    children: [{
      find(presentationMachine) {
        return Playlists.find({ presentationMachineId: presentationMachine._id }, { fields: {engagementId: 1, presentationMachineId: 1} });
      },
      children: [{
        find(playlist) {
          return Engagements.find({ _id: playlist.engagementId }, { fields: Engagements.publicFields });
        }
      }]
    }],
  };
});

