import React from 'react';
import { FastIcon } from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import Radium from 'radium'
// Components
import ProgressBar from '/imports/ui/components/ProgressBar'
import { PLAYINGSTATUS } from '/imports/api/playerstatus/playerstatus'
import { moment } from 'meteor/momentjs:moment'


@Radium
export default class ControlMedia extends React.Component{

  constructor(){
    super()
  }

  isPlaying(){
    return this.props.playingStatus === PLAYINGSTATUS.PLAYING
  }

  handleRewind = () => {
    this.props.playItem(this.props.prevItem)
  }

  handlePlayButton = () => {
    const toggle = this.isPlaying() ? PLAYINGSTATUS.PAUSE : PLAYINGSTATUS.PLAYING
    this.props.updateStatus(toggle,this.props.playlistLoop)
  }

  handleForward = () => {
    this.props.playItem(this.props.nextItem)
  }

  handleRepeat = () => {
    this.props.updateStatus(this.props.playingStatus,!this.props.playlistLoop)
  }



  static defaultProps = {
    totalTime: '00',
    currentTime: '00',
    name : '',
    type : 'video'
  }

  render(){
    const {totalTime ,currentTime,presentationMachineId } = this.props
    const total = moment(totalTime*1000).format('mm:ss')
    const current = moment(currentTime*1000).format('mm:ss')

    const playIcon = this.isPlaying() ? 'pause' : 'play'
    return(
      <div id="media-control-container" style={styles.playerInfos}>
        <div style={styles.playerControls}>
          <div  style={[styles.btnControl,styles.ambient]}><FastIcon onClick={!this.props.isAmbient && this.props.runAmbient} style={[styles.icon,this.props.isAmbient && styles.active ]} type="ambient"/></div>
          <div style={styles.btnControl}><FastIcon onClick={this.handleRewind} style={[styles.icon,!this.props.prevItem && styles.iconInactive ]} type="rewind"/></div>
          <div style={[styles.btnControl]}>
              <FastIcon onClick={this.handlePlayButton} style={styles.iconAction} type={playIcon}/>
          </div>
          <div style={styles.btnControl}><FastIcon onClick={this.handleForward} style={[styles.icon,!this.props.nextItem && styles.iconInactive ]} type="forward"/></div>
          <div style={[styles.btnControl,styles.repeat]}><FastIcon  onClick={!this.props.isAmbient && this.handleRepeat} style={[styles.icon,this.props.playlistLoop && styles.active ]} type="repeat"/></div>
        </div>
        <ProgressBar key={presentationMachineId} {...{currentTime,totalTime}}/>
        <div className="current-playing-item-container" style={styles.listItem}>
          <div style={[styles.playerTrack, styles.brandColor]}><FastIcon style={this.state.smallIcon} type={this.props.type}/></div>
          <div className="display-playlistitem-name" style={styles.textTrack}>{this.props.name}</div>
          <div style={{fontSize: 'small'}}><span className="current-time" style={styles.brandColor}>{current}</span>  / <span className="total-time">{total}</span></div>
        </div>
      </div>
    )
  }
}

const styles = {
  playerInfos: {
    borderLeft: '1px solid #d2d2d2',
    borderRight: '1px solid #d2d2d2',
    backgroundColor: '#f3f3f3',
    width: 'calc( 100% - 20px )',
    marginLeft: '10px',
    padding: '15px',
  },
  playerControls : {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  btnControl : {
    marginLeft: '15px',
    marginRight: '15px',
  },
  btnControlXl : {
    width: '40px',
  },
  repeat : {
    marginRight: '10px',
    marginLeft : 'auto'
  },
  ambient : {
    marginLeft: '10px',
    marginRight : 'auto'
  },
  playerTrack : {
    border: 'none',
    width: '20px',
    height: '20px',
    trackIconSvg : {
      fill: cssVars.brandColor
    }
  },
  icon: {
    width: '40px',
    height: '40px',
    fill: cssVars.darkGrey
  },
  iconInactive : {
    opacity : '0.2'
  },
  brandColor: {
    color: cssVars.brandColor,
    fill: cssVars.brandColor
  },
  active : {
    fill: cssVars.brandColor
  },
  iconAction: {
    width: '65px',
    height: '65px',
    fill: cssVars.brandColor,
    cursor: 'pointer'
  },
  listItem: {
    marginTop: '15px',
    display: 'flex',
    alignItems: 'center'
  },
  smallIcon: {
    width: '20px',
    height: '20px'
  },
  textTrack: {
    marginLeft: '20px',
    marginRight: 'auto',
    color: cssVars.darkGrey,
    fontWeight: '400',
    fontSize: 'smaller'
  }
}