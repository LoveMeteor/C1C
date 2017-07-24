import React from 'react'
import KeyHandler, { KEYPRESS } from 'react-key-handler'
import itemType from '/imports/ui/itemType'
import { FastIcon } from '/imports/ui/components/CustomSvg'
import Item from '/imports/ui/components/ItemCommon'
import ModalAnimation from '/imports/ui/components/ModalAnimation'
import DeleteItemModal from '/imports/ui/partials/Modals/DeleteItemModal'
import UploadMediaModal from '/imports/ui/partials/Modals/UploadMediaModal'
import PMItems from '/imports/ui/components/PMItems'
import Duration from '/imports/ui/components/Duration'
import { Button } from '/imports/ui/components/FormElements'
import PreviewModal from '/imports/ui/components/PreviewModal'
import cssVars from '/imports/ui/cssVars'

export default class ItemMediaFile extends React.Component {

  constructor() {
    super()
    this.hideDeleteModal = this.hideDeleteModal.bind(this)
    this.hideUpdateModal = this.hideUpdateModal.bind(this)
    this.isValid = this.isValid.bind(this)
    this.updateMedia = this.updateMedia.bind(this)
    this.state = {
      formValid: false,
    }
  }

  getIconUrl(type) {
    return `/images/icons/icon_${itemType[type]}.svg`
  }

  hideDeleteModal() {
    this.refs.deleteModal.closeModal();
  }

  hideUpdateModal() {
    this.refs.updateModal.closeModal();
  }

  // Used to activate the button in modals

  isValid(valid, media, tags) {
    this.setState({ formValid: valid, media, tags })
  }

  updateMedia() {
    this.props.updateMedia(this.state.media, this.hideUpdateModal, this.state.tags)
  }

  canDelete() {
    return this.props.media.canDelete()
  }

  toTitleCase(text) {
    return text.replace(/(^|\s)[a-z]/g, str => str.toUpperCase())
  }

  renderButtons() {
    const typeTitle = this.toTitleCase(this.props.media.type)
    const canDelete = this.canDelete()
    return (
      <div style={styles.btnWrapper}>
        <KeyHandler keyEventName={KEYPRESS} keyValue="Enter" onKeyHandle={this.updateMedia} />
        <Button className="btn-update-media" style={styles.btn} disabled={!this.state.formValid} onClick={this.updateMedia} icon="add">Update {typeTitle}</Button>
        <Button className="btn-delete-media" style={styles.btn} disabled={!canDelete} onClick={() => this.props.deleteMedia(this.props.media._id)} icon="delete" kind="danger">Delete {typeTitle}</Button>
        {!canDelete && <span style={styles.errorMessage}>This {typeTitle} can not be deleted because it's currently used by one or more playlist(s)</span>}
      </div>
    )
  }

  render() {
    const pms = this.props.media.presentationMachines()
    const typeTitle = this.toTitleCase(this.props.media.type)
    return (
      <Item className="media-item-container" dataId={this.props.media._id} dataType={this.props.media.type}>
        <div style={styles.mediaInfoWrapper}>
          <FastIcon className="icon-media-type" style={styles.mediaIcon} type={this.props.media.type} />
          <div className="media-item-name" style={styles.mediaName}>{this.props.media.name}</div>
          <Duration className="media-item-time" style={styles.mediaDuration} duration={this.props.media.videoDuration} />
          <PreviewModal style={styles.mediaPreview} medias={[this.props.media]} showPreview />
        </div>
        <div className="container-presentation-machines" style={styles.pms}>{pms && pms.length>0 && _.pluck(pms, 'name').join(', ')}</div>
        <ModalAnimation
          style={styles.mediaAction}
          ref="updateModal"
          typeModal="FadeModal"
          modalTitleIcon={this.props.media.type}
          modalTitle={`Edit ${typeTitle}`}
          modalBody={<UploadMediaModal ref="uploadModal" media={this.props.media} PM={this.props.PM} themes={this.props.themes} tags={this.props.tags} industries={this.props.industries} isValid={this.isValid} />}
          modalFooter={() => this.renderButtons()}
          modalButtonText="Edit {typeTitle}"
        >
          <FastIcon className="link-edit-media" style={styles.icon} type={'settings'} />
        </ModalAnimation>
      </Item>
    )
  }
}

const styles = {
  mediaInfoWrapper: {
    display: 'flex',
    alignItems: 'center',
      width: 350
  },
  mediaIcon: {
    width: '20px',
    height: '20px',
  },
  mediaName: {
    margin: '0 10px',
    color: '#414141',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    flexShrink: 10,
  },
  mediaDuration: {
    color: '#a9a9a9',
    marginRight: '10px',
    fontSize: '13px',
  },
  mediaPreview: {
    marginRight: 'auto',
  },
  mediaAction: {
    marginRight: '0',
  },
  PMItems: {
    marginRight: '10%',
  },
  icon: {
    width: '30px',
    fill: cssVars.brandColor,
  },
  mediaModals: {
    display: 'flex',
    width: '25px',
  },
  btnWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  btnWrapperDelete: {
    display: 'flex',
    justifyContent: 'center',
  },
  btn: {
    margin: '0 10px 0 0',
  },
  errorMessage: {
    marginTop: '10px',
    fontSize: '12px',
    color: cssVars.brandColor,
  },
  pms: {
    flex: 1,
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      marginLeft: 20,
      marginRight: 20
  },
}
