/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { PresentationMachines } from './presentationmachines.js';
import { Medias } from '../medias/medias.js';
import { Playlists } from '/imports/api/playlists/playlists.js';
import { PlayerStatus } from '/imports/api/playerstatus/playerstatus.js';

import { insertPresentationMachine, updatePresentationMachine, removePresentationMachine } from './methods.js';
import { createTestAdminUser, createTestNoRoleUser } from '../users/methods';

import { resetDatabase } from 'meteor/xolvio:cleaner';
if (Meteor.isServer) {

  import './server/publications.js';

  describe('presentationMachines', function () {

    let adminUserID, noRoleUserId;
    beforeEach(function () {
      resetDatabase();
      adminUserID = createTestAdminUser.call({});
      noRoleUserId = createTestNoRoleUser.call({});
    });



    describe('mutators', function () {

      it('builds correctly from factory and insert', function () {
        this.timeout(15000);

        const presentationMachine = Factory.create('presentationmachine');
        assert.typeOf(presentationMachine, 'object');
        assert.typeOf(presentationMachine.createdAt, 'date');

        const presentationMachineId = insertPresentationMachine._execute({userId: adminUserID}, {name: "Created from Insert", cicId:Factory.create('cic')._id });
        assert.typeOf(presentationMachineId, 'string');
      });

      it('update work fine', function () {
        const createdAt = new Date(new Date() - 1000);
        let presentationMachine = Factory.create('presentationmachine', { createdAt });
        updatePresentationMachine._execute({userId: adminUserID}, {_id: presentationMachine._id, name: 'some new text', width:100, height: 200});
        presentationMachine = PresentationMachines.findOne(presentationMachine._id);
        assert.equal(presentationMachine.name, 'some new text');
        assert.equal(presentationMachine.createdAt.getTime(), createdAt.getTime());
      });

      it('Remove PresentationMachine', function () {
        const presentationMachine = Factory.create('presentationmachine');
        Factory.create('playlist',{presentationMachineId:presentationMachine._id});
        Factory.create('playlist',{presentationMachineId:presentationMachine._id});
        assert.equal(Playlists.find({presentationMachineId: presentationMachine._id}).count(),2);

        removePresentationMachine._execute({userId: adminUserID}, {_id: presentationMachine._id});

        const presentationMachineCheck = PresentationMachines.findOne(presentationMachine._id);
        assert.equal(presentationMachineCheck, null);
        assert.equal(Playlists.find({presentationMachineId: presentationMachine._id}).count(),0);

      });

      it('"insertPresentationMachine" method should throw error "No authorized" if none role user', function () {
          assert.throws(() => {
              insertPresentationMachine._execute({userId: noRoleUserId}, {name: "Created from Insert", cicId:Factory.create('cic')._id });
          }, Meteor.Error);
      });

      it('"updatePresentationMachine" method should throw error "No authorized" if none role user', function () {
          const createdAt = new Date(new Date() - 1000);
          let presentationMachine = Factory.create('presentationmachine', { createdAt });

          assert.throws(() => {
              updatePresentationMachine._execute({userId: noRoleUserId}, {_id: presentationMachine._id, name: 'some new text', width:100, height: 200});
          }, Meteor.Error);
      });

      it('"removePresentationMachine" method should throw error "No authorized" if none role user', function () {
          const presentationMachine = Factory.create('presentationmachine');

          assert.throws(() => {
              removePresentationMachine._execute({userId: noRoleUserId}, {_id: presentationMachine._id});
          }, Meteor.Error);
      });

    });


    describe('publications', function () {

      beforeEach(function () {
        _.times(3, () => {
          Factory.create('presentationmachine');
        });
      });

      it('sends all presentationMachines', function (done) {
        const collector = new PublicationCollector({userId: adminUserID});
        collector.collect(
            'presentationmachines',
            {},
            (collections) => {
              chai.assert.equal(collections.PresentationMachines.length, 3);
              done();
            }
        );
      });

      it('"presentationmachines" publication should return nothing if none role user', function (done) {
          const collector = new PublicationCollector({userId:noRoleUserId});
          collector.collect(
              'presentationmachines',
              {},
              (collections) => {
                  chai.assert.equal(Object.keys(collections).length, 0);
                  done();
              }
          );
      });

      it('"presentationAndEngagements" publication should return nothing if none role user', function (done) {
        const presentationMachine = Factory.create('presentationmachine')
          const collector = new PublicationCollector({userId:noRoleUserId});
          collector.collect(
              'presentationAndEngagements',
              {presentationMachineId:presentationMachine._id},
              (collections) => {
                  chai.assert.equal(Object.keys(collections).length, 0);
                  done();
              }
          );
      });

    });
  });
}
