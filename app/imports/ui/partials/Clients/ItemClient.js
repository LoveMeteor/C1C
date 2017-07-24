import React from 'react'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import KeyHandler, {KEYPRESS} from 'react-key-handler'
import {FastIcon} from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import Item from '/imports/ui/components/ItemCommon'
import ModalAnimation from '/imports/ui/components/ModalAnimation'
import DeleteItemModal from '/imports/ui/partials/Modals/DeleteItemModal'
import {Button} from '/imports/ui/components/FormElements'

export default class ItemClient extends React.Component {

  constructor() {
      super()
      this.hideDeleteModal = this.hideDeleteModal.bind(this);
    }

  hideDeleteModal() {
      this.refs.deleteModal.closeModal();
    }

  render() {

    const styles = {
      icon: {
        width: '30px',
        height : '30px',
        fill: cssVars.brandColor,
        marginLeft: '10px'
      },
      client: {
        marginLeft: '10px',
      },
      industry: {
        marginLeft: '10px',
        marginRight: 'auto',
        color: cssVars.grey,
        fontSize: '13px'
      },
      mediaModals: {
        display: 'flex',
        width: '25px'
      },
      btnWrapperDelete: {
        display: 'flex',
        justifyContent: 'center',
      },
      btn: {
        margin: '0 5px'
      },
      img: {
        width: '30px',
        height: '30px',
        border: `1px solid ${  cssVars.lightGrey}`,
        borderRadius: '15px',
        objectFit: 'cover'
      }
    }

    const img = this.props.media ? this.props.media.link() : '/images/default-client.png'

    return (
      <div className="container-client-item" data-id={this.props.dataId}>
        <Item className={this.props.className}>
          <img className="img-client-logo" style={styles.img} src={img}/>
          <div className="display-client-name" style={styles.client}>{this.props.name}</div>
          <div className="display-industry-name" style={styles.industry}>{this.props.industry.name}</div>
          <FastIcon className="link-edit-client" style={styles.icon} onClick={() => FlowRouter.go(`/client/edit/${this.props._id}`)} type="settings"/>
          <ModalAnimation
            ref="deleteModal"
            styles={styles.mediaAction}
            typeModal='FadeModal'
            modalTitleIcon='settings'
            modalTitle="Warning"
            modalBody={ <DeleteItemModal nameItem={this.props.name}/> }
            modalFooter={
                <div style={styles.btnWrapperDelete}>
                  <KeyHandler keyEventName={KEYPRESS} keyValue="Enter" onKeyHandle={() => this.props.deleteClient(this.props._id)}/>
                    <Button style={styles.btn} onClick={this.hideDeleteModal}>Cancel, keep it</Button>
                    <Button className="btn-delete" style={styles.btn} onClick={() => this.props.deleteClient(this.props._id)}
                            kind="danger">Yes, delete it</Button>
                </div>}>
            <FastIcon style={styles.icon} type="remove"/>
          </ModalAnimation>
        </Item>
      </div>
    )
  }
}