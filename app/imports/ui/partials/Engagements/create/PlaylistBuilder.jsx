import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import { moment } from 'meteor/momentjs:moment'

import LeftSidebar from '/imports/ui/components/LeftSidebar'
import { SimpleInput , SearchInput, Selector, Label , Radio , Button , InputInline } from '/imports/ui/components/FormElements'
import AddMediaWrapper from '/imports/ui/partials/Playlist/create/AddMediaWrapper'
import ItemPlaylist , {MediaItem, DragItem} from '/imports/ui/partials/Playlist/ItemPlaylist'
import {FastIcon} from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'
import NoResult from '/imports/ui/components/NoResult'


import { Tags } from '/imports/api/tags/tags'
import { Medias } from '/imports/api/medias/medias'
import { CanoncialPlaylists } from '/imports/api/canoncialplaylist/canoncialplaylists'

import Filters from '/imports/ui/hoc/Filters'
import Radium from 'radium'

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
@DragDropContext(HTML5Backend)
@Filters
@Radium
export default class PlaylistBuilder extends TrackerReact(React.Component){

  shouldComponentUpdate(nextProps){
    const {_id : presentationMachineId} = nextProps.presentationMachine
    if(nextProps.selectedArea !== presentationMachineId && this.props.selectedArea !== presentationMachineId){
      return false
    }
    return true
  }

  getTagsFromSearchTerm(searchTerm){
    // This thing need to be optimised
		const tags = Tags.find({name: { $regex: searchTerm, $options: 'i' }}).fetch()
		const tagIds = tags.map(tag => tag._id)
		return tagIds
	}

  getOverlayText(){
    const {playlists,presentationMachine} = this.props
    const { overlay = '' } = playlists[presentationMachine._id] || {}
    return overlay
  }

  getMediasState(){
    const {playlists,presentationMachine} = this.props
    // This Object destructuring is complex => get the medias form the playlists object renamed it to propsMedias , with a new Map assigned if it's empty !
    const { medias : propsMedias = new Map() } = playlists[presentationMachine._id] || {}
    return propsMedias
  }

  getFiltersState(){
    const {playlists,presentationMachine} = this.props
    // This Object destructuring is complex => get the filters form the playlists object renamed it to propsFilters , with default object assigned if it's empty !
    const { filters : propsFilters = {} } = playlists[presentationMachine._id] || {}
    propsFilters.mediaFilter = propsFilters.mediaFilter || 'all'
    return propsFilters
  }

  isValid() {
    const {playlists,presentationMachine} = this.props
    const { mediasValid } = playlists[presentationMachine._id] || {}
    return mediasValid
  }

  batchSelect = (array,isAdd) => {
    let medias = this.getMediasState()
    const {_id : presentationMachineId}  = this.props.presentationMachine
    array.forEach((value) => {
      const duration = value.duration || 30
      isAdd ? medias.set(value.mediaId,{duration}) : medias.delete(value.mediaId)
    })
    medias = new Map(medias)
    this.props.updateMedias(medias,presentationMachineId)
  }

  toggleMedia = (media) => {
    let medias = this.getMediasState()
    const {_id : presentationMachineId}  = this.props.presentationMachine

    if(medias.has(media._id)){
      medias.delete(media._id)
    }
    else{
      const {_id, videoDuration} = media
      const duration = videoDuration || 30
      medias.set(_id,{duration})
    }
    medias = new Map(medias)
    this.props.updateMedias(medias,presentationMachineId)
  }

  moveItem = (dragIndex, hoverIndex) => {
    const medias = this.getMediasState()
    const {_id : presentationMachineId}  = this.props.presentationMachine
    // Create a array from the map keys
    const mediasSelected = [...medias.keys()]
    const dragItem = mediasSelected[dragIndex];

    // We reorder these keys
    mediasSelected.splice(dragIndex,1);
    mediasSelected.splice(hoverIndex,0,dragItem)

    // We need to remap the Map in the proper order
    const updatedMedia = new Map()
    mediasSelected.forEach(item => updatedMedia.set(item,medias.get(item)))
    this.props.updateMedias(updatedMedia,presentationMachineId)
  }

  saveItems = () => {}

  handleDuration = (mediaId,duration) => {
    const medias = this.getMediasState()
    const {_id : presentationMachineId}  = this.props.presentationMachine

    const media = medias.get(mediaId);
    media.duration = moment.duration(`00:${duration}`).asSeconds()
    medias.set(mediaId,media)
    this.props.updateMedias(medias,presentationMachineId)
  }

  handleOverlay = (mediaId) => {
    const medias = this.getMediasState()
    const {_id : presentationMachineId}  = this.props.presentationMachine

    const media = medias.get(mediaId);
    media.showOverlay = !media.showOverlay
    medias.set(mediaId,media)
    this.props.updateMedias(medias,presentationMachineId)
  }

  handleOverlayText = (value) => {
    const {_id : presentationMachineId}  = this.props.presentationMachine
    this.props.overlay(value,presentationMachineId)
  }

  // Generate a filter for the playlist and the media.
  getFilter(){
    const {industryFilter = '', themeFilter = '', inputFilter = ''} = this.getFiltersState()
		const tags = this.getTagsFromSearchTerm(inputFilter)

    const filter = {}
    //Industries Filter
    if(industryFilter != ''){
      filter.industryIds = industryFilter
    }
    //Theme Filter
    if(themeFilter != ''){
      filter.themeId = themeFilter
    }
    //Input Filter
    if(inputFilter != '') {
      filter.$or = []
      filter.$or.push({name : { $regex: inputFilter, $options: 'i' }})
      filter.$or.push({tagIds : {$in: tags}})
    }

    return filter
  }

