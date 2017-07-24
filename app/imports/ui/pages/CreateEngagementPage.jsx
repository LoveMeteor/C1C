import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'
import ReactDOM from 'react-dom'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'
import { moment } from 'meteor/momentjs:moment'
import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import KeyHandler, { KEYPRESS } from 'react-key-handler'
import Radium from 'radium'

import SndTopNav from '/imports/ui/components/SndTopNav'
import { Selector, SimpleInput, Button, InputInline, TagInput } from '/imports/ui/components/FormElements'
import AreaWrapper from '/imports/ui/partials/Engagements/create/AreaWrapper'
import PlaylistBuilder from '/imports/ui/partials/Engagements/create/PlaylistBuilder'
import PlaylistReview from '/imports/ui/partials/Engagements/create/PlaylistReview'
import CollapsableItem, { ReviewItem } from '/imports/ui/components/CollapsableItem'
import DurationModal from '/imports/ui/components/DurationModal'

import { BoolButton } from '../components'

import cssVars from '/imports/ui/cssVars'

// API Collections
import { Clients } from '/imports/api/clients/clients'
import { Playlists } from '/imports/api/playlists/playlists'
import { PresentationMachines } from '/imports/api/presentationmachines/presentationmachines'
import { Engagements } from '/imports/api/engagements/engagements'
import { Medias } from '/imports/api/medias/medias'

// API Methods
import { insertEngagement, updateEngagement } from '/imports/api/engagements/methods'
import { insertPlaylistItemBulk, upsertPlaylistItemBulk } from '/imports/api/playlistitems/methods'
import { insertPlaylist, updatePlaylist } from '/imports/api/playlists/methods'


@Radium
export default class CreateEngagement extends TrackerReact(React.Component) {

  constructor(props) {
    super(props)

    this.state = {
      date: '',
      time: '',
      duration: '',
      isStar: false,
      selectedArea: null,
      summaryView: false,
      playlists: {},
      engagement: {
        name: '',
        clientId: '',
        startTime: null, // Start Time as Unix Timestamp
        endTime: null, // Start Time as Unix Timestamp
      },
      panels: {
        pos1: {
          pick: ['name'],
        },
        pos2: {
          pick: ['clientId'],
        },
        pos3: {

        },
        pos4: {

        },
      },
      currentPanel: 1,
      subscription: {
        playlist: Meteor.subscribe('canoncialPlaylists'),
        items: Meteor.subscribe('playlistitems'),
        playlists: Meteor.subscribe('playlists'),
        media: Meteor.subscribe('medias'),
        clients: Meteor.subscribe('clients'),
        engagements: Meteor.subscribe('engagements'),
        presentationmachines: Meteor.subscribe('presentationmachines'),
      },
    }
  }

  componentWillMount() {
    // Edit playlist
    if (this.props.engagementId) {
      const engagementId = this.props.engagementId
      // Set the values to edit
      this.handleTemplate({ _id: engagementId }, true)
    }
  }


  componentDidMount() {
    // Create the popup
    const div = document.createElement('DIV')
    div.id = 'durationModal'
    document.getElementById('main').append(div)
    this.state.div = div
  }


  setEngagement(item, value) {
    const { engagement } = this.state
    engagement[item] = value
    this.setState({ engagement })
  }


  moveItem = (dragIndex, hoverIndex, presentationMachineId) => {
    const { playlists } = this.state

    // Create a array from the map keys
    const mediasSelected = [...playlists[presentationMachineId].medias.keys()]
    const dragItem = mediasSelected[dragIndex];
    // We reorder these keys
    mediasSelected.splice(dragIndex, 1);
    mediasSelected.splice(hoverIndex, 0, dragItem)

    // We need to remap the Map in the proper order
    const medias = new Map()
    mediasSelected.forEach(item => medias.set(item, playlists[presentationMachineId].medias.get(item)))
    playlists[presentationMachineId].medias = medias
    this.setState({ playlists: Object.assign(playlists) })
  }

