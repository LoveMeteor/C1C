import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import faker from 'faker';

class TagsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    ourDoc.createdAt = ourDoc.createdAt || new Date();
    const result = super.insert(ourDoc, callback);
    //tagsCountDenormalizer.afterInsertTag(ourDoc);
    return result;
  }
  remove(selector) {
    const result = super.remove(selector);
    return result;
  }
}

export const Tags = new TagsCollection('Tags');

// Deny all tag-side updates since we will be using methods to manage this collection
Tags.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

Tags.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  createdAt: {    type: Date,    denyUpdate: true }
});

Tags.attachSchema(Tags.schema);

// This represents the keys from Tags objects that should be published
// to the tag. If we add secret properties to Tags objects, don't list
// them here to keep them private to the server.
Tags.publicFields = {
  name: 1,
  createdAt: 1
};

// TAG This factory has a name - This is for Testing
Factory.define('tag', Tags, {
  name: () => faker.lorem.word(),
  createdAt: () => new Date()
});

