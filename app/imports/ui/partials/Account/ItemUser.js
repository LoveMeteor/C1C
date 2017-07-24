import React from 'react'
import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'
import KeyHandler, {KEYPRESS} from 'react-key-handler'

import {FastIcon} from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import Item from '/imports/ui/components/ItemCommon'
import ModalAnimation from '/imports/ui/components/ModalAnimation'
import DeleteItemModal from '/imports/ui/partials/Modals/DeleteItemModal'

import { Button } from '/imports/ui/components/FormElements'

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '/imports/api/users/users.js';

export default class ItemUser extends React.Component{

  getRole(userId){
    const roles = Roles.getRolesForUser(userId)
    return roles[0] || null
  }

  render(){
    const role = this.getRole(this.props._id);
    return (
      <Item className={this.props.className} dataId={this.props._id}>
        {role && <FastIcon style={styles.roleIcon} type={role} /> || <span style={styles.roleIcon}></span>}
        <div className="display-username" style={styles.user}>{this.props.username}</div>
        <div className="display-role-name" style={styles.role}>{role}</div>
        {(Meteor.userId() !== this.props._id) &&
          <FastIcon className="link-edit-user" style={styles.icon} onClick={() => FlowRouter.go(`/account/edit/${this.props._id}`)} type="settings"/>}
        {(Meteor.userId() !== this.props._id) &&
          <ModalAnimation
            styles={styles.mediaAction}
            typeModal='FadeModal'
            modalTitleIcon='settings'
            modalTitle="Warning"
            modalBody={ <DeleteItemModal nameItem={this.props.username}/> }
            modalFooter= {
              <div style={styles.btnWrapperDelete}>
                <KeyHandler keyEventName={KEYPRESS} keyValue="Enter" onKeyHandle={() => this.props.deleteUser(this.props._id)}/>
                <Button style={styles.btnWrapperDelete.btn} onClick={this.hideModal}>Cancel, keep it</Button>
                <Button style={styles.btnWrapperDelete.btn} onClick={() => this.props.deleteUser(this.props._id)} kind="danger">Yes, delete it</Button>
              </div>
            }
            modalButtonText= "Delete Item">
            <FastIcon style={styles.icon} type="remove"/>
          </ModalAnimation>}
      </Item>
    )
  }
}

const styles = {
      icon: {
        width : '30px',
        height : '30px',
        marginLeft: '10px',
        fill : cssVars.brandColor
      },
      user : {
        marginLeft : '10px',
      },
      role : {
        marginLeft : '10px',
        marginRight : 'auto',
        color : cssVars.grey
      },
      mediaModals: {
        display: 'flex',
        width: '25px'
      },
      roleIcon : {
        width: '30px',
        height: '30px',
      },
      btnWrapperDelete: {
        display: 'flex',
        justifyContent: 'center',
        btn : {
          margin:'0 5px'
        }
      },
    }