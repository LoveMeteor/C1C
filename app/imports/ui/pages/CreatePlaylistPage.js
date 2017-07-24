import ReactDOM from 'react-dom'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { subsManager } from '/imports/startup/client/routes'
import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import { DragDropContext } from 'react-dnd'
import KeyHandler, { KEYPRESS } from 'react-key-handler'

import SndTopNav from '/imports/ui/components/SndTopNav'
import { SimpleInput, Button, InputInline, Radio, TagInput } from '/imports/ui/components/FormElements'
import {Selector} from '../components'
import { FastIcon } from '/imports/ui/components/CustomSvg'

import { DragItem } from '/imports/ui/partials/Playlist/ItemPlaylistMedia'
import CollapsableItem, { ReviewItem } from '/imports/ui/components/CollapsableItem'
import TagContainer, { ITEM_TYPES } from '/imports/ui/components/TagContainer'
import AddMediaPanel from '/imports/ui/partials/Playlist/create/AddMediaPanel'
import DurationModal from '/imports/ui/components/DurationModal'

import { insertMultipleTags } from '/imports/api/tags/methods';
import { insertPlaylistItemBulk } from '/imports/api/playlistitems/methods'
import { insertCanoncialPlaylist, updateCanoncialPlaylist } from '/imports/api/canoncialplaylist/methods'

import { PlaylistItems, CanoncialPlaylists, PresentationMachines, Industries, Themes, Medias, Tags, Cics } from '../../api/models'

import TouchBackend from 'react-dnd-touch-backend';
import HTML5Backend from 'react-dnd-html5-backend';

@DragDropContext('ontouchstart' in window ? TouchBackend : HTML5Backend)
export default class CreatePlaylist extends TrackerReact(React.Component) {

  constructor(props) {
    super(props)

    this.state = {
      tags: new Map(),
      // Todo : Rework how the Selected and Duration are globally managed , they should be in the same map state
      medias: new Map(),
      playlist: {
        name: '',
        presentationMachineId: '',
        tagIds: [],
        themeId: '',
        industryIds: [],
        itemIds: [],
      },
      panels: {
        pos1: {
          pick: ['name',
            'themeId',
            'industryIds',
            'industryIds.$',
            'tagIds',
            'tagIds.$',
          ],
        },
        pos2: {
          pick: ['presentationMachineId'],
        },
        pos3: {
        },
        pos4: {
        },
      },
      currentPanel: 1,
      subscription: {
        industries: subsManager.subscribe('industries'),
        themes: subsManager.subscribe('themes'),
        machines: subsManager.subscribe('presentationmachines'),
        playlist: subsManager.subscribe('canoncialPlaylists'),
        items: subsManager.subscribe('playlistitems'),
        media: subsManager.subscribe('medias'),
        tags: subsManager.subscribe('tags'),
      },
    }
    // Edit playlist
    if (this.props.playlistData) {
      const { createdAt, ...cleanedProps } = this.props.playlistData
      this.state.playlist = cleanedProps
      this.getTagsByIds(this.props.playlistData.tagIds).forEach((tag) => {
        this.state.tags.set(tag.name, tag)
      })
      const items = this.getItemsByIds(this.props.playlistData.itemIds)
      this.state.medias = new Map([...items.map(item => [item.mediaId, { duration: item.duration }])])
    }
  }

  componentDidMount() {
    // Create the popup
    const div = document.createElement('DIV')
    div.id = 'durationModal'
    document.getElementById('main').append(div)
    this.state.div = div
  }

  moveItem = (dragIndex, hoverIndex) => {
    // Create a array from the map keys
    const mediasSelected = [...this.state.medias.keys()]
    const dragItem = mediasSelected[dragIndex];

    // We reorder these keys
    mediasSelected.splice(dragIndex, 1);
    mediasSelected.splice(hoverIndex, 0, dragItem)

    // We need to remap the Map in the proper order
    const medias = new Map()
    mediasSelected.forEach(item => medias.set(item, this.state.medias.get(item)))
    this.setState({ medias })
  }

  saveItems = () => {
    // this.isValid()
  }

  setDuration = (item, duration, overwrite) => {
    const { _id: itemId, duration: dur } = item
    const { medias } = this.state

    if (overwrite) {
      medias.forEach((mediaItem, mediaId) => {
        if (this.getMediaById(mediaId).type === 'image') {
          mediaItem.duration = duration
        }
      })
    } else {
      medias.forEach((mediaItem, index) => {
        if (index === itemId) {
          mediaItem.duration = duration
        }
      })
    }

    this.setState({ playlists: Object.assign(medias) })
  }

  setDurationModal = (item) => {
      // Set the modal
    const modal = ReactDOM.render((<DurationModal {...item} onSubmit={(newDuration, overwrite) => this.setDuration(item, newDuration, overwrite)} />), this.state.div);
    modal.refs.durationModal.show()
  }

