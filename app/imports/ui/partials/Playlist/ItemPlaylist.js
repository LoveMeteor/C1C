import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import Radium from 'radium'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import KeyHandler, { KEYPRESS } from 'react-key-handler'

import itemType from '/imports/ui/itemType'
import Item from '/imports/ui/components/ItemCommon'
import { FastIcon } from '/imports/ui/components/CustomSvg'
import OnOffSwitch from '/imports/ui/components/OnOffSwitch'

import ModalAnimation from '/imports/ui/components/ModalAnimation'
import DeleteItemModal from '/imports/ui/partials/Modals/DeleteItemModal'
import PMItems from '/imports/ui/components/PMItems'
import { Button, TimeInput } from '/imports/ui/components/FormElements'
import ButtonSvg from '/imports/ui/components/ButtonSvg'
import ItemPlaylistMedia from '/imports/ui/partials/Playlist/ItemPlaylistMedia'
import cssVars from '/imports/ui/cssVars'
import PreviewModal from '/imports/ui/components/PreviewModal'
import { PresentationMachines } from '/imports/api/presentationmachines/presentationmachines'

@Radium
export class MediaItem extends React.PureComponent {

  static defaultProps = {
    selected: false,
  }

  getImageLink() {
    return this.props.media.mediaFile().link()
  }

    // Use renderItem for sharing the code with the dragItem
  renderItem(dragStatus) {
    let durationInput = null
        // If we need to set the time on this media ( only for image type)
    if (this.props.onSetTime && this.props.media.type === 'image') {
      durationInput = (<TimeInput
        placeholder="00:00"
        value={this.props.duration}
        style={styles.timeInput}
        onChange={this.props.onSetTime}
      />)
    }
    return (
      <div className="container-media-item" data-id={this.props.media._id} data-type={this.props.media.type}>
        <Item style={styles[dragStatus]}>
          <ItemPlaylistMedia
            style={styles.mediaAction}
            type={this.props.media.type}
            name={this.props.media.name}
            duration={this.props.duration}
            input={durationInput}
          />
          <PreviewModal style={styles.mediaPreview} medias={[this.props.media]} />
          {this.props.hasOverlay &&
            <OnOffSwitch off="Overlay" onClick={this.props.onToggleOverlay} active={this.props.overlay} />
                    }
          {this.props.onDelete && (
            <FastIcon
              style={styles.iconDelete}
              type="remove"
              onClick={() => {
                this.props.onDelete(this.props.media)
              }}
            />
                    )}
          {this.props.onAdd && (
            <div onClick={() => {
              this.props.onAdd(this.props.media)
            }}
            >
              {this.props.media.selected &&
              <FastIcon style={styles.icon} type="added" />
                            }
              {!this.props.media.selected &&
              <FastIcon style={styles.icon} type="add" />
                            }
            </div>
                    )}
        </Item>
      </div>
    )
  }

  render() {
    return this.renderItem('')
  }

}


@Radium
export default class ItemPlaylist extends TrackerReact(React.PureComponent) {

  constructor(props) {
    super(props)

    this.handleDetail = this.handleDetail.bind(this)
    this.hideModal = this.hideModal.bind(this);
    this.getMedia = this.getMedia.bind(this)
    this.state = {
      isOpen: false,
      isSelected: props.selectedItems ? this.isAllSelected(props.selectedItems) : false,
    }
  }

  static propTypes = {
    name: React.PropTypes.string,
    duration: React.PropTypes.string,
    typeMedia: React.PropTypes.string,
  }

  static defaultProps = {
    name: 'Sample Item',
    typeMedia: 'video',
    itemIds: [],
  }

  getIconUrl(type) {
    return `/images/icons/icon_${itemType[type]}.svg`;
  }

