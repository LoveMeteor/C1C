import React from 'react'
import {FastSVG} from '/imports/ui/components/CustomSvg'
import Radium from 'radium'
@Radium
export default class Logo extends React.Component {
  render(){
    const styles = {
      a : {
        display : "block",
        height : this.props.height || 40,
        width : this.props.width || 40,
      }
    }
    return(
      <a href={this.props.href} style={[styles.a,this.props.style]}><FastSVG src="/images/logo.svg" /></a>
    )
  }
}
