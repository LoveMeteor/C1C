import React from 'react'
import { Button } from '/imports/ui/components/FormElements'
import cssVars from '/imports/ui/cssVars'

export default class DeleteItemModal extends React.Component{

  constructor(){
    super()
  }

  static propTypes = {
    nameItem: React.PropTypes.string
  }

  static defaultProps = {
    nameItem: 'Sample Item'
  }


  render(){
    var styles = {
      wrapper: {
        display: 'flex',
        justifyContent: 'center'
      },
      body : {
        textAlign: 'center'
      },
      title : {
        color: cssVars.brandColor,
        fontSize: '32px',
        marginTop: '30px',
        marginBottom: '15px'
      },
      message : {
        color: '#666666',
        marginBottom: '15px'
      }
    }
    return(
      <div style={styles.body}>
        <div style={styles.title}>Delete item</div>
        <div style={styles.message}>
          Are you sure you want to delete <b>{this.props.nameItem}</b>?
        </div>
      </div>
    )
  }
}