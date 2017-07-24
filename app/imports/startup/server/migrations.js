import { _ } from 'meteor/underscore';
import {Meteor} from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import {Factory} from 'meteor/dburles:factory';
import {Accounts} from 'meteor/accounts-base';
import {Clients, ClientLogoFile} from '../../api/clients/clients';
import {Playlists} from '../../api/playlists/playlists';

import {Engagements} from '../../api/engagements/engagements';
import {Industries} from '../../api/industry/industry';
import {Themes} from '../../api/themes/themes';
import {MediaFiles} from '../../api/mediafiles/mediafiles';
import {Medias, MEDIA_TYPES} from '../../api/medias/medias';
import {PlaylistItems} from '../../api/playlistitems/playlistitems';
import {Tags} from '../../api/tags/tags';
import {Cics} from '../../api/cics/cics';
import {PresentationMachines} from '../../api/presentationmachines/presentationmachines';
import {CanoncialPlaylists} from '../../api/canoncialplaylist/canoncialplaylists';
import {Favorites} from '../../api/favorites/favorites';
import {Histories} from '../../api/histories/histories';
import { PlayerStatus, PLAYINGSTATUS } from '../../api/playerstatus/playerstatus'
import {DownloadStatus, DOWNLOAD_STATUS} from '../../api/downloadstatus/downloadstatus'

import {ROLES} from '../../api/users/users.js';
import {Roles} from 'meteor/alanning:roles';
import {Migrations} from 'meteor/percolate:migrations'
import faker from 'faker';

Migrations.add({
    version: 1,
    name: 'Add new areas.',
    up() {
        const cic = Cics.findOne({name : 'SYDNEY'})
        if(cic) {
            addPMAndMachineUser({ name: "Forum Left", logo: "forum-left", cicId : cic._id, width: 3500, height: 1500}, { username: 'machine_sydney_forum_left', password: 'pas_machine_sydney_forum_left_word'});
            addPMAndMachineUser({ name: "Forum Right", logo: "forum-right", cicId : cic._id, width: 2000, height: 1200}, { username: 'machine_sydney_forum_right', password: 'pas_machine_sydney_forum_right_word'});
            addPMAndMachineUser({ name: "Expo Zone Left", logo: "expozone-left", cicId : cic._id, width: 3500, height: 1500}, { username: 'machine_sydney_expozone_left', password: 'pas_machine_sydney_expozone_left_word'});
            addPMAndMachineUser({ name: "Expo Zone Right", logo: "expozone-right", cicId : cic._id, width: 2000, height: 1200}, { username: 'machine_sydney_expozone_right', password: 'pas_machine_sydney_expozone_right_word'});
        }

    },
    down() {
        //code to migrate down to version 1
        PresentationMachines.rawCollection().deleteOne({name: "Forum Left"})
        PresentationMachines.rawCollection().deleteOne({name: "Forum Right"})
        PresentationMachines.rawCollection().deleteOne({name: "Expo Zone Left"})
        PresentationMachines.rawCollection().deleteOne({name: "Expo Zone Right"})
        Meteor.users.rawCollection().deleteOne({username: 'machine_sydney_forum_left'})
        Meteor.users.rawCollection().deleteOne({username: 'machine_sydney_forum_right'})
        Meteor.users.rawCollection().deleteOne({username: 'machine_sydney_expozone_left'})
        Meteor.users.rawCollection().deleteOne({username: 'machine_sydney_expozone_right'})
    }
});


