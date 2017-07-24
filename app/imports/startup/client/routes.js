import React from 'react'
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session'
import { Tracker } from 'meteor/tracker'
import { SubsCache } from 'meteor/ccorcos:subs-cache'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { mount } from 'react-mounter'

import LoginPage from '/imports/ui/pages/LoginPage'
import SignupPage from '/imports/ui/pages/SignupPage'
import Page404 from '/imports/ui/pages/Page404'

// Layouts
import AdminLayout from '/imports/ui/layouts/AdminLayout'
import PresenterLayout from '/imports/ui/layouts/PresenterLayout'
import PublicLayout from '/imports/ui/layouts/PublicLayout'

// Partials
import TopNav from '/imports/ui/partials/_Common/TopNav'
import PresenterNav from '/imports/ui/partials/Presenter/Navbar'
import PresenterLeftNav from '/imports/ui/partials/Presenter/LeftNav'

// Pages
import ClientsPage from '/imports/ui/pages/ClientsPage'
import AddClientPage from '/imports/ui/pages/AddClientPage'
import EngagementsPage from '/imports/ui/pages/EngagementsPage'
import CreateEngagementPage from '/imports/ui/pages/CreateEngagementPage'
import MediaPage from '/imports/ui/pages/MediaPage'
import PlaylistPage from '/imports/ui/pages/PlaylistPage'
import AccountPage from '/imports/ui/pages/AccountPage'
import CreatePlaylistPage from '/imports/ui/pages/CreatePlaylistPage'
import EditUser from '/imports/ui/pages/EditUser'


// Pages Presenter
import EngagementsList from '/imports/ui/pages/presenter/Engagements'
import Industries from '/imports/ui/pages/presenter/Industries'
import Industry from '/imports/ui/pages/presenter/Industry'
import Favorites from '/imports/ui/pages/presenter/Favorites'
import Themes from '/imports/ui/pages/presenter/Themes'
import Theme from '/imports/ui/pages/presenter/Theme'
import Search from '/imports/ui/pages/presenter/Search'
import Settings from '/imports/ui/pages/presenter/Settings'

// Roles
import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '/imports/api/users/users.js';

// Models
import { PresentationMachines } from '/imports/api/presentationmachines/presentationmachines.js';
import { CanoncialPlaylists } from '/imports/api/canoncialplaylist/canoncialplaylists'
import { Cics } from '/imports/api/cics/cics'

export const subsManager = new SubsCache(10, -1);

FlowRouter.route('/signup', {
  name: 'Signup',
  action() {
    mount(PublicLayout, {
      content: () => (<SignupPage />),
    })
  },
})

FlowRouter.route('/404', {
  name: '404',
  action() {
    mount(PublicLayout, {
      content: () => (<Page404 />),
    })
  },
})

FlowRouter.notFound = {
  action() {
    mount(PublicLayout, {
      content: () => (<Page404 />),
    })
  },
}

FlowRouter.wait();

Tracker.autorun(() => {
  // wait on roles to intialise so we can check is use is in proper role
  if (Roles.subscription.ready() && !FlowRouter._initialized) {
    FlowRouter.initialize()
  }
});

// Track if the user is suddendly logout ( session expire etc..)
Tracker.autorun((c) => {
  const userId = Meteor.userId()
  if (c.firstRun) { return; }
  if (!userId) {
    FlowRouter.go('/login');
  }
});
// Public Routes
FlowRouter.route('/login', {
  name: 'Login',
  action() {
    mount(PublicLayout, {
      content: () => (<LoginPage />),
    })
  },
})

// reRoute the user to the proper page if he has a userId
FlowRouter.route('/', {
  triggersEnter: [() => {
    const userId = Meteor.userId()
    const redirectAfterLogin = Session.get('redirectAfterLogin')
    if (userId) {
      if (Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN], Roles.GLOBAL_GROUP)) {
        const go = redirectAfterLogin || '/engagements'
        return FlowRouter.go(go);
      }
      if (Roles.userIsInRole(Meteor.userId(), [ROLES.PRESENTER], Roles.GLOBAL_GROUP)) {
        return FlowRouter.go('/presenter/');
      }
      // If no roles sent it back to the login
      // return FlowRouter.go('/login');
    }
    return FlowRouter.go('/login');
  }],
})

