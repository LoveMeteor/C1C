import React from 'react'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import Logo from '/imports/ui/components/Logo'
import CicSelector from '../../components/CicSelector/CicSelector'

import TopNavItem from '/imports/ui/partials/_Common/TopNavItem'
import cssVars from '/imports/ui/cssVars'

import { Cics } from '../../../api/models'

export default class TopNav extends TrackerReact(React.Component) {
  isActive(routeName) {
    return FlowRouter.current().route.name === routeName;
  }

  getCurrentCic() {
    const cicId = Session.get('cic')
    if (!cicId) return Cics.findOne()
    return Cics.findOne(cicId)
  }

  onChangeCic = (cicId) => {
    Session.setAuth('cic', cicId)
  }
  render() {
    const styles = {
      topNavWrapper: {
        background: 'url(/images/nav-bg.png) right bottom no-repeat',
        backgroundSize: 'contain',
        borderBottom: '1px solid #CCC',
      },
      topNav: {
        height: '90px',
        display: 'flex',
        marginLeft: cssVars.bodySpacing,
        alignItems: 'center',
      },
      nav: {
        marginLeft: 'auto',
        display: 'flex',
        bottom: 0,
        alignSelf: 'flex-end',
        marginRight: cssVars.bodySpacing,
      },
    }
    return (
      <div style={styles.topNavWrapper}>
        <div className="topNav" style={styles.topNav}>
          <Logo href="/engagements/" />
          <CicSelector disabled={this.props.disabled} onChange={this.onChangeCic} selected={this.getCurrentCic()._id} />
          <nav style={styles.nav}>
            <TopNavItem active={this.isActive('Engagements')} href="/engagements/">Engagements</TopNavItem>
            <TopNavItem active={this.isActive('Media')} href="/media/">Media</TopNavItem>
            <TopNavItem active={this.isActive('Playlists')} href="/playlists/">Playlists</TopNavItem>
            <TopNavItem active={this.isActive('Clients')} href="/client/">Clients</TopNavItem>
            <TopNavItem active={this.isActive('Account')} href="/account/">Account</TopNavItem>
          </nav>
        </div>
      </div>
    )
  }
}
