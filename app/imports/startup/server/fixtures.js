/*
import {Meteor} from 'meteor/meteor';
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
import { PlayerStatus, PLAYINGSTATUS } from '/imports/api/playerstatus/playerstatus'

import {ROLES} from '../../api/users/users.js';
import {Roles} from 'meteor/alanning:roles';
import faker from 'faker';

import _ from 'underscore';


function getRandomInt(max) {
    return Math.floor(Math.random() * max) % max;
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
  //MediaFiles.remove({});
  Medias.rawCollection().drop();
  PlaylistItems.rawCollection().drop();
  PlayerStatus.rawCollection().drop();
  Playlists.rawCollection().drop();
  PresentationMachines.rawCollection().drop();
  Tags.rawCollection().drop();
  Themes.rawCollection().drop();
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
  const presentationMachine1 = {
      name: "Reception Hall",
      logo: "receptionhall",
      cicId,
      width: 3000,
      height: 1500
  };

  const presentationMachineId1 = PresentationMachines.insert(presentationMachine1);

  const machineUser1 = {
      username: 'machine_sydney_reception',
      firstName: presentationMachine1.name,
      password: 'pas_machine_sydney_reception_word',
      presentationMachineId: presentationMachineId1
  };
  const machineUserId1 = Accounts.createUser(machineUser1);
  Roles.addUsersToRoles(machineUserId1, [ROLES.MACHINE], Roles.GLOBAL_GROUP);

  const presentationMachine2 = {
      name: "Insight Ring",
      logo: "insightring",
      cicId,
      width: 4000,
      height: 2500
  };
  const presentationMachineId2 = PresentationMachines.insert(presentationMachine2);
  const machineUser2 = {
      username: 'machine_sydney_insightring',
      firstName: presentationMachine2.name,
      password: 'pas_machine_sydney_insightring_word',
      presentationMachineId: presentationMachineId2
  };
  const machineUserId2 = Accounts.createUser(machineUser2);
  Roles.addUsersToRoles(machineUserId2, [ROLES.MACHINE], Roles.GLOBAL_GROUP);


  const presentationMachine3 = {
      name: "Partnership Hub",
      logo: "partnershiphub",
      cicId,
      width: 3500,
      height: 1500
  };
  const presentationMachineId3 = PresentationMachines.insert(presentationMachine3);
  const machineUser3 = {
      username: 'machine_sydney_partnershiphub',
      firstName: presentationMachine3.name,
      password: 'pas_machine_sydney_partnershiphub_word',
      presentationMachineId: presentationMachineId3
  };
  const machineUserId3 = Accounts.createUser(machineUser3);
  Roles.addUsersToRoles(machineUserId3, [ROLES.MACHINE], Roles.GLOBAL_GROUP);

  const presentationMachine4 = {
      name: "Other Areas",
      logo: "otherareas",
      cicId,
      width: 2000,
      height: 1200
  };
  const presentationMachineId4 = PresentationMachines.insert(presentationMachine4);
  const machineUser4 = {
      username: 'machine_sydney_otherarea',
      firstName: presentationMachine4.name,
      password: 'pas_machine_sydney_otherarea_word',
      presentationMachineId: presentationMachineId4
  };
  const machineUserId4 = Accounts.createUser(machineUser4);
  Roles.addUsersToRoles(machineUserId4, [ROLES.MACHINE], Roles.GLOBAL_GROUP);



    const arrPM = [presentationMachineId1, presentationMachineId2, presentationMachineId3, presentationMachineId4];
    arrPM.forEach(pmId => {
        const playlist = {
            presentationMachineId: pmId,
            overlay: true,
            ambientPlaylist: true
        };
        const ambientPlaylistId = Playlists.insert(playlist);

        // Setting Ambient Playlist as the default playlist
        const playerStatus = {
            presentationMachineId: pmId,
            playlistId: ambientPlaylistId
        };
        PlayerStatus.insert(playerStatus);
    });

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
  };
  const clientId1 = Clients.insert(client1);

  const client2 = {
      name: "Hollywood",
      website: "http://www.hollywood.com",
      industryId: arrIndustries[getRandomInt(arrIndustries.length)]._id,
      facebook: 'http://www.facebook.com/hollywood',
      twitter: 'http://www.twitter.com/hollywood',
      instagram: 'http://www.instagram.com/hollywood',
  };
  const clientId2 = Clients.insert(client2);

  const client3 = {
      name: "Microsoft",
      website: "http://www.microsoft.com",
      industryId: arrIndustries[getRandomInt(arrIndustries.length)]._id,
      facebook: 'http://www.facebook.com/microsoft',
      twitter: 'http://www.twitter.com/microsoft',
      instagram: 'http://www.instagram.com/microsoft',
  };
  const clientId3 = Clients.insert(client3);
  const client4 = {
      name: "Motorola",
      website: "http://www.motorola.com",
      industryId: arrIndustries[getRandomInt(arrIndustries.length)]._id,
      facebook: 'http://www.facebook.com/motorola',
      twitter: 'http://www.twitter.com/motorola',
      instagram: 'http://www.instagram.com/motorola',
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

function testFixtures(){

  const arrThemes = Themes.find({}).fetch();
  const arrIndustries = Industries.find({}).fetch();
  const arrPresentationMachines = PresentationMachines.find({}).fetch();


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
  const presentationMachines = PresentationMachines.find({}).fetch();
  const industries = Industries.find({}).fetch()
  const themes = Themes.find({}).fetch()
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
                  industryId: _.sample(_.pluck(industries, '_id')),
                  logoFileId: file?file._id:null,
                  facebook: faker.internet.url(),
                  twitter: faker.internet.url(),
                  instagram: faker.internet.url()
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
              if(file.isVideo) {
                  const params = {
                      industryIds: _.sample(_.pluck(industries, '_id'), _.random(1, industries.length)),
                      tagIds: _.sample(_.pluck(tags, '_id'), _.random(2, tags.length)),
                      themeId: _.sample(_.pluck(themes, '_id')),
                      presentationMachineIds: _.sample(_.pluck(presentationMachines, '_id'), _.random(1, presentationMachines.length)),
                      type: MEDIA_TYPES.VIDEO,
                      mediaFileId: file._id
                  }
                  if(file.path) {
                      ffprobe(file.path, {path:ffprobeStatic.path}).then((info) => {
                          //console.log("ffprobe info", info);
                          params.videoDuration = info.streams && info.streams.length ? parseInt(info.streams[0].duration) : 0
                          if(params.videoDuration) Factory.create('media', params);
                      })
                  }
              } else if(file.isImage) {
                  const params = {
                      industryIds: _.sample(_.pluck(industries, '_id'), _.random(1, industries.length)),
                      tagIds: _.sample(_.pluck(tags, '_id'), _.random(2, tags.length)),
                      themeId: _.sample(_.pluck(themes, '_id')),
                      presentationMachineIds: _.sample(_.pluck(presentationMachines, '_id'), _.random(1, presentationMachines.length)),
                      type: MEDIA_TYPES.IMAGE,
                      mediaFileId: file._id
                  }
                  Factory.create('media', params);
              }
          });
          console.log('Medias created' )

          const mediaIdsNotLinkedToPlaylistItem = _.pluck(_.sample(Medias.find().fetch(), 10), '_id'); console.log(mediaIdsNotLinkedToPlaylistItem)
          // Create CanoncialPlaylists data
          _.times(50, () => {
              const themeId = _.sample(_.pluck(themes, '_id'))
              const presentationMachineId = _.sample(_.pluck(presentationMachines, '_id'))
              const medias = _.reject(Medias.find({themeId, presentationMachineIds:presentationMachineId}).fetch(), (media)=>_.contains(mediaIdsNotLinkedToPlaylistItem, media._id));
              if(medias.length){
                  const sampleMedias = _.uniq(_.sample(medias, _.random(1, medias.length)));

                  const playlistitems = [];
                  sampleMedias.forEach((media) => {
                      const duration = media.type == MEDIA_TYPES.IMAGE ? parseInt(Random.fraction() * 100) : media.videoDuration
                      playlistitems.push(Factory.create('playlistitem', {'mediaId': media._id, duration}));
                  });

                  const params = {
                      itemIds: _.pluck(playlistitems, '_id'),
                      industryIds: _.sample(_.pluck(industries, '_id'), _.random(1, industries.length)),
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
              const clientId1 = Clients.findOne();

              if(presenterUser) {
                  // Create Engagements
                  _.times(50, () => {
                      // Get a rounded date and add random time ( rounded by 30 minutes )
                      const now = moment().minutes('00').add((_.random(2, 300)-100)*30,'minutes')
                      const engagement = {
                          presenterId: presenterUser._id,
                          clientId: clientId1._id,
                          name: `${faker.lorem.word()} Tour`,
                          startTime: now.format(),
                          endTime: now.add(_.random(1, 3)*30,'minutes').format(),
                      }

                      const engagementId = Engagements.insert(engagement)

                      const samplePMs = _.sample(presentationMachines, _.random(1, presentationMachines.length))

                      samplePMs.forEach((pm)=>{
                          const medias = _.reject(Medias.find({presentationMachineIds:pm._id}).fetch(), (media)=>_.contains(mediaIdsNotLinkedToPlaylistItem, media._id));

                          const sampleMedias = _.uniq(_.sample(medias, _.random(1, medias.length/3)));

                          const playlistitems = [];
                          sampleMedias.forEach((media) => {
                              const duration = media.type == MEDIA_TYPES.IMAGE ? parseInt(Random.fraction() * 100) : media.videoDuration
                              playlistitems.push(Factory.create('playlistitem', {'mediaId': media._id, duration, showOverlay:_.sample([true, false])}));
                          });

                          const playlist = {
                              presentationMachineId: pm._id,
                              engagementId,
                              itemIds: _.pluck(playlistitems, '_id')
                          }
                          Playlists.insert(playlist)
                      })

                  })
                  console.log("Engagements & Playlists created")

                  presentationMachines.forEach((pm) => {
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
                      const medias = _.reject(Medias.find({presentationMachineIds:pm._id}).fetch(), (media)=>_.contains(mediaIdsNotLinkedToPlaylistItem, media._id));

                      const sampleMedias = _.uniq(_.sample(medias, _.random(1, medias.length/3)));

                      const playlistitems = [];
                      sampleMedias.forEach((media) => {
                          const duration = media.type == MEDIA_TYPES.IMAGE ? parseInt(Random.fraction() * 100) : media.videoDuration
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
    testFixtures();
  }
})

*/