Migrations.add({
    version: 2,
    name: 'Add Melbourne CIC.',
    up() {

        // Link current engagement and clients to the only present CIC in the DB

        const currentCic = Cics.findOne()

        console.log(`set default CIC to Engagement`)
        Engagements.rawCollection().update({},{ $set: {cicId : currentCic._id}}, { multi: true })

        console.log(`set default CIC to Clients`)
        Clients.rawCollection().update({},{ $set: {cicId : currentCic._id}}, { multi: true })

        console.log(`set default CIC to presenter user`)
        Meteor.users.rawCollection().update({'roles.__global_roles__' : 'presenter'},{ $set: {cicId : currentCic._id}}, { multi: true })

        const cic = {
            name: "MELBOURNE",
            logo: "http://www.logourl.com/logo.jpg",
            website: "http://www.melbourncic.com/"
        };
        const cicId = Cics.insert(cic);
        if(cicId) {
            addPMAndMachineUser({ name: "Reception Hall (ML)", logo: "receptionhall", cicId, width: 3000, height: 1500}, { username: 'machine_melbourne_reception', password: 'pas_machine_melbourne_reception_word'});
            addPMAndMachineUser({ name: "Insight Ring (ML)", logo: "insightring", cicId, width: 4000, height: 2500}, { username: 'machine_melbourne_insightring', password: 'pas_machine_melbourne_insightring_word'});
        }
    },
    down() {
        //code to migrate down to version 1
    }
});


Migrations.add({
    version: 3,
    name: 'Add Expo Zone Centre.',
    up() {

        // Link current engagement and clients to the only present CIC in the DB
        const cic = Cics.findOne({name : 'SYDNEY'})

        // We rename other area to Expo Zone Centre
        const otherArea = PresentationMachines.findOne({name : 'Other Areas'})
        if(otherArea){
            // Set the new name and logo
            PresentationMachines.rawCollection().update({_id : otherArea._id}, { $set: { name: "Expo Zone Centre 1", logo: "expozonecenter1"} })
            // Rename the user linked
            Meteor.users.rawCollection().update({presentationMachineId : otherArea._id},{ $set: {username: 'machine_sydney_expozone1' }})
        }
        // Add the new CIC
        addPMAndMachineUser({ name: "Expo Zone Centre 2", logo: "expozonecenter2", cicId : cic._id, width: 3000, height: 1500}, { username: 'machine_sydney_expozone2', password: 'pas_machine_sydney_expozone2_word'});

        // Now we reorder the elemets in a temp array
        const presentationMachinesItems = PresentationMachines.find({}).fetch()

        let ar = moveArrayItems(presentationMachinesItems,7,4);
        ar = moveArrayItems(presentationMachinesItems,7,5);
        ar = moveArrayItems(presentationMachinesItems,3,4);
        ar = moveArrayItems(presentationMachinesItems,10,5);
        ar = moveArrayItems(presentationMachinesItems,8,7);
        ar.forEach((pm,index) => {
            console.log( 'set index to ', pm.logo , pm._id );
            PresentationMachines.rawCollection().update({_id : pm._id },{ $set : {position : index}});
        })


    },
    down() {
        //code to migrate down to version 1
    }
});

Migrations.add({
    version: 4,
    name: 'Change area names and order',
    up() {
        const cicSydneyId = Cics.findOne({name:'SYDNEY'})._id
        const cicMelbourneId = Cics.findOne({name:'MELBOURNE'})._id
        const pms = PresentationMachines.find().fetch()

        PresentationMachines.rawCollection().update({_id:_.findWhere(pms, {cicId:cicSydneyId, name:'Reception Hall'})._id}, {$set:{name:'Reception Wall', position:0}})
        PresentationMachines.rawCollection().update({_id:_.findWhere(pms, {cicId:cicSydneyId, name:'Insight Ring'})._id}, {$set:{name:'Insight Ring', position:1}})
        PresentationMachines.rawCollection().update({_id:_.findWhere(pms, {cicId:cicSydneyId, name:'Partnership Hub'})._id}, {$set:{name:'Partnership Hub', position:2}})
        PresentationMachines.rawCollection().update({_id:_.findWhere(pms, {cicId:cicSydneyId, name:'Expo Zone Centre 1'})._id}, {$set:{name:'Expo Zone 1 Centre', position:3}})
        PresentationMachines.rawCollection().update({_id:_.findWhere(pms, {cicId:cicSydneyId, name:'Expo Zone Right'})._id}, {$set:{name:'Expo Zone 1 Left & Right', position:4}})
        PresentationMachines.rawCollection().update({_id:_.findWhere(pms, {cicId:cicSydneyId, name:'Expo Zone Centre 2'})._id}, {$set:{name:'Expo Zone 2 Centre', position:5}})
        PresentationMachines.rawCollection().update({_id:_.findWhere(pms, {cicId:cicSydneyId, name:'Expo Zone Left'})._id}, {$set:{name:'Expo Zone 2 Left & Right', position:6}})
        PresentationMachines.rawCollection().update({_id:_.findWhere(pms, {cicId:cicSydneyId, name:'Forum Right'})._id}, {$set:{name:'Forum 5', position:7}})
        PresentationMachines.rawCollection().update({_id:_.findWhere(pms, {cicId:cicSydneyId, name:'Forum Left'})._id}, {$set:{name:'Forum 8', position:8}})
        PresentationMachines.rawCollection().update({_id:_.findWhere(pms, {cicId:cicMelbourneId, name:'Reception Hall (ML)'})._id}, {$set:{name:'Reception Wall', position:9}})
        PresentationMachines.rawCollection().update({_id:_.findWhere(pms, {cicId:cicMelbourneId, name:'Insight Ring (ML)'})._id}, {$set:{name:'Insight Wall', position:10}})
    },
    down() {
        //code to migrate down to version 1
    }
});


