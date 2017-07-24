/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import {Meteor} from 'meteor/meteor';
import {Factory} from 'meteor/dburles:factory';
import {PublicationCollector} from 'meteor/johanbrook:publication-collector';
import {chai, assert} from 'meteor/practicalmeteor:chai';
import {Random} from 'meteor/random';
import {_} from 'meteor/underscore';

import {CanoncialPlaylists} from './canoncialplaylists.js';

import {resetDatabase} from 'meteor/xolvio:cleaner';
import {
    insertCanoncialPlaylist,
    updateCanoncialPlaylist,
    removeCanoncialPlaylist,
    updateCanoncialPlaylistItems
} from './methods';
import {createTestAdminUser, createTestNoRoleUser} from '../users/methods';

import {Favorites, FAVORITETYPES} from '../favorites/favorites';
import {insertFavorite, removeFavorite} from '../favorites/methods';
import {PlaylistItems} from '/imports/api/playlistitems/playlistitems';
import {DOWNLOAD_STATUS} from '../downloadstatus/downloadstatus'

if (Meteor.isServer) {
    // eslint-disable-next-line import/no-unresolved
import
    './server/publications.js';

    describe('canoncialPlaylists', function () {

        let adminUserId, noRoleUserId;

        beforeEach(function () {
            resetDatabase();
            adminUserId = createTestAdminUser.call({});
            noRoleUserId = createTestNoRoleUser.call({});
        });


        describe('mutators', function () {
            it('builds correctly from factory and insert', function () {
                this.timeout(15000);
                const playlistId = Factory.create('canoncialplaylist');
                assert.typeOf(playlistId, 'object');
                assert.typeOf(playlistId.createdAt, 'date');

                const playlistId1 = insertCanoncialPlaylist._execute({userId: adminUserId}, {
                    name: "Crated from Insert",
                    presentationMachineId: Factory.create('presentationmachine')._id,
                    themeId: Factory.create('theme')._id,
                    tagIds: [Factory.create('tag')._id, Factory.create('tag')._id]
                });
                assert.typeOf(playlistId1, 'string');
            });

            it('check for helpers', function () {
                const playlistId = insertCanoncialPlaylist._execute({userId: adminUserId}, {
                    name: "Crated from Insert",
                    presentationMachineId: Factory.create('presentationmachine')._id,
                    themeId: Factory.create('theme')._id,
                    tagIds: [Factory.create('tag')._id, Factory.create('tag')._id]
                });
                var cplaylist = CanoncialPlaylists.findOne(playlistId);
                assert.typeOf(cplaylist.presentationMachine(), 'object');
                assert.typeOf(cplaylist.theme(), 'object');
                assert.equal(cplaylist.tags().fetch().length, 2);
                assert.equal(cplaylist.industries().fetch(), 0);
            });


            it('update Playlist work correctly', function () {
                const createdAt = new Date(new Date() - 1000);
                let canoncialPlaylist = Factory.create('canoncialplaylist', {createdAt});
                const text = 'some new text';
                updateCanoncialPlaylist._execute({userId: adminUserId}, {
                    _id: canoncialPlaylist._id,
                    name: text,
                    presentationMachineId: Factory.create('presentationmachine')._id,
                    themeId: Random.id()
                });
                canoncialPlaylist = CanoncialPlaylists.findOne(canoncialPlaylist._id);
                assert.equal(canoncialPlaylist.name, text);
                assert.equal(canoncialPlaylist.createdAt.getTime(), createdAt.getTime());
            });


            it('remove playlist', function () {
                const playlist = Factory.create('canoncialplaylist');
                removeCanoncialPlaylist._execute({userId: adminUserId}, {_id: playlist._id});
                let canoncialPlaylist = CanoncialPlaylists.findOne(playlist._id);
                assert.equal(canoncialPlaylist, null);
            });

        });

        describe('test favorite helper', function () {

            it('check for helper', function () {
                const playlistId = Factory.create('canoncialplaylist');
                var cplaylist = CanoncialPlaylists.findOne(playlistId);
                assert.equal(cplaylist.isFavoritedBy(adminUserId), false);
                insertFavorite._execute({userId: adminUserId}, {
                    itemId: cplaylist._id,
                    favoriteType: FAVORITETYPES.CANONCIALPLAYLIST
                });
                assert.equal(cplaylist.isFavoritedBy(adminUserId), true);
            });
            it('check isReady ( fully downloaded )', function () {
                const presentationMachine = Factory.create('presentationmachine');
                const media = Factory.create('media', {presentationMachineIds: [presentationMachine._id]});
                const playlistItem = Factory.create('playlistitem', {mediaId: media._id})
                const playlist = Factory.create('canoncialplaylist', {
                    itemIds: [playlistItem._id],
                    presentationMachineId: presentationMachine._id
                })

                assert.equal(playlist.isReady(), false);
                const downloadstatus = Factory.create('downloadstatus', {
                    mediaId: media._id,
                    status: DOWNLOAD_STATUS.DOWNLOADED,
                    presentationMachineId: presentationMachine._id
                })
                assert.equal(playlist.isReady(), true);
            });

        });


        describe('test methods', function () {

            it('check overrite playlist should work fine.', function () {
                this.timeout(15000);
                let presentationMachine1 = Factory.create('presentationmachine');
                let playlistItem1 = Factory.create('playlistitem');
                let playlistItem2 = Factory.create('playlistitem');
                let playlistItem3 = Factory.create('playlistitem');
                const playlist = Factory.create('canoncialplaylist', {
                    itemIds: [playlistItem1._id, playlistItem2._id, playlistItem3._id],
                    presentationMachineId: presentationMachine1._id
                });

                let playlistItem4 = Factory.create('playlistitem');
                let playlistItem5 = Factory.create('playlistitem');
                updateCanoncialPlaylistItems._execute({userId: adminUserId}, {
                    _id: playlist._id,
                    itemIds: [playlistItem1._id, playlistItem4._id, playlistItem5._id]
                });

                const playlistItemCheck1 = PlaylistItems.findOne(playlistItem1._id);
                assert.notEqual(playlistItemCheck1, null);
                const playlistItemCheck2 = PlaylistItems.findOne(playlistItem2._id);
                assert.equal(playlistItemCheck2, null, "playlistitem should not exist after being overwrited");
                const playlistItemCheck3 = PlaylistItems.findOne(playlistItem3._id);
                assert.equal(playlistItemCheck3, null, "playlistitem should not exist after being overwrited");
                const playlistItemCheck4 = PlaylistItems.findOne(playlistItem4._id);
                assert.notEqual(playlistItemCheck4, null);
                const playlistItemCheck5 = PlaylistItems.findOne(playlistItem5._id);
                assert.notEqual(playlistItemCheck5, null);


                const playlistCheck = CanoncialPlaylists.findOne(playlist._id);
                assert.equal(playlistCheck.itemIds.length, 3);
                assert.equal(playlistCheck.itemIds[0], playlistItem1._id);
                assert.equal(playlistCheck.itemIds[1], playlistItem4._id);
                assert.equal(playlistCheck.itemIds[2], playlistItem5._id);
            });

            it('"insertCanoncialPlaylist" method should throw error "No authorized" if none role user', function () {
                assert.throws(() => {
                    insertCanoncialPlaylist._execute({userId: noRoleUserId}, {
                        name: "Crated from Insert",
                        presentationMachineId: Factory.create('presentationmachine')._id,
                        themeId: Factory.create('theme')._id,
                        tagIds: [Factory.create('tag')._id, Factory.create('tag')._id]
                    });
                }, Meteor.Error);
            });

            it('"updateCanoncialPlaylist" method should throw error "No authorized" if none role user', function () {
                const createdAt = new Date(new Date() - 1000);
                let canoncialPlaylist = Factory.create('canoncialplaylist', {createdAt});
                const text = 'some new text';

                assert.throws(() => {
                    updateCanoncialPlaylist._execute({userId: noRoleUserId}, {
                        _id: canoncialPlaylist._id,
                        name: text,
                        presentationMachineId: Factory.create('presentationmachine')._id,
                        themeId: Random.id()
                    })
                }, Meteor.Error);
            });

            it('"updateCanoncialPlaylistItems" method should throw error "No authorized" if none role user', function () {
                let presentationMachine1 = Factory.create('presentationmachine');
                let playlistItem1 = Factory.create('playlistitem');
                let playlistItem2 = Factory.create('playlistitem');
                let playlistItem3 = Factory.create('playlistitem');
                const playlist = Factory.create('canoncialplaylist', {
                    itemIds: [playlistItem1._id, playlistItem2._id, playlistItem3._id],
                    presentationMachineId: presentationMachine1._id
                });

                let playlistItem4 = Factory.create('playlistitem');
                let playlistItem5 = Factory.create('playlistitem');
                assert.throws(() => {
                    updateCanoncialPlaylistItems._execute({userId: noRoleUserId}, {
                        _id: playlist._id,
                        itemIds: [playlistItem1._id, playlistItem4._id, playlistItem5._id]
                    });
                }, Meteor.Error);
            });

            it('"removeCanoncialPlaylist" method should throw error "No authorized" if none role user', function () {
                const playlist = Factory.create('canoncialplaylist');

                assert.throws(() => {
                    removeCanoncialPlaylist._execute({userId: noRoleUserId}, {_id: playlist._id});
                }, Meteor.Error);
            });

        });


        describe('publications', function () {

            beforeEach(function () {
                _.times(3, () => {
                    Factory.create('canoncialplaylist');
                });
            });

            it('sends all canoncialPlaylists', function (done) {
                const collector = new PublicationCollector({userId: adminUserId});
                collector.collect(
                    'canoncialPlaylists',
                    {},
                    (collections) => {
                        chai.assert.equal(collections.CanoncialPlaylists.length, 3);
                        done();
                    }
                );
            });


            it('"canoncialPlaylists" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId: noRoleUserId});
                collector.collect(
                    'canoncialPlaylists',
                    {},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

            it('"canoncialPlaylists.single" publication should return nothing if none role user', function (done) {
                const playlist = CanoncialPlaylists.findOne({});

                const collector = new PublicationCollector({userId: noRoleUserId});
                collector.collect(
                    'canoncialPlaylists.single',
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
