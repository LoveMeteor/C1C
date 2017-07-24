import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {MediasView} from '/imports/ui/partials/Presenter/ContainerView'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

import { Industries } from '/imports/api/industry/industry'

import { subsManager } from '../../../startup/client/routes'

import ListPlaylistContainer from  '/imports/ui/partials/Presenter/ListPlaylistContainer'
import ListMediaContainer from  '/imports/ui/partials/Presenter/ListMediaContainer'

export default class Industry extends TrackerReact(React.Component){
  constructor(){
    super();
    this.handleChangePlaylist = this.handleChangePlaylist.bind(this);

    this.state = {
      playlistView : true,
      subscription: {
        industries: subsManager.subscribe('industries')
      },
      name : ''
    }
  }

  componentDidMount(){
    this.tracker = Tracker.autorun(()=> {
      FlowRouter.watchPathChange()
      let industry = Industries.findOne({_id : FlowRouter.current().params.industryId})
      if(industry){
        this.setState({name:industry.name})
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