// Admin routes groups
const AdminRouter = FlowRouter.group({
  triggersEnter: [() => {
    Session.setDefaultAuth('cic', Cics.findOne({})._id)
    if (!Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN], Roles.GLOBAL_GROUP)) {
      return FlowRouter.go('/login');
    }
  }],
});

AdminRouter.route('/media', {
  waitOn() {
    return [subsManager.subscribe('cics')]
  },
  name: 'Media',
  action() {
    mount(AdminLayout, {
      navbar: () => (<TopNav />),
      content: () => (<MediaPage />),
    })
  },
})

AdminRouter.route('/playlists', {
  waitOn() {
    return [subsManager.subscribe('cics')]
  },
  name: 'Playlists',
  action() {
    mount(AdminLayout, {
      navbar: () => (<TopNav />),
      content: () => (<PlaylistPage />),
    })
  },
})

AdminRouter.route('/playlists/createPlaylist', {
  waitOn() {
    return [subsManager.subscribe('cics')]
  },
  name: 'Playlists',
  actionName: 'Create Playlist',
  action() {
    mount(AdminLayout, {
      navbar: () => (<TopNav disabled />),
      content: () => (<CreatePlaylistPage />),
    })
  },
})

AdminRouter.route('/playlists/editPlaylist/:playlistId', {
  waitOn() {
    return [subsManager.subscribe('canoncialPlaylists'), subsManager.subscribe('tags'), subsManager.subscribe('playlistitems'), subsManager.subscribe('cics')]
  },
  data(params) {
    return CanoncialPlaylists.findOne({ _id: params.playlistId })
  },
  name: 'Playlists',
  actionName: 'Edit Playlist',
  action(params, queryParams, data) {
    mount(AdminLayout, {
      navbar: () => (<TopNav disabled />),
      content: () => (<CreatePlaylistPage playlistData={data} />),
    })
  },
})

AdminRouter.route('/client', {
  waitOn() {
    return [subsManager.subscribe('cics')]
  },
  name: 'Clients',
  action() {
    mount(AdminLayout, {
      navbar: () => (<TopNav />),
      content: () => (<ClientsPage />),
    })
  },
})

AdminRouter.route('/client/createClient', {
  waitOn() {
    return [subsManager.subscribe('cics')]
  },
  name: 'Clients',
  actionName: 'Add Client',
  action() {
    mount(AdminLayout, {
      navbar: () => (<TopNav disabled />),
      content: () => (<AddClientPage />),
    })
  },
})

AdminRouter.route('/client/edit/:clientId', {
  waitOn() {
    return [subsManager.subscribe('clients'), subsManager.subscribe('cics')]
  },
  name: 'Clients',
  actionName: 'Edit Client',
  action(params) {
    mount(AdminLayout, {
      navbar: () => (<TopNav disabled />),
      content: () => (<AddClientPage clientId={params.clientId} />),
    })
  },
})


AdminRouter.route('/engagements', {
  waitOn() {
    return [subsManager.subscribe('cics')]
  },
  name: 'Engagements',
  action() {
    mount(AdminLayout, {
      navbar: () => (<TopNav />),
      content: () => (<EngagementsPage />),
    })
  },
})

AdminRouter.route('/engagements/new', {
  waitOn() {
    return [subsManager.subscribe('cics')]
  },
  name: 'Engagements',
  actionName: 'Add Engagement',
  action() {
    mount(AdminLayout, {
      navbar: () => (<TopNav disabled />),
      content: () => (<CreateEngagementPage />),
    })
  },
})

AdminRouter.route('/engagements/edit/:engagementId', {

  waitOn({ engagementId }) {
    return [subsManager.subscribe('engagement.single', { engagementId }), subsManager.subscribe('cics')]
  },
  name: 'Engagements',
  actionName: 'Edit Engagement',
  action(params) {
    mount(AdminLayout, {
      navbar: () => (<TopNav disabled />),
      content: () => (<CreateEngagementPage engagementId={params.engagementId} />),
    })
  },
})