  setDuration = (item, duration, overwrite) => {
    const { _id: itemId, duration: dur, presentationMachineId } = item
    const { playlists } = this.state

    if (overwrite) {
      playlists[presentationMachineId].medias.forEach((playlistItem, mediaId) => {
        if (this.getMediaById(mediaId).type === 'image') {
          playlistItem.duration = duration
        }
      })
    } else {
      playlists[presentationMachineId].medias.forEach((playlistItem, index) => {
        if (index === itemId) {
          playlistItem.duration = duration
        }
      })
    }

    this.setState({ playlists: Object.assign(playlists) })
  }

  setDurationModal = (item) => {
      // Set the modal
    const modal = ReactDOM.render((<DurationModal {...item} onSubmit={(newDuration, overwrite) => this.setDuration(item, newDuration, overwrite)} />), this.state.div);
    modal.refs.durationModal.show()
  }

  isValid = (pos) => {
    const panel = this.state.panels[`pos${pos}`]
    const state = Object.assign({}, this.state.engagement)
    const validityContext = Engagements.schema.pick(panel.pick).newContext()
    const cleanedState = Engagements.schema.pick(panel.pick).clean(state)
    const valid = validityContext.validate(cleanedState)

    if (pos === 1) {
      const { date, time, duration, isStar } = this.state
      return (isStar && valid) || ([date, time, duration].every(item => item !== '') && valid)
    } else if (pos === 2) {
      return this.state.isStar || (this.isValid(1) && valid && this.state.engagement && this.state.engagement.clientId && this.state.engagement.clientId !== '')
    }
    return this.isValid(1) && this.isValid(2) && Object.values(this.state.playlists).some(data => data.medias && data.medias.size > 0)
  }

  toggleSummary = (summaryView) => {
    this.setState({ summaryView })
  }


  // active events
  handleTitle = (value) => {
    this.setEngagement('name', value, 'pos1')
  }

  handleDate = (date) => {
    this.setState({ date })
  }

  handleTime = (time) => {
    this.setState({ time })
  }

  handleDuration = (duration) => {
    this.setState({ duration })
  }

  handleClient = (clientId) => {
    this.setEngagement('clientId', clientId)
  }

  handleStar = () => {
    this.setState({ isStar: !this.state.isStar })
  }

  handleFilter(state, value, id) {
    const { playlists } = this.state
    const playlist = playlists[id] ? playlists[id] : {}
    playlist.filters = playlist.filters || {}
    playlist.filters[state] = value
    playlists[id] = playlist
    this.setState({ playlists: Object.assign(playlists) })
  }

  handleSeletedArea = (selectedArea) => {
    this.setState({ selectedArea })
  }

  handleOverlayText = (text, id) => {
    const { playlists } = this.state
    const playlist = playlists[id] ? playlists[id] : {}
    playlist.overlay = text
    playlists[id] = playlist
    this.setState({ playlists: Object.assign(playlists) })
  }

  handleMedias = (medias, id) => {
    const { playlists } = this.state
    const playlist = playlists[id] ? playlists[id] : {}

    playlist.medias = medias
    playlist.mediasValid = [...medias.values()].every(media => media.duration > 0)
    playlists[id] = playlist
    this.setState({ playlists: Object.assign(playlists) })
  }

  handleNewClient = () => {
    window.open('/client/createClient?closeAfter=true', '_blank')
  }

  handleTemplate = ({ _id }, isUpdate = false) => {
    if (_id) {
      // Load Engagement
      const { clientId, name, startTime, endTime, star: isStar } = this.listEngagementById(_id)
      const { engagement } = this.state

      if (isUpdate) {
        // Set the proper time to the state
        // Create moment object for easy handling
        const start = moment(startTime)
        const end = moment(endTime)

        // Get the duration
        const duration = Math.round(((end.unix() - start.unix()) / 60)).toString()
        // Get the duration
        const time = Math.round(((start.unix() - moment(start).startOf('day').unix()) / 60)).toString()
        // Get the day
        const date = start.format('YYYY-MM-DD')

        this.setState({ date, time, duration })
      }

      // Load playlists items
      const playlists = this.getPlaylistsStateFromEngagement(_id)

      this.setState({ engagement: { ...engagement, clientId, name }, playlists, isStar })
    }
  }

