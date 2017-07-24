/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Engagements } from './engagements.js';
import { Playlists } from '/imports/api/playlists/playlists.js';
import { Medias } from '../medias/medias.js';
import { DOWNLOAD_STATUS } from '../downloadstatus/downloadstatus'
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { insertEngagement, updateEngagement, removeEngagement } from './methods.js';
import { createTestAdminUser, createTestNoRoleUser } from '../users/methods';


if (Meteor.isServer) {
    // eslint-disable-next-line import/no-unresolved
    import './server/publications.js';

    describe('engagements', function () {

        let adminUserID, noRoleUserId;
        beforeEach(function () {
            resetDatabase();
            adminUserID = createTestAdminUser.call({});
            noRoleUserId = createTestNoRoleUser.call({});
        });

        describe('mutators', function () {
            it('builds correctly from factory and insert', function () {
                this.timeout(15000);
                const engagement = Factory.create('engagement');
                assert.typeOf(engagement, 'object');
                assert.typeOf(engagement.createdAt, 'date');

                const engagementId = insertEngagement._execute({userId: adminUserID}, {name: "Created from Insert", clientId: Factory.create('client')._id, startTime: new Date(new Date() + 1000), endTime: new Date(new Date() + 10000)});
                assert.typeOf(engagementId, 'string');
            });

            it('shoud insert with no date', function () {
                const engagementId = insertEngagement._execute({userId: adminUserID}, {name: "Created from Insert", clientId: Factory.create('client')._id, star : true});
                assert.typeOf(engagementId, 'string');
            });

            it('update engagement should work fine', function () {
                this.timeout(15000);

                const createdAt = new Date(new Date() - 1000);
                let engagement = Factory.create('engagement', { createdAt });
                updateEngagement._execute({userId: adminUserID}, {_id: engagement._id,name:"Hala", startTime: new Date(new Date() + 1000), endTime: new Date(new Date() + 10000), clientId: Random.id()});
                engagement = Engagements.findOne(engagement._id);
                assert.equal(engagement.name, "Hala");
                assert.equal(engagement.createdAt.getTime(), createdAt.getTime());
            });

            it('Remove Engagement should work fine', function () {
                const engagement = Factory.create('engagement');
                const playlist1 = Factory.create('playlist', {engagementId: engagement._id});
                const playlist2 = Factory.create('playlist', {engagementId: engagement._id});

                let engagement1 = Engagements.findOne(engagement._id);
                assert.notEqual(engagement1, null);

                let playlist1Check = Playlists.findOne(playlist1._id);
                assert.notEqual(playlist1Check, null);
                let playlist2Check = Playlists.findOne(playlist2._id);
                assert.notEqual(playlist2Check, null);

                removeEngagement._execute({userId: adminUserID}, {_id: engagement._id});
                let engagement2 = Engagements.findOne(engagement._id);
                assert.equal(engagement2, null);

                let playlist1Check1 = Playlists.findOne(playlist1._id);
                assert.equal(playlist1Check1, null);
                let playlist2Check1 = Playlists.findOne(playlist2._id);
                assert.equal(playlist2Check1, null);

            });

            it('Remove engagement should fail since has current playing list', function () {
                const engagement = Factory.create('engagement');
                const playlist = Factory.create('playlist', {engagementId: engagement._id});
                Factory.create('playerstatus', {playlistId:playlist._id, presentationMachineId:playlist.presentationMachineId})

                assert.throws(() => {
                    removeEngagement._execute({userId: adminUserID}, {_id: engagement._id});
                }, Meteor.Error);
            });

            it('Remove engagement should succeed with force true although it has current playing list', function () {
                const engagement = Factory.create('engagement');
                const playlist1 = Factory.create('playlist', {engagementId: engagement._id});
                const playlist2 = Factory.create('playlist', {engagementId: engagement._id});
                Factory.create('playerstatus', {playlistId:playlist1._id, presentationMachineId:playlist1.presentationMachineId})
                removeEngagement._execute({userId: adminUserID}, {_id: engagement._id, force: true});
                const engagementCheck = Engagements.findOne({_id: engagement._id})
                assert.equal(engagementCheck, null)
                const playlist1Check = Playlists.findOne({_id: playlist1._id})
                assert.equal(playlist1Check, null)
                const playlist2Check = Playlists.findOne({_id: playlist2._id})
                assert.equal(playlist2Check, null)

            });

            it('"insertEngagement" method should throw error "No authorized" if none role user', function () {
                assert.throws(() => {
                    insertEngagement._execute({userId: noRoleUserId}, {name: "Crated from Insert", clientId: Factory.create('client')._id, startTime: new Date(new Date() + 1000), endTime: new Date(new Date() + 10000)});
                }, Meteor.Error);
            });

            it('"updateEngagement" method should throw error "No authorized" if none role user', function () {
                const createdAt = new Date(new Date() - 1000);
                let engagement = Factory.create('engagement', { createdAt });

                assert.throws(() => {
                    updateEngagement._execute({userId: noRoleUserId}, {_id: engagement._id,name:"Hala", startTime: new Date(new Date() + 1000), endTime: new Date(new Date() + 10000), clientId: Random.id()});
                }, Meteor.Error);
            });

            it('"removeEngagement" method should throw error "No authorized" if none role user', function () {
                const engagement = Factory.create('engagement');

                assert.throws(() => {
                    removeEngagement._execute({userId: noRoleUserId}, {_id: engagement._id});
                }, Meteor.Error);
            });

        });

        describe('test helpers', function () {
            it('Engagement isReady ( fully downloaded )', function () {
                const presentationMachine = Factory.create('presentationmachine');
                const media = Factory.create('media',{presentationMachineIds : [presentationMachine._id]});
                const playlistItem = Factory.create('playlistitem', {mediaId : media._id })
                const engagement = Factory.create('engagement');
                const playlist = Factory.create('playlist', {engagementId : engagement._id, itemIds : [playlistItem._id], presentationMachineId : presentationMachine._id})

                assert.equal(engagement.isReady(presentationMachine._id), false);
                const downloadstatus = Factory.create('downloadstatus',{mediaId : media._id , status : DOWNLOAD_STATUS.DOWNLOADED, presentationMachineId : presentationMachine._id})
                assert.equal(engagement.isReady(presentationMachine._id), true);
            });

            it('Engagement isPlaying ( a playlist of this engagement is playing on presenter now)', function() {
                const media = Factory.create('media')
                const playlistItem = Factory.create('playlistitem', {mediaId: media._id})
                const engagement = Factory.create('engagement')
                const playlist = Factory.create('playlist', {engagementId:engagement._id, itemIds:[playlistItem._id]})

                assert.equal(engagement.isPlaying(), false)
                Factory.create('playerstatus', {playlistId:playlist._id, playerUpdate:{playlistItemId:playlistItem._id,playedDuration:0}})
                assert.equal(engagement.isPlaying(), true)
            })

            it('Engagement.presentationMachines() should get prensentation machines of this engagement', function() {
                const engagement = Factory.create('engagement');
                const playlist1 = Factory.create('playlist', {engagementId: engagement._id});
                const playlist2 = Factory.create('playlist', {engagementId: engagement._id});


                assert.equal(Engagements.findOne(engagement._id).presentationMachines().length, 2)
            })
        });

        describe('publications', function () {

            beforeEach(function () {
                this.timeout(15000);
                _.times(3, () => {
                    Factory.create('engagement');
                });
            });
            it('sends all engagements', function (done) {
                const collector = new PublicationCollector({userId: adminUserID});
                collector.collect(
                    'engagements',
                    {},
                    (collections) => {
                        chai.assert.equal(collections.Engagements.length, 3);
                        done();
                    }
                );
            });

            it('"engagements" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'engagements',
                    {},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

            it('"engagements.today" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'engagements.today',
                    {todayStartTime: new Date(), todayEndTime: new Date()},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

            it('"engagement.single" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'engagement.single',
                    {engagementId: Engagements.findOne()._id},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

        });


    });
}
