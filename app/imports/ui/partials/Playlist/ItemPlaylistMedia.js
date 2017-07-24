import React from 'react'
import { DragSource, DropTarget } from 'react-dnd'
import Radium from 'radium'
import {findDOMNode} from 'react-dom'

import ButtonTextIcon from '/imports/ui/components/ButtonTextIcon'
import { FastIcon } from '/imports/ui/components/CustomSvg'
import itemType from '/imports/ui/itemType'

import Duration from '/imports/ui/components/Duration'
import cssVars from '/imports/ui/cssVars'

@Radium
export default class ItemPlaylistMedia extends React.Component{

  static defaultProps = {
    type: 'playlist',
    onClick : () => {},
  }

  handleClick = () => {
    const { type, duration , _id , presentationMachineId , setDuration } = this.props
    if(setDuration && type === 'image') {
      setDuration({_id,duration,presentationMachineId})
    }
  }

  renderItem(dragStatus) {
    const {name ,type, onClick , style , duration , _id , presentationMachineId , setDuration} = this.props
    const styles = {
      wrapper: {
        display: 'flex',
        alignItems : 'center',
        overflow: 'hidden'
      },
      duration: {
        color:cssVars.grey,
        marginLeft: '5px',
        fontSize : '13px',
      },
      durationLink : {
        color:cssVars.brandColor,
        borderBottom : `1px solid ${cssVars.brandColor}`,
        cursor : 'pointer',
      },
      name : {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        flexShrink: 10,
      },
      icon: {
        width: '20px',
        height: '20px',
        marginRight: '10px'
      },
      iconColor: {
        width: '25px',
        fill: '#F36F21'
      }
    }

    return(
      <div className="container-item-playlist-media" style={[styles.wrapper,style]} onClick={onClick} data-id={this.props.dataId}>
        <FastIcon key={type} style={styles.icon} type={type}/>
        <span style={styles.name} className="display-playlistitem-name">{ name }</span>
        <Duration className="display-playlistitem-duration" style={[styles.duration , (setDuration && type === 'image') && styles.durationLink]} duration={duration} onClick={this.handleClick} />
      </div>)

  }

  render(){
    return this.renderItem('')
  }
}




const Types = {
  DRAGITEM: 'DragItem'
};

const itemSource = {
  beginDrag(props) {
    return {
			id: props.id,
      name: props.name,
			index: props.index
    };
  }
};

const itemTarget = {
	drop(props) {
		//props.saveItems()
	},
	hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveItem(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
}


@DropTarget(Types.DRAGITEM, itemTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource(Types.DRAGITEM, itemSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
@Radium
export class DragItem extends ItemPlaylistMedia{


	static propTypes = {
		...ItemPlaylistMedia.propTypes,
		connectDragSource: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    isDragging: React.PropTypes.bool.isRequired
	}

	render(){
		const {isDragging,connectDragSource,connectDropTarget} = this.props
		const dragStatus = isDragging ? 'grabbing' : 'grab';
		return connectDragSource(
			connectDropTarget(
				this.renderItem(dragStatus)
			)
		)
	}
}