  onKeyHandle = (event) => {
    event.preventDefault()

    const { currentPanel } = this.state

    if (currentPanel < 4) { this.goToPanel(currentPanel + 1) } else if (this.isValid(3)) { this.createEngagement() }
  }
  getMediaById(id) {
    return Medias.findOne({ _id: id })
  }

  getPlaylistsStateFromEngagement = (engagementId) => {
    const playlists = {}
    Playlists.find({ engagementId }).forEach((playlist) => {
      const { _id, presentationMachineId, overlay } = playlist
      const medias = new Map()
      playlist.itemsInOrder().forEach(({ _id, mediaId, duration, showOverlay }) => {
        medias.set(mediaId, { _id, duration, showOverlay })
      })
      playlists[presentationMachineId] = { _id, overlay, medias, mediasValid: true, engagementId }
    })
    return playlists
  }


  // Move this to an helper or an HOC
  getPrettyDate(parsedTime) {
    return parsedTime.calendar(null, {
      lastDay: '[Yesterday]',
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd DD/MM',
      sameElse: 'dddd DD/MM',
    })
  }

  getCurrentCic() {
    return Session.get('cic')
  }
  // Lists

  listDuration() {
    return [...Array(11).keys()].map((index) => {
      const time = (index + 1) * 30
      const hours = Math.trunc(time / 60)
      const minutes = (time % 60) ? time % 60 : '00'
      return {
        _id: `${time}`,
        name: `${hours}:${minutes}`,
      }
    })
  }

  listTime() {
    const { date } = this.state;
    const mDate = moment(date, 'YYYY-MM-DD')
    let halfHours = 48,
      pastHalfHours = 0
    // If today , we don't show hours before now
    if (date !== '' && moment().startOf('day').diff(mDate, 'days') === 0) {
      pastHalfHours = Math.ceil(moment().diff(moment().startOf('day'), 'minutes') / 30)
      halfHours -= pastHalfHours
    }
    // we put the first hours at 7am
    const halfHoursArray = [...Array(halfHours).keys()]
    const moveTo = halfHoursArray.length - 34
    if (moveTo > 0) {
      const morningHalfHours = halfHoursArray.splice(halfHoursArray.length - 34);
      halfHoursArray.unshift(...morningHalfHours)
    }

    return halfHoursArray.map((index) => {
      const time = (index + pastHalfHours) * 30
      const hours = Math.trunc(time / 60)
      const minutes = (time % 60) ? time % 60 : '00'
      return {
        _id: `${time}`,
        name: `${hours}:${minutes}`,
      }
    })
  }

  listDates() {
    // Return the 20 next dates
    return [...Array(20).keys()].map((index) => {
      const day = moment().add(index, 'days');
      return {
        _id: day.format('YYYY-MM-DD'),
        name: this.getPrettyDate(day),
      }
    })
  }

  listPM() {
    return PresentationMachines.find({ cicId: Session.get('cic') }).fetch()
  }

  listClients() {
    return Clients.find({ cicId: this.getCurrentCic() }).fetch()
  }

  listEngagementById(_id) {
    return Engagements.findOne({ _id })
  }

  listEngagementByName = name => Engagements.find({ name: { $regex: name, $options: 'i' }, cicId: this.getCurrentCic() }, { sort: { name: 1, startTime: 1 } }).map(({ _id, name, startTime }) => ({
    name: (<span style={styles.selectorWrapper}><span className="engagement-name" style={styles.selectorName}>{name}</span> <span className="engagement-date" style={styles.selectorDate}> {moment(startTime).format('DD/MM/YY')}</span><span className="engagement-use" style={styles.selectorLink}>Use template</span></span>),
    _id,
  }))