function moveArrayItems(array, old_index, new_index) {
    if (new_index >= array.length) {
        let k = new_index - array.length;
        while ((k--) + 1) {
            array.push(undefined);
        }
    }
    array.splice(new_index, 0, array.splice(old_index, 1)[0]);
    return array; // for testing purposes

}


function resetDatabase() {
    console.log("Resetting Database");
    Meteor.users.remove({});
    Cics.rawCollection().remove({});
    CanoncialPlaylists.rawCollection().drop();
    Clients.rawCollection().drop();
    Engagements.rawCollection().drop();
    Favorites.rawCollection().drop();
    Histories.rawCollection().drop();
    Industries.rawCollection().drop();
    Medias.rawCollection().drop();
    PlaylistItems.rawCollection().drop();
    PlayerStatus.rawCollection().drop();
    Playlists.rawCollection().drop();
    PresentationMachines.rawCollection().drop();
    Tags.rawCollection().drop();
    Themes.rawCollection().drop();
    Migrations._collection.rawCollection().drop()
}


function addUser(_username, _email, _firstName, _lastName, _password, _role){
    const userObject = {
        username: _username,
        email: _email,
        firstName: _firstName,
        lastName: _lastName,
        password: _password,
    }

    const userId = Accounts.createUser(userObject);
    Roles.addUsersToRoles(userId, [_role], Roles.GLOBAL_GROUP);
}