  setPlaylist(item, value) {
    const playlist = this.state.playlist
    playlist[item] = value
    this.setState({ playlist })
  }

  // Lists
  listIndustries() {
    return Industries.find({}).fetch();
  }

  listThemes() {
    return Themes.find({}).fetch();
  }

  listPM() {
    return Cics.find().fetch().map((cic) => ({
        _id: cic._id,
        name: cic.name,
        children: PresentationMachines.find({cicId:cic._id}).map((pm)=>({_id:pm._id,name:pm.name}))
    }))
  }
  listTags(text) {
    return Tags.find({ name: { $regex: text, $options: 'ig' } }).fetch()
  }

  isValid = (panelId) => {
    const panel = this.state.panels[`pos${panelId}`]
    const state = Object.assign({}, this.state.playlist)
    const validityContext = CanoncialPlaylists.schema.pick(panel.pick).newContext()
    const cleanedState = CanoncialPlaylists.schema.pick(panel.pick).clean(state)
    let valid = validityContext.validate(cleanedState)

    if (panelId > 1) for (let i = panelId - 1; i >= 1; i--) valid = valid && this.isValid(i)
    if (panelId === 3) {
      const { medias } = this.state
      return valid && medias.size/* && medias.values().every(item => item.duration > 0)*/
    }
    return valid
  }

  // active events
  handleTitle = (value) => {
    this.setPlaylist('name', value)
  }

  handleIndustries = (value) => {
    this.setPlaylist('industryIds', value)
  }

  handleTheme = (value) => {
    this.setPlaylist('themeId', value)
  }

  handlePM = (value) => {
    if (this.state.playlist.presentationMachineId !== value) this.setState({ medias: new Map() })
    this.setPlaylist('presentationMachineId', value)
  }

  handleItems = (medias) => {
    this.setState({ medias: new Map(medias) });
  }

  handleTags = (value) => {
    this.state.tags.set(value.name, value)
    this.forceUpdate()
    // this.setState({tagValues: value})
  }

  removeElement = (value, type) => {
    if (type === ITEM_TYPES.TAG) {
      this.state.tags.delete(value)
      this.forceUpdate()
    }
    if (type === ITEM_TYPES.THEME) {
      this.state.playlist.themeId = ''
      this.setState({ playlist: Object.assign(this.state.playlist) })
    }
    if (type === ITEM_TYPES.INDUSTRY) {
      const industryIds = new Set(this.state.playlist.industryIds)
      industryIds.delete(value)
      this.state.playlist.industryIds = [...industryIds]
      this.setState({ playlist: Object.assign(this.state.playlist) })
    }
  }

  getListIndustries(industryIds) {
    if (industryIds) {
      const industries = Industries.find({ _id: { $in: industryIds } }).fetch()
      const industryText = []
      industries.map((industry) => {
        industryText.push(industry.name)
      })
      return industryText.join(', ')
    }
    return ''
  }

  getPMById(id) {
    const pm = PresentationMachines.findOne({ _id: id })
    if (pm) {
      return <div style={style.pmWrapper}>{pm.name}</div>
    }
    return null
  }

  getMediaById(id) {
    return Medias.findOne({ _id: id })
  }

  goToPanel(panelId) {
    if (panelId == 1) {
      this.setState({ currentPanel: 1 })
    } else if (this.isValid(panelId - 1)) {
      this.setState({ currentPanel: panelId })
    }
  }

  onKeyHandle = (event) => {
    event.preventDefault()

    const { currentPanel } = this.state

    if (currentPanel < 4) {
      this.goToPanel(currentPanel + 1)
    } else if (this.isValid(3)) {
      this.createPlaylist()
    }
  }

  getTagsByIds(ids) {
    return Tags.find({ _id: { $in: ids } }).fetch()
  }

  getItemsByIds(ids) {
    return PlaylistItems.find({ _id: { $in: ids } }).fetch()
  }

  getItems() {
    return [...this.state.medias.keys()].map((item) => {
      const obj = { mediaId: item }
      if (this.state.medias.get(item)) {
        obj.duration = this.state.medias.get(item).duration
      }
      return obj
    })
  }

  createTags() {
    const tags = [...this.state.tags.values()].map(tag => tag.name)
    return insertMultipleTags.call({ names: tags })
  }

  createPlaylist() {
    // Create Tags
    const tagIds = this.createTags()

    // Create Items
    const itemIds = insertPlaylistItemBulk.call({ listItems: this.getItems() })

    console.log(itemIds)
    // If state as an id => Update
    if (this.state.playlist._id) {
      updateCanoncialPlaylist.call({ ...this.state.playlist, tagIds, itemIds }, (error, response) => {
        console.log(error, response);
      })
    } else {
      insertCanoncialPlaylist.call({ ...this.state.playlist, tagIds, itemIds }, (error, response) => {
        console.log(error, response);
      })
    }

    // Redirect
    FlowRouter.go('/playlists')
  }

