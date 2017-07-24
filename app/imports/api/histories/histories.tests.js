/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Histories } from './histories.js';

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { insertHistory, removeHistory} from './methods';
import { createTestAdminUser, createTestNoRoleUser } from '../users/methods';

if (Meteor.isServer) {
    // eslint-disable-next-line import/no-unresolved
import './server/publications.js';

    describe('histories', function () {

        let adminUserID, noRoleUserId;

        beforeEach(function () {
            resetDatabase();
            adminUserID = createTestAdminUser.call({});
            noRoleUserId = createTestNoRoleUser.call({});
        });


        describe('mutators', function () {
            it('builds correctly from factory and insert', function () {
                this.timeout(15000);
                const history = Factory.create('history');
                assert.typeOf(history, 'object');
                assert.typeOf(history.createdAt, 'date');

                const historyId = insertHistory._execute({userId: adminUserID}, {playedAt: new Date(new Date() - 1000), playlistId: Factory.create('playlist')._id, engagementId:Random.id(), mediaId: Factory.create('media')._id});
                assert.typeOf(historyId, 'string');
            });


            it('Remove should work', function () {
                const history = Factory.create('history');
                const historyToCheck1 = Histories.findOne({_id: history._id});
                assert.notEqual(historyToCheck1, null);

                removeHistory._execute({userId: adminUserID}, {_id: history._id});
                const historyToCheck2 = Histories.findOne({_id: history._id});
                assert.equal(historyToCheck2, null);
            });

            it('"insertHistory" method should throw error "No authorized" if none role user', function () {
                assert.throws(() => {
                    insertHistory._execute({userId: noRoleUserId}, {playedAt: new Date(new Date() - 1000), playlistId: Factory.create('playlist')._id, engagementId:Random.id(), mediaId: Factory.create('media')._id});
                }, Meteor.Error);
            });

            it('"removeHistory" method should throw error "No authorized" if none role user', function () {

                const history = Factory.create('history');

                assert.throws(() => {
                    removeHistory._execute({userId: noRoleUserId}, {_id: history._id});
                }, Meteor.Error);
            });

        });


        describe('publications', function () {

            beforeEach(function () {
                _.times(3, () => {
                    Factory.create('history');
                });
            });
            it('sends all histories', function (done) {
                const collector = new PublicationCollector({userId: adminUserID});
                collector.collect(
                    'histories',
                    {},
                    (collections) => {
                        chai.assert.equal(collections.Histories.length, 3);
                        done();
                    }
                );
            });
            it('"histories" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'histories',
                    {},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

        });

    });
}
