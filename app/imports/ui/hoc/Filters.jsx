import React from 'react'

import TrackerReact from 'meteor/ultimatejs:tracker-react'

import { Industries } from '/imports/api/industry/industry'
import { Themes } from '/imports/api/themes/themes'
import { Tags } from '/imports/api/tags/tags'
import { CanoncialPlaylists } from '/imports/api/canoncialplaylist/canoncialplaylists'

import { subsManager } from '../../startup/client/routes'

export default function Filters(WrappedComponent) {
  class withFilters extends TrackerReact(React.Component) {

    constructor() {
      super()
      this.state = {
        subscription: {
          industries: subsManager.subscribe('industries'),
          themes: subsManager.subscribe('themes'),
          playlist: subsManager.subscribe('canoncialPlaylists'),
          items: subsManager.subscribe('playlistitems'),
          media: subsManager.subscribe('medias'),
          tags: subsManager.subscribe('tags'),
        },
      }
    }

    listPlaylist() {
      const filter = {}
      if (this.props.presentationMachine._id) {
        filter.presentationMachineId = this.props.presentationMachine._id
      }
      return CanoncialPlaylists.find(filter).fetch();
    }

    listThemes() {
      return Themes.find({}).fetch();
    }

    listIndustries() {
      return Industries.find({}).fetch();
    }


    render() {
      const filters = {
        listPlaylist: this.listPlaylist,
        listThemes: this.listThemes,
        listIndustries: this.listIndustries,
      }
      // Wraps the input component in a container, without mutating it. Good!
      return <WrappedComponent filters={filters} {...this.props} />;
    }
  }
  // Add a specific display name for debugging purpose
  withFilters.displayName = `WithFilters(${getDisplayName(WrappedComponent)})`;

  return withFilters
}

// Should be put outside this compoment
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
