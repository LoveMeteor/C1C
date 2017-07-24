import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import Radium from 'radium'
import { DragDropContext } from 'react-dnd'

import { DragItem } from '/imports/ui/partials/Playlist/ItemPlaylistMedia'
import {FastIcon} from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'

import { PresentationMachines } from '/imports/api/presentationmachines/presentationmachines'
import { Medias } from '/imports/api/medias/medias'

import TouchBackend from 'react-dnd-touch-backend';
import HTML5Backend from 'react-dnd-html5-backend';
@DragDropContext('ontouchstart' in window ? TouchBackend : HTML5Backend)
@Radium
export default class PlaylistReview extends TrackerReact(React.Component){

  getPresentationMachine(){
    return PresentationMachines.findOne(this.props.presentationMachineId)
  }

  getMediaById(id){
    return Medias.findOne({_id: id})
  }

  render(){
    const {style,overlay,medias,mediasValid,setDuration,presentationMachineId} = this.props
    const {logo = null,name = ''} = this.getPresentationMachine() || {}
    if(!mediasValid) return false
    return (
    <div style={[styles.wrapper,style]}>
        <div style={styles.pmWrapper}>
          {name}
        </div>
        {overlay && (
          <div>
            <div style={styles.title}><i>Text overlay</i></div>
            {overlay}
          </div>
        )}
        <div>
          <div style={styles.title}><i>Media</i></div>
            {[...medias.entries()].map(([mediaId,data],index) => <DragItem dataId={mediaId} setDuration={setDuration} index={index} moveItem={(dragIndex, hoverIndex) => {this.props.moveItem(dragIndex, hoverIndex,presentationMachineId)}} style={styles.media} presentationMachineId={presentationMachineId} key={mediaId} {...this.getMediaById(mediaId)} duration={data.duration} /> )}
        </div>
      </div>
    )
  }

}

const styles = {
  wrapper : {
    width : '100%',
    flex : 1,
    overflow: 'hidden',
    paddingRight: '10px'
  },
  pmWrapper : {
    display : 'flex',
    alignItems : 'center',
    marginRight : '10px'
  },
  media : {
    marginBottom : '10px'
  },
  icon : {
    width : '30px',
    height : '30px',
    fill : cssVars.brandColor,
    marginRight : '10px'
  },
  title : {
    marginTop : '20px',
    marginBottom : '10px',

  }
}