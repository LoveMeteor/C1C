import React from 'react'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import Radium from 'radium'
import {FastIcon} from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import color from "color"

@Radium
export class Link extends React.Component{
   getStyles() {
    return {
      button : {
        cursor: 'pointer',
        height: '65px',
        width: '65px',
        padding: '10px 10px',
        display: 'block',
        marginBottom: '8px',

      },
      active : {
        backgroundColor: '#FFF'
      },
      icon : {
        fill: '#FFF',
        opacity: '0.5',
      },
      iconActive : {
        fill: cssVars.sndBrandColor,
        opacity: 1
      },
      bottomButton : {
        marginTop: 'auto',
        marginBottom: '0',
        padding: '20px 20px',
        backgroundColor : color(cssVars.sndBrandColor).darken(0.2).hex(),
        svg : {
          opacity: 1
        }
      }
    }
  }


  render(){
    const {href,bottom} = this.props
    const isActive = FlowRouter.current().path === href
    const styles = this.getStyles()
    return (
      <a href={href}
        style={[
          styles.button,
          bottom && styles.bottomButton,
          isActive && styles.active
        ]} className={this.props.className}>
        <FastIcon style={[
          styles.icon,
          isActive && styles.iconActive
        ]} type={this.props.type} />
      </a>
    )
  }
}


@Radium
export default class LeftNav extends React.Component{

  render() {
    const currentId = FlowRouter.current().params.presentationMachineId;
    const styles = {
      leftNav : {
        backgroundColor: cssVars.sndBrandColor,
        width: '65px',
        display: 'flex',
        flexDirection: 'column',
      },
    }

    return (
      <div id="leftNav" style={styles.leftNav}>
        <Link href={`/presenter/${currentId}/search`} className="presentation-search" type="search" />
        <Link href={`/presenter/${currentId}/industries`} className="presentation-industries" type="industry" />
        <Link href={`/presenter/${currentId}/themes`} className="presentation-themes" type="themes" />
        <Link href={`/presenter/${currentId}/favorites`} className="presentation-favorites" type="favourite" />
        <Link href={`/presenter/${currentId}/engagements`} className="presentation-engagements" type="engagement" />
        <Link href={`/presenter/${currentId}/settings`} bottom={true} className="presentation-settings" type="settings" />
      </div>
    )
  }
}