function addPMAndMachineUser(pmInfo, userInfo) {

    console.log("Creating Presentation Machines...");

    const presentationMachineId = PresentationMachines.insert(pmInfo);

    // Create Machine User
    const machineUser = {
        username: userInfo.username,
        firstName: pmInfo.name,
        password: userInfo.password,
        presentationMachineId
    };
    const machineUserId = Accounts.createUser(machineUser);
    Roles.addUsersToRoles(machineUserId, [ROLES.MACHINE], Roles.GLOBAL_GROUP);

    // Create Ambient Playlist
    const playlist = {
        presentationMachineId,
        overlay: true,
        ambientPlaylist: true
    };
    const ambientPlaylistId = Playlists.insert(playlist);

    // Setting Ambient Playlist as the default playlist
    const playerStatus = {
        presentationMachineId,
        playlistId: ambientPlaylistId
    };
    PlayerStatus.insert(playerStatus);
}
function baseData(){

    console.log("Create User Data");

    // admin users
    addUser('admin', 'admin@telstra.com', 'Admin', 'User', 'cicadmin1', ROLES.ADMIN)
    addUser('ben_admin', 'ben.cox@brainsdesign.com', 'Ben', 'Cox', 'password1', ROLES.ADMIN)
    addUser('valentyna_admin', 'valentinchka@gmail.com', 'Valentyna', 'User', 'password1', ROLES.ADMIN)
    addUser('richard_admin', 'namlleps.drahcir@gmail.com', 'Richard', 'User', 'password1', ROLES.ADMIN)
    addUser('cb_admin', 'chris.bond@brainsdesign.com', 'Chris', 'Bond', 'password1', ROLES.ADMIN)


    // presenter users
    addUser('presenter1', 'presenter1@telstra.com', 'John', 'Smith', 'presenter1', ROLES.PRESENTER)
    addUser('presenter2', 'presenter2@telstra.com', 'John', 'Christiano', 'Ronaldo', ROLES.PRESENTER)
    addUser('ben_presenter', 'ben.cox2@brainsdesign.com', 'Ben', 'Cox', 'password1', ROLES.PRESENTER)
    addUser('valentyna_presenter', 'valentinchka2@gmail.com', 'Valentyna', 'User', 'password1', ROLES.PRESENTER)
    addUser('richard_presenter', 'namlleps.drahcir2@gmail.com', 'Richard', 'User', 'password1', ROLES.PRESENTER)
    addUser('cb_presenter', 'chris.bond2@brainsdesign.com', 'Chris', 'Bond', 'password1', ROLES.PRESENTER)

    console.log("Creating CIC");

    const cic = {
        name: "SYDNEY",
        logo: "http://www.logourl.com/logo.jpg",
        website: "http://www.melbourncic.com/"
    };

    const cicId = Cics.insert(cic);

    console.log("Creating Presentation Machines...");

    // addPMAndMachineUser(pmInfo, userInfo)
    addPMAndMachineUser({ name: "Reception Hall", logo: "receptionhall", cicId, width: 3000, height: 1500}, { username: 'machine_sydney_reception', password: 'pas_machine_sydney_reception_word'});
    addPMAndMachineUser({ name: "Insight Ring", logo: "insightring", cicId, width: 4000, height: 2500}, { username: 'machine_sydney_insightring', password: 'pas_machine_sydney_insightring_word'});
    addPMAndMachineUser({ name: "Partnership Hub", logo: "partnershiphub", cicId, width: 3500, height: 1500}, { username: 'machine_sydney_partnershiphub', password: 'pas_machine_sydney_partnershiphub_word'});
    addPMAndMachineUser({ name: "Other Areas", logo: "otherareas", cicId, width: 2000, height: 1200}, { username: 'machine_sydney_otherarea', password: 'pas_machine_sydney_otherarea_word'});

    const industryNames = ["Banking & Finance", "Construction", "Education", "Government", "Health", "Hospitality",
        "Insurance", "Manufacturing", "Media", "Mining Oil & Gas", "Professional Services", "Public Safety", "Retail"];

    industryNames.forEach(industryName => {
        const industry = {
            name: industryName,
            icon: "svgicon"
        };
        Industries.insert(industry);
    });

    const themeNames = ["Create transformative Innovations", "Reach global markets", "Liberate your workforce",
        "Optimise your IT", "Secure your business"];

    themeNames.forEach(themeName => {
        const theme = {
            name: themeName,
            icon: "svgicon"
        };
        Themes.insert(theme);
    });
}

