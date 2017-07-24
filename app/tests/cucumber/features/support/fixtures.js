import faker from 'faker';
const _ = require('underscore');

global.fixtures = {};

fixtures = {
    adminUserId: null,

    users: {
        administrator: {
            username: 'admin',
            password: 'cicadmin1',
            role: 'Admin'
        },
        presenter: {
            username: 'presenter1',
            password: 'presenter1',
            role: 'Presenter'
        },
    },

    presentationMachines: [{
        name: 'Reception Wall',
        logo: 'Reception'
    }, {
        name: 'Insight Ring',
        logo: 'Insight'
    }, {
        name: 'Partnership Hub',
        logo: 'Partnership'
    }, {
        name: "Other Areas",
        logo: "OtherArea",

    }],

    overlayTitle: 'WELCOME TO THE CUSTOMER INSIGHT CENTER',

    userIsInRole(userId, role) {
        return server.execute((userId, role) => Roles.userIsInRole(userId, [role], Roles.GLOBAL_GROUP), userId, role);
    },

    getUsers(filters={}, sort={}) {
        return server.execute((filters, sort) => Meteor.users.find(filters, sort).fetch(), filters, sort);
    },

    getRoles() {
        return server.execute(() => {
            const ROLES = require('/imports/api/users/users').ROLES
            //return Object.entries(ROLES).map(([key,value]) => ({_id : key,name:value}))
            return ROLES
        });
    },

    getPresentationMachines(filters = {}, filterCic=false) {
        if(filterCic) {
            const cic = client.execute(() => Session.get('cic')).value
            filters.cicId = cic
        }
        return server.execute((filters) => {
            const PresentationMachines = require('/imports/api/presentationmachines/presentationmachines').PresentationMachines;
            return PresentationMachines.find(filters, {sort:{position:1}}).fetch();
        }, filters);
    },

    getPresentationMachinesForPresenter(filters = {}) {
        const userId = client.execute(() => Meteor.userId()).value
        return server.execute((filters, userId) => {
            const PresentationMachines = require('/imports/api/presentationmachines/presentationmachines').PresentationMachines;
            const user = Meteor.users.findOne(userId)
            return PresentationMachines.find({cicId:user.cicId}, {sort:{position:1}}).fetch();
        }, filters, userId)
    },


    getCanoncialPlaylists(filters={}, sort={}, include={}) {
        return server.execute((filters, sort, include) => {
            const CanoncialPlaylists = require('/imports/api/canoncialplaylist/canoncialplaylists').CanoncialPlaylists;

            const playlists = CanoncialPlaylists.find(filters, sort);

            return playlists.map((playlist) => {
                playlist.isReady = playlist.isReady()
                if(include.presentationMachine) {
                    const PresentationMachines = require('/imports/api/presentationmachines/presentationmachines').PresentationMachines;
                    const presentationMachine = PresentationMachines.findOne({_id:playlist.presentationMachineId});
                    playlist.presentationMachine = presentationMachine;
                }
                if(include.items) {
                    playlist.items = playlist.itemIds.map((itemId) => {
                        const PlaylistItems = require('/imports/api/playlistitems/playlistitems').PlaylistItems
                        const item = PlaylistItems.findOne({_id: itemId})
                        if(item) {
                            const Medias = require('/imports/api/medias/medias').Medias
                            const media = Medias.findOne({_id: item.mediaId})
                            item.media = media
                        }
                        return item
                    })
                }

                return playlist;
            });
        }, filters, sort, include);
    },

    getCanoncialPlaylistById(playlistId) {
        // Should be rewritten
        return server.execute((playlistId) => {
            const CanoncialPlaylists = require('/imports/api/canoncialplaylist/canoncialplaylists').CanoncialPlaylists;
            const PresentationMachines = require('/imports/api/presentationmachines/presentationmachines').PresentationMachines;
            const PlaylistItems = require('/imports/api/playlistitems/playlistitems').PlaylistItems;

            const playlist = CanoncialPlaylists.findOne({_id:playlistId});
            const presentationMachine = PresentationMachines.findOne({_id:playlist.presentationMachineId});
            playlist.presentationMachine = presentationMachine;
            const items = PlaylistItems.find({_id:{$in:playlist.itemIds}}).fetch();
            playlist.items = items.map((item) => {
                const Medias = require('/imports/api/medias/medias').Medias;
                item.media = Medias.findOne({_id:item.mediaId});
                return item;
            });

            return playlist;
        }, playlistId);
    },
    getClients(filters={}, sort={}, include={}) {
        const cic = client.execute(() => Session.get('cic')).value
        filters.cicId = cic
        return server.execute((filters, sort, include) => {
            const Clients = require('/imports/api/clients/clients').Clients;

            const clients = Clients.find(filters, sort);

            return clients.map((client) => {
                if(include.industry) {
                    const Industries = require('/imports/api/industry/industry').Industries;
                    const industry = Industries.findOne({_id:client.industryId});
                    client.industry = industry;
                }
                return client;
            });
        }, filters, sort, include);
    },

    getClientById(clientId) {
        return server.execute((clientId) => {
            const Clients = require('/imports/api/clients/clients').Clients;
            const Industries = require('/imports/api/industry/industry').Industries;

            const client = Clients.findOne({_id:clientId});
            const industry = Industries.findOne({_id:client.industryId});
            client.industry = industry;

            return client;
        }, clientId);
    },
    getSampleCanoncialPlaylist() {
        const playlists = this.getCanoncialPlaylists({},{sort:{name:1}});

        return _.sample(playlists);
    },
    getPlaylistItems(params={},inclusionMedia=true) {
        return server.execute((params,inclusionMedia) => {
            const PlaylistItems = require('/imports/api/playlistitems/playlistitems').PlaylistItems;
            const items = PlaylistItems.find(params);

            if(inclusionMedia) {
                return items.map((item) => {
                    const Medias = require('/imports/api/medias/medias').Medias;
                    const media = Medias.findOne({_id:item.mediaId});
                    item.media = media;

                    return item;
                });
            } else {
                return items.fetch();
            }
        },params,inclusionMedia);
    },
    getPlaylistItemById(id) {
        return server.execute((id) => {
            const PlaylistItems = require('/imports/api/playlistitems/playlistitems').PlaylistItems;
            const item = PlaylistItems.findOne({_id:id});

            const Medias = require('/imports/api/medias/medias').Medias;
            const media = Medias.findOne({_id:item.mediaId});
            item.media = media;

            return item;
        }, id);
    },
    getMediaLinkById(id, version=null) {
        return server.execute((id, version) => {
            const Medias = require('/imports/api/medias/medias').Medias;
            const media = Medias.findOne({_id:id});

            const mediaFile = media.mediaFile();
            if(!mediaFile) return null

            return mediaFile.versions[version]!=null ? mediaFile.link(version) : mediaFile.link()
        }, id, version);
    },

    getPlayListItems(playlistId, inclusionMedia) {
        return server.execute((inclusionMedia) => {
            const PlaylistItems = require('/imports/api/playlistitems/playlistitems').PlaylistItems;
            const items = PlaylistItems.find({});

            if(inclusionMedia) {
                return items.map((item) => {
                    const Medias = require('/imports/api/medias/medias').Medias;
                    const media = Medias.findOne({_id:item.mediaId});
                    item.media = media;

                    return item;
                });
            } else {
                return items.fetch();
            }
        },inclusionMedia);
    },

    getTags(filters={}) {
        return server.execute((filters) => {
            const Tags = require('/imports/api/tags/tags').Tags;
            return Tags.find(filters).fetch();
        }, filters);
    },

    getMedias(filters={}, sort={}) {
        return server.execute((filters, sort) => {
            const Medias = require('/imports/api/medias/medias').Medias;
            return Medias.find(filters, sort).map(media => {
                if(filters.presentationMachineIds) {
                    media.isReady = media.isReady(filters.presentationMachineIds)
                }
                return media
            });
        }, filters, sort);
    },

    getMediaByName(name){
        return server.execute((name) => {
            const Medias = require('/imports/api/medias/medias').Medias;
            console.log(Medias.findOne({name}))
            return Medias.findOne({name});
        }, name);
    },

    getMediaById(mediaId, inclusion={}) {
        // Should be rewritten
        return server.execute((mediaId, inclusion) => {
            const Medias = require('/imports/api/medias/medias').Medias;
            const media = Medias.findOne({_id:mediaId});

            if(inclusion.presentationMachines) {
                const PresentationMachines = require('/imports/api/presentationmachines/presentationmachines').PresentationMachines;

                const pms = PresentationMachines.find({_id:{$in:media.presentationMachineIds}}).fetch();
                media.presentationMachines = pms;
            }

            return media;
        }, mediaId, inclusion);
    },

    getAssetsForMedia(mediaId) {
        // Should be rewritten
        return server.execute((mediaId) => {
            const Medias = require('/imports/api/medias/medias').Medias;
            return Medias.findOne({_id:mediaId});
        }, mediaId);
    },

    getTagsForMedia(mediaId) {
        // Should be rewritten
        return server.execute((mediaId) => {
            const Medias = require('/imports/api/medias/medias').Medias;
            const Tags = require('/imports/api/tags/tags').Tags;

            const media = Medias.findOne({_id:mediaId});
            return Tags.find({_id:{$in:media.tagIds}}).fetch();
        }, mediaId);
    },

    getIndustries(filters = {},options = {}) {
        return server.execute((filters,options) => {
            const Industries = require('/imports/api/industry/industry').Industries;
            return Industries.find(filters,options).fetch();
        },filters,options);
    },

    createThemeData() {
        server.execute(() => {
            _.times(10, () => {
                Factory.create('theme');
            });
        });
    },

    getThemes(filters = {}) {
        return server.execute((filters) => {
            const Themes = require('/imports/api/themes/themes').Themes;
            return Themes.find(filters).fetch();
        }, filters);
    },

    getThemeById(themeId) {
        return server.execute((themeId) => {
            const Themes = require('/imports/api/themes/themes').Themes;
            return Themes.findOne({_id:themeId});
        }, themeId);
    },

    getAdminUserId() {
        if(!this.adminUserId) {
            this.adminUserId = server.execute(() => {
                const createTestAdminUser = require('/imports/api/users/methods').createTestAdminUser;
                return createTestAdminUser.call({});
            });
        }

        return this.adminUserId;
    },


    getEngagements(filters={}, sort={}, include={}) {
        const cic = client.execute(() => Session.get('cic')).value
        filters.cicId = cic

        return server.execute((filters, sort, include) => {
            const Engagements = require('/imports/api/engagements/engagements').Engagements;
            const engagements = Engagements.find(filters, sort).fetch();
            return engagements

        }, filters, sort, include);
    },

    getDeletableEngagements(filters={}, sort={}, include={}) {
        const cic = client.execute(() => Session.get('cic')).value
        filters.cicId = cic

        return server.execute((filters, sort, include) => {
            const Engagements = require('/imports/api/engagements/engagements').Engagements;
            const engagements = Engagements.find(filters, sort).fetch();
            return engagements.filter((engagement) => !engagement.isPlaying())

        }, filters, sort, include);
    },

    getEngagementById(id) {
        return server.execute((id) => {
            const Engagements = require('/imports/api/engagements/engagements').Engagements;
            const Playlists = require('/imports/api/playlists/playlists').Playlists;

            const engagement = Engagements.findOne({_id:id});

            engagement.playlists = Playlists.find({engagementId:engagement._id}).map((playlist) => {
                playlist.items = playlist.itemIds.map((itemId) => {
                    const PlaylistItems = require('/imports/api/playlistitems/playlistitems').PlaylistItems
                    const item = PlaylistItems.findOne({_id: itemId})
                    return item;
                })

                return playlist;
            })
            return engagement

        }, id);
    },

    getPlayerStatusForPresentationMachine(pmId) {
        return server.execute((pmId) => {
            const PlayerStatus = require('/imports/api/playerstatus/playerstatus').PlayerStatus;
            const status = PlayerStatus.findOne({presentationMachineId:pmId});

            return status
        }, pmId);
    },

    getPlaylists(filters={}, sort={}, include={}) {
        return server.execute((filters, sort, include) => {
            const Playlists = require('/imports/api/playlists/playlists').Playlists
            const playlists = Playlists.find(filters, sort).fetch()

            return playlists.map((playlist) => {
                if(include.playlistitems) {
                    playlist.items = playlist.itemIds.map((itemId) => {
                        const PlaylistItems = require('/imports/api/playlistitems/playlistitems').PlaylistItems
                        const item = PlaylistItems.findOne({_id: itemId})

                        const Medias = require('/imports/api/medias/medias').Medias
                        const media = Medias.findOne({_id: item.mediaId})
                        item.media = media
                        return item
                    })
                }

                return playlist
            })
        }, filters, sort, include)
    },

    getPlaylistById(id) {
        const playlists = fixtures.getPlaylists({_id:id}, {}, {playlistitems:true})

        return playlists && playlists.length ? playlists[0] : null
    },

    getPlaylistItemsForPlaylist(playlistId) {
        const playlist = fixtures.getPlaylistById(playlistId);

        return playlist ? playlist.items : null
    },

    getFavorites(filters = {}) {
        return server.execute((filters) => {
            const Favorites = require('/imports/api/favorites/favorites').Favorites;
            return Favorites.find(filters).fetch();
        }, filters);
    },

}