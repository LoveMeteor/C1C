/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Industries } from './industry.js';

import { resetDatabase } from 'meteor/xolvio:cleaner';
import {insertIndustry, removeIndustry, updateIndustry} from './methods';

import { createTestAdminUser, createTestNoRoleUser } from '../users/methods';


if (Meteor.isServer) {
  // eslint-disable-next-line import/no-unresolved
  import './server/publications.js';

  describe('Industries', function () {
    let adminUserID, noRoleUserId;

    beforeEach(function () {
      resetDatabase();
      adminUserID = createTestAdminUser.call({});
      noRoleUserId = createTestNoRoleUser.call({});
    });

    describe('mutators', function () {
      it('builds correctly from factory & insert', function () {
        this.timeout(15000);

        const industry = Factory.create('industry');
        assert.typeOf(industry, 'object');
        assert.typeOf(industry.createdAt, 'date');

        const industryId = insertIndustry._execute({userId: adminUserID}, {name: "Crated from Insert", icon: "http://icon.com/icon.png"});
        assert.typeOf(industryId, 'string');
      });


      it('update works', function () {
        const createdAt = new Date(new Date() - 1000);
        let industry = Factory.create('industry', { createdAt });

        updateIndustry._execute({userId: adminUserID}, {_id: industry._id, name: 'some new text', icon:"http://icon.com/icon.png"});
        industry = Industries.findOne(industry._id);
        assert.equal(industry.name, 'some new text');
        assert.equal(industry.icon, "http://icon.com/icon.png");
        assert.equal(industry.createdAt.getTime(), createdAt.getTime());
      });

      it('Should Remove Industry and Check Remaiing Industry Count', function () {

        const industry = Factory.create('industry');
        const industryCheck1 = Industries.findOne(industry._id);
        assert.notEqual(industryCheck1, null);

        removeIndustry._execute({userId: adminUserID}, {_id: industry._id});
        const industryCheck2 = Industries.findOne(industry._id);
        assert.equal(industryCheck2, null);
      });

      it('"insertIndustry" method should throw error "No authorized" if none role user', function () {
          assert.throws(() => {
              insertIndustry._execute({userId: noRoleUserId}, {name: "Crated from Insert", icon: "http://icon.com/icon.png"});
          }, Meteor.Error);
      });

      it('"updateIndustry" method should throw error "No authorized" if none role user', function () {
          const createdAt = new Date(new Date() - 1000);
          let industry = Factory.create('industry', { createdAt });

          assert.throws(() => {
              updateIndustry._execute({userId: noRoleUserId}, {_id: industry._id, name: 'some new text', icon:"http://icon.com/icon.png"});
          }, Meteor.Error);
      });

      it('"removeIndustry" method should throw error "No authorized" if none role user', function () {
          const industry = Factory.create('industry');

          assert.throws(() => {
              removeIndustry._execute({userId: noRoleUserId}, {_id: industry._id});
          }, Meteor.Error);
      });

    });


    describe('publications', function () {

      beforeEach(function () {
        _.times(3, () => {
          Factory.create('industry');
        });
      });

      it('sends all Industries', function (done) {
        const collector = new PublicationCollector({userId: adminUserID});
        collector.collect(
            'industries',
            {},
            (collections) => {
              chai.assert.equal(collections.Industries.length, 3);
              done();
            }
        );
      });

      it('"industries" publication should return nothing if none role user', function (done) {
          const collector = new PublicationCollector({userId:noRoleUserId});
          collector.collect(
              'industries',
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
