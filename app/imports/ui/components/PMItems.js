import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import Radium from 'radium'
import {FastIcon} from '/imports/ui/components/CustomSvg'

import cssVars from '/imports/ui/cssVars'
import itemType from '/imports/ui/itemType'

import { PresentationMachines } from '/imports/api/presentationmachines/presentationmachines'

@Radium
export class PMItem extends React.Component{

  styles = {
    container : {
      marginLeft: '10px',
      display: 'flex'
    },
    icon : {
      width : '30px',
      height : '30px',
      fill : cssVars.grey
    },
    hide : {
      visibility : 'hidden'
    }
  }

  render(){
    return(
      <div style={[this.styles.container,this.styles[this.props.show]]} className="container-presentation-machine-item" data-id={this.props.dataId}>
        <FastIcon style={this.styles.icon} type={this.props.logo} />
      </div>
    )
  }
}


@Radium
export default class PMItems extends TrackerReact(React.Component){

  static defaultProps = {
    unique : false
  }

  listPresentationMachines(){
    return PresentationMachines.find({}).fetch();
  }

  render(){
    const styles = {
      wrapper: {
        display: 'flex',
        alignItems : 'center'
      }
    }
    const items = this.listPresentationMachines().map((pm) => {
      const exist = this.props.PMIds.find((item) => pm._id === item)
      if(!exist && this.props.unique){
        return null
      }
      else {
        return (<PMItem key={pm._id} {...pm} show={exist ? 'show' : 'hide'} dataId={pm._id}/>)
      }
    })

    return(
      <div className={this.props.className} style= {[styles.wrapper,this.props.style]}>
        {items}
      </div>
    )
  }
}
