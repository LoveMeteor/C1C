/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import {Meteor} from 'meteor/meteor';
import {Factory} from 'meteor/dburles:factory';
import {PublicationCollector} from 'meteor/johanbrook:publication-collector';
import {chai, assert} from 'meteor/practicalmeteor:chai';
import {Random} from 'meteor/random';
import {_} from 'meteor/underscore';

import {Playlists} from './playlists.js';
import {PlaylistItems} from '/imports/api/playlistitems/playlistitems.js';
import {CanoncialPlaylists} from '/imports/api/canoncialplaylist/canoncialplaylists.js';
import {PlayerStatus} from '/imports/api/playerstatus/playerstatus.js';

import {resetDatabase} from 'meteor/xolvio:cleaner';
import {insertPlaylist, updatePlaylist, removePlaylist, overwritePlaylist, appendMediaToPlaylist} from './methods';
import {createTestAdminUser, createTestNoRoleUser} from '../users/methods';

import {Favorites, FAVORITETYPES} from '../favorites/favorites';
import {insertFavorite, removeFavorite} from '../favorites/methods';

if (Meteor.isServer) {
    // eslint-disable-next-line import/no-unresolved
import
    './server/publications.js';

    describe('playlists', function () {

        var adminUserID, noRoleUserId;
        beforeEach(function () {
            resetDatabase();
            adminUserID = createTestAdminUser.call({});
            noRoleUserId = createTestNoRoleUser.call({});
        });


        describe('mutators', function () {
            it('builds correctly from factory and insert', function () {
                this.timeout(15000);
                const playlist = Factory.create('playlist');
                assert.typeOf(playlist, 'object');
                assert.typeOf(playlist.createdAt, 'date');

                const playlistId = insertPlaylist._execute({userId: adminUserID}, {
                    overlay: "Crated from Insert",
                    engagementId: Factory.create('engagement')._id,
                    presentationMachineId: Factory.create('presentationmachine')._id
                });
                assert.typeOf(playlistId, 'string');
            });


            it('update work correctly', function () {
                let playlistItem11 = Factory.create('playlistitem');
                let playlistItem12 = Factory.create('playlistitem');
                const playlistId = insertPlaylist._execute({userId: adminUserID}, {
                    overlay: "Crated from Insert",
                    engagementId: Factory.create('engagement')._id,
                    presentationMachineId: Factory.create('presentationmachine')._id,
                    itemIds: [playlistItem11._id, playlistItem12._id]
                });


                let playlistItem1 = Factory.create('playlistitem');
                let playlistItem2 = Factory.create('playlistitem');
                let playlistItem3 = Factory.create('playlistitem');
                let playlistItem4 = Factory.create('playlistitem');
                let playlistItem5 = Factory.create('playlistitem');
                let playlistItem6 = Factory.create('playlistitem');

                const text = 'some new text';
                updatePlaylist._execute({userId: adminUserID}, {
                    _id: playlistId,
                    overlay: text,
                    itemIds: [playlistItem1._id, playlistItem2._id, playlistItem3._id, playlistItem4._id, playlistItem5._id, playlistItem6._id]
                });
                const playlist = Playlists.findOne(playlistId);
                assert.equal(playlist.overlay, text);
                var playitems = playlist.itemsInOrder();
                assert.equal(playitems.length, 6);
                assert.equal(playitems[0]._id, playlistItem1._id);
                assert.equal(playitems[1]._id, playlistItem2._id);
                assert.equal(playitems[2]._id, playlistItem3._id);
                assert.equal(playitems[3]._id, playlistItem4._id);
                assert.equal(playitems[4]._id, playlistItem5._id);
                assert.equal(playitems[5]._id, playlistItem6._id);

                const playlistItemCheck1 = PlaylistItems.findOne(playlistItem11._id);
                assert.equal(playlistItemCheck1, null);
                const playlistItemCheck2 = PlaylistItems.findOne(playlistItem1._id);
                assert.notEqual(playlistItemCheck2, null);

                let playlistItem15 = Factory.create('playlistitem');
                let playlistItem16 = Factory.create('playlistitem');
                updatePlaylist._execute({userId: adminUserID}, {
                    _id: playlistId,
                    overlay: "wholy new text",
                    itemIds: [playlistItem15._id, playlistItem16._id]
                });
                const playlistCheck2 = Playlists.findOne(playlistId);
                assert.equal(playlistCheck2.overlay, "wholy new text");
                var playitemslist2 = playlistCheck2.itemsInOrder();
                assert.equal(playitemslist2.length, 2);
                assert.equal(playitemslist2[0]._id, playlistItem15._id);
                assert.equal(playitemslist2[1]._id, playlistItem16._id);

            });


            it('should remove playlist work fine', function () {
                let playlistItem1 = Factory.create('playlistitem');
                let playlistItem2 = Factory.create('playlistitem');
                const playlistId = insertPlaylist._execute({userId: adminUserID}, {
                    overlay: "Crated from Insert",
                    engagementId: Factory.create('engagement')._id,
                    presentationMachineId: Factory.create('presentationmachine')._id,
                    itemIds: [playlistItem1._id, playlistItem2._id]
                });

                const playlistItemCheck2 = PlaylistItems.findOne(playlistItem1._id);
                assert.notEqual(playlistItemCheck2, null, "playlist item should exist");

                removePlaylist._execute({userId: adminUserID}, {_id: playlistId});
                const playlistCheck = Playlists.findOne(playlistId);
                assert.equal(playlistCheck, null, "playlist should not exist after remove");

                const playlistItemCheck1 = PlaylistItems.findOne(playlistItem1._id);
                assert.equal(playlistItemCheck1, null, "playlist item should not exist after remove playlist");
            });


            it('"insertPlaylist" method should throw error "No authorized" if none role user', function () {
                let playlistItem1 = Factory.create('playlistitem');
                let playlistItem2 = Factory.create('playlistitem');

                assert.throws(() => {
                    insertPlaylist._execute({userId: noRoleUserId}, {
                        overlay: "Crated from Insert",
                        engagementId: Factory.create('engagement')._id,
                        presentationMachineId: Factory.create('presentationmachine')._id,
                        itemIds: [playlistItem1._id, playlistItem2._id]
                    });
                }, Meteor.Error);
            });

            it('"updatePlaylist" method should throw error "No authorized" if none role user', function () {

                const playlistItem1 = Factory.create('playlistitem');
                const playlistItem2 = Factory.create('playlistitem');
                const playlistId = Factory.create('playlist', {itemIds:[playlistItem1._id, playlistItem2._id]})
                const playlistItem3 = Factory.create('playlistitem');
                const playlistItem4 = Factory.create('playlistitem');
                const playlistItem5 = Factory.create('playlistitem');
                const playlistItem6 = Factory.create('playlistitem');

                const text = 'some new text';
                assert.throws(() => {
                    updatePlaylist._execute({userId: noRoleUserId}, {
                        _id: playlistId,
                        overlay: text,
                        itemIds: [playlistItem3._id, playlistItem4._id, playlistItem5._id, playlistItem6._id]
                    });
                }, Meteor.Error);
            });

            it('"overwritePlaylist" method should throw error "No authorized" if none role user', function () {
                const playlist = Factory.create('playlist');
                const canoncialPlaylist = Factory.create('canoncialplaylist');

                assert.throws(() => {
                    overwritePlaylist._execute({userId: noRoleUserId}, {playlistId: playlist._id, canoncialPlaylistId: canoncialPlaylist._id});
                }, Meteor.Error);
            });

            it('"appendMediaToPlaylist" method should throw error "No authorized" if none role user', function () {
                assert.throws(() => {
                    appendMediaToPlaylist._execute({userId: noRoleUserId}, {playlistId: Random.id(), mediaId: Random.id()});
                }, Meteor.Error);
            });

            it('"removePlaylist" method should throw error "No authorized" if none role user', function () {
                let playlistItem1 = Factory.create('playlistitem');
                let playlistItem2 = Factory.create('playlistitem');
                const playlist = Factory.create('playlist',{itemIds:[playlistItem1._id, playlistItem2._id]})

                assert.throws(() => {
                    removePlaylist._execute({userId: noRoleUserId}, {_id: playlist._id});
                }, Meteor.Error);
            });

        });


        describe('test favorite helper', function () {

            it('check for helper', function () {
                const playlist = Factory.create('playlist');
                assert.equal(playlist.isFavoritedBy(adminUserID), false);
                insertFavorite._execute({userId: adminUserID}, {
                    itemId: playlist._id,
                    favoriteType: FAVORITETYPES.PLAYLIST
                });
                assert.equal(playlist.isFavoritedBy(adminUserID), true);
            });
        });


        describe('test methods', function () {

            it('check overrite playlist should work fine.', function () {

                let presentationMachine1 = Factory.create('presentationmachine');
                let playlistItem1 = Factory.create('playlistitem');
                let playlistItem2 = Factory.create('playlistitem');
                let playlistItem3 = Factory.create('playlistitem');
                const playlist = Factory.create('playlist', {
                    itemIds: [playlistItem1._id, playlistItem2._id, playlistItem3._id],
                    presentationMachineId: presentationMachine1._id
                });
                const playerStatus = Factory.create('playerstatus', {
                    presentationMachineId: presentationMachine1._id,
                    playlistId: playlist._id,
                    playerUpdate: {playlistItemId: _.sample(playlist.itemIds), playedDuration: 0}
                });

                let playlistItem4 = Factory.create('playlistitem');
                let playlistItem5 = Factory.create('playlistitem');
                const canoncialPlaylist = Factory.create('canoncialplaylist', {
                    itemIds: [playlistItem4._id, playlistItem5._id],
                    presentationMachineId: presentationMachine1._id
                });
                overwritePlaylist._execute({userId: adminUserID}, {
                    playlistId: playlist._id,
                    canoncialPlaylistId: canoncialPlaylist._id
                });

                const playlistItemCheck1 = PlaylistItems.findOne(playlistItem1._id);
                assert.equal(playlistItemCheck1, null, "playlistitem should not exist after being overwrited");
                const playlistItemCheck2 = PlaylistItems.findOne(playlistItem2._id);
                assert.equal(playlistItemCheck2, null, "playlistitem should not exist after being overwrited");
                const playlistItemCheck3 = PlaylistItems.findOne(playlistItem3._id);
                assert.equal(playlistItemCheck3, null, "playlistitem should not exist after being overwrited");


                const playlistCheck = Playlists.findOne(playlist._id);
                const firstPlaylistItemId = playlistCheck.itemIds[0];
                assert.equal(playlistCheck.itemIds.length, 2);
                assert.notEqual(firstPlaylistItemId, playlistItem1._id);
                assert.notEqual(firstPlaylistItemId, playlistItem4._id);

                const playerStatusCheck = PlayerStatus.findOne({_id: playerStatus._id});
                assert.equal(playerStatusCheck.playerUpdate.playlistItemId, firstPlaylistItemId);
            });

            it('check overrite playlist should fail because of different presentation machine.', function () {

                let presentationMachine1 = Factory.create('presentationmachine');
                let playlistItem1 = Factory.create('playlistitem');
                let playlistItem2 = Factory.create('playlistitem');
                let playlistItem3 = Factory.create('playlistitem');
                const playlist = Factory.create('playlist', {
                    itemIds: [playlistItem1._id, playlistItem2._id, playlistItem3._id],
                    presentationMachineId: presentationMachine1._id
                });

                let playlistItem4 = Factory.create('playlistitem');
                let playlistItem5 = Factory.create('playlistitem');
                const canoncialPlaylist = Factory.create('canoncialplaylist', {
                    itemIds: [playlistItem4._id, playlistItem5._id],
                    presentationMachineId: Random.id()
                });

                assert.throws(() => {
                    overwritePlaylist._execute({userId: adminUserID}, {
                        playlistId: playlist._id,
                        canoncialPlaylistId: canoncialPlaylist._id
                    });
                }, Meteor.Error);
            });


            it('check append playlist with media should work fine.', function () {

                let presentationMachine1 = Factory.create('presentationmachine');
                let playlistItem1 = Factory.create('playlistitem');
                let playlistItem2 = Factory.create('playlistitem');
                let playlistItem3 = Factory.create('playlistitem');
                const playlist = Factory.create('playlist', {
                    itemIds: [playlistItem1._id, playlistItem2._id, playlistItem3._id],
                    presentationMachineId: presentationMachine1._id
                });

                let media = Factory.create('media', {presentationMachineIds: [Random.id(), presentationMachine1._id, Random.id()]});
                appendMediaToPlaylist._execute({userId: adminUserID}, {playlistId: playlist._id, mediaId: media._id});

                const playlistCheck = Playlists.findOne(playlist._id);
                assert.equal(playlistCheck.itemIds.length, 4);
                const playlistItemCheck = PlaylistItems.findOne(playlistCheck.itemIds[3]);
                assert.equal(playlistItemCheck.mediaId, media._id);
            });

            it('check append playlist should fail because of different presentation machine.', function () {

                let presentationMachine1 = Factory.create('presentationmachine');
                let playlistItem1 = Factory.create('playlistitem');
                let playlistItem2 = Factory.create('playlistitem');
                const playlist = Factory.create('playlist', {
                    itemIds: [playlistItem1._id, playlistItem2._id],
                    presentationMachineId: presentationMachine1._id
                });

                let media = Factory.create('media', {presentationMachineIds: [Random.id(), Random.id()]});

                assert.throws(() => {
                    appendMediaToPlaylist._execute({userId: adminUserID}, {
                        playlistId: playlist._id,
                        mediaId: media._id
                    });
                }, Meteor.Error);
            });

        });

        describe('publications', function () {

            beforeEach(function () {
                _.times(3, () => {
                    Factory.create('playlist');
                });
            });
            it('sends all playlists', function (done) {
                const collector = new PublicationCollector({userId: adminUserID});
                collector.collect(
                    'playlists',
                    {},
                    (collections) => {
                        chai.assert.equal(collections.Playlists.length, 3);
                        done();
                    }
                );
            });

            it('return nothing if no userId', function (done) {
                const collector = new PublicationCollector({});
                collector.collect(
                    'playlists',
                    {},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });
            it('"playlists" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'playlists',
                    {},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

            it('"playlists.andItems" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'playlists.andItems',
                    {},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

            it('"playlists.inEngagement" publication should return nothing if none role user', function (done) {
                const engagement = Factory.create('engagement')
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'playlists.inEngagement',
                    {engagementId: engagement._id},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

            it('"playlists.single" publication should return nothing if none role user', function (done) {
                const playlist = Factory.create('playlist')
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'playlists.single',
                    {playlistId: playlist._id},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

        });


    });
}
