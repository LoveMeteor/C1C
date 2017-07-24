import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/dburles:factory';
import { TAPi18n } from 'meteor/tap:i18n';
import faker from 'faker';
import { FilesCollection } from 'meteor/ostrio:files'

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

import { Industries } from '../industry/industry.js';


export const ClientLogoFile = new FilesCollection({
  storagePath: Meteor.settings.storageAbsolutePath + "/logo",
  public: true,
  downloadRoute:'/logos/',
  collectionName: 'logos',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload: function (file) {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
      console.log("Not Logged in as admin. Return false");
      return 'Please login as admin to client logo';
      //return false;
    }
    if (/png|jpg|jpeg/i.test(file.extension)) {
      return true;
    } else {
      return 'Please upload images with extension png/jpg/jpeg';
    }
  }
});

if(Meteor.isServer) {
  ClientLogoFile.allow({
    insert: function(){
      return true;
    },
    update: function() {
      // add custom authentication code here
      return true;
    }
  });
  ClientLogoFile.deny({
    remove: function() {
      return true;
    }
  });
}


class ClientsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    ourDoc.createdAt = ourDoc.createdAt || new Date();
    const result = super.insert(ourDoc, callback);
    return result;
  }
  remove(selector, callback) {
    const clients = this.find(selector).fetch();
    if(clients && clients.length > 0)
    {
      let logoFileIds = [];
      clients.forEach(client => {
        if(client.logoFileId) {
          logoFileIds.push(client.logoFileId);
        }
      })
      if (logoFileIds.length > 0) {
        ClientLogoFile.remove({ _id: {$in: logoFileIds} });
      }
    }
    return super.remove(selector, callback);
  }
}

export const Clients = new ClientsCollection('Clients');

// Deny all client-side updates since we will be using methods to manage this collection
Clients.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

Clients.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  logoFileId: { type: String , regEx: SimpleSchema.RegEx.Id, optional: true},
  website: { type: String , optional: true},
  industryId: { type: String }, // Industry is not optional. Only one industry
  facebook: { type: String , optional: true},
  twitter: { type: String , optional: true},
  instagram: { type: String , optional: true},
  cicId: { type: String , regEx: SimpleSchema.RegEx.Id, optional: true},
  createdAt: { type: Date, denyUpdate: true }
});

Clients.attachSchema(Clients.schema);

// This represents the keys from Clients objects that should be published
// to the client. If we add secret properties to Client objects, don't client
// them here to keep them private to the server.
Clients.publicFields = {
  name: 1,
  logoFileId: 1,
  website: 1,
  industryId: 1,
  facebook: 1,
  twitter: 1,
  instagram: 1,
  createdAt: 1,
  cicId : 1
};

Factory.define('client', Clients, {
  name: () => faker.lorem.words(),
  website: () => faker.internet.url(),
  industryId: () => Factory.get('industry'),
  createdAt: () => new Date()
});

Clients.helpers({
  logoFile() {
    return ClientLogoFile.findOne(this.logoFileId);
  },
  industry() {
    return Industries.findOne(this.industryId);
  },
});
