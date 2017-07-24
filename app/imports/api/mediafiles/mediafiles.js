import { Mongo } from 'meteor/mongo'
import { FilesCollection } from 'meteor/ostrio:files'

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';
import fs from 'fs';

let s3, bound, Request;

if (Meteor.isServer) {
    Request = Npm.require('request');
    if(Meteor.settings.thirdPartyStorageType)
    {
        if(Meteor.settings.thirdPartyStorageType == "S3")
        {
            //process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

            bound = Meteor.bindEnvironment((callback) => callback());

            const configOption = { params: {Bucket: Meteor.settings.amazon.s3Bucket} };
            if(Meteor.settings.amazon.accessKeyId && Meteor.settings.amazon.accessKeyId != "")
            {
                configOption.accessKeyId = Meteor.settings.amazon.accessKeyId;
                configOption.secretAccessKey = Meteor.settings.amazon.secretKey;
            }

            if(Meteor.settings.amazon.region && Meteor.settings.amazon.region != "")
            {
                configOption.region = Meteor.settings.amazon.region;
            }

            s3 = new AWS.S3(configOption);
        }
    }

}

export const MediaFiles = new FilesCollection({
    storagePath: `${Meteor.settings.storageAbsolutePath  }/media`,
    public: true,
    downloadRoute:'/mediafiles/',
    collectionName: 'mediafiles',
    allowClientCode: false, // Disallow remove files from Client
    onBeforeUpload (file) {
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            console.error("Not Logged in as admin. Return false");
            return 'Please login as admin to upload media';
        }
        if (/png|jpg|jpeg|mp4|mov|webm/i.test(file.extension)) {
            return true;
        } else {
            return 'Please upload images or videos with extension png/jpg/jpeg/mp4/webm/mov';
        }
    },
    onAfterUpload(fileRef) {
        if(Meteor.isServer && fileRef.isImage) {
            const {createThumbnails} = require('./thumbnail')
            createThumbnails(MediaFiles, fileRef, (err, fileRef1) => {
                //console.log('MediaFiles createThumbnails result', err)

                if(Meteor.settings.thirdPartyStorageType)
                {
                    if(Meteor.settings.thirdPartyStorageType == "S3" && s3) {

                        // In onAfterUpload callback we will move file to AWS:S3
                        const self = this;
                        _.each(fileRef1.versions, (vRef, version) => {
                            // We use Random.id() instead of real file's _id
                            // to secure files from reverse engineering
                            // As after viewing this code it will be easy
                            // to get access to unlisted and protected files
                            const filePath = `${Meteor.settings.amazon.filePrefix + parseInt((new Date()).getTime())  }-${  Random.id()  }-${  version  }.${  fileRef1.extension}`;
                            const stream = fs.createReadStream(vRef.path);
                            s3.upload({
                                Key: filePath,
                                Body: stream,
                                ACL: 'public-read',
                                ContentType: fileRef1['mime-type']
                            }, (err, data) => {
                                bound(() => {
                                    let upd;
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        upd = {
                                            $set: {}
                                        };
                                        upd['$set'][`versions.${  version  }.meta.pipeFrom`] = data.Location;// + '/' + filePath;//accessKeyId
                                        upd['$set'][`versions.${  version  }.meta.pipePath`] = filePath;
                                        upd['$set'][`versions.${  version  }.meta.service`] = Meteor.settings.thirdPartyStorageType;
                                        //console.log("Upload Completed")
                                        //console.log(res);
                                        self.collection.update({
                                            _id: fileRef1._id
                                        }, upd, (error) => {
                                            if (error) {
                                                console.error(error);
                                            } else {
                                                // Unlink original files from FS
                                                // after successful upload to AWS:S3
                                                //console.log('Collection Updated and now remove original file')
                                                try {
                                                    self.unlink(self.collection.findOne(fileRef1._id), version);
                                                }
                                                catch (e) {
                                                    console.error('error with unlink', e);
                                                }
                                                //console.log("File removed with unlink")
                                            }
                                        });
                                    }
                                });
                            });                    //
                        });
                    }
                }
            })
        }

    },
    interceptDownload(http, fileRef, version) {
        let path, ref, ref1, ref2;
        path = (ref = fileRef.versions) != null ? (ref1 = ref[version]) != null ? (ref2 = ref1.meta) != null ? ref2.pipeFrom : void 0 : void 0 : void 0;
        if (path) {
            // If file is moved to S3
            // We will pipe request to S3
            // So, original link will stay always secure
            Request({
                url: path,
                headers: _.pick(http.request.headers, 'range', 'accept-language', 'accept', 'cache-control', 'pragma', 'connection', 'upgrade-insecure-requests', 'user-agent')
            })
            .on('error',error => {
                console.error('error in interceptDownload', error.message , path)
            })
            .pipe(http.response);
            return true;
        } else {
            // While file is not yet uploaded to S3
            // We will serve file from FS
            return false;
        }
    }
});

if(Meteor.isServer) {
    MediaFiles.allow({
        insert(){
            return true;
        },
        update() {
            // add custom authentication code here
            return true;
        }
    });
    MediaFiles.deny({
        remove() {
            return true;
        }
    });

    // Intercept File's collection remove method
    // to remove file from S3
    // Not sure about this. If we were using S3, and then change to some other third party, there are possibility that we have mediafiles that are piped from different third party.
    // We can't just assume it's from S3.

    const _origRemove = MediaFiles.remove;

    MediaFiles.remove = function(search) {
        const cursor = this.collection.find(search);
        cursor.forEach((fileRef) => {
            _.each(fileRef.versions, (vRef) => {
                if (vRef != null && vRef.meta != null && vRef.meta.pipePath && vRef.meta.service == "S3") {
                    const params = {
                        Key: vRef.meta.pipePath
                    };
                    s3.deleteObject(params, (err, data) => {
                        if (err)
                        {
                            console.error('S3 remove object error', err, err.stack);
                        } // an error occurred
                        else
                        {
                            //console.log("S3 remove object success");
                            //console.log(data);
                        }           // successful response
                    });
                }
            });
        });
        // Call original method
        _origRemove.call(this, search);
    };

}