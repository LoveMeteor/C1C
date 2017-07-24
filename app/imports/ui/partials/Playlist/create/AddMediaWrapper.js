import React from 'react'
import cssVars from '/imports/ui/cssVars'

export default class AddMediaWrapper extends React.Component{

  render(){
    const styles = {
      wrapper: {
        marginBottom: '20px',
      },
      title: {
        color:cssVars.brandColor,
        display : 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${cssVars.midGrey}`,
        paddingBottom: '10px',
      }
    }

    // Return nothing if there is no childrens
    if(this.props.children && this.props.children.length){
      const className = `div-media-wrapper-${this.props.type}`
      return (
        <div id={this.props.id} className={className} style={styles.wrapper}>
          <div style={styles.title}>{this.props.title} {this.props.sndText}</div>
          {this.props.children}
        </div>
      )
    }
    return null
  }
}
