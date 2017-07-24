import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {MediasView} from '/imports/ui/partials/Presenter/ContainerView'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

import { subsManager } from '../../../startup/client/routes'

import { Themes } from '/imports/api/themes/themes'

import ListPlaylistContainer from  '/imports/ui/partials/Presenter/ListPlaylistContainer'
import ListMediaContainer from  '/imports/ui/partials/Presenter/ListMediaContainer'
import OnOffSwitch from  '/imports/ui/components/OnOffSwitch'

export default class Theme extends TrackerReact(React.Component){
  constructor(){
    super();
    this.handleChangePlaylist = this.handleChangePlaylist.bind(this);

    this.state = {
      playlistView : true,
      subscription: {
        themes: subsManager.subscribe('themes'),
      }
    }
  }

  componentDidMount(){
    this.tracker = Tracker.autorun(()=> {
      FlowRouter.watchPathChange()
      let theme = Themes.findOne({_id : FlowRouter.current().params.themeId})
      if(theme){
        this.setState({name:theme.name})
      }
    })
  }

  componentWillUnmount(){
    this.tracker.stop()
  }

  handleChangePlaylist(){
    this.setState({playlistView : !this.state.playlistView});
  }

  render(){
    return (
      <MediasView title={this.state.name} onClick={this.handleChangePlaylist} active={this.state.playlistView}>
        {this.state.playlistView &&
          <ListPlaylistContainer /> ||
          <ListMediaContainer />
        }
      </MediasView>
    )

  }
}