  listPlaylist(){
    const filter = this.getFilter()
    filter.presentationMachineId = this.props.presentationMachine._id
    return CanoncialPlaylists.find(filter).fetch();
  }

  listMediasByType(type){
    const filter = this.getFilter()
    const mediasState = this.getMediasState()
    const {mediaFilter} = this.getFiltersState()
    const {_id : presentationMachineId}  = this.props.presentationMachine
    // We need to filter the media more presicely
    filter.type = (mediaFilter === 'all' || mediaFilter === type ) ? type : null
    // This one is specific to Medias
    filter.presentationMachineIds = presentationMachineId

    const medias = Medias.find(filter).fetch();
    //Populate with selected
    if(mediasState.size){
      medias.forEach((media) => {
        if(mediasState.has(media._id)){
          media.selected = true
        }
      })
    }
    return medias
  }

  getMediaById(id){
    return Medias.findOne({_id : id})
  }

  renderDndText(){
    return (
      <div style={styles.dndText}>Drag items to reorder <FastIcon style={styles.dndIcon} type="dragndrop" /></div>
    )
  }

  renderPlaylists(){
    const {mediaFilter} = this.getFiltersState()
    const mediasState = this.getMediasState()
    if(mediaFilter === 'all' || mediaFilter === 'playlist'){
      return this.listPlaylist().map((playlist) => <ItemPlaylist {...playlist} selectedItems={mediasState} items={playlist.items()} playlistAction={(array,isAdd) => {this.batchSelect(array,isAdd)}} onAddMedia={(value) => {this.toggleMedia(value)}} typeMedia="playlist" key={playlist._id}/>)
    }
    return null
  }

  renderItem(type){
    return this.listMediasByType(type).map((media) => <MediaItem onAdd={() => {this.toggleMedia(media)}} key={media._id}  media={media} />)
  }

  render(){
    const {filters,style,presentationMachine} = this.props
    const propsMedias = this.getMediasState()
    const propsFilters = this.getFiltersState()
    let hasOverlay = null

    const playlists = this.renderPlaylists() || []
    const videos = this.renderItem('video')
    const images = this.renderItem('image')

    // PM with Overlay ability should be flagged in the DB
    if(presentationMachine.logo === "receptionhall") {
      hasOverlay = true
    }


    return (
      <div className="media-search-container" data-id={presentationMachine._id} style={style}>
        <div style={[styles.wrapper]}>
          <LeftSidebar className="div-playlist-media-search-form" style={styles.sideLeft}>
            <Label>Search By</Label>
            <SearchInput className="form-search-keyword" onChange={(value) => {this.props.handleFilter('inputFilter',value)}} placeholder="Title, keyword, tag" />
            <Selector selected={propsFilters.industryFilter} className="form-select-industry" onChange={(value) => {this.props.handleFilter('industryFilter',value)}} placeholder="Select industry" data={filters.listIndustries()} />
            <Selector selected={propsFilters.themeFilter}  className="form-select-theme" onChange={(value) => {this.props.handleFilter('themeFilter',value)}} placeholder="Select theme" data={filters.listThemes()} />
            <Label>Filter results</Label>
            <Radio current={propsFilters.mediaFilter} value="all" onClick={(value) => {this.props.handleFilter('mediaFilter',value)}}>All media</Radio>
            <Radio current={propsFilters.mediaFilter} value="playlist" onClick={(value) => {this.props.handleFilter('mediaFilter',value)}}>Playlists</Radio>
            <Radio current={propsFilters.mediaFilter} value="video" onClick={(value) => {this.props.handleFilter('mediaFilter',value)}}>Videos</Radio>
            <Radio current={propsFilters.mediaFilter} value="image" onClick={(value) => {this.props.handleFilter('mediaFilter',value)}}>Images</Radio>
          </LeftSidebar>

          {playlists.length === 0 && videos.length === 0 && images.length === 0 &&
            <div className="div-playlist-media-search-result" style={styles.sideRight}><NoResult /></div>
            ||
            <div className="div-playlist-media-search-result" style={styles.sideRight}>


                <AddMediaWrapper type="playlist" title="Playlists">
                  {playlists}
                </AddMediaWrapper>
                <AddMediaWrapper type="video" title="Videos">
                  {videos}
                </AddMediaWrapper>
                <AddMediaWrapper type="image" title="Images">
                  {images}
                </AddMediaWrapper>
                <Button className="btn-continue" style={styles.btnContinue} kind="danger" disabled={!propsMedias.size} onClick={() => this.props.onContinue()}>Continue</Button>
            </div>}
        </div>
      </div>
    )
  }
}

const styles = {
  wrapper : {
    background : '#FFF',
    display : 'flex',
  },
  summaryWrapper : {
    background:'#FFF',
    padding : '20px'
  },
  sideLeft : {
    background: '#FFF',
    paddingLeft: '15px',
    paddingRight : '10px',
    width: '24%',
  },
  overlayText : {
    marginBottom : '10px',
    color:cssVars.brandColor
  },
  overlayInput : {
    width : '50%',
    background : cssVars.lightGrey,
    border : `1px solid ${cssVars.lightGrey}`,
    marginBottom : '20px'
  },
  sideRight:{
    marginTop: "20px",
    paddingRight: '50px',
    paddingLeft: '50px',
    width:'100%',
    overflow : 'hidden'
  },
  dndText : {
    color : '#9b9b9b',
    fontSize : '12px',
    marginLeft : 'auto',
    display: 'flex',
    alignItems: 'center',
  },
  dndIcon: {
    fill : '#9b9b9b',
    width : '25px',
    height : '25px',
    marginLeft: '15px',
    marginRight: '15px',
  },
  btnContinue : {
    marginBottom : '30px'
  }
}