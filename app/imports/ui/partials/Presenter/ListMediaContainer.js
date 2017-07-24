import React from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {FlowRouter} from 'meteor/ostrio:flow-router-extra'

import { subsManager } from '../../../startup/client/routes'


import { getCurrentPlaylist , toggleToFavorite , isFavorite } from '/imports/ui/playlistHelpers'

import { Medias } from '/imports/api/medias/medias'
import { appendMediaToPlaylist } from '/imports/api/playlists/methods'
import PlaylistItem  from '/imports/ui/components/PlaylistItem'
import { FastIcon } from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import PreviewModal from '/imports/ui/components/PreviewModal'

export default class ListMediaContainer extends TrackerReact(React.Component){
	constructor(){
    super();

    this.state = {
      presentationMachineId : FlowRouter.getParam('presentationMachineId'),
      industryId : FlowRouter.getParam('industryId'),
      themeId : FlowRouter.getParam('themeId'),
      subscription: {
        medias: subsManager.subscribe('medias'),
        playlistitems: subsManager.subscribe('playlistitems'),
        favorites: subsManager.subscribe('favorites'),
        downloadstatus : subsManager.subscribe('downloadstatus')
      }
    }
  }

  listMedias(){
    const options = { presentationMachineIds : this.state.presentationMachineId }
    if(this.state.industryId) {
      options.industryIds = this.state.industryId;
    }
    if(this.state.themeId) {
      options.themeId = this.state.themeId;
    }
    return Medias.find(options,{sort: {createdAt: -1}}).fetch()
  }

  handleAppendToMedia = ({_id : mediaId}) => {
    appendMediaToPlaylist.call({playlistId : getCurrentPlaylist()._id,mediaId})
  }

  renderAction(item){
    return (<FastIcon onClick={() => this.handleAppendToMedia(item)} style={[styles.icon,styles.brandColor]} type="add" />)
  }

  renderSubAction(item,context){
    const favorite = isFavorite(item) ? 'favorite' : ''
    return (
      <div style={{display:'flex'}}>
        <FastIcon onClick={() => toggleToFavorite(item,Medias,context)} style={[styles.icon,styles[favorite]]} type="favourite" />
        <PreviewModal medias={[item]} styleIcon={[styles.icon]}/>
      </div>
    )
  }

  renderItems(){
    return this.listMedias().map((item) => (<PlaylistItem {...item} disabled={!item.isReady(this.state.presentationMachineId)} action={() => this.renderAction(item)} subAction={(context) => this.renderSubAction(item,context)} key={item._id}  />))
  }

  render(){

  	return (
      <ul style={styles.list} className="media-list items-list">
        {this.renderItems()}
      </ul>
  	)
  }
}

const styles = {
  list : {
    paddingLeft: 0,
  },
  icon : {
    width: '30px',
    height: '30px',
    fill : cssVars.darkGrey,
    marginLeft: '10px',
  },
  favorite : {
    fill : cssVars.brandColor,
  }
}