  render() {
    const { currentPanel } = this.state
    return (
      <div>
        <KeyHandler keyEventName={KEYPRESS} keyValue="Enter" onKeyHandle={this.onKeyHandle} />
        <SndTopNav />
        <CollapsableItem id="create-playlist-collapse-title" pos={1} title={'Title'} contextData={`${this.state.playlist.name}`} onClick={() => { this.goToPanel(1) }} clickable visible={currentPanel === 1}>
          <InputInline style={{ width: '100%' }}>
            <SimpleInput defaultValue={this.state.playlist.name} style={{ flex: '2' }} onChange={this.handleTitle} placeholder="Playlist title" />
            <Selector selected={this.state.playlist.industryIds} className="selector-industry" style={{ flex: '1' }} multiple onChange={this.handleIndustries} placeholder="Select industry" data={this.listIndustries()} />
            <Selector selected={this.state.playlist.themeId} className="selector-theme" style={{ flex: '1' }} onChange={this.handleTheme} placeholder="Select theme" data={this.listThemes()} />
          </InputInline>
          <InputInline style={{ width: '20%' }}>
            <TagInput ref="formTags" className="selector-tags" tags={this.listTags} placeholder="Select Tags" onChange={this.handleTags} />
          </InputInline>
          <TagContainer tags={this.state.tags} themes={this.state.playlist.themeId} industries={this.state.playlist.industryIds} onClick={this.removeElement} />
          <Button className="btn-continue" disabled={!this.isValid(1)} onClick={() => { this.goToPanel(2) }} kind="danger">Continue</Button>
        </CollapsableItem>

        <CollapsableItem id="create-playlist-collapse-area" pos={2} title={'Area'} contextData={this.state.playlist.presentationMachineId && PresentationMachines.findOne({_id:this.state.playlist.presentationMachineId}).name} onClick={() => { this.goToPanel(2) }} clickable={this.isValid(1)} visible={currentPanel === 2}>
          <div>Select area/s</div>
          <div style={style.PMWrapper}>
            <Selector selected={this.state.playlist.presentationMachineId} className="selector-area" data={this.listPM()} onChange={this.handlePM} placeholder="Select area" />
          </div>
          <Button className="btn-continue" disabled={!this.isValid(2)} onClick={() => { this.goToPanel(3) }} kind="danger">Continue</Button>
        </CollapsableItem>

        <CollapsableItem id="create-playlist-collapse-add-media" pos={3} title={'Add media'} onClick={() => { this.goToPanel(3) }} clickable={this.isValid(2)} visible={currentPanel === 3}>
          <AddMediaPanel PM={this.state.playlist.presentationMachineId} onDelete={this.handleDeleteSelectedMedia} medias={this.state.medias} onSelect={this.handleItems} onContinue={() => this.goToPanel(4)} />
        </CollapsableItem>

        <CollapsableItem id="create-playlist-collapse-review" pos={4} title={'Review'} onClick={() => { this.goToPanel(4) }} visible={currentPanel === 4} clickable={this.isValid(3)} >
          <ReviewItem className="container-review-title" title={'Title & Tags'} onClick={() => { this.goToPanel(1) }}>
            <InputInline style={{ width: '100%' }}>
              <div>
                <div>{this.state.playlist.name}</div>
                <div>{this.getListIndustries(this.state.playlist.industryIds)}</div>
              </div>
              <TagContainer tags={this.state.tags} />
            </InputInline>
          </ReviewItem>
          <ReviewItem className="container-review-area" title={'Area/s'} onClick={() => { this.goToPanel(2) }}>
            {this.getPMById(this.state.playlist.presentationMachineId)}
          </ReviewItem>
          <ReviewItem className="container-review-media" title={'Media'} onClick={() => { this.goToPanel(3) }} >
            {this.state.medias && [...this.state.medias.keys()].map((item, index) => <DragItem dataId={item} index={index} key={item} moveItem={this.moveItem} saveItems={this.saveItems} {...this.getMediaById(item)} setDuration={this.setDurationModal} duration={this.state.medias.get(item).duration} />)}
          </ReviewItem>
          <InputInline>
            <Button className="btn-save" onClick={() => { this.createPlaylist() }} kind="danger">Save & Finish</Button>
          </InputInline>
        </CollapsableItem>
      </div>
    )
  }
}

const style = {
  PMWrapper: {
    marginTop: '10px',
    display: 'flex'
  },
  button: {
    marginRight: '100px',
  },
  item: {
    borderBottom: '1px solid #FFF',
    marginTop: '20px',
  },
  tags: {
    flex: '3',
    display: 'flex',
  },
  pmWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    width: '30px',
    marginRight: '10px',
  },
}
