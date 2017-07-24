import React from 'react';
import ReactDOM from 'react-dom'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

import { CanoncialPlaylists } from '/imports/api/canoncialplaylist/canoncialplaylists'
import { PresentationMachines } from '/imports/api/presentationmachines/presentationmachines'
import { PlayerStatus } from '/imports/api/playerstatus/playerstatus'
import { Playlists } from '/imports/api/playlists/playlists'
import { Favorites } from '/imports/api/favorites/favorites'

import { insertPlaylistItem , insertPlaylistItemBulk , updatePlaylistItemDuration } from '/imports/api/playlistitems/methods'
import { updatePlaylist , overwritePlaylist } from '/imports/api/playlists/methods'
import { insertFavorite, removeFavorite , removeFavoriteWithItem} from '/imports/api/favorites/methods'
import { runEngagementPlaylist } from '/imports/api/playerstatus/methods'

import {FastIcon} from '/imports/ui/components/CustomSvg'
import { Button , TimeInput } from '/imports/ui/components/FormElements'
import Duration from '/imports/ui/components/Duration'
import DurationModal from '/imports/ui/components/DurationModal'
import Modal from 'boron/FadeModal';
import cssVars from '/imports/ui/cssVars'
import Radium from 'radium'

/**
 * Return the playlist of the player
 *
 * @export
 * @returns {Object} Selected playlist
 */
export function getCurrentPlaylist(){
  const player = getCurrentStatus()
  return Playlists.findOne({_id : player.playlistId});
}

export function getCurrentStatus(){
  const presentationMachineId = FlowRouter.current().params.presentationMachineId
  return PlayerStatus.findOne({presentationMachineId})
}

export function getCurrentPM(){
  const _id = FlowRouter.current().params.presentationMachineId
  return PresentationMachines.findOne({_id})
}

/**
 *
 *
 * @param {Object} Selected Playlist
 * @param {Object} Target Playlist
 */
function playlistOverwrite({_id : canoncialPlaylistId},{_id : playlistId}){
  overwritePlaylist.call({playlistId,canoncialPlaylistId},(error) => console.log(error))
}

function playlistAppend(item,playlist){
  // Get the item id and durations
  const mediaItems = item.items().map((item) => {
    const media = item.media()
    return {
      mediaId : item.mediaId,
      duration : media.type === 'video' ?  media.videoDuration : 60
    }
  })
  const newItems = insertPlaylistItemBulk.call({listItems : mediaItems})
  const mergedItems = new Set([...playlist.itemIds,...item.itemIds])
  updatePlaylist.call({_id:playlist._id, itemIds: [...mergedItems]},(error) => console.log(error))
}

/**
 * Add item to the current playlist
 *
 * @export
 * @param {any} item
 * @param {String} collection name
 */
export function	appendToPlaylist(item,collection){
  const playlist = getCurrentPlaylist()
  // If playlist
  if(collection === CanoncialPlaylists){
    // Append a modal container to the design
    if(document.getElementById('overwriteModal')){
      var div = document.getElementById('overwriteModal')
    }
    else {
      var div = document.createElement('DIV')
      div.id = "overwriteModal"
      document.getElementById('main').appendChild(div)
    }

    // Set the modal
    const modal = ReactDOM.render(
      (<OverwriteModal name={item.name} playlistOverwrite={() => playlistOverwrite(item,playlist)} playlistAppend={() => {playlistAppend(item,playlist)}} />),
      div
    );
    modal.refs.overwriteModal.show()
  }

  // Media
  else {
    const pId = insertPlaylistItem.call({
      mediaId : item._id,
      duration : item.type === 'video' ? item.videoDuration : 60
    })
    if(pId){
      const ids = new Set(playlist.itemIds)
      ids.add(pId)
      updatePlaylist.call({
        _id:playlist._id,
        itemIds: [...ids]
      })
    }

  }
}

export function setPlaylistToPlayer(engagementId,all = false){
  let PMIds = []
  if(all){
    PMIds = PresentationMachines.find({}).map(pm => pm._id)
  }
  else {
    PMIds.push(getCurrentPM()._id)
  }
  PMIds.forEach(presentationMachineId => {
      runEngagementPlaylist.call({
        presentationMachineId,
        engagementId
      })

  })
}

/**
 * Play an engagements
 *
 * @export
 * @param {any} item
 * @param {String} collection name
 */
export function	engagementPlayModal(engagement){
  let div
  if(document.getElementById('engagementModal')){
    div = document.getElementById('engagementModal')
  }
  else {
    div = document.createElement('DIV')
    div.id = "engagementModal"
    document.getElementById('main').appendChild(div)
  }

  // Set the modal
  const modal = ReactDOM.render(
    (<EngagementModal {...engagement} setPlaylistToPlayer={setPlaylistToPlayer} />),
    div
  );
  modal.refs.engagementModal.show()

}


/**
 * Return if the item is in favorite
 *
 * @export
 * @param {Object} Medias,Playlist or CanonicalPlaylist item object
 * @return {Boolean}
 */
export function isFavorite(item){
  return !!Favorites.findOne({itemId : item._id})
}

/**
 * Toggle an item to the user favorites
 *
 * @export
 * @param {Object} Selected Playlist
 * @param {Collection} Item Collection
 * @param {Object} The object context, for perfs purpose we refresh only when the user do an action
 */
