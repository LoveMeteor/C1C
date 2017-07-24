/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Themes } from './themes.js';

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { insertTheme, updateTheme, removeTheme} from './methods';
import { createTestAdminUser, createTestNoRoleUser } from '../users/methods';

if (Meteor.isServer) {
  // eslint-disable-next-line import/no-unresolved
  import './server/publications.js';

  describe('themes', function () {

    let adminUserID, noRoleUserId;
    beforeEach(function () {
      resetDatabase();
      adminUserID = createTestAdminUser.call({});
      noRoleUserId = createTestNoRoleUser.call({});
    });



    describe('mutators', function () {
      it('builds correctly from factory and insert', function () {
        this.timeout(15000);
        const theme = Factory.create('theme');
        assert.typeOf(theme, 'object');
        assert.typeOf(theme.createdAt, 'date');

        const themeId = insertTheme._execute({userId: adminUserID}, {name: "Created from Insert", icon:"http://www.themicoin.com/themicon.jpg"});
        assert.typeOf(themeId, 'string');
      });


      it('update works', function () {
        const createdAt = new Date(new Date() - 1000);
        let theme = Factory.create('theme', { createdAt });

        updateTheme._execute({userId: adminUserID}, {_id: theme._id, name:'some new text', icon:"http://www.themicoin.com/themicon.jpg"});
        theme = Themes.findOne(theme._id);
        assert.equal(theme.name, 'some new text');
        assert.equal(theme.icon, "http://www.themicoin.com/themicon.jpg");
        assert.equal(theme.createdAt.getTime(), createdAt.getTime());
      });


      it('remove works', function () {
        const theme = Factory.create('theme');
        removeTheme._execute({userId: adminUserID}, {_id: theme._id});
        const themeCheck = Themes.findOne(theme._id);
        assert.equal(themeCheck, null);
      });

      it('"insertTheme" method should throw error "No authorized" if none role user', function () {
          assert.throws(() => {
              insertTheme._execute({userId: noRoleUserId}, {name: "Created from Insert", icon:"http://www.themicoin.com/themicon.jpg"});
          }, Meteor.Error);
      });

      it('"updateTheme" method should throw error "No authorized" if none role user', function () {
          const createdAt = new Date(new Date() - 1000);
          let theme = Factory.create('theme', { createdAt });

          assert.throws(() => {
              updateTheme._execute({userId: noRoleUserId}, {_id: theme._id, name:'some new text', icon:"http://www.themicoin.com/themicon.jpg"});
          }, Meteor.Error);
      });

      it('"removeTheme" method should throw error "No authorized" if none role user', function () {
          const theme = Factory.create('theme');

          assert.throws(() => {
              removeTheme._execute({userId: noRoleUserId}, {_id: theme._id});
          }, Meteor.Error);
      });

    });


    describe('publications', function () {

      beforeEach(function () {
        _.times(3, () => {
          Factory.create('theme');
        });
      });

      it('sends all themes', function (done) {
        const collector = new PublicationCollector({userId: adminUserID});
        collector.collect(
            'themes',
            {},
            (collections) => {
              chai.assert.equal(collections.Themes.length, 3);
              done();
            }
        );
      });

      it('"themes" publication should return nothing if none role user', function (done) {
          const collector = new PublicationCollector({userId:noRoleUserId});
          collector.collect(
              'themes',
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
