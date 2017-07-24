import React from 'react'
import Radium from 'radium'
import {FastIcon} from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'


@Radium
export default class IconItem extends React.Component{
  static defaultProps = {
    size : 'x3'
  }
  render(){
    return (
    <a className="list-tile" data-id={this.props.data._id} style={[styles.base,styles[this.props.size],this.props.style]} href={this.props.href}>
        <div style={styles.el} className="item-inner">
          <FastIcon style={styles.icon} type={this.props.data.icon} />
          <div>{this.props.data.name}</div>
        </div>
      </a>
    )
  }
}
const styles = {
  base : {
    color: '#414141',
    padding: '0 10px 10px 0',
    textAlign: 'center',
    fontSize: '12px'
  },
  el: {
    border: `1px solid ${cssVars.midGrey}`,
    paddingBottom:'20px',
    height: '100%'
  },
  x2 : {
     width: '50%',
  },
  x3 : {
    width: '33%',
  },
  icon : {
    margin:'20px 0 10px',
    fill: cssVars.sndBrandColor,
    width:'50%'
  }
}
