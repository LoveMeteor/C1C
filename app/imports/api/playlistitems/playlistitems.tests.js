/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { PlaylistItems } from './playlistitems.js';
import { Playlists } from '../playlists/playlists.js';

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { insertPlaylistItem, updatePlaylistItemDuration, updatePlaylistItemShowOverlay, removePlaylistItem, insertPlaylistItemBulk, upsertPlaylistItemBulk} from './methods';

import { createTestAdminUser, createTestNoRoleUser } from '../users/methods';

if (Meteor.isServer) {
  // eslint-disable-next-line import/no-unresolved
  import './server/publications.js';

  describe('playlistitems', function () {

    let adminUserID, noRoleUserId;
    beforeEach(function () {
      resetDatabase();
      adminUserID = createTestAdminUser.call({});
      noRoleUserId = createTestNoRoleUser.call({});
    });

    describe('mutators', function () {
      it('builds correctly from factory and insert', function () {
        this.timeout(15000);

        const playlistitem = Factory.create('playlistitem');
        assert.typeOf(playlistitem, 'object');
        assert.typeOf(playlistitem.createdAt, 'date');

        const playlistitemId = insertPlaylistItem._execute({userId: adminUserID}, { mediaId: Factory.create('media')._id, duration:30, showOverlay:false});
        assert.typeOf(playlistitemId, 'string');

        const ids = insertPlaylistItemBulk._execute({userId: adminUserID}, {listItems:[{ mediaId: Factory.create('media')._id, duration:30, showOverlay:false},{ mediaId: Factory.create('media')._id, duration:30, showOverlay:false},{ mediaId: Factory.create('media')._id, duration:30, showOverlay:false}]});
        assert.typeOf(ids, 'array');
        const items = PlaylistItems.find({_id:{$in:ids}}).fetch();
        assert.equal(items.length, 3);

      });


      it('update work fine', function () {
        const createdAt = new Date(new Date() - 1000);
        let playlistitem = Factory.create('playlistitem', { createdAt });
        const durTime = 30;
        updatePlaylistItemDuration._execute({userId: adminUserID}, {_id: playlistitem._id, duration: durTime});
        playlistitem = PlaylistItems.findOne(playlistitem._id);
        assert.equal(playlistitem.duration, durTime);
        assert.equal(playlistitem.createdAt.getTime(), createdAt.getTime());


        const ids = upsertPlaylistItemBulk._execute({userId: adminUserID}, {listItems:[{ _id: playlistitem._id, mediaId: Factory.create('media')._id, duration:50, showOverlay:false},{ mediaId: Factory.create('media')._id, duration:30, showOverlay:false},{ mediaId: Factory.create('media')._id, duration:30, showOverlay:false}]});
        assert.equal(ids.length, 3);

        playlistitem = PlaylistItems.findOne(playlistitem._id);
        assert.equal(playlistitem.duration, 50);

      });


      it('Should Remove PlaylistItem', function () {
        let playlistitem = Factory.create('playlistitem');
        removePlaylistItem._execute({userId: adminUserID}, {_id: playlistitem._id});
        playlistitem = PlaylistItems.findOne(playlistitem._id);
        assert.equal(playlistitem, null);
      });


      it('"insertPlaylistItem" method should throw error "No authorized" if none role user', function () {
          assert.throws(() => {
              insertPlaylistItem._execute({userId: noRoleUserId}, { mediaId: Factory.create('media')._id, duration:30, showOverlay:false});
          }, Meteor.Error);
      });

      it('"insertPlaylistItemBulk" method should throw error "No authorized" if none role user', function () {
          assert.throws(() => {
              insertPlaylistItemBulk._execute({userId: noRoleUserId}, {listItems:[{ mediaId: Factory.create('media')._id, duration:30, showOverlay:false},{ mediaId: Factory.create('media')._id, duration:30, showOverlay:false},{ mediaId: Factory.create('media')._id, duration:30, showOverlay:false}]});
          }, Meteor.Error);
      });
      it('"upsertPlaylistItemBulk" method should throw error "No authorized" if none role user', function () {
          const createdAt = new Date(new Date() - 1000);
          let playlistitem = Factory.create('playlistitem', { createdAt });

          assert.throws(() => {
              upsertPlaylistItemBulk._execute({userId: noRoleUserId}, {listItems:[{ _id: playlistitem._id, mediaId: Factory.create('media')._id, duration:50, showOverlay:false},{ mediaId: Factory.create('media')._id, duration:30, showOverlay:false},{ mediaId: Factory.create('media')._id, duration:30, showOverlay:false}]});
          }, Meteor.Error);
      });

      it('"updatePlaylistItemDuration" method should throw error "No authorized" if none role user', function () {
          const createdAt = new Date(new Date() - 1000);
          let playlistitem = Factory.create('playlistitem', { createdAt });
          const durTime = 30;

          assert.throws(() => {
              updatePlaylistItemDuration._execute({userId: noRoleUserId}, {_id: playlistitem._id, duration: durTime});
          }, Meteor.Error);
      });
      it('"updatePlaylistItemShowOverlay" method should throw error "No authorized" if none role user', function () {
          const createdAt = new Date(new Date() - 1000);
          let playlistitem = Factory.create('playlistitem', { createdAt });
          assert.throws(() => {
              updatePlaylistItemShowOverlay._execute({userId: noRoleUserId}, {_id: playlistitem._id, showOverlay:true});
          }, Meteor.Error);
      });

      it('"removePlaylistItem" method should throw error "No authorized" if none role user', function () {
          let playlistitem = Factory.create('playlistitem');

          assert.throws(() => {
              removePlaylistItem._execute({userId: noRoleUserId}, {_id: playlistitem._id});
          }, Meteor.Error);
      });

    });


    describe('publications', function () {
      let publicPlaylist;

      beforeEach(function () {
        publicPlaylist = Factory.create('playlist');
        _.times(3, () => {
          Factory.create('playlistitem', {playlistId: publicPlaylist._id});//, {playlistId: publicPlaylist._id}
        });
      });

      it('sends all playlistitems', function (done) {
        const collector = new PublicationCollector({userId: adminUserID});
        collector.collect(
            'playlistitems',
            {},
            (collections) => {
              //console.log(collections);
              chai.assert.equal(collections.PlaylistItems.length, 3);
              done();
            }
        );
      });

      it('"playlistitems" publication should return nothing if none role user', function (done) {
          const collector = new PublicationCollector({userId:noRoleUserId});
          collector.collect(
              'playlistitems',
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
