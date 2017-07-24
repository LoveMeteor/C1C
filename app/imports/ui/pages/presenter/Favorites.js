import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'

import { subsManager } from '../../../startup/client/routes'

import { Medias } from '/imports/api/medias/medias.js';
import { CanoncialPlaylists } from '/imports/api/canoncialplaylist/canoncialplaylists.js';

import { FastIcon } from '/imports/ui/components/CustomSvg'
import {MediasView} from '/imports/ui/partials/Presenter/ContainerView'
import PlaylistItem  from '/imports/ui/components/PlaylistItem'
import { appendToPlaylist , removeFromFavorite } from '/imports/ui/playlistHelpers'
import cssVars from '/imports/ui/cssVars'
import { Favorites,FAVORITETYPES } from '/imports/api/favorites/favorites'
import PreviewModal from '/imports/ui/components/PreviewModal'


export default class FavoritesPage extends TrackerReact(React.Component){
  constructor(){
    super()
    this.state = {
      playlistView : true,
      subscription: {
        canoncialPlaylists: subsManager.subscribe('canoncialPlaylists'),
        medias: subsManager.subscribe('medias'),
        favorites: subsManager.subscribe('favorites')
      }
    }
  }

  // Reconcialiate collection with the proper type of favorite,
  // If someone has a better solution, I'm not able to get the imports in any scope.
  _collections = {
    [FAVORITETYPES.CANONCIALPLAYLIST] : CanoncialPlaylists,
    [FAVORITETYPES.MEDIA] : Medias,
  }

  listFavorites(itemType){
    return Favorites.find({favoriteType:itemType}).fetch()
  }

  renderAction(item,collection){
    return (<FastIcon onClick={() => appendToPlaylist(item,collection)} style={[styles.icon,styles.brandColor]} type="add" />)
  }

  renderSubAction(item,child){
		const medias = child.mediaFileId ? [child] : child.itemsInOrder().map(pi => pi.media())
    return (
      <div style={{display:'flex'}}>
        <FastIcon onClick={() => removeFromFavorite(item)} style={[styles.icon]} type="remove" />
        <PreviewModal medias={medias} styleIcon={[styles.icon]} />
      </div>
    )
  }

  renderItems(){
    const itemType = this.state.playlistView ? FAVORITETYPES.CANONCIALPLAYLIST : FAVORITETYPES.MEDIA
    return this.listFavorites(itemType).map((item) => {
      const collection = this._collections[item.favoriteType]
      const itemChild = collection.findOne({_id:item.itemId})

      if(!itemChild) return null
      const type = this.state.playlistView ? 'playlist' : itemChild.type
      return (<PlaylistItem name={itemChild.name} type={type} action={() => this.renderAction(itemChild,collection)} subAction={() => this.renderSubAction(item,itemChild)} key={item._id}  />);
    })
  }

  handleChangeFavorites = () => {
    this.setState({playlistView : !this.state.playlistView});
  }

  render(){
  	return (
      <MediasView title="Favourites" onClick={this.handleChangeFavorites} active={this.state.playlistView}>
        <ul style={styles.list}  className="media-list items-list">
          {this.renderItems()}
        </ul>
      </MediasView>
    )
  }
}

const styles = {
  list : {
    paddingLeft: 0,
  },
  icon : {
    width: '30px',
    height: '30px',
    fill : cssVars.darkGrey,
    marginLeft: '10px',
  }
}