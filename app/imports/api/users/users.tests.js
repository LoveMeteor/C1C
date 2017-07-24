/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { UserSchema, ROLES } from './users.js';

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { insertUser, updateUser, removeUser, createTestAdminUser, createUserByAdmin, updateUserRole , updatePresentationMachinePassword} from './methods';

if (Meteor.isServer) {
    // eslint-disable-next-line import/no-unresolved
    import './server/publications.js';

    describe('users', function () {

        let adminUserID;
        beforeEach(function () {
            resetDatabase();
            adminUserID = createTestAdminUser.call({});
        });


        describe('mutators', function () {
            it('builds correctly from factory and insert', function () {
                this.timeout(15000);

                const user = Factory.create('user');
                assert.typeOf(user, 'object');
                assert.typeOf(user.createdAt, 'date');
                // Mock the call using Admin user
                const userId = insertUser._execute({userId: adminUserID}, {username: "abc", firstName: "A", lastName:"B", password: "abc", email:"test@gmail.com"});
                assert.typeOf(userId, 'string');

                const userObj = Meteor.users.findOne(userId);
                assert.equal(userObj.firstName, "A");
                assert.equal(userObj.lastName, "B");
                assert.equal(userObj.emails.length, 1);
                assert.equal(userObj.email(), "test@gmail.com");

            });


            it('update works', function () {
                const createdAt = new Date(new Date() - 1000);
                let user = Factory.create('user', { createdAt });

                updateUser._execute({userId: adminUserID},{_id: user._id, firstName: "A", lastName:"B"});
                user = Meteor.users.findOne(user._id);
                assert.equal(user.firstName, "A");
                assert.equal(user.lastName, "B");
                assert.equal(user.createdAt.getTime(), createdAt.getTime());
            });

            it('Remove User and Check Remaining Users', function () {
                // Remove User
                let user = Factory.create('user');
                removeUser._execute({userId: adminUserID},{_id: user._id});
                user = Meteor.users.findOne(user._id);
                assert.equal(user, null);
            });
        });

        describe('Methods for Admin', function () {
            it('create user by admin', function () {
                const userId = createUserByAdmin._execute({userId: adminUserID}, {username: "abc", firstName: "A", lastName:"B", password: "abc", email:"test@gmail.com", role: ROLES.ADMIN});
                assert.typeOf(userId, 'string');
                assert.equal(Roles.userIsInRole(userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP), true);
            });


            it('update user role works', function () {
                const userId = createUserByAdmin._execute({userId: adminUserID}, {username: "abc", firstName: "A", lastName:"B", password: "abc", email:"test@gmail.com", role: ROLES.ADMIN});

                assert.equal(Roles.userIsInRole(userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP), true);
                updateUserRole._execute({userId: adminUserID},{_id: userId, role: ROLES.PRESENTER});
                assert.equal(Roles.userIsInRole(userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP), false);
                assert.equal(Roles.userIsInRole(userId, [ROLES.PRESENTER], Roles.GLOBAL_GROUP), true);
            });

            it('update Presentation Machine password', function () {
                const userId = createUserByAdmin._execute({userId: adminUserID}, {username: "abc", firstName: "A", lastName:"B", password: "qQ1!qwerqwer", email:"test2@gmail.com", role: ROLES.MACHINE});
                const user = Meteor.users.findOne({_id : userId});
                updatePresentationMachinePassword._execute({userId: adminUserID}, {userId: userId, password : "aA1!qwerqwer", });
                const updatedUser = Meteor.users.findOne({_id : userId});
                assert.notEqual(user.services.password.bcrypt,updatedUser.services.password.bcrypt);
            });

            it('canmot update with a non-secure password', function () {
                const userId = createUserByAdmin._execute({userId: adminUserID}, {username: "abc", firstName: "A", lastName:"B", password: "qQ1!qwerqwer", email:"test2@gmail.com", role: ROLES.MACHINE});
                const user = Meteor.users.findOne({_id : userId});
                expect(() => updatePresentationMachinePassword._execute({userId: adminUserID}, {userId: userId, password : "aAssqwerqwer", })).to.throw('Password failed regular expression validation [validation-error]');
            });

            it('shoud fail with error when called by presenter', function () {
                const presenterId = createUserByAdmin._execute({userId: adminUserID}, {username: "abc", firstName: "A", lastName:"B", password: "abc", email:"test@gmail.com", role: ROLES.PRESENTER});
                assert.typeOf(presenterId, 'string');
                const presenterId1 = createUserByAdmin._execute({userId: adminUserID}, {username: "abc2", firstName: "A", lastName:"B", password: "abc2", email:"test2@gmail.com", role: ROLES.PRESENTER});
                assert.typeOf(presenterId1, 'string');
                assert.throws(() => {
                    const userId = createUserByAdmin._execute({userId: presenterId}, {username: "abc1", firstName: "A", lastName:"B", password: "abc1", email:"test1@gmail.com", role: ROLES.PRESENTER});
                }, Meteor.Error);
                assert.throws(() => {
                    const userId = updateUserRole._execute({userId: presenterId}, {_id: presenterId1, role: ROLES.MACHINE});
                }, Meteor.Error);
            });

        });

        describe('Secure Methods',() => {
            it('canmot update Presentation Machine password without userId', function () {
                const userId = createUserByAdmin._execute({userId: adminUserID}, {username: "abc", firstName: "A", lastName:"B", password: "qQ1!qwerqwer", email:"test2@gmail.com", role: ROLES.MACHINE});
                const user = Meteor.users.findOne({_id : userId});
                expect(() => updatePresentationMachinePassword._execute({userId: null}, {userId: userId, password : "aA1!qwerqwer", })).to.throw('Not authorized to update password [users.update.presentationmachinepassword]');
            });
        })

        describe('publications', function () {

            beforeEach(function () {
                _.times(3, () => {
                    Factory.create('user');
                });
            });

            it('sends all users', function (done) {
                const collector = new PublicationCollector({userId: adminUserID});
                collector.collect(
                    'users',
                    {},
                    (collections) => {
                        chai.assert.equal(collections.users.length, 3);
                        done();
                    }
                );
            });

            it('return nothing if no userId', function (done) {
                const collector = new PublicationCollector({});
                collector.collect(
                    'users',
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
