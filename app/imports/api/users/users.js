import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import faker from 'faker';
import { Accounts } from 'meteor/accounts-base';
import { PresentationMachines } from '../presentationmachines/presentationmachines'
import { Cics } from '../cics/cics'

const Schema = {};

Schema.User = new SimpleSchema({
  username: {
    type: String,
    optional: true,
  },
  emails: {
    type: Array,
    optional: true,
  },
  'emails.$': {
    type: Object,
  },
  'emails.$.address': {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  'emails.$.verified': {
    type: Boolean,
  },
  createdAt: {
    type: Date,
  },
    // Make sure this services field is in your schema if you're using any of the accounts packages
  services: {
    type: Object,
    optional: true,
    blackbox: true,
  },
    // Add `roles` to your schema if you use the meteor-roles package.
  roles: {
    type: Object,
    optional: true,
    blackbox: true,
  },
    // In order to avoid an 'Exception in setInterval callback' from Meteor
  heartbeat: {
    type: Date,
    optional: true,
  },
  firstName: {
    type: String,
    optional: true,
  },
  lastName: {
    type: String,
    optional: true,
  },
  presentationMachineId: {
    type: String,
    optional: true,
  },
  cicId: {
    type: String,
    optional: true,
  },
});

Meteor.users.attachSchema(Schema.User);
Meteor.users.publicFields = {
  username: 1,
  emails: 1,
  firstName: 1,
  lastName: 1,
  presentationMachineId: 1,
  cicId: 1,
  roles: 1,
  createdAt: 1,
};
export const UserSchema = Schema.User;
export const ROLES = {
  ADMIN: 'admin',
  PRESENTER: 'presenter',
  MACHINE: 'machine',
};

export const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d\s:]).{12,}$/

// Deny all client-side updates to user documents
Meteor.users.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Factory.define('user', Meteor.users, {
  username: () => faker.lorem.word() + Random.id(10),
  heartbeat: () => new Date(),
  createdAt: () => new Date(),
  firstName: () => faker.lorem.word(),
  lastName: () => faker.lorem.word(),
  password: () => faker.lorem.word(),
});

Meteor.users.helpers({
  presentationMachine() {
        // console.log("presentationMachine helper called");
        // console.log(this.presentationMachineId);
        // console.log(PresentationMachines.findOne(this.presentationMachineId);
    return PresentationMachines.findOne(this.presentationMachineId);
  },
  email() {
    if (this.emails.length > 0) {
      return this.emails[0].address;
    }
    return null;
  },
  cic() {
    if (!this.cicId) return null
    return Cics.findOne(this.cicId)
  },
});

if (Meteor.isServer) {
  Accounts.onCreateUser((options, user) => {
    if (options.firstName) {
      user.firstName = options.firstName;
    }
    if (options.firstName) {
      user.lastName = options.lastName;
    }
    if (options.presentationMachineId) {
      user.presentationMachineId = options.presentationMachineId;
    }
    return user;
  });
}