  createEngagement = () => {
    // Create the engagemenmt
    const { name, clientId } = this.state.engagement
    const cicId = Session.get('cic')
    const star = this.state.isStar
    let { startTime, endTime } = this.formatTime()
    startTime = startTime.isValid() ? startTime.format() : null
    endTime = endTime.isValid() ? endTime.format() : null
    let createEngagementId = null
    if (this.props.engagementId) {
      createEngagementId = this.props.engagementId
      updateEngagement.call({
        _id: this.props.engagementId, name, clientId, startTime, endTime, star,
      })
    } else {
      createEngagementId = insertEngagement.call({
        name, clientId, startTime, endTime, cicId, star,
      })
    }

    // Create the playlist items and playlist
    Object.entries(this.state.playlists).forEach(([presentationMachineId, { _id, mediasValid, medias, overlay, engagementId }]) => {
      console.log(_id, mediasValid, medias, overlay, engagementId, createEngagementId)
      // If we have an ID we update the playlist , else we create it
      if (_id && engagementId === createEngagementId) {
        if (mediasValid) {
          const listItems = [...medias.entries()].map(([mediaId, { _id, duration, showOverlay }]) => ({ _id, mediaId, duration, showOverlay }))
          const itemIds = upsertPlaylistItemBulk.call({ listItems })
          updatePlaylist.call({ _id, overlay, itemIds })
        }
      } else if (mediasValid) {
        const listItems = [...medias.entries()].map(([mediaId, { duration, showOverlay }]) => ({ mediaId, duration, showOverlay }))
        if (listItems.length) {
          const itemIds = insertPlaylistItemBulk.call({ listItems })
          insertPlaylist.call({ engagementId: createEngagementId, presentationMachineId, overlay, itemIds })
        }
      }
    })

    // Redirect
    FlowRouter.go('/engagements')
  }


  goToPanel(panelId) {
    if (panelId == 1) this.setState({ currentPanel: 1 })
    else if (this.isValid(panelId - 1)) { this.setState({ currentPanel: panelId }) }
  }

  formatTime() {
    const { date, time, duration } = this.state
    const day = moment(date).startOf('day')
    const startTime = day.add(time, 'minutes')
    const endTime = moment(startTime).add(duration, 'minutes')
    return { startTime, endTime }
  }

  formatReviewTime() {
    const { startTime, endTime } = this.formatTime()
    if (!startTime.isValid() && !endTime.isValid()) return null
    return `${startTime.format('dddd DD MMMM  hh:mmA')} - ${endTime.format('hh:mmA')}`
  }

