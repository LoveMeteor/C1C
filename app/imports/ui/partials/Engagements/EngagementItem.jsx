import React from 'react'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { moment } from 'meteor/momentjs:moment'
import KeyHandler, { KEYPRESS } from 'react-key-handler'

import ModalAnimation from '/imports/ui/components/ModalAnimation'
import Item from '/imports/ui/components/ItemCommon'
import DeleteItemModal from '/imports/ui/partials/Modals/DeleteItemModal'
import { Button } from '/imports/ui/components/FormElements'

import { FastIcon } from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import Radium from 'radium'

@Radium
export default class EngagementItem extends React.Component {

  hideDeleteModal = () => {
    this.refs.deleteModal.closeModal();
  }

  renderDate(date) {
    const formatedData = moment(date).format('HH:mm')
    if (!moment(date).isValid()) return null
    return <span>{formatedData}</span>
  }

  render() {
    return (
      <Item style={styles.item} className="container-item-engagement" dataId={this.props._id}>
        <div className="engagement-item-name" style={styles.name}>{this.props.name}</div>
        <div className="engagement-item-duration" style={styles.duration}>
          {this.renderDate(this.props.startTime)} -&nbsp;
          {this.renderDate(this.props.endTime)}
        </div>
        <FastIcon className="link-edit-engagement" style={styles.icon} onClick={() => FlowRouter.go(`/engagements/edit/${this.props._id}`)} type="settings" />
        {
            this.props.deletable &&
            <ModalAnimation
              styles={styles.mediaAction}
              ref="deleteModal"
              typeModal="FadeModal"
              modalTitleIcon="cal"
              modalTitle="Warning"
              modalBody={<DeleteItemModal nameItem={this.props.name} />}
              modalFooter={
                  <div style={styles.btnWrapperDelete}>
                    <KeyHandler keyEventName={KEYPRESS} keyValue="Enter" onKeyHandle={() => this.props.deleteEngagement(this.props._id)} />
                    <Button className="btn-cancel" style={styles.btn} onClick={this.hideDeleteModal}>Cancel, keep it</Button>
                    <Button className="btn-delete" style={styles.btn} onClick={() => this.props.deleteEngagement(this.props._id)} kind="danger">Yes, delete it</Button>
                  </div>
                }
              modalButtonText="Delete Item"
            >
              <FastIcon className="link-delete-engagement" style={styles.icon} type="remove" />
            </ModalAnimation>
          }
      </Item>
    )
  }
}

const styles = {
  item: {
    padding: '10px 0 10px',
  },
  name: {
    color: cssVars.darkGrey,
    width: '40%',
  },
  duration: {
    color: cssVars.grey,
  },
  icon: {
    width: '30px',
    height: '30px',
    marginLeft: 'auto',
    marginRight: '15px',
    fill: cssVars.brandColor,
  },
  btnWrapperDelete: {
    display: 'flex',
    justifyContent: 'center',
  },
  btn: {
    margin: '0 10px 0 0',
  },
}
