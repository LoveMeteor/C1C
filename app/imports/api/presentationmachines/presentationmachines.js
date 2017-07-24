import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import faker from 'faker';
import { Cics } from '../cics/cics.js';
import { PlayerStatus } from '/imports/api/playerstatus/playerstatus.js';
import { Playlists } from '/imports/api/playlists/playlists.js';
// PresentationMachine is Equal to PlayMachine
class PresentationMachinesCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    ourDoc.createdAt = ourDoc.createdAt || new Date();
    const result = super.insert(ourDoc, callback);
    return result;
  }
  remove(selector) {
    const presentationMachines = this.find(selector).fetch();
    if(presentationMachines && presentationMachines.length > 0) {
      const pmIds = [];
      presentationMachines.forEach(presentationMachine => {
        pmIds.push(presentationMachine._id);
      });
      Meteor.users.remove({presentationMachineId:{$in:pmIds}});
      Playlists.remove({presentationMachineId:{$in:pmIds}});
      PlayerStatus.remove({presentationMachineId:{$in:pmIds}});
    }
    const result = super.remove(selector);
    return result;
  }
}

export const PresentationMachines = new PresentationMachinesCollection('PresentationMachines');

// Deny all client-side updates since we will be using methods to manage this collection
PresentationMachines.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

PresentationMachines.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  logo: { type: String , optional: true},
  cicId: { type: String, regEx: SimpleSchema.RegEx.Id },
  position : { type : Number , optional: true},
  width: { type: Number , optional: true},
  height: { type: Number , optional: true},
  createdAt: { type: Date, denyUpdate: true }
});

PresentationMachines.attachSchema(PresentationMachines.schema);

// This represents the keys from PresentationMachines objects that should be published
// to the presentationMachine. If we add secret properties to PresentationMachines objects, don't list
// them here to keep them private to the server.
PresentationMachines.publicFields = {
  name: 1,
  logo: 1,
  cicId: 1,
  width: 1,
  height: 1,
  createdAt: 1
};

// PresentationMachine This factory has a name - This is for Testing
Factory.define('presentationmachine', PresentationMachines, {
  name: () => faker.lorem.words(),
  logo: () => faker.image.imageUrl(),
  cicId: () => Factory.get('cic'),
  createdAt: () => new Date()
});

PresentationMachines.helpers({
  cic() {
    return Cics.findOne(this.cicId);
  }
});
