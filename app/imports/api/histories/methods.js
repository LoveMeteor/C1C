import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';


import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../users/users.js';

import { Histories } from './histories.js';

export const insertHistory = new ValidatedMethod({
    name: 'histories.insert',
    validate: Histories.simpleSchema().pick(['playlistId','engagementId', 'playedAt', 'mediaId']).validator({ clean: true, filter: false }),
    run({ playlistId, playedAt, mediaId, engagementId}) {


        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("histories.insert", "Not authorized to add history");
        }

        const history = {
            playlistId,
            playedAt,
            mediaId,
            engagementId,
            createdAt: new Date()
        };
        return Histories.insert(history);
    }
});

export const removeHistory = new ValidatedMethod({
    name: 'histories.remove',
    validate: new SimpleSchema({
        _id: Histories.simpleSchema().schema('_id')
    }).validator({ clean: true, filter: false }),
    run({ _id }) {
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
        {
            throw new Meteor.Error("histories.remove", "Not authorized to remove history");
        }

        Histories.remove(_id);
    }
});

// Get client of all method names on Histories
const HISTORIES_METHODS = _.pluck([
    insertHistory,
    removeHistory
], 'name');

if (Meteor.isServer) {
    // Only allow 5 histories operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(HISTORIES_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; },
    }, 5, 1000);
}
