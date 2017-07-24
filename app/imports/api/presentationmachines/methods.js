import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';


import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

import { PresentationMachines } from './presentationmachines.js';


export const insertPresentationMachine = new ValidatedMethod({
  name: 'presentationmachines.insert',
  validate: PresentationMachines.simpleSchema().pick(['name','logo', 'cicId', 'width', 'height']).validator({ clean: true, filter: false }),
  run({ name,logo,cicId, width, height}) {

    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to create new users");
    }

    const presentationMachine = {
      name,
      logo,
      cicId,
      width,
      height,
      createdAt: new Date()
    };
    return PresentationMachines.insert(presentationMachine);
  }
});

export const updatePresentationMachine = new ValidatedMethod({
  name: 'presentationmachines.update',
  validate: new SimpleSchema({
    _id: PresentationMachines.simpleSchema().schema('_id'),
    name: PresentationMachines.simpleSchema().schema('name'),
    logo: PresentationMachines.simpleSchema().schema('logo'),
    width: PresentationMachines.simpleSchema().schema('width'),
    height: PresentationMachines.simpleSchema().schema('height')
  }).validator({ clean: true, filter: false }),
  run({ _id, name, logo, width, height }) {

    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to create new users");
    }

    PresentationMachines.update(_id, {
      $set: {
        name: name,
        logo: logo,
        width: (_.isUndefined(width) ? null : width),
        height: (_.isUndefined(height) ? null : height),
      }
    });
  }
});


export const removePresentationMachine = new ValidatedMethod({
  name: 'presentationmachines.remove',
  validate: new SimpleSchema({
    _id: PresentationMachines.simpleSchema().schema('_id')
  }).validator({ clean: true, filter: false }),
  run({ _id }) {

    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(403, "Not authorized to create new users");
    }
    PresentationMachines.remove(_id);
  }
});

// Get client of all method names on PresentationMachines
const PresentationMachineS_METHODS = _.pluck([
  insertPresentationMachine,
  updatePresentationMachine,
  removePresentationMachine
], 'name');

if (Meteor.isServer) {
  // Only allow 5 presentationMachines operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(PresentationMachineS_METHODS, name);
    },
    // Rate limit per connection ID
    connectionId() { return true; }
  }, 5, 1000);
}
