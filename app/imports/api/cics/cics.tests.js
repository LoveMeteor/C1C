/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Cics } from './cics.js';
import { Medias } from '../medias/medias.js';

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { insertCic, updateCic, removeCic} from './methods';
import { createTestAdminUser, createTestNoRoleUser } from '../users/methods';
import { PresentationMachines } from  '/imports/api/presentationmachines/presentationmachines'


if (Meteor.isServer) {
    import './server/publications.js';

    describe('cics', function () {

        let adminUserId, noRoleUserId;
        beforeEach(function () {
            resetDatabase();
            adminUserId = createTestAdminUser.call({});
            noRoleUserId = createTestNoRoleUser.call({});
        });



        describe('mutators', function () {
            it('builds correctly from factory and insert', function () {
                this.timeout(15000);

                const cic = Factory.create('cic');
                assert.typeOf(cic, 'object');
                assert.typeOf(cic.createdAt, 'date');

                const cic1 = insertCic._execute({userId: adminUserId}, {name: "New Name", logo: "New Logo", website:"http://newwebsite.com"});
                assert.typeOf(cic1, 'string');
            });


            it('should update work correctly', function () {
                const createdAt = new Date(new Date() - 1000);
                let cic = Factory.create('cic', { createdAt });

                updateCic._execute({userId: adminUserId}, {_id: cic._id, name: "New Name", logo: "New Logo", website:"http://newwebsite.com"});
                cic = Cics.findOne(cic._id);
                assert.equal(cic.name, "New Name");
                assert.equal(cic.logo, "New Logo");
                assert.equal(cic.website, "http://newwebsite.com");
                assert.equal(cic.createdAt.getTime(), createdAt.getTime());
            });


            it('should remove CIC work correctly', function () {
                let cic = Factory.create('cic');
                let pm1 = Factory.create('presentationmachine', {cicId:cic._id});
                let pm2 = Factory.create('presentationmachine', {cicId:cic._id});
                assert.equal(PresentationMachines.find({cicId: cic._id}).count(),2);
                removeCic._execute({userId: adminUserId}, {_id: cic._id});
                let cicCheck = Cics.findOne(cic._id);
                assert.equal(cicCheck, null);
                assert.equal(PresentationMachines.find({cicId: cic._id}).count(),0);
            });


            it('"insertCic" method should throw error "No authorized" if none role user', function () {
                assert.throws(() => {
                    insertCic._execute({userId: noRoleUserId}, {name: "New Name", logo: "New Logo", website:"http://newwebsite.com"});
                }, Meteor.Error);
            });

            it('"updateCic" method should throw error "No authorized" if none role user', function () {
                const createdAt = new Date(new Date() - 1000);
                let cic = Factory.create('cic', { createdAt });

                assert.throws(() => {
                    updateCic._execute({userId: noRoleUserId}, {_id: cic._id, name: "New Name", logo: "New Logo", website:"http://newwebsite.com"});
                }, Meteor.Error);
            });

            it('"removeCic" method should throw error "No authorized" if none role user', function () {
                let cic = Factory.create('cic');

                assert.throws(() => {
                    removeCic._execute({userId: noRoleUserId}, {_id: cic._id});
                }, Meteor.Error);
            });

        });


        describe('publications', function () {

            beforeEach(function () {
                _.times(3, () => {
                    Factory.create('cic');
                });
            });

            it('sends all cics', function (done) {

                const collector = new PublicationCollector({userId: adminUserId});
                collector.collect(
                    'cics',
                    {},
                    (collections) => {
                        chai.assert.equal(collections.Cics.length, 3);
                        done();
                    }
                );
            });


            it('"cics" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId: noRoleUserId});
                collector.collect(
                    'cics',
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