function dumbData() {

    const arrThemes = Themes.find({}).fetch();
    const arrIndustries = Industries.find({}).fetch();
    const arrPresentationMachines = PresentationMachines.find({}).fetch();
    const arrCics = Cics.find({}).fetch()

    if (!((arrThemes && arrThemes.length > 0) && (arrIndustries && arrIndustries.length > 0) && (arrPresentationMachines && arrPresentationMachines.length > 0))) {
        console.log("Base Data Not Applied");
        return;
    }

    console.log("Creating Dumb Information for Tags...");

    const tag1 = {
        name: "Entertainment"
    };
    const tagId1 = Tags.insert(tag1);
    const tag2 = {
        name: "Software Engineering"
    };
    const tagId2 = Tags.insert(tag2);

    const tag3 = {
        name: "CIC"
    };
    const tagId3 = Tags.insert(tag3);

    const arrTagIds = [tagId1, tagId2, tagId3];

    console.log("Creating Dumb Information for Media...");

    const addMediaIds = [];
    const arrItemIds = [];

    _.times(50, (i) => {
        const type = Math.random() > 0.5 ? MEDIA_TYPES.IMAGE : MEDIA_TYPES.VIDEO;
        const media = {
            name: `Media File - ${  i}`,
            type,
            width: 6000,
            height: 3000,
            mediaFileId: 'ZBrQdWChw2GQbF9AR', // TODO insert real images and medias
            themeId: arrThemes[getRandomInt(arrThemes.length)]._id,
            industryIds: _.sample(arrIndustries.map(industry => industry._id), _.random(1, arrIndustries.length)),
            tagIds: _.sample(arrTagIds, _.random(1, arrTagIds.length)),
            presentationMachineIds: _.sample(arrPresentationMachines.map(pm => pm._id), _.random(1, arrPresentationMachines.length))
        };
        if(type === MEDIA_TYPES.VIDEO){
            media.videoDuration = _.random(10, 250);
        }

        const mediaId = Medias.insert(media);
        addMediaIds.push(mediaId);

        const playlistitem = {
            mediaId,
            duration: type === MEDIA_TYPES.VIDEO ? media.videoDuration : 60,
            showOverlay: false
        };
        const playlistitemId = PlaylistItems.insert(playlistitem);
        arrItemIds.push(playlistitemId);
    });

    _.times(100, (i) => {
        const canoncialPlaylist = {
            name: `Canoncial Playlist - ${  i}`,
            presentationMachineId: arrPresentationMachines[getRandomInt(arrPresentationMachines.length)]._id,
            tagIds: _.sample(arrTagIds, _.random(1, arrTagIds.length)),
            themeId: arrThemes[getRandomInt(arrThemes.length)]._id,
            industryIds: _.sample(arrIndustries.map(industry => industry._id), _.random(1, arrIndustries.length)),
            itemIds: _.sample(arrItemIds, _.random(1, 5)),
        };
        CanoncialPlaylists.insert(canoncialPlaylist);
    });

    console.log("Creating Dumb Information for Client...");

    const client1 = {
        name: "IBM",
        website: "http://www.ibm.com",
        industryId: arrIndustries[getRandomInt(arrIndustries.length)]._id,
        facebook: 'http://www.facebook.com/ibm',
        twitter: 'http://www.twitter.com/ibm',
        instagram: 'http://www.instagram.com/ibm',
        cicId : arrCics[getRandomInt(arrCics.length)]._id,
    };
    const clientId1 = Clients.insert(client1);

    const client2 = {
        name: "Hollywood",
        website: "http://www.hollywood.com",
        industryId: arrIndustries[getRandomInt(arrIndustries.length)]._id,
        facebook: 'http://www.facebook.com/hollywood',
        twitter: 'http://www.twitter.com/hollywood',
        instagram: 'http://www.instagram.com/hollywood',
        cicId : arrCics[getRandomInt(arrCics.length)]._id,
    };
    const clientId2 = Clients.insert(client2);

    const client3 = {
        name: "Microsoft",
        website: "http://www.microsoft.com",
        industryId: arrIndustries[getRandomInt(arrIndustries.length)]._id,
        facebook: 'http://www.facebook.com/microsoft',
        twitter: 'http://www.twitter.com/microsoft',
        instagram: 'http://www.instagram.com/microsoft',
        cicId : arrCics[getRandomInt(arrCics.length)]._id,
    };
    const clientId3 = Clients.insert(client3);
    const client4 = {
        name: "Motorola",
        website: "http://www.motorola.com",
        industryId: arrIndustries[getRandomInt(arrIndustries.length)]._id,
        facebook: 'http://www.facebook.com/motorola',
        twitter: 'http://www.twitter.com/motorola',
        instagram: 'http://www.instagram.com/motorola',
        cicId : arrCics[getRandomInt(arrCics.length)]._id,
    };
    const clientId4 = Clients.insert(client4);

    console.log("Creating Dumb Information for Presenter...");

    const presenterUser = Meteor.users.findOne({username: "presenter1"});
    if(presenterUser) {
        const engagement = {
            presenterId: presenterUser._id,
            clientId: clientId1,
            name: 'Westpac Tour',
            startTime: new Date(2016, 0, 1),
            endTime: new Date(2016, 11, 31, 23, 59, 59),
        };
        const engagementId = Engagements.insert(engagement);

        _.times(20, (i) => {
            const playlist = {
                name: `Playlist - ${  i}`,
                presentationMachineId: arrPresentationMachines[getRandomInt(arrPresentationMachines.length)]._id,
                engagementId,
                itemIds: _.sample(arrItemIds, _.random(1, 5)),
            };
            Playlists.insert(playlist);
        });
    }
}



