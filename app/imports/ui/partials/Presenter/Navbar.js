import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

import { subsManager } from '../../../startup/client/routes'

import classNames from 'classnames'
import itemType from '/imports/ui/itemType'
import cssVars from '/imports/ui/cssVars'
import { PresentationMachines, Cics } from '../../../api/models'
import { ROLES } from '../../../api/constants'
import { Selector } from '../../components'
import CicSelector from '../../components/CicSelector/CicSelector'
import ButtonImage from '../../components/ButtonImage'
import ButtonSvg from '../../components/ButtonSvg'
import { FastIcon } from '../../components/CustomSvg'

const styles = {
  wrapper: {
    height: '66px',
    background: cssVars.brandColor,
    display: 'flex',
  },
  rightButton: {
    cursor: 'pointer',
  },
  topWrapper: {
    margin: 'auto 20px',
    color: '#FFF',
    display: 'flex',
  },
  rightArrow: {
    width: 20,
    height: 20,
    fill: '#FFF',
  },
  pmSelector: {
    marginLeft: 10,
    width: 250
  }
}

export default class NavbarNew extends TrackerReact(React.Component) {
  constructor(props) {
    super(props)
    this.state = {
      presentationmachines: subsManager.subscribe('presentationmachines'),
      cics: subsManager.subscribe('cics'),
    }
  }

  classes(presentationMachineId) {
    const currentId = FlowRouter.current().params.presentationMachineId;
    const isActive = currentId === presentationMachineId ? 'active' : '';

    return classNames(isActive, { 'top-nav-button': true });
  }

  selectedPresentationMachineId() {
    return FlowRouter.current().params.presentationMachineId
  }
  listPM() {
    const cic = this.getCurrentCic()
    if (!cic) return []

    return PresentationMachines.find({ cicId: cic._id }, { sort: { position: 1 } }).fetch()
  }
  onChangePM = (pmId) => {
    FlowRouter.go(`/presenter/${pmId}/`)
  }
  handleLogout = () => {
    subsManager.clear();
    Meteor.logout()
  }

  routeName() {
    const currentId = FlowRouter.current().params.presentationMachineId;
    const presentationMachine = PresentationMachines.findOne({ _id: currentId });

    if (presentationMachine) {
      return presentationMachine.name;
    }
    return '';
  }

  getCurrentCic() {
    if (Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN], Roles.GLOBAL_GROUP)) {
      const cicId = Session.get('cic')
      if (!cicId) {
        return Cics.findOne()
      }
      return Cics.findOne(cicId)
    }

    return Meteor.user().cic()
  }

  onChangeCic = (cicId) => {
    Session.setAuth('cic', cicId)
  }

  renderCicElement() {
    const cic = this.getCurrentCic()
    if (!cic) return null
    if (Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN], Roles.GLOBAL_GROUP)) {
      return <CicSelector hideIcon bsStyle="orange" selected={cic._id} onChange={this.onChangeCic} />
    }

    return <span>{cic && cic.name}</span>
  }

  render() {
    const pms = this.listPM()
    return (
      <div style={styles.wrapper} className="top-navbar">
        <ButtonImage className="top-logo" href="/presenter/" icon="/images/logo.svg" width="40" height="40" />
        <div style={styles.topWrapper}>
          {this.renderCicElement()}
          <FastIcon style={styles.rightArrow} type="arrow-right" />
          {pms && pms.length>0 && <Selector className="selector-area" style={styles.pmSelector} hideReset notLimitHeight data={pms} bsStyle="orange" bsSize="large" selected={this.selectedPresentationMachineId()} onChange={this.onChangePM} />}
        </div>
        <ButtonSvg
          onClick={this.handleLogout}
          className="top-nav-button pull-to-right"
          style={styles.rightButton}
          type="exit"
        />
      </div>
    )
  }
}