AdminRouter.route('/account', {
  waitOn() {
    return [subsManager.subscribe('cics')]
  },
  name: 'Account',
  action() {
    mount(AdminLayout, {
      navbar: () => (<TopNav disabled />),
      content: () => (<AccountPage />),
    })
  },
})


AdminRouter.route('/account/edit/:userId', {
  waitOn() {
    return [subsManager.subscribe('cics')]
  },
  name: 'Account',
  actionName: 'Edit User',
  action(params) {
    mount(AdminLayout, {
      navbar: () => (<TopNav disabled />),
      content: () => (<EditUser userId={params.userId} />),
    })
  },
})

// Presenter routes groups
const presenterRoutes = FlowRouter.group({
  prefix: '/presenter',
  name: 'Presenter',
  title: 'Presenter',
  triggersEnter: [
    function () {
      let route;
      if (!(Meteor.loggingIn() || Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN, ROLES.PRESENTER], Roles.GLOBAL_GROUP))) {
        route = FlowRouter.current();
        if (route.route.name !== '/login') {
          Session.set('redirectAfterLogin', route.path);
        }
        return FlowRouter.go('/login');
      }
    },
  ],
});

presenterRoutes.route('/', {
  waitOn() {
    return [subsManager.subscribe('presentationmachines')];
  },
  whileWaiting() {
    if (!Meteor.userId()) {
      return FlowRouter.go('/login')
    }
  },
  data() {
    return PresentationMachines.findOne()
  },
  triggersEnter: [function (context, redirect, stop, data) {
    if (!data) return null
    return FlowRouter.go('/presenter/:presentationMachineId/', { presentationMachineId: data._id });
  }],
})

presenterRoutes.route('/:presentationMachineId/', {

  triggersEnter: [function (context, redirect) {
    redirect(`/presenter/${context.params.presentationMachineId}/search`);
  }],
})
presenterRoutes.route('/:presentationMachineId/engagements', {
  name: 'Presentation-Engagements',
  action() {
    mount(PresenterLayout, {
      topNav: () => (<PresenterNav />),
      content: () => (<EngagementsList />),
      leftNav: () => (<PresenterLeftNav />)
    })
  },
})
presenterRoutes.route('/:presentationMachineId/industries', {
  name: 'Presentation-Industries',
  action() {
    mount(PresenterLayout, {
      topNav: () => (<PresenterNav />),
      content: () => (<Industries />),
      leftNav: () => (<PresenterLeftNav />)
    })
  },
})
presenterRoutes.route('/:presentationMachineId/industry/:industryId', {
  name: 'Presentation-Industries',
  action() {
    mount(PresenterLayout, {
      topNav: () => (<PresenterNav />),
      content: () => (<Industry />),
      leftNav: () => (<PresenterLeftNav />),
    })
  },
})
presenterRoutes.route('/:presentationMachineId/themes', {
  name: 'Presentation-Themes',
  action() {
    mount(PresenterLayout, {
      topNav: () => (<PresenterNav />),
      content: () => (<Themes />),
      leftNav: () => (<PresenterLeftNav />),
    })
  },
})
presenterRoutes.route('/:presentationMachineId/theme/:themeId', {
  name: 'Presentation-Themes',
  action() {
    mount(PresenterLayout, {
      topNav: () => (<PresenterNav />),
      content: () => (<Theme />),
      leftNav: () => (<PresenterLeftNav />),
    })
  },
})
presenterRoutes.route('/:presentationMachineId/favorites', {
  name: 'Presentation-Favorites',
  action() {
    mount(PresenterLayout, {
      topNav: () => (<PresenterNav />),
      content: () => (<Favorites />),
      leftNav: () => (<PresenterLeftNav />),
    })
  },
})

presenterRoutes.route('/:presentationMachineId/settings', {
  name: 'Presentation-Settings',
  action() {
    mount(PresenterLayout, {
      topNav: () => (<PresenterNav />),
      content: () => (<Settings />),
      leftNav: () => (<PresenterLeftNav />),
    })
  },
})

presenterRoutes.route('/:presentationMachineId/search', {

  name: 'Presentation-Search',
  action(params, queryParams) {
    mount(PresenterLayout, {
      topNav: () => (<PresenterNav />),
      content: () => (<Search />),
      leftNav: () => (<PresenterLeftNav />),
    })
  },
})

