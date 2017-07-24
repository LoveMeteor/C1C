import {_} from 'meteor/underscore'
import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import { moment } from 'meteor/momentjs:moment'

import AddMediaWrapper from '/imports/ui/partials/Playlist/create/AddMediaWrapper'
import ItemPlaylist , {MediaItem,DragItem} from '/imports/ui/partials/Playlist/ItemPlaylist'

import LeftSidebar from '/imports/ui/components/LeftSidebar'
import Sorter from '/imports/ui/components/Sorter'
import { SearchInput, Selector, Label , Radio , Button , InputInline } from '/imports/ui/components/FormElements'
import {FastIcon} from '/imports/ui/components/CustomSvg'
import cssVars from '/imports/ui/cssVars'

import { Industries } from '/imports/api/industry/industry'
import { Themes } from '/imports/api/themes/themes'
import { Tags } from '/imports/api/tags/tags'
import { Medias } from '/imports/api/medias/medias'
import { CanoncialPlaylists } from '/imports/api/canoncialplaylist/canoncialplaylists'

import { DragDropContext } from 'react-dnd';
import NoResult from '/imports/ui/components/NoResult'

import TouchBackend from 'react-dnd-touch-backend';
import HTML5Backend from 'react-dnd-html5-backend';
@DragDropContext('ontouchstart' in window ? TouchBackend : HTML5Backend)
export default class AddMediaPanel extends TrackerReact(React.Component){

  constructor(props){
    super(props)

    this.handleDeleteSelectedMedia = this.handleDeleteSelectedMedia.bind(this)

    this.state = {
      summaryVisible : false,
      themeFilter: '',
      industryFilter: '',
      inputFilter: '',
      mediaFilter: 'all',
      medias: props.medias,
      selectedSort : 'newest'
    }
  }

  static defaultProps = {
    visible: false,
    PM: '',
    onDelete: () => {},
    onSelect: () => {}
  }

  optionsSorter = [
      {code : 'asc', text: 'Title (A–Z)', sorter: {name: 1}},
      {code : 'desc', text: 'Title (Z–A)', sorter:{name: -1}},
      {code : 'newest', text: 'Newest', sorter: {createdAt: -1}},
      {code : 'oldest', text: 'Oldest', sorter: {createdAt: 1}}
	]

	handleOnChangeSorter = (code) => {
		this.setState({selectedSort: code})
	}

  handleDeleteSelectedMedia(id){
    const items= this.state.itemsSelected

    items.map((item) => {
      const index = item.mediaId.indexOf(id)
      if (index > -1) {
        items.splice(index, 1);
      }
    })

    this.setState({itemsSelected: items})
  }

  getTagsFromSearchTerm(searchTerm){
    // This thing need to be optimised
		const tags = Tags.find({name: { $regex: searchTerm, $options: 'i' }}).fetch()
		const tagIds = tags.map(tag => tag._id)
		return tagIds
	}

  // Generate a filter for the playlist and the media.
  getFilter(){
    const searchTerm = this.state.inputFilter || ''
		const tags = this.getTagsFromSearchTerm(searchTerm)

    const filter = {}
    //Industries Filter
    if(this.state.industryFilter != ''){
      filter.industryIds = this.state.industryFilter
    }
    //Theme Filter
    if(this.state.themeFilter != ''){
      filter.themeId = this.state.themeFilter
    }
    //Input Filter
    if(this.state.inputFilter != '') {
      filter.$or = []
      filter.$or.push({name : { $regex: this.state.inputFilter, $options: 'i' }})
      filter.$or.push({tagIds : {$in: tags}})
    }

    return filter
  }

  getSorter(){
    return this.optionsSorter.find(option => option.code === this.state.selectedSort).sorter
  }

  listPlaylist(){
    const filter = this.getFilter()
    filter.presentationMachineId = this.props.PM
    return CanoncialPlaylists.find(filter,{sort: this.getSorter()}).fetch();
  }

  listMediasByType(type){
    const filter = this.getFilter()

    // We need to filter the media more presicely
    filter.type = (this.state.mediaFilter === 'all' || this.state.mediaFilter === type ) ? type : null
    // This one is specific to Medias
    filter.presentationMachineIds = this.props.PM

    const medias = Medias.find(filter, {sort: this.getSorter()}).fetch();
    //Populate with selected
    if(this.state.medias.size){
      medias.forEach((media) => {
        if(this.state.medias.has(media._id)){
          media.selected = true
        }
      })
    }

    return medias
  }

  // Not a big deal since this is already cached on the client
  getMediaById(id){
    return Medias.findOne({_id : id})
  }

  listIndustries(){
    return Industries.find({}).fetch();
  }

  listThemes(){
    return Themes.find({}).fetch();
  }

  handleFilter(state,value){
    this.setState({[state]: value})
  }

  batchSelect(array,isAdd){
    let medias = this.state.medias
    array.forEach((value) => {
      isAdd ? medias.set(value.mediaId,{duration : value.duration}) : medias.delete(value.mediaId)
    })
    medias = new Map(medias)
    //this.setState({medias})
    if(this.props.onSelect) this.props.onSelect(medias)
  }

  toggleMedia = (media) => {
    let medias = this.state.medias
    if(medias.has(media._id)){
      medias.delete(media._id)
    }
    else{
      const {_id, videoDuration = 60 } = media
      medias.set(_id,{duration :videoDuration})
    }
    medias = new Map(medias)
    //this.setState({medias})
    if(this.props.onSelect) this.props.onSelect(medias)
  }

