/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '/imports/api/users/users.js';

import { DownloadStatus, DOWNLOAD_STATUS } from './downloadstatus.js';
import { PresentationMachines } from '../presentationmachines/presentationmachines.js';
import { updateDownloadStatus , flushDownloadStatus } from './methods';
import { createTestAdminUser, createTestNoRoleUser } from '../users/methods';

if (Meteor.isServer) {
  // eslint-disable-next-line import/no-unresolved
  import './server/publications.js';

  describe('downloadstatus', function () {

    let adminUserID;
    let presentationMachine;
    let pmUser;
    let noRoleUserId;
    beforeEach(function () {
      resetDatabase();
      adminUserID = createTestAdminUser.call({});
      presentationMachine = Factory.create('presentationmachine');
      pmUser = Factory.create('user', {presentationMachineId: presentationMachine._id});
      Roles.addUsersToRoles(pmUser._id, [ROLES.MACHINE], Roles.GLOBAL_GROUP);
      noRoleUserId = createTestNoRoleUser.call({});
    });

    describe('mutators', function () {
      it('builds correctly from factory', function () {
        this.timeout(15000);

        const downloadstatus = Factory.create('downloadstatus');
        assert.typeOf(downloadstatus, 'object');
        assert.typeOf(downloadstatus.createdAt, 'date');
      });

      it('should throw an error if admin try to update', function () {
        assert.throws(() => {
          updateDownloadStatus._execute({userId: adminUserID}, { mediaId: Random.id(), status: DOWNLOAD_STATUS.DOWNLOADED});
        }, Meteor.Error);
      });

      it('should update fine', function () {
        let statusId = updateDownloadStatus._execute({userId: pmUser._id}, {mediaId: Random.id(), status: DOWNLOAD_STATUS.DOWNLOADED});
        assert.typeOf(statusId, 'string');
      });

      it('should update existing status to new value', function () {
        let media = Factory.create('media');
        let statusId = updateDownloadStatus._execute({userId: pmUser._id}, {mediaId: media._id, status: DOWNLOAD_STATUS.INPROGRESS, progress: 10});
        updateDownloadStatus._execute({userId: pmUser._id}, {mediaId: media._id, status: DOWNLOAD_STATUS.DOWNLOADED});
        let status = DownloadStatus.findOne(statusId);
        assert.equal(status.status, DOWNLOAD_STATUS.DOWNLOADED);
      });
      it('should remove all the status from a PM', function () {
        // Create 3 objects
        _.times(3, () => {
          let downloadStatus = Factory.create('downloadstatus', {presentationMachineId: presentationMachine._id});
          Factory.create('downloadstatus');
        });
        flushDownloadStatus._execute({userId: pmUser._id}, {presentationMachineId : presentationMachine._id})
        assert.equal(DownloadStatus.find( {presentationMachineId : presentationMachine._id}).fetch().length, 0);
      });


      it('"updateDownloadStatus" method should throw error "No authorized" if none role user', function () {
          assert.throws(() => {
              updateDownloadStatus._execute({userId: noRoleUserId}, { mediaId: Random.id(), status: DOWNLOAD_STATUS.DOWNLOADED});
          }, Meteor.Error);
      });

      it('"flushDownloadStatus" method should throw error "No authorized" if none role user', function () {
          // Create 3 objects
          _.times(3, () => {
              let downloadStatus = Factory.create('downloadstatus', {presentationMachineId: presentationMachine._id});
              Factory.create('downloadstatus');
          });

          assert.throws(() => {
              flushDownloadStatus._execute({userId: noRoleUserId}, {presentationMachineId : presentationMachine._id})
          }, Meteor.Error);
      });

    });

    describe('publications', function () {
      beforeEach(function () {
        _.times(3, () => {
          let downloadStatus = Factory.create('downloadstatus', {presentationMachineId: presentationMachine._id});
          Factory.create('downloadstatus');
        });
      });

      it('sends all download status', function (done) {
        const collector = new PublicationCollector({userId: pmUser._id});
        collector.collect(
            'downloadstatus.presentationmachine',
            { presentationMachineId: presentationMachine._id },
            (collections) => {
              chai.assert.equal(collections.DownloadStatus.length, 3);
              done();
            }
        );
      });

      it('sends all download status', function (done) {
        const collector = new PublicationCollector({userId: adminUserID});
        collector.collect(
            'downloadstatus',
            { },
            (collections) => {
              chai.assert.equal(collections.DownloadStatus.length, 6);
              done();
            }
        );
      });

      it('"downloadstatus" publication should return nothing if none role user', function (done) {
          const collector = new PublicationCollector({userId: noRoleUserId});
          collector.collect(
              'downloadstatus',
              {},
              (collections) => {
                  chai.assert.equal(Object.keys(collections).length, 0);
                  done();
              }
          );
      });

      it('"downloadstatus.presentationmachine" publication should return nothing if none role user', function (done) {
          const collector = new PublicationCollector({userId: noRoleUserId});
          collector.collect(
              'downloadstatus.presentationmachine',
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
