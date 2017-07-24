# API OverView


## Database Scheme Overview



Tags.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  createdAt: { type: Number, denyUpdate: true,  },
});


Medias.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  filename: { type: String },
  tagIds: { type: [String] },
  areas: { type: [String] },
  createdAt: { type: Number, denyUpdate: true,  },
});

Playlists.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  itemIds: { type: [String] }, // Play list item Ids
  tagIds: { type: [String] },
  areaId: { type: String, regEx: SimpleSchema.RegEx.Id },
  createdAt: { type: Number, denyUpdate: true,  },
});


PlaylistItems.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  mediaId: { type: String },
  duration: { type: Number },
  showOverlay: { type: Number },
  createdAt: { type: Number, denyUpdate: true,  },
});


Areas.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  createdAt: { type: Number, denyUpdate: true,  },
});

Engagements.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  clientId: { type: String, regEx: SimpleSchema.RegEx.Id},
  startTime: { type: Number}, // Start Time as Unix Timestamp
  endTime: { type: Number}, // Start Time as Unix Timestamp
  tagIds: { type: [String] },
  playlistIds: { type: [String] },
  createdAt: { type: Number, denyUpdate: true,  },
});


Clients.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  logo: { type: String },
  website: { type: String },
  scoialAccountIds: {type: [String]}
  createdAt: { type: Number, denyUpdate: true,  },
});

SocialAccount.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  url: { type: String },
  handle: { type: String },
  createdAt: { type: Number, denyUpdate: true,  },
});



Contacts.schema = new SimpleSchema({
  _id: {    type: String,    regEx: SimpleSchema.RegEx.Id },
  clientId: {   type: String,    regEx: SimpleSchema.RegEx.Id,    denyUpdate: true, },
  name:{    type: String  },
  role:{    type: String  },
  email:{    type: String  },
  phone:{    type: String  },
  createdAt: {    type: Number,    denyUpdate: true,  },
});


Teams.schema = new SimpleSchema({
  _id: {    type: String,    regEx: SimpleSchema.RegEx.Id,  },
  clientId: {    type: String,    regEx: SimpleSchema.RegEx.Id,    denyUpdate: true,  },
  name:{    type: String  },
  contacts:{    type: [String]  },
  createdAt: {    type: Number,    denyUpdate: true,  },
});


