/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Favorites, FAVORITETYPES } from './favorites.js';
import { Medias } from '../medias/medias.js';
import { UserSchema, ROLES } from '../users/users.js';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { insertFavorite, removeFavorite, removeFavoriteWithItem} from './methods';
import { createTestAdminUser, createUserByAdmin, createTestNoRoleUser } from '../users/methods';


if (Meteor.isServer) {
    import './server/publications.js';

    describe('favorites', function () {

        let adminUserID;
        let presenterUserID;
        let noRoleUserId;
        beforeEach(function () {
            resetDatabase();
            adminUserID = createTestAdminUser.call({});
            presenterUserID = createUserByAdmin._execute({userId: adminUserID},{username: "abc", firstName: "A", lastName:"B", password: "abc", email:"test@gmail.com",role: ROLES.ADMIN});
            noRoleUserId = createTestNoRoleUser.call({});
        });

        describe('mutators', function () {
            it('builds correctly from factory and insert', function () {
                this.timeout(15000);

                const favorite = Factory.create('favorite');
                assert.typeOf(favorite, 'object');
                assert.typeOf(favorite.createdAt, 'date');

                const favorite1 = insertFavorite._execute({userId: adminUserID}, { itemId: Factory.create('media')._id, favoriteType: FAVORITETYPES.MEDIA});
                assert.typeOf(favorite1, 'string');
                const favorite2 = insertFavorite._execute({userId: presenterUserID}, {itemId: Factory.create('media')._id, favoriteType: FAVORITETYPES.MEDIA});
                assert.typeOf(favorite2, 'string');
            });

            it('should fail when try without login', function () {
                assert.throws(() => {
                    insertFavorite.call({itemId: Factory.create('media')._id});
                }, Meteor.Error);
            });

            it('should fail when try remove favorite with differnt user', function () {
                const favorite = insertFavorite._execute({userId: presenterUserID}, {itemId: Factory.create('media')._id, favoriteType: FAVORITETYPES.MEDIA});
                assert.throws(() => {
                    removeFavorite._execute({userId: adminUserID}, {_id: favorite});
                }, Meteor.Error);
            });

            it('Remove should work fine', function () {
                const favoriteId = insertFavorite._execute({userId: presenterUserID}, {itemId: Factory.create('media')._id, favoriteType: FAVORITETYPES.MEDIA});
                removeFavorite._execute({userId: presenterUserID}, {_id: favoriteId});
                const favorite = Favorites.findOne({_id: favoriteId});
                assert.equal(favorite, null);
            });

            it('remove using item', function () {
                const itemToDelete = {itemId: Factory.create('media')._id, favoriteType: FAVORITETYPES.MEDIA};
                const favoriteId = insertFavorite._execute({userId: presenterUserID}, itemToDelete);

                removeFavoriteWithItem._execute({userId: presenterUserID}, itemToDelete);
                const favorite = Favorites.findOne({_id: favoriteId});
                assert.equal(favorite, null);
            });


            it('"insertFavorite" method should throw error "No authorized" if none role user', function () {
                assert.throws(() => {
                    insertFavorite._execute({userId: noRoleUserId}, { itemId: Factory.create('media')._id, favoriteType: FAVORITETYPES.MEDIA});
                }, Meteor.Error);
            });

            it('"removeFavorite" method should throw error "No authorized" if none role user', function () {
                let favorite = Factory.create('favorite')

                assert.throws(() => {
                    removeFavorite._execute({userId: noRoleUserId}, {_id: favorite._id});
                }, Meteor.Error);
            });

            it('"removeFavoriteWithItem" method should throw error "No authorized" if none role user', function () {

                const itemToDelete = {itemId: Factory.create('media')._id, favoriteType: FAVORITETYPES.MEDIA};
                const favoriteId = Factory.create('favorite', itemToDelete)._id;
                assert.typeOf(favoriteId, 'string');

                assert.throws(() => {
                    removeFavoriteWithItem._execute({userId: noRoleUserId}, itemToDelete);
                }, Meteor.Error);
            });

        });


        describe('publications', function () {
            beforeEach(function () {
                _.times(3, () => {
                    Factory.create('favorite',{userId:presenterUserID});
                });
                Factory.create('favorite',{userId:adminUserID});
            });

            it('favorites for presenter', function (done) {
                const collector = new PublicationCollector({userId: presenterUserID});
                collector.collect(
                    'favorites',
                    {},
                    (collections) => {
                        chai.assert.equal(collections.Favorites.length, 3);
                        done();
                    }
                );
            });
            it('favorites for admin', function (done) {
                const collector = new PublicationCollector({userId: adminUserID});
                collector.collect(
                    'favorites',
                    {},
                    (collections) => {
                        chai.assert.equal(collections.Favorites.length, 1);
                        done();
                    }
                );
            });


            it('"favorites" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'favorites',
                    {},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

            it('"favorites.medias" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'favorites.medias',
                    {},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

            it('"favorites.canoncialplaylists" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'favorites.canoncialplaylists',
                    {},
                    (collections) => {
                        chai.assert.equal(Object.keys(collections).length, 0);
                        done();
                    }
                );
            });

            it('"favorites.playlists" publication should return nothing if none role user', function (done) {
                const collector = new PublicationCollector({userId:noRoleUserId});
                collector.collect(
                    'favorites.playlists',
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
