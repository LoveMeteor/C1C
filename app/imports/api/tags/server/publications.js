/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '../../users/users.js';

import { Tags } from '../tags.js';
import { Medias } from '../../medias/medias.js';

Meteor.publishComposite('tags.inMedia', function tagsInMedia(idOfMedia) {
  new SimpleSchema({
    mediaId: { type: String },
  }).validate(idOfMedia);
  if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN,ROLES.PRESENTER,ROLES.MACHINE], Roles.GLOBAL_GROUP))
  {
    this.ready();
    return;
  }
  const { mediaId } = idOfMedia;

  return {
    find() {
      const query = {
        _id: mediaId,
      };

      const options = {
        fields: Medias.publicFields,
      };

      return Medias.find(query, options);
    },

    children: [{
      find(media) {
        return Tags.find({ _id: {$in: media.tagIds }}, { fields: Tags.publicFields });
      },
    }],
  };
});

Meteor.publish("tags", function () {
  if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.PRESENTER], Roles.GLOBAL_GROUP))
  {
    this.ready();
    return;
  }
  return Tags.find({});
});