function getRandomInt(max) {
    return Math.floor(Math.random() * max) % max;
}

function testFixtures(){

    const arrThemes = Themes.find({}).fetch();
    const arrIndustries = Industries.find({}).fetch();
    const arrPresentationMachines = PresentationMachines.find({}).fetch();
    const arrCics = Cics.find({}).fetch()

    // Create Tags data | use set to prevent duplicate tag names in the db
    const tagsNames = new Set()
    _.times(10, () => {
        tagsNames.add(faker.lorem.word())
    });

    // Add the ambient tag
    tagsNames.add('Ambient')

    const cleanedTags = [...tagsNames]
    cleanedTags.forEach(tag => Tags.insert({name:tag}))

    console.log('Industries,Themes,Tags Created')

    // Create Medias and PlaylistItems data
    const tags = Tags.find({}).fetch()


    const pmMachine = PresentationMachines.findOne({})
    const machineUser1 = {
        username: 'reception',
        firstName: pmMachine.name,
        password: 'pm1',
        presentationMachineId: pmMachine._id
    };
    const machineUserId1 = Accounts.createUser(machineUser1);
    Roles.addUsersToRoles(machineUserId1, [ROLES.MACHINE], Roles.GLOBAL_GROUP);


    // Creating test media files
    const fs = require('fs');

    const oldmedias = fs.readdirSync(`${Meteor.settings.storageAbsolutePath}/media`);
    oldmedias.forEach((filename) => {
        fs.unlink(`${Meteor.settings.storageAbsolutePath}/media/${filename}`);
    })

    const mediaPromises = [];
    _.times(50, (index) => {  // Create image medias
        const promise = new Promise((resolve, reject) => {
            MediaFiles.load('http://lorempixel.com/320/240', {
                fileName: `image${index+1}.jpeg`,
                meta: {},
                type: 'image/jpeg'
            }, (err, file) => {
                if (err) {
                    resolve({isImage:true});
                } else {
                    resolve(file);
                }
            });
        });

        mediaPromises.push(promise);
    });

    const ffprobe         = require('ffprobe'),
        ffprobeStatic   = require('ffprobe-static');

    const demoVideos = [
        {url:'http://techslides.com/demos/sample-videos/small.mp4', type:'video/mp4'},
        {url:'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4', type:'video/mp4'},
    ]

    demoVideos.forEach((video, index) => {  // Create video medias
        const promise = new Promise((resolve, reject) => {
            MediaFiles.load(video.url, {
                fileName: `video${index + 1}.mp4`,
                meta: {},
                type: video.type
            }, (err, file) => {
                if (err) {
                    resolve({isVideo: true});
                } else {
                    resolve(file)
                }
            });
        });

        mediaPromises.push(promise);
    });


    const oldlogos = fs.readdirSync(`${Meteor.settings.storageAbsolutePath  }/logo`);
    oldlogos.forEach((filename) => {
        fs.unlink(`${Meteor.settings.storageAbsolutePath}/logo/${filename}`);
    })

    const logoPromises = [];
    _.times(20, (index) => {
        const promise = new Promise((resolve, reject) => {
            //var filepath = `${Meteor.settings.storageAbsolutePath}/logo/download${index+1}.png`;

            ClientLogoFile.load('http://lorempixel.com/160/120', {
                fileName: `logo${index+1}.png`,
                meta: {},
                type: 'image/png'
            }, (err, file) => {
                const params = {
                    industryId: _.sample(_.pluck(arrIndustries, '_id')),
                    logoFileId: file?file._id:null,
                    facebook: faker.internet.url(),
                    twitter: faker.internet.url(),
                    instagram: faker.internet.url(),
                    cicId : _.sample(arrCics)._id,
                }
                Factory.create('client', params);
                resolve();
            });
        });

        logoPromises.push(promise);
    });

    Promise.all(mediaPromises)
        .then((files) => {

            files.forEach((file) => {
                const industryIds = _.sample(_.pluck(arrIndustries, '_id'), _.random(1, arrIndustries.length))
                const tagIds = _.sample(_.pluck(tags, '_id'), _.random(2, tags.length))
                const themeId = _.sample(_.pluck(arrThemes, '_id'))
                const presentationMachineIds = _.sample(_.pluck(arrPresentationMachines, '_id'), _.random(1, arrPresentationMachines.length))

                const insertDownloadStatus = (media) => {
                    _.sample(media.presentationMachineIds, _.random(1, media.presentationMachineIds.length)).forEach((presentationMachineId) => {
                    //media.presentationMachineIds.forEach((presentationMachineId) => {
                        Factory.create('downloadstatus', {
                            mediaId: media._id,
                            presentationMachineId,
                            status: DOWNLOAD_STATUS.DOWNLOADED
                        })
                    })
                }
                if(file.isVideo) {
                    const params = {
                        industryIds,
                        tagIds,
                        themeId,
                        presentationMachineIds,
                        type: MEDIA_TYPES.VIDEO,
                        mediaFileId: file._id
                    }
                    if(file.path) {
                        ffprobe(file.path, {path:ffprobeStatic.path}).then((info) => {
                            //console.log("ffprobe info", info);
                            params.videoDuration = info.streams && info.streams.length ? parseInt(info.streams[0].duration) : 0
                            if(params.videoDuration) {
                                insertDownloadStatus(Factory.create('media', params))
                            }
                        })
                    }
                } else if(file.isImage) {
                    const params = {
                        industryIds,
                        tagIds,
                        themeId,
                        presentationMachineIds,
                        type: MEDIA_TYPES.IMAGE,
                        mediaFileId: file._id
                    }
                    insertDownloadStatus(Factory.create('media', params))
                }
            });
            console.log('Medias created' )

            // Create CanoncialPlaylists data
            _.times(50, () => {
                const themeId = _.sample(_.pluck(arrThemes, '_id'))
                const presentationMachineId = _.sample(_.pluck(arrPresentationMachines, '_id'))
                const medias = Medias.find({themeId, presentationMachineIds:presentationMachineId}).fetch();
                if(medias.length){
                    const sampleMedias = _.uniq(_.sample(medias, _.random(1, medias.length)));

                    const playlistitems = [];
                    sampleMedias.forEach((media) => {
                        const duration = media.type == MEDIA_TYPES.IMAGE ? 1+parseInt(Random.fraction() * 100) : media.videoDuration
                        playlistitems.push(Factory.create('playlistitem', {'mediaId': media._id, duration}));
                    });

                    const params = {
                        itemIds: _.pluck(playlistitems, '_id'),
                        industryIds: _.sample(_.pluck(arrIndustries, '_id'), _.random(1, arrIndustries.length)),
                        tagIds: _.sample(_.pluck(tags, '_id'), _.random(2, tags.length)),
                        themeId,
                        presentationMachineId
                    }
                    Factory.create('canoncialplaylist', params);
                }
            });
            console.log('canoncialplaylist created' )

            Promise.all(logoPromises).then(() => {

                const presenterUser = Meteor.users.findOne({username: "presenter1"});

                if(presenterUser) {
                    // Create Engagements
                    _.times(50, () => {
                        // Get a rounded date and add random time ( rounded by 30 minutes )
                        const now = moment().minutes('00').add((_.random(2, 300)-100)*30,'minutes')
                        const cicId = _.sample(arrCics)._id
                        const client = _.sample(Clients.find({cicId}).fetch())
                        const engagement = {
                            presenterId: presenterUser._id,
                            clientId: client._id,
                            name: `${faker.lorem.word()} Tour`,
                            startTime: now.format(),
                            endTime: now.add(_.random(1, 3)*30,'minutes').format(),
                            cicId
                        }

                        const engagementId = Engagements.insert(engagement)
                        const pms = _.where(arrPresentationMachines,{cicId})
                        const samplePMs = _.sample(pms, _.random(1, pms.length))

                        samplePMs.forEach((pm) => {
                            const medias = Medias.find({presentationMachineIds:pm._id}).fetch();

                            const sampleMedias = _.uniq(_.sample(medias, _.random(1, medias.length/3)));

                            const playlistitems = [];
                            sampleMedias.forEach((media) => {
                                const duration = media.type == MEDIA_TYPES.IMAGE ? 1+parseInt(Random.fraction() * 100) : media.videoDuration
                                playlistitems.push(Factory.create('playlistitem', {'mediaId': media._id, duration, showOverlay:_.sample([true, false])}));
                            });

                            const playlist = {
                                presentationMachineId: pm._id,
                                engagementId,
                                itemIds: _.pluck(playlistitems, '_id'),
                                cicId
                            }
                            Playlists.insert(playlist)
                        })

                    })
                    console.log("Engagements & Playlists created")

                    arrPresentationMachines.forEach((pm) => {
                        // Create PlayerStatus for every presentation machine
                        const playlists = Playlists.find({presentationMachineId:pm._id, ambientPlaylist:false}).fetch()
                        const playlist = _.sample(playlists)
                        const playlistitem = PlaylistItems.findOne({_id: _.sample(playlist.itemIds)})

                        const playerStatus = PlayerStatus.findOne({presentationMachineId: pm._id})
                        const playerStatusData = {
                            presentationMachineId : pm._id,
                            playlistLoop : true,
                            playlistId : playlist._id,
                            playingStatus : PLAYINGSTATUS.STOP,
                            playerUpdate : {
                                playlistItemId : playlistitem._id,
                                playedDuration : _.random(Math.floor(playlistitem.duration/5), playlistitem.duration)
                            }
                        }

                        PlayerStatus.update({_id:playerStatus._id}, {$set:playerStatusData})

                        // Set AmbientPlaylist for every presentation machine
                        const ambientPlaylist = Playlists.findOne({presentationMachineId:pm._id, ambientPlaylist:true})
                        const medias = Medias.find({presentationMachineIds:pm._id}).fetch();

                        const sampleMedias = _.uniq(_.sample(medias, _.random(1, medias.length/3)));

                        const playlistitems = [];
                        sampleMedias.forEach((media) => {
                            const duration = media.type == MEDIA_TYPES.IMAGE ? 1+parseInt(Random.fraction() * 100) : media.videoDuration
                            playlistitems.push(Factory.create('playlistitem', {'mediaId': media._id, duration, showOverlay:_.sample([true, false])}));
                        });

                        Playlists.update({_id:ambientPlaylist._id}, {$set:{itemIds:_.pluck(playlistitems, '_id')}})
                    })
                    console.log("PlayerStatus created")
                    console.log("AmbientPlaylist set")
                }

                console.log('========== Tests Fixtures Completed ==========');
            }).catch((err) => {
                console.error("logoPromises error", err)
            })
        })
        .catch((err) => {
            console.error("mediaPromises error", err)
        });
}

// if the database is empty on server start, create some sample data.
Meteor.startup(() => {
  if (Meteor.settings.fixtures && Meteor.settings.fixtures.apply && !Meteor.isAppTest) {
    if (Meteor.settings.fixtures.resetDatabase) {
      resetDatabase()
    }
    if (Meteor.settings.fixtures.applyFixtures) {
      Meteor.settings.fixtures.applyFixtures.forEach((action) => {
        if(action == 'baseData') {
          baseData()
        }
        if(action == 'dumbData') {
          dumbData()
        }
      })
    }

    if (Meteor.settings.fixtures.exitAfterRun) {
      process.exit(0);
    }
  }
  // If we run in test mode
  if (Meteor.settings.fixtures && Meteor.settings.fixtures.apply && Meteor.isAppTest) {
    resetDatabase();
    baseData();
  }

  // We run the data migrations
  Migrations.migrateTo(4);

  if (Meteor.settings.fixtures && Meteor.settings.fixtures.apply && Meteor.isAppTest) {
    testFixtures();
  }

})