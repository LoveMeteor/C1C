import React from 'react'
import Isvg , { FastSVG, FastIcon } from '/imports/ui/components/CustomSvg'
import Radium from 'radium'

@Radium
export default class ButtonSvg extends React.Component {

  static defaultProps = {
    style : {}
  }

  render(){
    let svg = this.props.type ? (<FastIcon style={this.props.style.svg} type={this.props.type} />) : (<FastSVG style={this.props.style.svg} src={this.props.icon}/>)
    return(
      <a style={this.props.style} className={this.props.className} href={this.props.href} onClick={this.props.onClick}>{svg}</a>
    )
  }
}
