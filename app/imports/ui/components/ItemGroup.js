import React from 'react'
import PlaylistItem from '/imports/ui/components/PlaylistItem'
import classNames from 'classnames'
import {FastIcon} from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import Radium from 'radium'

@Radium
export default class Search extends React.Component{
  constructor(){
    super()
    this.state = {
      active : false
    }
    this.toggleList = this.toggleList.bind(this);
  }

  toggleList() {
    this.setState({active : !this.state.active})
  }

  renderAction(){
    const {children} = this.props;
    const results = `${children.length  } results`
    const active = this.state.active ? 'activeIcon' : ''
    return (<div style={styles.action}>
              <span>{results}</span>
              <FastIcon onClick={() => this.toggleList()} style={[styles.icon,styles[active]]} type="arrow-down" />
            </div>)
  }

  render(){
      const {children,type,id} = this.props;

      if(!children.length) return null
      const active = this.state.active ? 'active' : ''
      const results = `${children.length} results`
      return (
        <div style={styles[active]} id={id}>
          <PlaylistItem onClick={() => this.toggleList()} type={type} styleTitle={styles.title} name={type} action={() => this.renderAction(results)} />
          {this.state.active && (
          <ul style={styles.list} className="search-results-list">
            {children}
          </ul>
          )}
        </div>
      )
  }
}

const styles = {
  list : {
    margin: 0,
    padding : 0
  },
  title : {
    color : cssVars.brandColor
  },
  action : {
    fontSize : '14px',
    display : 'flex',
    alignItems : 'center',
    lineHeight: '30px'
  },
  active : {
    background: cssVars.lightGrey
  },
  activeIcon : {
     transform: 'scaleY(-1)'
  },
  icon : {
    width: '20px',
    height: '20px',
    marginLeft: '10px',
    fill : cssVars.darkGrey
  }
}