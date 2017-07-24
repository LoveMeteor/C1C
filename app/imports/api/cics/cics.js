import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/dburles:factory';
import { TAPi18n } from 'meteor/tap:i18n';
import faker from 'faker';

import { PresentationMachines } from '../presentationmachines/presentationmachines.js';

class CicsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    ourDoc.createdAt = ourDoc.createdAt || new Date();
    const result = super.insert(ourDoc, callback);
    return result;
  }
  remove(selector, callback) {
    // When CICs removed, PresentationMachines should be affected. But I don't think it will happen much.
    const cics = this.find(selector).fetch();
    if(cics && cics.length > 0)
    {
      var ids = [];
      for(var i=0; i<cics.length; i++)
      {
        ids.push(cics[i]._id);
      }
      PresentationMachines.remove({ cicId: {$in: ids} });
    }
    return super.remove(selector, callback);
  }
}

export const Cics = new CicsCollection('Cics');

// Deny all cic-side updates since we will be using methods to manage this collection
Cics.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

Cics.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  logo: { type: String , optional: true},
  website: { type: String, optional: true },
  createdAt: { type: Date, denyUpdate: true }
});

Cics.attachSchema(Cics.schema);

// This represents the keys from Cics objects that should be published
// to the cic. If we add secret properties to Cic objects, don't cic
// them here to keep them private to the server.
Cics.publicFields = {
  name: 1,
  logo: 1,
  website: 1,
  createdAt: 1
};

Factory.define('cic', Cics, {
  name: () => faker.lorem.words(),
  logo: () => faker.image.imageUrl(),
  website: () => faker.internet.url(),
  createdAt: () => new Date()
});

Cics.helpers({
  presentationMachines() {
    return PresentationMachines.find({ cicId: this._id });
  }
});
