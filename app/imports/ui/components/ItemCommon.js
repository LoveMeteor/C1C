import React from 'react'
import cssVars from '/imports/ui/cssVars'
import Radium from 'radium'
@Radium
export default class ItemCommon extends React.Component{
  render(){

    return (
      <div className={this.props.className} data-id={this.props.dataId} data-type={this.props.dataType} style={[styles.itemList,this.props.style]}>{this.props.children}</div>
    )
  }
}

const styles = {
    itemList: {
      display: 'flex',
      padding: '10px 15px 10px',
      minHeight : '51px',
      alignItems: 'center',
      borderBottom: `1px solid ${cssVars.midGrey}`,
      fontSize: '16px',
      fontWeight: '300',
      height: '34px'
    }
  }