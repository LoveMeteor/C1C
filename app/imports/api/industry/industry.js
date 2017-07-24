import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import faker from 'faker';

class IndustriesCollection extends Mongo.Collection {
    insert(doc, callback) {
        const ourDoc = doc;
        ourDoc.createdAt = ourDoc.createdAt || new Date();
        const result = super.insert(ourDoc, callback);
        return result;
    }
    remove(selector) {
        const result = super.remove(selector);
        return result;
    }
}

export const Industries = new IndustriesCollection('Industries');

// Deny all client-side updates since we will be using methods to manage this collection
Industries.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
});


Industries.schema = new SimpleSchema({
    _id: { type: String, regEx: SimpleSchema.RegEx.Id },
    name: { type: String },
    icon: { type: String },
    createdAt: { type: Date, denyUpdate: true }
});

Industries.attachSchema(Industries.schema);

// This represents the keys from Industries objects that should be published
// to the industry. If we add secret properties to Industries objects, don't list
// them here to keep them private to the server.
Industries.publicFields = {
    name: 1,
    icon: 1,
    createdAt: 1
};

// INDUSTRY This factory has a name - This is for Testing
Factory.define('industry', Industries, {
    name: () => faker.lorem.words(),
    icon: () => 'industry',
    createdAt: () => new Date()
});

Industries.helpers({
});
