/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';

import { Clients,ClientLogoFile } from '../clients.js';
import { Industries } from '/imports/api/industry/industry.js';

Meteor.publishComposite('clients', function () {
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    return {
        find() {
            return Clients.find({});
        },
        children: [
            {
                find(client) {
                    return ClientLogoFile.find({ _id: client.logoFileId}).cursor;
                }
            },
            {
                find(client) {
                    return Industries.find({ _id: client.industryId});
                }
            }
        ]
    };
});


Meteor.publish("logofiles", function(){
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN], Roles.GLOBAL_GROUP))
    {
        this.ready();
        return;
    }
    return ClientLogoFile.find({}).cursor;
});
