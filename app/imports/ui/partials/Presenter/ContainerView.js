import React from 'react';
import cssVars from '/imports/ui/cssVars'
import OnOffSwitch from  '/imports/ui/components/OnOffSwitch'

export  class MediasView extends React.Component{
  render() {
  	return (
  		<div id="presenter-medias-view" style={styles.listWrapper}>
        <div style={styles.titleSwitch}>
          <h2 style={styles.title}>{this.props.title}</h2>
          <OnOffSwitch style={styles.OnOffSwitch} onClick={this.props.onClick} on="Playlist" off="Media" active={this.props.active}  />
        </div>
        {this.props.children}
  		</div>
  	)
  }
}


export  class ListView extends React.Component{
  render() {
  	return (
  		<div style={styles.listWrapper}>
        <h2 style={styles.title}>{this.props.title}</h2>
        {this.props.children}
  		</div>
  	)
  }
}

export  class TileView extends React.Component{
  render() {
  	return (
  		<div style={styles.wrapper} className={this.props.className}>
        <h2 style={styles.title}>{this.props.title}</h2>
        <div style={styles.tiles}>
          {this.props.children}
        </div>

  		</div>
  	)
  }
}

var styles={

  wrapper : {
    flex:1,
    overflow:'scroll',
    paddingLeft: '20px'
  },
  listWrapper : {
    flex:1,
    overflow:'scroll',
    padding: '0 20px'
  },
  titleSwitch : {
    display: 'flex',
    alignItems: 'baseline'
  },
  title : {
    color: cssVars.sndBrandColor,
    fontSize: '20px',
    fontWeight : 300,
    margin: '21px 0 10px'
  },
  OnOffSwitch : {
    marginLeft: 'auto'
  },
  tiles: {
    display:'flex',
    flexWrap : 'wrap'
  },
}
