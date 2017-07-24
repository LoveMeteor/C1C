import React from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import { moment } from 'meteor/momentjs:moment'
import { FastIcon} from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import Radium from 'radium'
import Duration from '/imports/ui/components/Duration'
import { updatePlaylist } from '/imports/api/playlists/methods'
import { setDurationToPlaylist, toggleToFavorite, isFavorite } from '/imports/ui/playlistHelpers'
import { DragItem } from '/imports/ui/components/PlaylistItem'
import { DragDropContext } from 'react-dnd';

import { runSpecificPlaylistItem } from '/imports/api/playerstatus/methods'
import { PLAYINGSTATUS } from '/imports/api/playerstatus/playerstatus'
import { Medias } from '/imports/api/medias/medias'

import TouchBackend from 'react-dnd-touch-backend';
import HTML5Backend from 'react-dnd-html5-backend';

// Dynamically select the good backend , for touch device we need to use Touchbackend and for browser we need the HTML5 one
@DragDropContext('ontouchstart' in window ? TouchBackend : HTML5Backend)
@Radium
export default class PlaylistPresenter extends TrackerReact(React.Component){

  constructor(props){
    super(props)

    this.state = {
      items : props.items,
      mounted : moment().format('X')
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.playlistId !== this.props.playlistId){
      this.state.mounted = moment().format('X')
    }
    this.setState({items:nextProps.items})

  }

  componentDidUpdate(prevProps){
    if(prevProps.items.length < this.props.items.length) {
      const cont = this.refs.playlistContainer
      cont.scrollTop = cont.scrollHeight;
    }
  }

  static defaultProps = {
    items : []
  }

  moveItem = (dragIndex, hoverIndex) => {
    const { items } = this.state;
    const dragItem = items[dragIndex];
    items.splice(dragIndex,1);
    items.splice(hoverIndex,0,dragItem)
    this.setState({items})
  }

  playItem(playlistItemId){
    if(this.props.playerStatus.playerUpdate.playlistItemId !== playlistItemId) {
      runSpecificPlaylistItem.call({
        presentationMachineId : this.props.pmId,
        playlistId : this.props.playlistId,
        playlistItemId
      })
    }
  }

  pauseItem = () => {
    this.props.updateStatus(PLAYINGSTATUS.PAUSE,this.props.playerStatus.playlistLoop)
  }

  depauseItem = () => {
    this.props.updateStatus(PLAYINGSTATUS.PLAYING,this.props.playerStatus.playlistLoop)
  }

  deleteItem(item){
    const itemIds = new Set(this.state.items.map((item) => item._id))
    itemIds.delete(item._id)
    updatePlaylist.call({
      _id : this.props.playlistId,
      overlay : false,
      itemIds : [...itemIds]
    })
  }

  saveItems = () => {
    const itemIds = this.state.items.map((item) => item._id)
    updatePlaylist.call({
      _id : this.props.playlistId,
      overlay : false,
      itemIds
    })
  }

  isCurrentItem(item) {
    return this.props.playerStatus.playerUpdate.playlistItemId === item._id
  }
  renderAction(item, context){
    const media = item.media()
    const editableDuration = media.type === 'image' ? 'editableDuration' : ''
    return (<div style={{display : "flex",alignItems: 'center',height: '30px'}}>
              <Duration className="item-duration" onClick={() => setDurationToPlaylist(item)} duration={item.duration} style={[styles.duration,styles[editableDuration]]}/>
              {this.isCurrentItem(item) && this.props.playerStatus.playingStatus === PLAYINGSTATUS.PLAYING &&
                <FastIcon onClick={() => this.pauseItem(item._id)} style={[styles.icon,styles.brandColor]} type="pause" />
              }
              {this.isCurrentItem(item) && this.props.playerStatus.playingStatus === PLAYINGSTATUS.PAUSE &&
                <FastIcon onClick={() => this.depauseItem(item._id)} style={[styles.icon,styles.brandColor]} type="play" />
              }
              {!this.isCurrentItem(item) &&
                <FastIcon onClick={() => this.playItem(item._id)} style={[styles.icon,styles.brandColor]} type="play" />
              }


            </div>)
  }

  renderSubAction(item,  context){
    const media = item.media()
    return (
      <div style={{display:'flex'}}>
        <FastIcon onClick={() => toggleToFavorite(media,Medias,context)} style={[styles.icon,isFavorite(media) && styles.brandColor]} type="favourite" />
        {!this.isCurrentItem(item) && <FastIcon onClick={() => this.deleteItem(item)} style={[styles.icon]} type="remove" />}
      </div>
    )
  }

  renderPlaylist(){
    return this.state.items.map((item,index) => <DragItem
          className="presenter-playlist-item-container" {...item.media()}
          style={[styles.item,this.isCurrentItem(item) && styles.playing]}
          parentMountTime={this.state.mounted}
          index={index}
          _id={item._id}
          key={item._id}
          action={(context) => this.renderAction(item, context)}
          subAction={(context) => this.renderSubAction(item, context)}
          saveItems={this.saveItems} moveItem={this.moveItem} />)
  }

  render(){
    return(
      <div id="playlist-presenter-container" style={styles.wrapper}>
        <div style={styles.header}>
          <div className="current-playlist-name-display" style={[styles.brandColor, styles.fontLarger]}>{this.props.name}</div>
        </div>
        <div className="current-playlist-container" ref="playlistContainer" style={styles.list} onDrop={this.onDrop}>
          {this.renderPlaylist()}
        </div>
      </div>
    )
  }
}

const styles = {
  wrapper: {
    backgroundColor: cssVars.lightGrey,
    width: 'calc( 100% - 20px )',
    marginLeft: '10px',
    height: '100%',
    marginBottom:'10px',
    display:'flex',
    flexDirection : 'column'
  },
  header: {
    padding: '15px',
    display: 'flex',
    borderTop: `1px solid ${cssVars.midGrey}`,
    justifyContent: 'space-between'
  },
  brandColor: {
    color: cssVars.brandColor,
    fill: cssVars.brandColor
  },
  duration : {
    fontSize : '14px'
  },
  editableDuration : {
    color :  cssVars.brandColor,
    borderBottom : `1px solid ${cssVars.brandColor}`,
    cursor : 'pointer'
  },
  icon: {
    width: '30px',
    height: '30px',
    overflow: 'hidden',
    marginLeft: '10px',
    fill : cssVars.darkGrey
  },
  list: {
    flex:1,
    marginLeft: '15px',
    marginRight: '15px',
    marginBottom : '15px',
    paddingLleft: 0,
    overflow: 'scroll',
    borderTop: `1px solid ${cssVars.midGrey}`,
    borderBottom: `1px solid ${cssVars.midGrey}`,
  },
  item: {
    fontSize: '14px',
  },
  fontLarger: {
    fontSize: 'larger'
  },
  dragText: {
    marginRight: '15px',
    fontSize:'small'
  },
  playing : {
    color : cssVars.brandColor,
    backgroundColor : '#f3f3f3'
  }
}