  moveItem = (dragIndex, hoverIndex) => {
    // Create a array from the map keys
    const mediasSelected = [...this.state.medias.keys()]
    const dragItem = mediasSelected[dragIndex];

    // We reorder these keys
    mediasSelected.splice(dragIndex,1);
    mediasSelected.splice(hoverIndex,0,dragItem)

    // We need to remap the Map in the proper order
    const medias = new Map()
    mediasSelected.forEach(item => medias.set(item,this.state.medias.get(item)))
    this.setState({medias})

  }
  saveItems = () => {
    this.isValid()
  }

  // Test if all the duration inputs  are valid
  isValid(){
      return this.state.medias.size && [...this.state.medias.values()].every(media => media.duration > 0)
  }

  handleContinue = () => {
      if(this.props.onContinue) this.props.onContinue()
  }

  renderPlaylists(){
    if(this.state.mediaFilter === 'all' || this.state.mediaFilter === 'playlist'){
      return this.listPlaylist().map((playlist) => <ItemPlaylist {...playlist} selectedItems={this.state.medias} items={playlist.items()} playlistAction={(array,isAdd) => {this.batchSelect(array,isAdd)}} onAddMedia={(value) => {this.toggleMedia(value)}} typeMedia="playlist" key={playlist._id}/>)
    }
    return null
  }

  renderDndText(){
    return (
      <div style={styles.dndText}>Drag items to reorder <FastIcon style={styles.dndIcon} type="dragndrop" /></div>
    )
  }

  renderItem(type){
    return this.listMediasByType(type).map((media) => <MediaItem onAdd={() => {this.toggleMedia(media)}} key={media._id}  media={media} />)
  }

  render(){
    const playlists = this.renderPlaylists() || []
    const videos = this.renderItem('video')
    const images = this.renderItem('image')
    return(
      <div>
          <div  style={styles.panel}>
            <LeftSidebar id="div-playlist-media-search-form" style={styles.sideLeft}>
              <Label>Search By</Label>
              <SearchInput id="form-search-keyword" onChange={(value) => {this.handleFilter('inputFilter',value)}} placeholder="Title, keyword, tag" />
              <Selector selected={this.state.industryFilter} id="form-select-industry" onChange={(value) => {this.handleFilter('industryFilter',value)}} placeholder="Select industry" data={this.listIndustries()} />
              <Selector selected={this.state.themeFilter}  id="form-select-theme" onChange={(value) => {this.handleFilter('themeFilter',value)}} placeholder="Select theme" data={this.listThemes()} />
              <Label>Filter results</Label>
              <Radio current={this.state.mediaFilter} value="all" onClick={(value) => {this.handleFilter('mediaFilter',value)}}>All media</Radio>
              <Radio current={this.state.mediaFilter} value="playlist" onClick={(value) => {this.handleFilter('mediaFilter',value)}}>Playlists</Radio>
              <Radio current={this.state.mediaFilter} value="video" onClick={(value) => {this.handleFilter('mediaFilter',value)}}>Videos</Radio>
              <Radio current={this.state.mediaFilter} value="image" onClick={(value) => {this.handleFilter('mediaFilter',value)}}>Images</Radio>
            </LeftSidebar>

            {playlists.length === 0 && videos.length === 0 && images.length === 0 &&
              <div className="div-playlist-media-search-result" style={styles.sideRight}><NoResult /></div>
              ||
              <div className="div-playlist-media-search-result" style={styles.sideRight}>

                <div style={styles.sorterWrapper}>
                  <Sorter options={this.optionsSorter} selected={this.state.selectedSort} onChange={this.handleOnChangeSorter}  />
                </div>
                <div>

                  <AddMediaWrapper type="playlist" title="Playlists">
                    {playlists}
                  </AddMediaWrapper>
                  <AddMediaWrapper type="video" title="Videos">
                    {videos}
                  </AddMediaWrapper>
                  <AddMediaWrapper type="image" title="Images">
                    {images}
                  </AddMediaWrapper>
                </div>

                 <Button disabled={!this.isValid()} className="btn-continue" kind="danger" onClick={() => this.handleContinue()}>Continue</Button>
              </div>}
          </div>
      </div>

    )
  }
}

const styles = {
  panel: {
    display: 'flex'
  },
  sideLeft:{
    paddingLeft: 0,
  },
  sideRight:{
    paddingTop: "20px",
    width:'100%',
    overflow : 'hidden',
    position : 'relative'
  },
  sorterWrapper : {
    position: 'absolute',
    right : 0,
    top: 0,
    zIndex: 10
  },
  summary : {
    paddingLeft: 0,
    width : '60%'
  },
  item: {
    margin: '5px 20px 5px 0'
  },
  input: {
    height: '35px',
    width: '200px',
    paddingLeft: '10px'
  },
  goBackBtn: {
    border: '1px solid #F36F21',
    color: '#F36F21'
  },
  continueBtn: {
    backgroundColor: '#F36F21',
    color: '#FFF',
  },
  btn:{
    height: '40px',
    width: '150px',
    margin: 'auto',
    padding: '10px'
  },
  dndText : {
    color: cssVars.grey,
    fontSize : '14px',
    marginLeft : 'auto',
    display: 'flex',
    alignItems: 'center',
  },
  dndIcon : {
    width : '30px',
    height : '30px',
    fill : cssVars.grey,
    marginLeft: '15px',
    marginRight: '15px',
  }
}