export function toggleToFavorite(item,collection,context){
  if(isFavorite(item)){
    removeFavoriteWithItem.call({
      itemId : item._id,
      favoriteType : collection._name.toLowerCase()
    })
  }
  else{
    addToFavorite(item,collection)
  }
  context.forceUpdate()
}


/**
 * Add an item to the user favorites
 *
 * @export
 * @param {Object} Selected Playlist
 * @param {Collection} Item Collection
 */
export function addToFavorite(item,collection){
  const typeName = collection._name.toLowerCase()
  insertFavorite.call({itemId:item._id,favoriteType:typeName},(error) => console.log(error))
}

export function removeFromFavorite(item){
  removeFavorite.call({_id:item._id})
}

export function setDurationToPlaylist(item){
  if(item.media().type === 'video') return false
  // Append a modal container to the design
  if(document.getElementById('durationModal')){
    var div = document.getElementById('durationModal')
  }
  else {
    var div = document.createElement('DIV')
    div.id = "durationModal"
    document.getElementById('main').append(div)
  }
  // Set the modal
  const modal = ReactDOM.render(
    (<DurationModal {...item} onSubmit={(newDuration,overwrite) => setDuration(item,newDuration,overwrite)} />),
    div
  );
  modal.refs.durationModal.show()
}

function setDuration(item,newDuration,overwrite){
  if(overwrite) {
    getCurrentPlaylist().items().forEach((item) => {
      if(item.media().type === 'image'){
        updatePlaylistItemDuration.call({
          _id : item._id,
          duration : newDuration
        })
      }

    })
  }
  else {
    updatePlaylistItemDuration.call({
      _id : item._id,
      duration : newDuration
    })
  }

}

@Radium
export class OverwriteModal extends React.Component{

  closeModal(){
    this.refs.overwriteModal.hide()
  }

  render(){
    return (
      <Modal modalStyle={styles.modal} backdropStyle={styles.backdrop} ref="overwriteModal" className="modal-boron modal-addToPlayer">
          <div style={styles.top} className="modal-top"><FastIcon onClick={() => this.closeModal()} style={styles.icon} type="close" /></div>
          <div style={styles.header} className="modal-header">
            <div className="modal-logo">
              <FastIcon  style={styles.iconPlaylist} type="playlist" />
            </div>
            <div className="modal-info">
              <span className="modal-info-title">{this.props.name}</span>
            </div>
            <Duration className="modal-info-duration" duration={this.props.duration} />
          </div>
          <div style={styles.actionWrapper} onClick={() => this.closeModal()} className="modal-actions">
            <div style={styles.action}><FastIcon style={styles.actionIcon} onClick={() => this.props.playlistOverwrite()} type="remove" />Overwrite current playlist</div>
            <div style={styles.action} ><FastIcon style={styles.actionIcon} onClick={() => this.props.playlistAppend()} type="add" />Append playlist</div>
          </div>
      </Modal>
    )
  }
}

@Radium
export class EngagementModal extends React.Component{

  closeModal(){
    this.refs.engagementModal.hide()
  }

  render(){
    console.log(this.props)
    const pm = getCurrentPM()
    const logo = pm.logo.toLowerCase()
    return (
      <Modal modalStyle={styles.modal} backdropStyle={styles.backdrop} ref="engagementModal" className="modal-boron modal-addToPlayer">
          <div style={styles.top} className="modal-top"><FastIcon onClick={() => this.closeModal()} style={styles.icon} type="close" /></div>
          <div style={styles.header} className="modal-header">
            Play engagement playlists across :
          </div>
          <div style={styles.actionWrapper} onClick={() => this.closeModal()} className="modal-actions">
            <div style={styles.action} onClick={() => this.props.setPlaylistToPlayer(this.props._id,true)}><FastIcon style={styles.actionIcon} type="engagements" />All screens</div>
            <div style={styles.action} onClick={() => this.props.setPlaylistToPlayer(this.props._id)}><FastIcon style={styles.actionIcon}  type={logo} />{pm.name} only</div>
          </div>
      </Modal>
    )
  }
}

const styles = {

  modal : {
    width : '370px',
    color : cssVars.darkGrey
  },
  backdrop : {
    background : '#000'
  },

  top : {
    background : cssVars.brandColor,
    textAlign: 'right',
    padding: '10px'
  },
  header : {
    display:'flex',
    margin: '20px'
  },
  durationLine : {
    justifyContent: 'space-between',
    alignItems : 'center',
    fontSize: '18px',
    fontWeight: 400,
  },
  duration : {
    padding: '5px'
  },
  durationInput : {
    border: '0px',
    fontSize: '16px',
    width: '50px',
    color : cssVars.sndBrandColor
  },
  setButton : {
    alignItems : 'center',
    padding: '10px 0 30px',
    textAlign: 'center'
  },
  icon : {
    width : '30px',
    fill : '#FFF'
  },
  iconPlaylist : {
    width : '40px',
    fill : cssVars.darkGrey
  },
  actionWrapper : {
    display:'flex',
    justifyContent : 'space-around'
  },
  actionIcon : {
    width : '80px',
    display: 'block',
    margin: '10px auto 10px',
    fill : cssVars.darkGrey
  },
  action : {
    width: '80%',
    textAlign : 'center',
    marginBottom : '30px',
    fontSize : '14px',
    cursor : 'pointer'
  },
}