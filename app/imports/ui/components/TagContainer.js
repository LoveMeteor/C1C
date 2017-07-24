import React from 'react'

import { Industries } from '/imports/api/industry/industry'
import { Themes } from '/imports/api/themes/themes'

import { FastIcon } from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import Radium from 'radium'

export const ITEM_TYPES = {
  TAG: "tag",
  INDUSTRY: "industry",
  THEME: "theme"
};

@Radium
export class TagItem extends React.Component{

  static propTypes = {
    tag: React.PropTypes.string,
    onClick: React.PropTypes.func
  }

  handleClick = () => {
    if(this.props.type === ITEM_TYPES.TAG) {
      this.props.onClick(this.props.tag,ITEM_TYPES.TAG)
    }
    else {
      this.props.onClick(this.props.id,this.props.type)
    }
  }

  render(){
    return(
      <div style={[styles.item,styles[this.props.type]]} className={`selected-${this.props.type}`} data-name={this.props.tag}>
        {this.props.onClick && <FastIcon style={styles.icon} onClick={this.handleClick} type="close" />}
        <span>{this.props.tag}</span>
      </div>
    )
  }
}

export default class TagContainer extends React.Component{

  static defaultProps = {
    industries : [],
    themes : [],
    tags : []
  }

  listIndustries(industries){
    return Industries.find({_id : { $in : industries }}).fetch()
  }

  listThemes(themes){
    const themesAr = themes == null ? [] : (Array.isArray(themes) ? themes : [themes])
    return Themes.find({_id : { $in : themesAr }}).fetch()
  }

  setToMap(map,list,type){
    list.forEach(item => {
      const {name,_id} = item
      map.set(name,{_id,name,type})
    })

  }

  render() {
    const {tags , industries, themes, ...props} = this.props
    tags.forEach(tag => tag.type = ITEM_TYPES.TAG)
    const items = new Map(tags)
    this.setToMap(items,this.listIndustries(industries),ITEM_TYPES.INDUSTRY)
    this.setToMap(items,this.listThemes(themes),ITEM_TYPES.THEME)

    return (
      <div id={this.props.id} style={styles.tagWrapper}>
        {[...items.values()].map(tag => <TagItem key={tag.name} type={tag.type} {...props} id={tag._id} tag={tag.name} />)}
      </div>
    )
  }
}

const styles = {
  tagWrapper : {
    display : 'flex',
    flexWrap: 'wrap'
  },
  item : {
    background: cssVars.midGrey,
    color: cssVars.darkGrey,
    alignItems: 'center',
    margin: '0px 10px 10px 0px',
    padding: '8px',
    fontSize: '14px',
    display: 'flex',
    alignItems : 'center',
  },
  tag : {
    background: '#fce6d8',
  },
  industry : {
    background: '#f7ac7f',
  },
  theme : {
    background: '#facdb2',
  },
  icon: {
    marginRight: '8px',
    fill: cssVars.darkGrey,
    width: '15px',
    height: '15px'
  },
}