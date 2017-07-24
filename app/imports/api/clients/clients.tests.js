/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Clients } from './clients.js';
import { Medias } from '../medias/medias.js';
import { Engagements } from '/imports/api/engagements/engagements.js';

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { insertClient, updateClient, removeClient} from './methods';
import { createTestAdminUser, createTestNoRoleUser } from '../users/methods';


if (Meteor.isServer) {
    import './server/publications.js';

    describe('clients', function () {

        let adminUserId, noRoleUserId;
        beforeEach(function () {
            resetDatabase();
            adminUserId = createTestAdminUser.call({});
            noRoleUserId = createTestNoRoleUser.call({});
        });



        describe('mutators', function () {
            it('builds correctly from factory and insert', function () {
                this.timeout(15000);

                const client = Factory.create('client');
                assert.typeOf(client, 'object');
                assert.typeOf(client.createdAt, 'date');

                const client1 = insertClient._execute({userId: adminUserId}, {name: "New Name", logoFileId: Random.id(), industryId: Random.id(), website:"http://newwebsite.com", facebook:"http://facebook.com", twitter:"http://newwebsite.com", instagram:"http://instagram.com/instagram"});
                assert.typeOf(client1, 'string');
            });


            it('should update work', function () {
                const createdAt = new Date(new Date() - 1000);
                let client = Factory.create('client', { createdAt });

                updateClient._execute({userId: adminUserId}, {_id: client._id, name: "New Name", logoFileId: Random.id(), industryId: Random.id(), website:"http://newwebsite.com"});
                client = Clients.findOne(client._id);
                assert.equal(client.name, "New Name");
                assert.equal(client.website, "http://newwebsite.com");
                assert.equal(client.createdAt.getTime(), createdAt.getTime());
            });


            it('Remove work fine', function () {
                const client = Factory.create('client');

                removeClient._execute({userId: adminUserId}, {_id: client._id});

                const client1 = Clients.findOne({_id: client._id})
                assert.equal(client1, null)
            });

            it('Remove should fail since engagement there', function () {
                const client = Factory.create('client');
                Factory.create('engagement', {clientId: client._id});
                Factory.create('engagement', {clientId: client._id});
                assert.throws(() => {
                    removeClient._execute({userId: adminUserId}, {_id: client._id});
                }, Meteor.Error);
            });
            it('Remove should succeed with force true', function () {
                const client = Factory.create('client');
                let engagement1 = Factory.create('engagement', {clientId: client._id});
                let engagement2 = Factory.create('engagement', {clientId: client._id});
                removeClient._execute({userId: adminUserId}, {_id: client._id, force: true});
                const client1 = Clients.findOne({_id: client._id})
                assert.equal(client1, null)
                const engagement1Check = Engagements.findOne({_id: engagement1._id})
                assert.equal(engagement1Check, null)
                const engagement2Check = Engagements.findOne({_id: engagement2._id})
                assert.equal(engagement2Check, null)

            });

            it('"insertClient" method should throw error "No authorized" if none role user', function () {
                assert.throws(() => {
                    insertClient._execute({userId: noRoleUserId}, {name: "New Name", logoFileId: Random.id(), industryId: Random.id(), website:"http://newwebsite.com", facebook:"http://facebook.com", twitter:"http://newwebsite.com", instagram:"http://instagram.com/instagram"});
                }, Meteor.Error);
            });

            it('"updateClient" method should throw error "No authorized" if none role user', function () {
                const createdAt = new Date(new Date() - 1000);
                let client = Factory.create('client', { createdAt });
                assert.throws(() => {
                    updateClient._execute({userId: noRoleUserId}, {
                        _id: client._id,
                        name: "New Name",
                        logoFileId: Random.id(),
                        industryId: Random.id(),
                        website: "http://newwebsite.com"
                    });
                }, Meteor.Error);
            });

            it('"removeClient" method should throw error "No authorized" if none role user', function () {
                const createdAt = new Date(new Date() - 1000);
                let client = Factory.create('client', { createdAt });
                assert.throws(() => {
                    removeClient._execute({userId: noRoleUserId}, {_id: client._id});
                }, Meteor.Error);
            });

        });


        describe('publications', function () {

            beforeEach(function () {
                _.times(3, () => {
                    Factory.create('client');
                });
            });
            it('sends all clients', function (done) {
                const collector = new PublicationCollector({userId: adminUserId});
                collector.collect(
                    'clients',
                    {},
                    (collections) => {
                        chai.assert.equal(collections.Clients.length, 3);
                        chai.assert.equal(collections.Industries.length, 3);
                        done();
                    }
                );
            });

            it('"clients" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId: noRoleUserId});
                collector.collect(
                    'clients',
                    {},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

            it('"logofiles" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId: noRoleUserId});
                collector.collect(
                    'logofiles',
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
