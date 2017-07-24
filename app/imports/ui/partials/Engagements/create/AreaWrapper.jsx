import React from 'react'
import {FastIcon} from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import Radium from 'radium'

@Radium
export default class AreaWrapper extends React.Component{
  constructor(props){
    super(props)
  }

  renderHeader(){
    const { children } = this.props
    return React.Children.map(children,child => {
      const {name,logo,_id} = child.props.presentationMachine
      return <div className="tab-presentation-machine" data-id={_id} onClick={() => this.props.onSelect(_id)} style={[styles.tab,(_id === this.props.selected) && styles.tabSelected]}>{name}</div>
    })
  }


  render(){
    this.renderHeader()
    return(
      <div>
        <div style={styles.tabWrapper}>{this.renderHeader()}</div>
        <div style={styles.contentWrapper}>{this.props.children}</div>
      </div>
    )
  }
}


const styles = {
  tabWrapper : {
    display : 'flex',
    justifyContent : 'space-between'
  },
  tab : {
    alignItems : 'center',
    display : 'flex',
    backgroundColor : '#FFF',
    opacity : '0.5',
    flexBasis : '24%',
    padding : '10px',
    cursor : 'pointer'
  },
  tabSelected : {
    opacity : '1',
  },
  icon: {
    width : '30px',
    height : '30px',
    fill : cssVars.brandColor,
    marginRight: '10px'
  }
}
