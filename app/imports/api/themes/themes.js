import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import faker from 'faker';

class ThemesCollection extends Mongo.Collection {
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

export const Themes = new ThemesCollection('Themes');

// Deny all theme-side updates since we will be using methods to manage this collection
Themes.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

Themes.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  icon: { type: String },
  createdAt: {    type: Date,    denyUpdate: true }
});

Themes.attachSchema(Themes.schema);

// This represents the keys from Themes objects that should be published
// to the theme. If we add secret properties to Themes objects, don't list
// them here to keep them private to the server.
Themes.publicFields = {
  name: 1,
  icon: 1,
  createdAt: 1
};

// THEME This factory has a name - This is for Testing
Factory.define('theme', Themes, {
  name: () => faker.lorem.word(),
  icon: () => 'industry',
  createdAt: () => new Date()
});