  handleDetail() {
    this.setState({ isOpen: !this.state.isOpen })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedItems/* && (nextProps.selectedItems !== this.props.selectedItems)*/) {
      this.setState({ isSelected: this.isAllSelected(nextProps.selectedItems) })
    }
  }

    // Check if the whole playlist is selected ( mean that all the media are selected )
  isAllSelected(selected) {
        // TODO : Fix this, it's is killing the perfs !
    const items = this.props.items.fetch()
    if (items.length) {
      return items.every(item => selected.has(item.mediaId))
    }
    return false
  }

  isSelected(mediaId) {
    if (this.props.selectedItems) {
      return this.props.selectedItems.has(mediaId)
    }
    return false
  }

  getMedia(media) {
    media.selected = this.isSelected(media._id)
    return media
  }

  hideModal() {
    this.refs.deleteModal.closeModal();
  }

  onAdd(value) {
    if (this.props.onAddMedia) {
      return (value) => {
        this.props.onAddMedia(value)
      }
    }

    return false
  }

  renderDelete() {
    const mediaIcon = this.getIconUrl(this.props.typeMedia)
    return (
      <div style={{ display: 'flex' }}>
        <FastIcon
          className="link-edit-media"
          onClick={() => FlowRouter.go(`/playlists/editPlaylist/${this.props._id}`)}
          style={styles.icon}
          type={'settings'}
        />
        <ModalAnimation
          className="action-delete-playlist"
          styles={styles.mediaAction}
          ref="deleteModal"
          typeModal="FadeModal"
          modalTitleIcon={mediaIcon}
          modalTitle="Warning"
          modalBody={<DeleteItemModal nameItem={this.props.name} />}
          modalFooter={
            <div style={styles.btnWrapperDelete}>
              <KeyHandler
                keyEventName={KEYPRESS}
                keyValue="Enter"
                onKeyHandle={() => this.props.deletePlaylist(this.props._id)}
              />
              <Button style={styles.btnWrapperDelete.btn} onClick={this.hideModal}>Cancel, keep
                                it</Button>
              <Button
                className="btn-delete"
                style={styles.btnWrapperDelete.btn}
                onClick={() => this.props.deletePlaylist(this.props._id)}
                kind="danger"
              >Yes, delete
                                it</Button>
            </div>
                    }
          modalButtonText="Delete Item"
        >
          <FastIcon style={styles.icon} type="remove" />
        </ModalAnimation>
      </div>
    )
  }

  render() {
    let pmItems = <div />
    const open = this.state.isOpen ? 'open' : 'close'
    let actionIcon = null
    if (this.props.deletePlaylist) {
      const pm = PresentationMachines.findOne(this.props.presentationMachineId)
      pmItems = <div style={styles.pms} className="container-presentation-machine" data-id={pm._id}>{pm.name}</div>// <PMItems style={styles.pms} unique PMIds={[this.props.presentationMachineId]} className="container-presentation-machines" />
      actionIcon = this.renderDelete()
    } else {
      let actionTypeIcon
      if (this.state.isSelected) {
        actionTypeIcon = (<FastIcon style={styles.icon} type="added" />)
      } else {
        actionTypeIcon = (<FastIcon style={styles.icon} type="add" />)
      }

      actionIcon = (<div onClick={() => {
        this.props.playlistAction(this.props.items, !this.state.isSelected)
      }}
      >{actionTypeIcon}</div>)
    }

    return (
      <div className="container-item-playlist" style={styles[open]} data-id={this.props._id}>
        <Item style={styles.wrapper}>
          <div style={styles.playlistInfoWrapper}>
            <FastIcon style={styles.mediaIcon} type="playlist" />
            <div className="display-playlist-name" style={styles.mediaName}>{this.props.name}</div>
            <div style={styles.mediaDuration}>{this.props.duration}</div>
            <ButtonSvg
              className="btn-playlist-details"
              onClick={this.handleDetail}
              style={[styles.openHandler, styles.openHandler[open]]}
              type="arrow-right"
            />
          </div>
          { pmItems}
          <div>
            {actionIcon}
          </div>
        </Item>
        {this.state.isOpen && (
        <div style={styles.playlistItems} className="container-playlistitems">
          {this.props.items.map(playlistItem => (
            <MediaItem
              key={playlistItem.media()._id}
              dataId={playlistItem.media()._id}
              media={this.getMedia(playlistItem.media())}
              duration={playlistItem.duration}
              onAdd={this.onAdd()}
            />))}
        </div>
                )
                }
      </div>
    )
  }
}


const styles = {
  open: {
    backgroundColor: cssVars.lightGrey,
  },
  grabbing: {
    opacity: 0.5,
  },
  openHandler: {
    cursor: 'pointer',
    marginRight: 'auto',
    fill: cssVars.brandColor,
    width: '20px',
    height: '20px',
    open: {
      transform: 'rotate(0.25turn)',
    },
  },
  playlistItems: {
    paddingLeft: '20px',
  },
  playlistInfoWrapper: {
    display: 'flex',
    flex: 1,
  },
  timeInput: {
    padding: '5px',
  },
  mediaIcon: {
    width: '20px',
    height: '20px',
  },
  mediaName: {
    margin: '0 10px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    flexShrink: 10,
  },
  mediaDuration: {
    color: cssVars.gray,
    fontSize: '13px',
  },
  mediaAction: {
    marginRight: '10px',
  },
  mediaPreview: {
    marginRight: 'auto',
  },
  icon: {
    width: '30px',
    height: '30px',
    marginLeft: '10px',
    fill: cssVars.brandColor,
    cursor: 'pointer',
  },
  iconDelete: {
    width: '30px',
    fill: '#000',
    cursor: 'pointer',
  },
  btnWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  btnWrapperDelete: {
    display: 'flex',
    justifyContent: 'center',
    btn: {
      margin: '0 5px',
    },
  },
  pms: {
    flex: 1,
  },
}
