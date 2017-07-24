/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { PlayerStatus, PLAYINGSTATUS } from './playerstatus.js';

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { updatePlayerStatus, runAmbientPlaylist, runEngagementPlaylist, runSpecificPlaylistItem, updatePlaylistItemId, updateDuration, runAmbientPlaylistFromPlayer } from './methods';
import { createTestAdminUser, createTestNoRoleUser } from '../users/methods';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

if (Meteor.isServer) {
    // eslint-disable-next-line import/no-unresolved
import './server/publications.js';

    describe('PlayerStatus', function () {

        var presentationMachine;

        var adminUserID;
        let pmUser;
        let noRoleUserId;
        beforeEach(function () {
            resetDatabase();
            adminUserID = createTestAdminUser.call({});
            presentationMachine = Factory.create('presentationmachine');
            pmUser = Factory.create('user', {presentationMachineId: presentationMachine._id});
            Roles.addUsersToRoles(pmUser._id, [ROLES.MACHINE], Roles.GLOBAL_GROUP);
            PlayerStatus.insert({
                presentationMachineId: presentationMachine._id
            });
            noRoleUserId = createTestNoRoleUser.call({});
        });


        describe('mutators', function () {
            it('builds correctly from update', function () {
                this.timeout(15000);

                const playerStatus = updatePlayerStatus._execute({userId: adminUserID}, {presentationMachineId: presentationMachine._id, playlistId: Random.id(), playingStatus: PLAYINGSTATUS.PLAYING});
                assert.equal(playerStatus, 1);
            });

        });

        describe('test methods', function () {
            var ambientPlaylist;
            var engagementPlaylist;
            var engagement;
            var item;
            beforeEach(function () {
                engagement = Factory.create('engagement');
                ambientPlaylist = Factory.create('playlist', {ambientPlaylist: true, presentationMachineId: presentationMachine._id});
                Factory.create('playlist', {ambientPlaylist: true});
                item = Factory.create('playlistitem');
                engagementPlaylist = Factory.create('playlist', {presentationMachineId: presentationMachine._id, engagementId: engagement._id, itemIds : [item._id]});
                Factory.create('playlist', {presentationMachineId: presentationMachine._id});
                Factory.create('playlist', {engagementId: engagement._id});
            });
            it('run ambient playlist', function () {
                const result = runAmbientPlaylist._execute({userId: adminUserID}, {presentationMachineId: presentationMachine._id});
                assert.equal(result, true);
                let playerStatus = PlayerStatus.findOne({presentationMachineId: presentationMachine._id});
                assert.equal(playerStatus.playlistId, ambientPlaylist._id);
            });
            it('run engagement playlist', function () {
                const result = runEngagementPlaylist._execute({userId: adminUserID}, {presentationMachineId: presentationMachine._id, engagementId: engagement._id});
                assert.equal(result, true);
                let playerStatus = PlayerStatus.findOne({presentationMachineId: presentationMachine._id});
                assert.equal(playerStatus.playlistId, engagementPlaylist._id);
            });
            it('run specific playlist item', function () {
                let playlist = Factory.create('playlist', {presentationMachineId: presentationMachine._id, itemIds:[Random.id(), Random.id(), Random.id()]});
                const result = runSpecificPlaylistItem._execute({userId: adminUserID}, {presentationMachineId: presentationMachine._id, playlistId: playlist._id, playlistItemId: playlist.itemIds[1]});
                assert.equal(result, true);
                let playerStatus = PlayerStatus.findOne({presentationMachineId: presentationMachine._id});
                assert.equal(playerStatus.playlistId, playlist._id);
                assert.equal(playerStatus.playerUpdate.playlistItemId, playlist.itemIds[1]);
            });
            it('run ambient playlist from player', function () {
                const result = runAmbientPlaylistFromPlayer._execute({userId: pmUser._id}, {});
                assert.equal(result, true);
                let playerStatus = PlayerStatus.findOne({presentationMachineId: presentationMachine._id});
                assert.equal(playerStatus.playlistId, ambientPlaylist._id);
            });


            it('"updatePlayerStatus" method should throw error "No authorized" if none role user', function () {
                assert.throws(() => {
                    updatePlayerStatus._execute({userId: noRoleUserId}, {presentationMachineId: presentationMachine._id, playlistId: Random.id(), playingStatus: PLAYINGSTATUS.PLAYING});
                }, Meteor.Error);
            });

            it('"runAmbientPlaylist" method should throw error "No authorized" if none role user', function () {
                assert.throws(() => {
                    runAmbientPlaylist._execute({userId: noRoleUserId}, {presentationMachineId: presentationMachine._id});
                }, Meteor.Error);
            });

            it('"runEngagementPlaylist" method should throw error "No authorized" if none role user', function () {
                assert.throws(() => {
                    runEngagementPlaylist._execute({userId: noRoleUserId}, {presentationMachineId: presentationMachine._id, engagementId: engagement._id});
                }, Meteor.Error);
            });

            it('"runSpecificPlaylistItem" method should throw error "No authorized" if none role user', function () {
                let playlist = Factory.create('playlist', {presentationMachineId: presentationMachine._id, itemIds:[Random.id(), Random.id(), Random.id()]});

                assert.throws(() => {
                    runSpecificPlaylistItem._execute({userId: noRoleUserId}, {presentationMachineId: presentationMachine._id, playlistId: playlist._id, playlistItemId: playlist.itemIds[1]});
                }, Meteor.Error);
            });

            it('"updatePlaylistItemId" method should throw error "No authorized" if none role user', function () {
                const item = Factory.create('playlistitem');

                assert.throws(() => {
                    updatePlaylistItemId._execute({userId: noRoleUserId}, {playlistItemId: item._id, updatedTime:300, playedDuration:10});
                }, Meteor.Error);
            });

            it('"updateDuration" method should throw error "No authorized" if none role user', function () {
                const item = Factory.create('playlistitem');

                assert.throws(() => {
                    updateDuration._execute({userId: noRoleUserId}, {updatedTime:300, playedDuration:10});
                }, Meteor.Error);
            });

            it('"runAmbientPlaylistFromPlayer" method should throw error "No authorized" if none role user', function () {
                assert.throws(() => {
                    runAmbientPlaylistFromPlayer._execute({userId: noRoleUserId}, {});
                }, Meteor.Error);
            });

        });
        describe('publications', function () {
            let pmUser;
            beforeEach(function () {
                PlayerStatus.insert({
                    presentationMachineId: Random.id()
                });
               pmUser = Factory.create('user', {presentationMachineId: presentationMachine._id});
                Roles.addUsersToRoles(pmUser._id, [ ROLES.MACHINE ], Roles.GLOBAL_GROUP );
            });

            it('should have 2 for admin', function (done) {

                const collector = new PublicationCollector({userId: adminUserID});
                collector.collect(
                    'playerstatus',
                    {},
                    (collections) => {
                        chai.assert.equal(collections.PlayerStatus.length, 2);
                        done();
                    }
                );
            });

            it('should have 1 for presenter machine', function (done) {
                const collector = new PublicationCollector({userId: pmUser._id});
                collector.collect(
                    'playerstatus',
                    {},
                    (collections) => {
                        chai.assert.equal(collections.PlayerStatus.length, 1);
                        done();
                    }
                );
            });


            it('"playerstatus" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'playerstatus',
                    {},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

            it('"playerstatusAndPlaylist" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'playerstatusAndPlaylist',
                    {},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

            it('"playerstatus.single" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'playerstatus.single',
                    presentationMachine._id,
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

        });

    });
}
