/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Medias } from './medias.js';
import { PresentationMachines } from '../presentationmachines/presentationmachines.js';

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { insertMedia, updateMedia, removeMedia} from './methods';

import { insertPlaylistItem} from '../playlistitems/methods';
import { insertCanoncialPlaylist } from '../canoncialplaylist/methods';

import { createTestAdminUser, createTestNoRoleUser } from '../users/methods';


import { Favorites, FAVORITETYPES} from '../favorites/favorites';
import { insertFavorite, removeFavorite } from '../favorites/methods';
import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '/imports/api/users/users.js';
import { DownloadStatus , DOWNLOAD_STATUS } from '../downloadstatus/downloadstatus.js';

if (Meteor.isServer) {
  // eslint-disable-next-line import/no-unresolved
  import './server/publications.js';

  describe('medias', function () {

    let adminUserID, noRoleUserId;
    beforeEach(function () {
      resetDatabase();
      adminUserID = createTestAdminUser.call({});
      noRoleUserId = createTestNoRoleUser.call({});
    });


    describe('mutators', function () {
      it('builds correctly from factory and insert', function () {
        this.timeout(15000);

        const media = Factory.create('media');
        assert.typeOf(media, 'object');
        assert.typeOf(media.createdAt, 'date');
        const mediaId = insertMedia._execute({userId: adminUserID}, {name: "Created from Insert", type: 'video', mediaFileId: Random.id(), themeId: Random.id(), industryIds:[Random.id(), Random.id()], tagIds: [], presentationMachineIds: [],width:1800, height: 1200, videoDuration: 1800});
        assert.typeOf(mediaId, 'string');

        const mediaId1 = insertMedia._execute({userId: adminUserID}, {name: "Created from Insert", type: 'video', mediaFileId: Random.id(), presentationMachineIds: [],width:1800, height: 1200, videoDuration: 1800});
        assert.typeOf(mediaId1, 'string');
      });

      it('should throw an error for validation', function () {
        assert.throws(() => {
          insertMedia._execute({userId: adminUserID}, { mediaFileId: Random.id(), themeId: Random.id(), industryIds:[Random.id(), Random.id()], tagIds: [], presentationMachineIds: []});
        }, Meteor.Error);
      });

      it('should throw an error for authentication', function () {
        assert.throws(() => {
          insertMedia._execute({}, {name: "Created from Insert", type: 'video', mediaFileId: Random.id(), themeId: Random.id(), industryIds:[Random.id(), Random.id()], tagIds: [], presentationMachineIds: []});
        }, Meteor.Error);
      });

      it('leaves createdAt on update', function () {
        const createdAt = new Date(new Date() - 1000);
        let media = Factory.create('media', { createdAt });

        updateMedia._execute({userId: adminUserID}, {_id:media._id, name:"Hallo", themeId: Random.id(),industryIds:[], tagIds: [Factory.create('tag')._id, Factory.create('tag')._id], presentationMachineIds: []});

        media = Medias.findOne(media._id);
        assert.equal(media.tagIds.length, 2);
        assert.equal(media.createdAt.getTime(), createdAt.getTime());

      });


      it('should remove and confirm its removed', function () {
        const media = Factory.create('media');
        const mediaCheck1 = Medias.findOne(media._id);
        assert.notEqual(mediaCheck1, null);
        removeMedia._execute({userId: adminUserID}, {_id: media._id});
        const mediaCheck2 = Medias.findOne(media._id);
        assert.equal(mediaCheck2, null);
      });


      it('should fail when try to delete a media linked to canoncial or future playlist', function () {
        const media = Factory.create('media');
        const playlistitem = insertPlaylistItem._execute({userId: adminUserID}, { mediaId: media._id, duration:30, showOverlay:false});
        insertCanoncialPlaylist._execute({userId: adminUserID}, {name: "Crated from Insert", itemIds: [playlistitem, Random.id(), Random.id()], presentationMachineId: Factory.create('presentationmachine')._id, themeId: Factory.create('theme')._id, tagIds:[Factory.create('tag')._id, Factory.create('tag')._id]});

        assert.throws(() => {
          removeMedia._execute({userId: adminUserID}, {_id: media._id});
        }, Meteor.Error);
      });

      it('"updateMedia" method should throw error "No authorized" if none role user', function () {
          const createdAt = new Date(new Date() - 1000);
          let media = Factory.create('media', { createdAt });

          assert.throws(() => {
              updateMedia._execute({userId: noRoleUserId}, {_id:media._id, name:"Hallo", themeId: Random.id(),industryIds:[], tagIds: [Factory.create('tag')._id, Factory.create('tag')._id], presentationMachineIds: []});
          }, Meteor.Error);
      });

      it('"removeMedia" method should throw error "No authorized" if none role user', function () {
          const media = Factory.create('media');

          assert.throws(() => {
              removeMedia._execute({userId: noRoleUserId}, {_id: media._id});
          }, Meteor.Error);
      });

    });

    describe('test helpers', function () {

      it('check for favorite helper', function () {
        const media = Factory.create('media');
        assert.equal(media.isFavoritedBy(adminUserID), false);
        insertFavorite._execute({userId: adminUserID}, {itemId: media._id, favoriteType: FAVORITETYPES.MEDIA});
        assert.equal(media.isFavoritedBy(adminUserID), true);
      });

      it('check Media deletable helper', function () {
        this.timeout(15000);
        const media = Factory.create('media');
        assert.equal(media.canDelete(), true);
        const playlistitem = insertPlaylistItem._execute({userId: adminUserID}, { mediaId: media._id, duration:30, showOverlay:false});
        assert.equal(media.canDelete(), true);
        assert.equal(media.canoncialPlaylists().fetch().length, 0);
        const canoncialPlaylistIDForHelperCheck = insertCanoncialPlaylist._execute({userId: adminUserID}, {name: "Crated from Insert", itemIds: [playlistitem, Random.id(), Random.id()], presentationMachineId: Factory.create('presentationmachine')._id, themeId: Factory.create('theme')._id, tagIds:[Factory.create('tag')._id, Factory.create('tag')._id]});
        assert.equal(media.canDelete(), false);
        assert.equal(media.canoncialPlaylists().fetch().length, 1);
      });

      it('check playlists helpers', function () {
        this.timeout(15000);
        const media = Factory.create('media');
        const playlistitem1 = Factory.create('playlistitem', {mediaId: media._id});
        const playlistitem2 = Factory.create('playlistitem', {mediaId: media._id});
        let playlist1 = Factory.create('playlist', {itemIds: [playlistitem1._id, Random.id()]});
        let playlist2 = Factory.create('playlist', {itemIds: [Random.id(), playlistitem2._id]});
        let playlist3 = Factory.create('playlist', {itemIds: [Random.id(), Random.id()]});

        let playlists = media.playlists().fetch();
        assert.equal(playlists.length, 2);
        assert.equal((playlists[0]._id == playlist1._id || playlists[1]._id == playlist1._id), true);
        assert.equal((playlists[0]._id == playlist2._id || playlists[1]._id == playlist2._id), true);

      });
      it('check presentation machine helper', function () {
        this.timeout(15000);
        let pm1 = Factory.create('presentationmachine');
        let pm2 = Factory.create('presentationmachine');
        let pm3 = Factory.create('presentationmachine');
        const media = Factory.create('media', {presentationMachineIds: [pm1._id, pm2._id]});
        assert.equal(media.presentationMachines().length, 2);
      });
      it('check machines used helper', function () {
        this.timeout(15000);
        let pm1 = Factory.create('presentationmachine');
        let pm2 = Factory.create('presentationmachine');
        let pm3 = Factory.create('presentationmachine');

        const media = Factory.create('media');

        const playlistitem1 = Factory.create('playlistitem', {mediaId: media._id});
        const playlistitem2 = Factory.create('playlistitem', {mediaId: media._id});
        const playlistitem3 = Factory.create('playlistitem', {mediaId: media._id});
        const playlistitem4 = Factory.create('playlistitem', {mediaId: media._id});

        let playlist1 = Factory.create('playlist', {itemIds: [playlistitem1._id, Random.id()], presentationMachineId: pm1._id});
        let playlist2 = Factory.create('playlist', {itemIds: [Random.id(), playlistitem2._id], presentationMachineId: pm1._id});
        let playlist3 = Factory.create('playlist', {itemIds: [Random.id(), Random.id()], presentationMachineId: pm3._id});

        let playlist4 = Factory.create('canoncialplaylist', {itemIds: [Random.id(), playlistitem3._id], presentationMachineId: pm2._id});
        let playlist5 = Factory.create('canoncialplaylist', {itemIds: [Random.id(), Random.id()], presentationMachineId: pm3._id});

        let machines = media.machinesUsedMedia();
        assert.equal(machines.length, 2);
        assert.equal((machines[0]._id == pm1._id || machines[1]._id == pm1._id), true);
        assert.equal((machines[0]._id == pm2._id || machines[1]._id == pm2._id), true);
      });
      it('check engagements helper', function () {
        this.timeout(15000);
        let engagement1 = Factory.create('engagement');
        let engagement2 = Factory.create('engagement');
        let engagement3 = Factory.create('engagement');

        const media = Factory.create('media');

        const playlistitem1 = Factory.create('playlistitem', {mediaId: media._id});
        const playlistitem2 = Factory.create('playlistitem', {mediaId: media._id});

        let playlist1 = Factory.create('playlist', {itemIds: [playlistitem1._id, Random.id()], engagementId: engagement1._id});
        let playlist2 = Factory.create('playlist', {itemIds: [Random.id(), playlistitem2._id], engagementId: engagement2._id});
        let playlist3 = Factory.create('playlist', {itemIds: [Random.id(), Random.id()], engagementId: engagement3._id});

        let engagements = media.engagements().fetch();
        assert.equal(engagements.length, 2);
        assert.equal((engagements[0]._id == engagement1._id || engagements[1]._id == engagement1._id), true);
        assert.equal((engagements[0]._id == engagement2._id || engagements[1]._id == engagement2._id), true);
      });
      it('check isReady ( fully downloaded )', function () {
          const presentationMachine = Factory.create('presentationmachine');
          const media = Factory.create('media',{presentationMachineIds : [presentationMachine._id]});

          assert.equal(media.isReady(presentationMachine._id), false);
          const downloadstatus = Factory.create('downloadstatus',{mediaId : media._id , status : DOWNLOAD_STATUS.DOWNLOADED, presentationMachineId : presentationMachine._id})
          assert.equal(media.isReady(presentationMachine._id), true);
      });
    });

    describe('publications', function () {
      let publicPresentationMachine;
      let userId;

      beforeEach(function () {
        userId = Random.id();
        publicPresentationMachine = Factory.create('presentationmachine');
        _.times(3, () => {
          let media = Factory.create('media', {presentationMachineIds: [publicPresentationMachine._id, Random.id()]});
          Factory.create('media');
        });
      });

      it('sends medias for a presentationMachine', function (done) {
        const collector = new PublicationCollector({userId: adminUserID});
        collector.collect(
            'medias.inPresentationMachine',
            { presentationMachineId: publicPresentationMachine._id },
            (collections) => {
              chai.assert.equal(collections.Medias.length, 3);
              done();
            }
        );
      });

      it('sends medias for a presentationMachine for PM user', function (done) {
        let pmUser = Factory.create('user', {presentationMachineId: publicPresentationMachine._id});
        Roles.addUsersToRoles(pmUser._id, [ROLES.MACHINE], Roles.GLOBAL_GROUP);
        const collector = new PublicationCollector({userId: pmUser._id});
        collector.collect(
            'medias.andMediaFiles',
            { },
            (collections) => {
              chai.assert.equal(collections.Medias.length, 3);
              done();
            }
        );
      });


      it('sends all medias', function (done) {
        const collector = new PublicationCollector({userId: adminUserID});
        collector.collect(
            'medias',
            {},
            (collections) => {
              chai.assert.equal(collections.Medias.length, 6);
              done();
            }
        );
      });
        it('"medias" publication should return nothing if none role user', function (done) {
            const collector = new PublicationCollector({userId:noRoleUserId});
            collector.collect(
                'medias',
                {},
                (collections) => {
                    chai.assert.equal(Object.keys(collections).length, 0);
                    done();
                }
            );
        });

        it('"medias.andMediaFiles" publication should return nothing if none role user', function (done) {
            const collector = new PublicationCollector({userId:noRoleUserId});
            collector.collect(
                'medias.andMediaFiles',
                {},
                (collections) => {
                    chai.assert.equal(Object.keys(collections).length, 0);
                    done();
                }
            );
        });

        it('"medias.inPresentationMachine" publication should return nothing if none role user', function (done) {
            const collector = new PublicationCollector({userId:noRoleUserId});
            collector.collect(
                'medias.inPresentationMachine',
                {presentationMachineId:Factory.create('presentationmachine')._id},
                (collections) => {
                    chai.assert.equal(Object.keys(collections).length, 0);
                    done();
                }
            );
        });


    });

  });
}
