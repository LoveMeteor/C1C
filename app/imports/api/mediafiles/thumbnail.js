import { _ }      from 'meteor/underscore';
import { check }  from 'meteor/check';
import { Meteor } from 'meteor/meteor';

import fs from 'fs-extra';
import Jimp from 'jimp';

const bound = Meteor.bindEnvironment((callback) => callback());

export const createThumbnails = (collection, fileRef, cb) => {
    check(fileRef, Object);

    let isLast = false;
    const finish = (error) => {
        bound(() => {
            const fileRef1 = collection.findOne(fileRef._id)
            if (error) {
                console.error('[mediafile.createThumbnails] [finish]', error);
                cb && cb (error, fileRef1);
            } else {
                if (isLast) {
                    cb && cb(void 0, fileRef1);
                }
            }
            return true;
        });
    };

    fs.exists(fileRef.path, (exists) => {
        bound(() => {
            if (!exists) {
                throw Meteor.log.error(`File ${  fileRef.path  } not found in [createThumbnails] Method`);
            }
            Jimp.read(fileRef.path, (err, image) => {
                if(err) {
                    console.error('[mediafile.createThumbnails] [_.each sizes]', err);
                    return finish(Meteor.Error('[mediafile.createThumbnails] [_.each sizes]', err));
                }
                const sizes = {
                    preview: {
                        width: 1024
                    },
                    thumbnail: {
                        width: 40,
                        square: true
                    }
                };

                const {width, height} = image.bitmap
                bound(() => {
                    let i = 0;
                    collection.collection.update(fileRef._id, {
                        $set: {
                            'meta.width': width,
                            'meta.height': height,
                            'versions.original.meta.width': width,
                            'versions.original.meta.height': height
                        }
                    });

                    _.each(sizes, (size, name) => {
                        const path = `${collection.storagePath(fileRef)  }/${  name  }-${  fileRef._id  }.${  fileRef.extension}`;
                        const copyPaste = () => {
                            fs.copy(fileRef.path, path, (fsCopyError) => {
                                bound(() => {
                                    if (fsCopyError) {
                                        console.error('[mediafile.createThumbnails] [_.each sizes] [fs.copy]', fsCopyError);
                                        finish(fsCopyError);
                                        return;
                                    }

                                    const upd = { $set: {} };
                                    upd['$set'][`versions.${  name}`] = {
                                        path,
                                        size: fileRef.size,
                                        type: fileRef.type,
                                        extension: fileRef.extension,
                                        meta: {
                                            width: width,
                                            height: height
                                        }
                                    };
                                    collection.collection.update(fileRef._id, upd, (colUpdError) => {
                                        ++i;
                                        if (i === Object.keys(sizes).length) {
                                            isLast = true;
                                        }
                                        finish(colUpdError);
                                    });
                                });
                            });
                        };

                        if (/png|jpe?g/i.test(fileRef.extension)) {
                            Jimp.read(fileRef.path, (err, img) => {
                                if(err) {
                                    console.error('[mediafile.createThumbnails] [_.each sizes] [img.resize]', err);
                                    finish(err);
                                    return;
                                }
                                const updateAndSave = (upNSaveError) => {
                                    bound(() => {
                                        if (upNSaveError) {
                                            console.error('[mediafile.createThumbnails] [_.each sizes] [img.resize]', upNSaveError);
                                            finish(upNSaveError);
                                            return;
                                        }
                                        fs.stat(path, (fsStatError, stat) => {
                                            bound(() => {
                                                if (fsStatError) {
                                                    console.error('[mediafile.createThumbnails] [_.each sizes] [img.resize] [fs.stat]', fsStatError);
                                                    finish(fsStatError);
                                                    return;
                                                }

                                                Jimp.read(path, (err, imgInfo) => {
                                                    bound(() => {
                                                        if (err) {
                                                            console.error('[mediafile.createThumbnails] [_.each sizes] [img.resize] [fs.stat] [gm(path).size]', err);
                                                            finish(err);
                                                            return;
                                                        }
                                                        const upd = { $set: {} };
                                                        upd['$set'][`versions.${  name}`] = {
                                                            path,
                                                            size: stat.size,
                                                            type: fileRef.type,
                                                            extension: fileRef.extension,
                                                            meta: {
                                                                width: imgInfo.bitmap.width,
                                                                height: imgInfo.bitmap.height
                                                            }
                                                        };

                                                        collection.collection.update(fileRef._id, upd, (colUpdError) => {
                                                            ++i;
                                                            if (i === Object.keys(sizes).length) {
                                                                isLast = true;
                                                            }
                                                            finish(colUpdError);
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                };

                                if (!size.square) {
                                    if (width > size.width) {
                                        img.resize(size.width, height * size.width / width).write(path, updateAndSave);
                                    } else {
                                        copyPaste();
                                    }
                                } else {
                                    let x = 0;
                                    let y = 0;
                                    const widthRatio  = width / size.width;
                                    const heightRatio = height / size.width;
                                    let widthNew      = size.width;
                                    let heightNew     = size.width;

                                    if (heightRatio < widthRatio) {
                                        widthNew = (size.width * width) / height;
                                        x = (widthNew - size.width) / 2;
                                    }

                                    if (heightRatio > widthRatio) {
                                        heightNew = (size.width * height) / width;
                                        y = (heightNew - size.width) / 2;
                                    }

                                    img
                                        .resize(widthNew, heightNew)
                                        .crop(x, y, size.width, size.width)
                                        .write(path, updateAndSave);
                                }
                            })


                        } else {
                            copyPaste();
                        }
                    });
                });
            })

        });
    });
    return true;
};