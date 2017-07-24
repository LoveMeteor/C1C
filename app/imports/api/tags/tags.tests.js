/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Tags } from './tags.js';
import { Medias } from '../medias/medias.js';

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { insertTag, insertMultipleTags, removeTag} from './methods';
import { createTestAdminUser, createTestNoRoleUser } from '../users/methods';

if (Meteor.isServer) {
  // eslint-disable-next-line import/no-unresolved
  import './server/publications.js';

  describe('tags', function () {

    var adminUserID, noRoleUserId;
    beforeEach(function () {
      resetDatabase();
      adminUserID = createTestAdminUser.call({});
      noRoleUserId = createTestNoRoleUser.call({});
    });

    describe('mutators', function () {
      it('builds correctly from factory and insert', function () {
        this.timeout(15000);

        const tag = Factory.create('tag');
        assert.typeOf(tag, 'object');
        assert.typeOf(tag.createdAt, 'date');

        const tagId = insertTag._execute({userId: adminUserID}, {name: "Created from Insert Created"});
        assert.typeOf(tagId, 'string');
      });

      it('should return same tag when insert called again', function () {
        this.timeout(15000);
        const tagId = insertTag._execute({userId: adminUserID}, {name: "Created from Insert Created"});

        const tag1 = insertTag._execute({userId: adminUserID}, {name: "Created from Insert Created"});
        assert.typeOf(tag1, 'string');
        assert.equal(tag1, tagId);
      //Case Insensitive
        const tag2 = insertTag._execute({userId: adminUserID}, {name: "created From insert Created"});
        assert.typeOf(tag2, 'string');
        assert.equal(tag2, tagId);
      });
      it('should create a new tag', function () {
        this.timeout(15000);
        const tagId = insertTag._execute({userId: adminUserID}, {name: "Created from Insert Created"});
        const tag1 = insertTag._execute({userId: adminUserID}, {name: "created From Insert"});
        assert.typeOf(tag1, 'string');
        assert.notEqual(tag1, tagId);
        const tag2 = insertTag._execute({userId: adminUserID}, {name: "Created"});
        assert.typeOf(tag2, 'string');
        assert.notEqual(tag2, tagId);
      });


      it('Remove Tag works fine', function () {
        const tag = Factory.create('tag');
        removeTag._execute({userId: adminUserID}, {_id: tag._id});
        const tagCheck = Tags.findOne({_id: tag._id});
        assert.equal(tagCheck, null);
      });

      it('"insertTag" method should throw error "No authorized" if none role user', function () {
          assert.throws(() => {
              insertTag._execute({userId: noRoleUserId}, {name: "Created from Insert Created"});
          }, Meteor.Error);
      });

      it('"insertMultipleTags" method should throw error "No authorized" if none role user', function () {
          assert.throws(() => {
              insertMultipleTags._execute({userId: noRoleUserId}, {names:['tag1', 'tag2']});
          }, Meteor.Error);
      });

      it('"removeTag" method should throw error "No authorized" if none role user', function () {
          const tag = Factory.create('tag');

          assert.throws(() => {
              removeTag._execute({userId: noRoleUserId}, {_id: tag._id});
          }, Meteor.Error);
      });
    });


    describe('publications', function () {
      let publicMedia;

      beforeEach(function () {
        publicMedia = Factory.create('media');
        _.times(3, () => {
          let tag = Factory.create('tag');
          Medias.update({ _id: publicMedia._id },{ $push: { tagIds: tag._id }})    ;
        });
        _.times(3, () => {
          let tag = Factory.create('tag');
        });
      });

      it('sends all tags for a public media', function (done) {
        const collector = new PublicationCollector({userId: adminUserID});
        collector.collect(
            'tags.inMedia',
            { mediaId: publicMedia._id },
            (collections) => {
              chai.assert.equal(collections.Tags.length, 3);
              done();
            }
        );
      });
      it('sends all tags', function (done) {
        const collector = new PublicationCollector({userId: adminUserID});
        collector.collect(
            'tags',
            {},
            (collections) => {
              chai.assert.equal(collections.Tags.length, 6);
              done();
            }
        );
      });

      it('"tags.inMedia" publication should return nothing if none role user', function (done) {
          const collector = new PublicationCollector({userId:noRoleUserId});
          collector.collect(
              'tags.inMedia',
              {mediaId: Random.id()},
              (collections) => {
                  chai.assert.equal(Object.keys(collections).length, 0);
                  done();
              }
          );
      });

      it('"tags" publication should return nothing if none role user', function (done) {
          const collector = new PublicationCollector({userId:noRoleUserId});
          collector.collect(
              'tags',
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
