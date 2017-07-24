import React from 'react'
import Modal from 'react-modal'
import Radium from 'radium'
import TrackerReact from 'meteor/ultimatejs:tracker-react'

import {FastIcon} from '/imports/ui/components/CustomSvg'
import { subsManager } from '../../startup/client/routes'

import cssVars from '/imports/ui/cssVars'

@Radium
export class Video extends React.Component{
  constructor(){
    super()
    this.state = {
      playIcon : 'play',
      timeProgress : 0,
      loadProgress : 0,
      playing : false,
    }
  }
  togglePlay(el){
    if(el.paused){
      el.play()
    }
    else {
      el.pause()
    }
  }

  handleProgress = () => {
    const {duration,buffered} = this.refs.video
    let loadProgress = 0
    if(buffered.length>0){
      loadProgress = (100/duration)*buffered.end(0)
    }
    else {
      loadProgress = 100
    }
    this.setState({loadProgress})
  }

  handleStop = () => {
    this.setState({playing:false})
  }

  handlePlaying = () => {
    this.setState({playing:true})
  }

  handleTime = () => {
    const {duration,currentTime} = this.refs.video
    const timeProgress = (100/duration)*currentTime
    this.setState({timeProgress})
  }

  render(){
      const {playing,timeProgress,loadProgress} = this.state
      const playIcon = playing ? 'pause' :'play'
      return (
        <div>
          <video
            preload="auto"
            ref="video"
            onTimeUpdate={this.handleTime}
            onProgress={this.handleProgress}
            onClick={() => {this.togglePlay(this.refs.video)}}
            onEnded={this.handleStop}
            onPlaying={this.handlePlaying}
            onPause={this.handleStop}
            style={styles.video}
            src={this.props.src} />
          <div style={videoStyles.loadBar}>
            <div style={[videoStyles.progress,videoStyles.timeProgress,{width:`${timeProgress}%`}]}></div>
            <div style={[videoStyles.progress,videoStyles.loadProgress,{width:`${loadProgress}%`}]}></div>
          </div>
          <div style={styles.player}>
            <FastIcon onClick={() => {this.togglePlay(this.refs.video)}} style={styles.playerIcon} type={playIcon}/>
          </div>
        </div>
      )
  }
}

const videoStyles = {
  loadBar : {
    position: 'absolute',
    bottom: '4px',
    width: '100%',
    height : '5px',
    opacity : '0.8',
    backgroundColor : 'rgba(255,255,255,0.3)'
  },
  progress : {
    position: 'absolute',
    bottom: 0,
    height : '5px',
    transition: 'width 0.5s linear'
  },
  timeProgress : {
    zIndex: 51,
    backgroundColor : cssVars.brandColor,
  },
  loadProgress : {
    zIndex: 50,
    backgroundColor : cssVars.darkGrey,

  }
}

@Radium
export default class PreviewModal extends TrackerReact(React.Component){

  constructor(){
    super()
    this.state = {
      modalIsOpen : false,
      playIcon : 'play',
      playingIndex : 0,
      subscription : {
        mediafiles: subsManager.subscribe('mediafiles'),
      }
    }
  }

  static defaultProps = {
    showPreview : false
  }

  static propTypes = {
    medias : React.PropTypes.array.isRequired,
    showPreview : React.PropTypes.bool
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }



  nextMedia() {
    let playingIndex = this.state.playingIndex;
    if(playingIndex < this.props.medias.length - 1)
      playingIndex++;
    this.setState({playingIndex});
  }

  prevMedia() {
    let playingIndex = this.state.playingIndex;
    if(playingIndex > 0)
      playingIndex--;
    this.setState({playingIndex});
  }

