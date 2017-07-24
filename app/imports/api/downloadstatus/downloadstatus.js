import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


// This collection shows download status of media for each PM.

class DownloadStatusCollection extends Mongo.Collection {
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
export const DownloadStatus = new DownloadStatusCollection('DownloadStatus');
export const DOWNLOAD_STATUS = {
  NONE: "none",
  DOWNLOADED: "downloaded",
  FAILED: "failed",
  INPROGRESS: "inprogress"
};
// Deny all downloadStatus-side updates since we will be using methods to manage this collection
DownloadStatus.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

DownloadStatus.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  mediaId: { type: String, regEx: SimpleSchema.RegEx.Id },
  presentationMachineId: { type: String, regEx: SimpleSchema.RegEx.Id },
  status: { type: String, allowedValues: [DOWNLOAD_STATUS.NONE, DOWNLOAD_STATUS.DOWNLOADED, DOWNLOAD_STATUS.FAILED, DOWNLOAD_STATUS.INPROGRESS], defaultValue: DOWNLOAD_STATUS.NONE },
  progress: { type: Number, optional: true, defaultValue: 0 }, // This is only valid when status == INPROGRESS
  lastUpdateAt: { type: Date },
  createdAt: { type: Date, denyUpdate: true }
});

DownloadStatus.attachSchema(DownloadStatus.schema);

// This represents the keys from DownloadStatus objects that should be published
// to the downloadStatus. If we add secret properties to DownloadStatuss objects, don't list
// them here to keep them private to the server.
DownloadStatus.publicFields = {
  mediaId: 1,
  presentationMachineId: 1,
  status: 1,
  progress: 1,
  lastUpdateAt: 1,
  createdAt: 1
};

// DownloadStatus This factory has a name - This is for Testing
Factory.define('downloadstatus', DownloadStatus, {
  mediaId: () => Factory.get('media'),
  presentationMachineId: () => Factory.get('presentationmachine'),
  lastUpdateAt: () => new Date(),
  createdAt: () => new Date(),
  status: _.sample(Object.values(DOWNLOAD_STATUS)),
  progress: 0
});

DownloadStatus.helpers({
});
