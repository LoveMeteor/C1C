import React from 'react'
import {findDOMNode} from 'react-dom'
import { moment } from 'meteor/momentjs:moment'
import { FastIcon } from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import itemType from '/imports/ui/itemType'
import { DragSource, DropTarget } from 'react-dnd'
import Radium , { Style} from 'radium'

@Radium
export default class PlaylistItem extends React.Component{
  constructor() {
    super();
    this.toggleClick = this.toggleClick.bind(this);
    this.state = {
      toggle: false
    }
  }

  static defaultProps = {
    isGroup : false,
    isTrack : false,
    isFavorite : false,
    active : false,
    disabled : false,
    type : itemType.Video,
    onClick : () => {}
  }

  static propTypes = {
    name : React.PropTypes.string.isRequired,
    isGroup : React.PropTypes.bool,
    isTrack : React.PropTypes.bool,
    isFavorite : React.PropTypes.bool,
    active : React.PropTypes.bool,
    disabled : React.PropTypes.bool
  }

  componentDidMount(){
    if(this.props.parentMountTime){
      if(moment().format('X') > this.props.parentMountTime + 5000){
        this.liItem.classList.add("added");
        setTimeout(() => {
          this.liItem.classList.remove("added");
        }, 500);

      }
    }
  }

  handleClickOutside(){
    this.setState({'toggle':false});
  }

  toggleClick() {
    if(!this.props.disabled && this.props.subAction){
        this.setState({toggle: !this.state.toggle});
    }
  }

  renderIcon(){
    const {type,styleIcon} = this.props;
    return <FastIcon style={[styles.icon,styleIcon]} type={type}/>
  }

  // This is outside for easy extending it.
  renderItem(){

    const {name,sndText,style,styleTitle, _id, type} = this.props;
    const sub = this.state.toggle ? 'sub' : ''

    return(
      <li className={this.props.className} ref={(li) => { this.liItem = li; }} style={[styles.item,styles[sub],this.props.disabled && styles.disabled,style]} data-id={_id} data-type={type} onMouseOver={() => this.setState({hover:true})} onMouseOut={() => this.setState({hover:false})}>
        <div style={styles.staticElements} onClick={this.props.onClick}>
          {!this.state.toggle && this.renderIcon()}
          <span style={[styles.title,styleTitle]} className="track-title item-text" onClick={this.toggleClick}>{name}</span>
          <span className="snd-text">{sndText}</span>
        </div>
        {!this.state.toggle &&
          <div style={styles.actionWrapper}>
            {!this.props.disabled && this.props.action && this.props.action(this)}
          </div>
        ||
          <div style={[styles.actionWrapper,styles.actionWrapperOpen]}>
            {this.props.subAction(this)}
          </div>
        }
        <Style scopeSelector={`.${this.props.className}`} rules={{
          backgroundColor: cssVars.lightGrey,
          transition: 'background-color 2s'
        }} />
        <Style scopeSelector={`.${this.props.className}.added`} rules={{
          backgroundColor: cssVars.brandColor,

        }} />
      </li>

    )
  }

  render(){
    return this.renderItem()
  }
}

const styles = {
  item : {
    color : cssVars.darkGrey,
    border: `1px solid ${cssVars.midGrey}`,
    display: 'flex',
    alignItems: 'center',
    marginBottom : '-1px',
  },
  disabled : {
    opacity : 0.5,
  },
  sub : {
    backgroundColor : cssVars.midGrey
  },
  staticElements : {
    padding: '17px 10px',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden'

  },
  title : {
    cursor : 'pointer',
        overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  grab : {
    cursor : '-webkit-grab'
  },
  grabbing : {
    opacity : 0.5
  },
  actionWrapper : {
    marginLeft : 'auto',
    display: 'flex',
    alignItems: 'center',
    padding: '17px 10px',
  },
  actionWrapperOpen : {
    padding: '17px 10px 17px 0',
    background : '#FFF'
  },
  itemAction : {
    fill : cssVars.darkGrey,
    cursor : 'pointer',
    width : '25px',
    height : '25px',
  },
  icon : {
    fill : cssVars.darkGrey,
    flexShrink: 0,
    width : '20px',
    height : '20px',
    marginRight: '10px'
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
    props.saveItems()
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
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
}))
@Radium
export class DragItem extends PlaylistItem{


  static propTypes = {
    ...PlaylistItem.propTypes,
    connectDragSource: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    connectDragPreview: React.PropTypes.func.isRequired,
    isDragging: React.PropTypes.bool.isRequired
  }

  renderIcon(){
    const {type,styleIcon,connectDragSource,connectDropTarget,isDragging} = this.props
    const status = isDragging ? 'grabbing' : 'grab';
    return connectDragSource(
      connectDropTarget(
        <span><FastIcon style={[styles.icon,styles[status],styleIcon]} type={type}/></span>
      )
    )
  }

  render(){
    const {connectDragPreview} = this.props
    return connectDragPreview(
      this.renderItem()
    )
  }
}