  renderArrows() {
    return <div>
      {this.state.playingIndex > 0 ?
          <div style={styles.leftArrow}>
            <FastIcon onClick={() => this.prevMedia()} style={styles.playerIcon} type="arrow-left"/>
          </div>
        : null}
      {this.state.playingIndex < this.props.medias.length - 1 ?
          <div style={styles.rightArrow}>
            <FastIcon onClick={() => this.nextMedia()} style={styles.playerIcon} type="arrow-right"/>
          </div>
        : null}
    </div>
  }

  getMedia(media){
    return media.mediaFile()
  }

  renderMedia(media){
    const mediaFile = this.getMedia(media)
    if(mediaFile && mediaFile.link()){
      if(mediaFile.isVideo){
        return (<Video src={mediaFile.link()} />)
      }
      if(mediaFile.isImage) {
        const imageUrl = mediaFile.versions['preview']!=null ? mediaFile.link('preview') : mediaFile.link()
        return <img style={styles.image} onClick={() => this.closeModal()} src={imageUrl} />
      }
    }
    return <div style={styles.error}>No media</div>
  }

  renderPreview(media){
    const mediaFile = this.getMedia(media)
    if(mediaFile && mediaFile.isImage){
      const imageUrl = mediaFile.versions['thumbnail']!=null ? mediaFile.link('thumbnail') : mediaFile.link()
      return <img ref="image" onClick={() => this.openModal()} style={styles.mediaPreviewImg} src={imageUrl} />
    }
    return null
  }

  render(){

    const {playingIndex, modalIsOpen} = this.state
    const { style , styleIcon , medias , showPreview} = this.props
    const currentMedia = medias[playingIndex]
    const arrows = this.renderArrows(styles)
    return (
       <div className="action-preview-media" style={[styles.wrapper,style]}>
          {showPreview && this.renderPreview(currentMedia) || <FastIcon onClick={() => this.openModal()} type="play" style={[styles.icon,styleIcon]} />}
          {modalIsOpen &&
          <Modal contentLabel="media" style={modalStyles} isOpen={true} onRequestClose={() => this.closeModal()}>
            <div style={styles.close}><FastIcon onClick={() => this.closeModal()} style={styles.closeIcon} type="close"/></div>
            <div style={styles.contentWrapper}>
              {this.renderMedia(currentMedia)}
            </div>
            { arrows }
          </Modal>}
        </div>
    )
  }
}


const styles = {
  wrapper : {
    display: 'flex'
  },
  contentWrapper : {
    position:'relative',
  },
  icon: {
    width : '30px',
    height : '30px',
    fill : cssVars.brandColor,
    cursor : 'pointer'
  },
  close : {
    position: 'absolute',
    right: '1px',
    top : '1px',
    zIndex : 1100,
  },
  closeIcon : {
    cursor : 'pointer',
    width: '50px',
    height: '50px',
    fill : '#FFF'
  },
  mediaPreviewImg : {
    cursor : 'pointer',
    width: '30px',
    height: '30px',
    borderRadius: '15px',
  },
  containerImage : {
    display: 'flex'
  },
  video : {
    maxWidth: '100%',
    objectFit : "contain",
  },
  image : {
    objectFit : "contain",
    maxWidth: '100%'
  },
  player : {
    position: 'absolute',
    left: '50%',
    marginLeft: "-30px",
    bottom: '30px',
  },
  playerIcon : {
    fill: cssVars.grey,
    backgroundColor: 'transparent',
    width : '60px',
    cursor : 'pointer'
  },
  leftArrow : {
    position: 'fixed',
    top: '50%',
    marginTop: '-30px',
    left : '30px',
  },
  rightArrow : {
    position: 'fixed',
    top: '50%',
    marginTop: '-30px',
    right : '30px'
  },
  error : {
    color : '#FFF'
  }
}

const modalStyles = {
  overlay : {
    backgroundColor : cssVars.overlay,
    display:'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  content: {
    position:'static',
    padding:0,
    background:'none',
    overflow: 'hidden',
    border:0,
    margin: '3%',
    top: 'initial',
    bottom:  'initial',
    left: 'initial',
    right: 'initial',
    display: 'flex'
  }
}