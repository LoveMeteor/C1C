import React from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

import cssVars from '/imports/ui/cssVars'
import Radium from 'radium'

// Components
import ControlMedia from '/imports/ui/partials/Presenter/ControlMedia'
import PlaylistPresenter from '/imports/ui/partials/Presenter/PlaylistPresenter'

import { subsManager } from '../../../startup/client/routes'

// API
import { Engagements } from '/imports/api/engagements/engagements'
import { Playlists } from '/imports/api/playlists/playlists'
import { PlaylistItems } from '/imports/api/playlistitems/playlistitems'
import { PlayerStatus } from '/imports/api/playerstatus/playerstatus'
import { updatePlayerStatus,runAmbientPlaylist,runSpecificPlaylistItem } from '/imports/api/playerstatus/methods'

@Radium
export default class Player extends TrackerReact(React.Component){
  constructor(){
    super()
    this.state = {
      subscription: {
        medias: subsManager.subscribe('medias'),
        playlistitems: subsManager.subscribe('playlistitems'),
        playlists: subsManager.subscribe('playlists'),
        playerstatus: subsManager.subscribeFor(-1,'playerstatus'),
        presentationmachines: subsManager.subscribeFor(-1,'presentationmachines'),
        favorites: subsManager.subscribe('favorites'),
      }
    }
  }

  getPlayerStatus(presentationMachineId){
    return PlayerStatus.findOne({presentationMachineId})
  }

  updateStatus = (playingStatus,playlistLoop) => {
    const { presentationMachineId } = FlowRouter.current().params
    updatePlayerStatus.call({
      presentationMachineId,
      playlistId : this.getPlaylist(presentationMachineId)._id,
      playingStatus,
      playlistLoop
    })
  }

  runAmbient = () => {
    runAmbientPlaylist.call({presentationMachineId : FlowRouter.current().params.presentationMachineId})
  }

  getEngagementName(){
    const playlist = this.getPlaylist()
    if(playlist.ambientPlaylist){
      return 'Ambient'
    }
    else {
      const engagement = Engagements.findOne({_id : playlist.engagementId})
      if(engagement){
        return engagement.name
      }
      return ''
    }
  }

  getMedia(status) {
    if(status && status.playerUpdate){
      const { playlistItemId,playedDuration } =  status.playerUpdate
      const item = PlaylistItems.findOne({_id: playlistItemId})

      if(item){
        const {duration} = item
        const {type,name} = item.media()
        return {type,name,totalTime : duration, currentTime : playedDuration}
      }
    }

    return {}
  }

  playItem = (playlistItemId) => {
    const presentationMachineId = FlowRouter.current().params.presentationMachineId
    const status = this.getPlayerStatus(presentationMachineId)
    if(playlistItemId && status.playerUpdate.playlistItemId !== playlistItemId) {
      runSpecificPlaylistItem.call({
        presentationMachineId,
        playlistId : status.playlistId,
        playlistItemId
      })
    }
  }


  getPrevAndNext(status,items){
    const { playlistItemId } =  status.playerUpdate
    let prevItem,nextItem
    items.forEach(({_id},pos) => {

      if(_id == playlistItemId) {
        prevItem = items[pos-1] ? items[pos-1]._id : null
        nextItem = items[pos+1] ? items[pos+1]._id : null
      }
    })
    return {prevItem,nextItem}
  }

  getPlaylist() {
    const presentationMachineId = FlowRouter.current().params.presentationMachineId
    const status = this.getPlayerStatus(presentationMachineId)
    if(!status) return null
    return Playlists.findOne({_id : status.playlistId })
  }

  render(){
    const presentationMachineId = FlowRouter.current().params.presentationMachineId
    const playlist = this.getPlaylist(presentationMachineId)
    const status = this.getPlayerStatus(presentationMachineId)
    const currentMedia = this.getMedia(status)

    if(!playlist) return null
    const items = playlist.itemsInOrder()
  	return(
  		<div style={styles.wrapper} id="player">
        <ControlMedia {...status} {...this.getPrevAndNext(status,items)} {...currentMedia} playItem={this.playItem} isAmbient={playlist.ambientPlaylist} runAmbient={this.runAmbient} updateStatus={this.updateStatus} />
        <PlaylistPresenter name={this.getEngagementName()} playerStatus={this.getPlayerStatus(presentationMachineId)}  playlistId={playlist._id} pmId={presentationMachineId} updateStatus={this.updateStatus} items={items} />
  		</div>
  	)
  }
}


const styles = {
  wrapper : {
    backgroundColor: cssVars.brandColor,
    width: '50%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
}
