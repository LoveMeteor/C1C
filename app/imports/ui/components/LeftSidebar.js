import React from 'react'
import cssVars from '/imports/ui/cssVars'
import Radium from 'radium'

@Radium
export default class LeftSidebar extends React.Component{

  render(){
    var styles = {
      wrapper : {
        background: '#eeeeee',
        paddingLeft: cssVars.bodySpacing,
        paddingRight: '50px',
        paddingTop: '20px',
        paddingBottom: '20px',
        minHeight: '100%'
      },
    }

    return(
      <div id={this.props.id} style={[styles.wrapper,this.props.style]}>
        {this.props.children}
      </div>
    )
  }
}
