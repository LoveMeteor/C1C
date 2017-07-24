import React from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {FlowRouter} from 'meteor/ostrio:flow-router-extra'

import { subsManager } from '../../../startup/client/routes'


import { CanoncialPlaylists } from '/imports/api/canoncialplaylist/canoncialplaylists'

import { appendToPlaylist , toggleToFavorite , isFavorite } from '/imports/ui/playlistHelpers'
import PlaylistItem  from '/imports/ui/components/PlaylistItem'
import { FastIcon } from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import PreviewModal from '/imports/ui/components/PreviewModal'

export default class ListPlaylistContainer extends TrackerReact(React.Component){
	constructor(){
    super();

    this.state = {
      presentationMachineId : FlowRouter.current().params.presentationMachineId,
      industryId : FlowRouter.current().params.industryId,
      themeId : FlowRouter.current().params.themeId,
      subscription: {
        canoncialPlaylists: subsManager.subscribe('canoncialPlaylists'),
        tags: subsManager.subscribe('tags'),
        playlists: subsManager.subscribe('playlists'),
        playlistitems: subsManager.subscribe('playlistitems'),
        medias: subsManager.subscribe('medias'),
        favorites: subsManager.subscribe('favorites'),
        downloadstatus : subsManager.subscribe('downloadstatus')
      }
    }
  }

  playlists(){
    const options = { presentationMachineId : this.state.presentationMachineId }
    if(this.state.industryId) {
      options.industryIds = this.state.industryId;
    }
    if(this.state.themeId) {
      options.themeId = this.state.themeId;
    }
    return CanoncialPlaylists.find(options,{sort: {createdAt: -1}}).fetch();
  }

  renderAction(item){
    return (<FastIcon onClick={() => appendToPlaylist(item,CanoncialPlaylists)} style={[styles.icon,styles.brandColor]} type="add" />)
  }

  renderSubAction(item,context){
    const mediaFiles = item.itemsInOrder().map(pI => pI.media())
    const favorite = isFavorite(item) ? 'favorite' : ''
    return (
      <div style={{display:'flex'}}>
        <FastIcon onClick={() => toggleToFavorite(item,CanoncialPlaylists,context)} style={[styles.icon,styles[favorite]]} type="favourite" />
        <PreviewModal medias={mediaFiles} styleIcon={styles.icon} />
      </div>
    )
  }

  renderItem(){
    return this.playlists().map((playlist) => (<PlaylistItem {...playlist} disabled={!playlist.isReady()} key={playlist._id} type="playlist" action={() => this.renderAction(playlist)} subAction={(context) => this.renderSubAction(playlist,context)} />))
  }

  render() {
  	return (
  	  <div>
        <ul style={styles.list} className="playlist-list items-list">
          {this.renderItem()}
        </ul>
      </div>
  	)
  }
}

const styles = {
  error : {
    color : cssVars.brandColor
  },
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