  renderClient() {
    const { name = '' } = Clients.findOne({ _id: this.state.engagement.clientId }) || {}
    return name
  }
  render() {
    const pms = this.listPM()
    let { selectedArea } = this.state
    if (!selectedArea) {
      if (pms[0]) {
        selectedArea = pms[0]._id
      }
    }

    const { currentPanel, isStar } = this.state
    return (
      <div>
        <KeyHandler keyEventName={KEYPRESS} keyValue="Enter" onKeyHandle={this.onKeyHandle} />
        <SndTopNav>
          <TagInput id="search-templates" style={styles.engagementsInput} tags={this.listEngagementByName} onChange={this.handleTemplate} placeholder="Search Engagement templates" />
        </SndTopNav>
        <CollapsableItem id="create-engagement-collapse-title" pos={1} title={'Title'} contextData={this.state.engagement.name} onClick={() => { this.goToPanel(1) }} clickable visible={currentPanel === 1}>
          <InputInline style={{ width: '80%' }}>
            <SimpleInput defaultValue={this.state.engagement.name} style={{ flex: '2' }} onChange={this.handleTitle} placeholder="Engagement title" /><BoolButton icon="star" active={isStar} onClick={this.handleStar} />
          </InputInline>
          <InputInline style={{ width: '80%' }}>
            <Selector selected={this.state.date} className="selector-date" style={{ flex: '1' }} onChange={this.handleDate} placeholder="Select date" data={this.listDates()} />
            <Selector selected={this.state.time} className="selector-time" style={{ flex: '1' }} onChange={this.handleTime} placeholder="Select time" data={this.listTime()} />
            <Selector selected={this.state.duration} className="selector-duration" style={{ flex: '1' }} onChange={this.handleDuration} placeholder="Select duration" data={this.listDuration()} />
            <Button className="btn-continue" disabled={!this.isValid(1)} onClick={() => { this.goToPanel(2) }} kind="danger">Continue</Button>
          </InputInline>
        </CollapsableItem>

        <CollapsableItem id="create-engagement-collapse-client" pos={2} title={'Client'} contextData={this.state.engagement.clientId && this.listClients().find(client => client._id === this.state.engagement.clientId).name} onClick={() => { this.goToPanel(2) }} clickable={this.isValid(1)} visible={currentPanel === 2}>
          <InputInline style={{ width: '80%' }}>
            <Selector selected={this.state.engagement.clientId} className="selector-client" style={{ flex: '1' }} onChange={this.handleClient} placeholder="Select existing client" data={this.listClients()} />
            <Button className="btn-create-client" onClick={this.handleNewClient} icon="add" kind="faded">Add new client</Button>
            <Button className="btn-continue" disabled={!this.isValid(2)} onClick={() => { this.goToPanel(3) }} kind="danger">Continue</Button>
          </InputInline>
        </CollapsableItem>

        <CollapsableItem id="create-engagement-collapse-media" pos={3} title={'Assigned area/s'} onClick={() => { this.goToPanel(3) }} clickable={this.isValid(2)} visible={currentPanel === 3}>
          <AreaWrapper selected={selectedArea} onSelect={this.handleSeletedArea}>
            {pms.map(pm => (<PlaylistBuilder
              handleFilter={(state, value) => { this.handleFilter(state, value, pm._id) }}
              updateMedias={this.handleMedias}
              overlay={this.handleOverlayText}
              summaryView={this.state.summaryView}
              toggleSummary={this.toggleSummary}
              selectedArea={selectedArea}
              onContinue={() => { this.goToPanel(4) }}
              playlists={this.state.playlists}
              style={[pm._id !== selectedArea && { display: 'none' }]}
              key={pm._id}
              presentationMachine={pm}
            />))}
          </AreaWrapper>
        </CollapsableItem>

        <CollapsableItem id="create-engagement-collapse-review" pos={4} title={'Review'} onClick={() => { this.goToPanel(4) }} visible={currentPanel === 4} clickable={this.isValid(3)} >
          <ReviewItem className="container-review-title" title={'Title & Date'} onClick={() => { this.goToPanel(1) }}>
            <div>{this.state.engagement.name}</div>
            <div>{this.formatReviewTime()}</div>
          </ReviewItem>
          <ReviewItem className="container-review-area" title={'Client'} onClick={() => { this.goToPanel(2) }}>
            <div>{this.renderClient()}</div>
          </ReviewItem>
          <ReviewItem className="container-review-media" title={'Assigned Area/s'} styleRightArea={styles.reviewAreas} onClick={() => { this.goToPanel(3) }}>
            {/* Object.entries return an array with key value array for each object , with the es6 array destructuring we can get the key value directly in the map ! */}
            {Object.entries(this.state.playlists).map(([presentationMachineId, playlist]) => <PlaylistReview moveItem={this.moveItem} key={presentationMachineId} presentationMachineId={presentationMachineId} setDuration={this.setDurationModal} {...playlist} />)}
          </ReviewItem>
          <InputInline>
            <Button className="btn-save" onClick={this.createEngagement} style={styles.buttonSave} kind="danger">Save & Finish</Button>
          </InputInline>
        </CollapsableItem>
      </div>
    )
  }
}

const styles = {
  button: {
    marginRight: '100px',
  },
  buttonSave: {
    marginLeft: '160px',
  },
  item: {
    borderBottom: '1px solid #FFF',
    marginTop: '20px',
  },
  selectorWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  selectorName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    flexShrink: 10,
  },
  selectorDate: {
    color: cssVars.grey,
    fontSize: '13px',
    marginRight: '10px',
    marginLeft: '10px',
  },
  selectorLink: {
    marginLeft: 'auto',
    marginRight: '10px',
    flexShrink: 0,
    color: cssVars.brandColor,
  },
  icon: {
    width: '30px',
    marginRight: '10px',
  },
  reviewAreas: {
    display: 'flex',
    width: '100%',
    overflow: 'hidden',
  },
  engagementsInput: {
    marginBottom: '-10px',
    width: '350px',
    background: cssVars.lightGrey,
  },
}
