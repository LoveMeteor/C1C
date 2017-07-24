import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { UserSchema, ROLES , PASSWORD_REGEX} from './users.js';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

export const createTestAdminUser = new ValidatedMethod({
    name: 'users.createTestAdmin',
    validate: new SimpleSchema({
    }).validator({ clean: true, filter: false }),
    run({ }) {
        if(Meteor.isServer && Meteor.isTest) {
            const user = {
                username: "admin",
                firstName: "Christano",
                lastName: "Ronaldo",
                password: "password",
                createdAt: new Date()
            };
            const userId = Accounts.createUser(user);
            Roles.addUsersToRoles( userId, [ ROLES.ADMIN ], Roles.GLOBAL_GROUP );
            return userId;
        }
    }
});

export const createTestNoRoleUser = new ValidatedMethod({
    name: 'users.createTestNoRole',
    validate: new SimpleSchema({
    }).validator({ clean: true, filter: false }),
    run({ }) {
        if(Meteor.isServer && Meteor.isTest) {
            const user = {
                username: "normal",
                firstName: "Alex",
                lastName: "Ivanov",
                password: "password",
                createdAt: new Date()
            };
            const userId = Accounts.createUser(user);
            return userId;
        }
    }
});



// Insert user
export const insertUser = new ValidatedMethod({
    name: 'users.insert',
    //validate: UserSchema.pick(['username', 'firstName', 'lastName']).validator({ clean: true, filter: false }),
    validate: new SimpleSchema({
        firstName: UserSchema.schema('firstName'),
        lastName: UserSchema.schema('lastName'),
        username: UserSchema.schema('username'),
        email: { type: String, optional: true},
        password: { type: String},
    }).validator({ clean: true, filter: false }),
    run({ username, firstName, lastName, password, email}) {

        const user = {
            username,
            firstName,
            lastName,
            password,
            createdAt: new Date()
        };
        if(email)
        {
            user.email = email;
        }

        const newUserId = Accounts.createUser(user);

        return newUserId;
    }
});

// Insert user
export const createUserByAdmin = new ValidatedMethod({
    name: 'users.create.byadmin',
    //validate: UserSchema.pick(['username', 'firstName', 'lastName']).validator({ clean: true, filter: false }),
    validate: new SimpleSchema({
        firstName: UserSchema.schema('firstName'),
        lastName: UserSchema.schema('lastName'),
        username: UserSchema.schema('username'),
        email: { type: String, optional: true},
        password: { type: String},
        role: { type: String, optional: true, allowedValues: [ROLES.ADMIN, ROLES.PRESENTER, ROLES.MACHINE]},
    }).validator({ clean: true, filter: false }),
    run({ username, firstName, lastName, password, email, role}) {
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("users.create.byadmin", "Not authorized to create new users");
        }

        const user = {
            username,
            firstName,
            lastName,
            password,
            createdAt: new Date()
        };
        if(email)
        {
            user.email = email;
        }

        const newUserId = Accounts.createUser(user);

        if(newUserId) {
            if(role)
            {
                Roles.addUsersToRoles(newUserId, [ role ], Roles.GLOBAL_GROUP );
            }
            else {
                Roles.addUsersToRoles(newUserId, [ ROLES.PRESENTER ], Roles.GLOBAL_GROUP );
            }
        }

        return newUserId;
    }
});
export const updateUser = new ValidatedMethod({
    name: 'users.update',
    validate: new SimpleSchema({
        _id: { type: String},
        firstName: UserSchema.schema('firstName'),
        lastName: UserSchema.schema('lastName'),
        cicId : UserSchema.schema('cicId')
    }).validator({ clean: true, filter: false }),
    run({ _id, firstName, lastName , cicId }) {
        if (_id != this.userId && !Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("users.update", "Not authorized to update");
        }

        Meteor.users.update(_id, {
            $set: {
                firstName: (_.isUndefined(firstName) ? null : firstName),
                lastName: (_.isUndefined(lastName) ? null : lastName),
                cicId
            }
        });
    }
});

export const updatePresentationMachinePassword = new ValidatedMethod({
    name: 'users.update.presentationmachinepassword',
    validate: new SimpleSchema({
        userId: { type: String},
        password : { type: String, regEx : PASSWORD_REGEX }
    }).validator({ clean: true, filter: false }),
    run({ userId, password }) {
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("users.update.presentationmachinepassword", "Not authorized to update password");
        }
        if(Meteor.isServer){
            Accounts.setPassword(userId, password)
        }

    }
});

export const updateUserRole = new ValidatedMethod({
    name: 'users.update.role',
    validate: new SimpleSchema({
        _id: { type: String},
        role: { type: String, allowedValues: [ROLES.ADMIN, ROLES.PRESENTER, ROLES.MACHINE]}
    }).validator({ clean: true, filter: false }),
    run({ _id, role }) {

        if (_id == this.userId)
        {
            throw new Meteor.Error("users.update.role", "You can not update your own role");
        }

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("users.update.role", "Not authorized to update");
        }

        if (!Roles.userIsInRole(_id, [role], Roles.GLOBAL_GROUP))
        {
            Roles.setUserRoles(_id, [role], Roles.GLOBAL_GROUP)
        }
    }
});
export const removeUser = new ValidatedMethod({
    name: 'users.remove',
    validate: new SimpleSchema({
        _id: { type: String},
    }).validator({ clean: true, filter: false }),
    run({ _id }) {
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("users.remove", "Not authorized to remove");
        }
        Meteor.users.remove(_id);
    },
});

 //Get client of all method names on Users
const USERS_METHODS = _.pluck([
    insertUser,
    createUserByAdmin,
    updateUser,
    updatePresentationMachinePassword,
    updateUserRole,
    removeUser
], 'name');

if (Meteor.isServer) {
    // Only allow 5 users operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(USERS_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; }
    }, 5, 1000);
}
