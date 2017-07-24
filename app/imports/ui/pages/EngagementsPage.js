import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'
import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import { moment } from 'meteor/momentjs:moment'
import Calendar from '/imports/ui/components/Calendar'

import SndTopNav, { SndTopNavAction } from '/imports/ui/components/SndTopNav'
import cssVars from '/imports/ui/cssVars'
import { getTagsFromString } from '/imports/ui/helpers'

import LeftSidebar from '/imports/ui/components/LeftSidebar'
import Sorter from '/imports/ui/components/Sorter'
import { SearchInput, Selector, Label } from '/imports/ui/components/FormElements'
import EngagementsItem from '/imports/ui/partials/Engagements/EngagementItem'
import Item from '/imports/ui/components/ItemCommon'
import { FastIcon } from '/imports/ui/components/CustomSvg'
import NoResult from '/imports/ui/components/NoResult'

//
import { Clients } from '/imports/api/clients/clients'
import { Engagements } from '/imports/api/engagements/engagements'
import { removeEngagement } from '/imports/api/engagements/methods'
import Radium from 'radium'

const VIEW = {
  LIST: 'list',
  CALENDAR: 'calendar',
  STAR: 'star',
}

@Radium
export default class EngagementsPage extends TrackerReact(React.Component) {
  constructor() {
    super();
    this.state = {
      selectedSort: 'chronological',
      listView: VIEW.LIST,
      clientFilter: '',
      inputFilter: '',
      dateFilter: '',
      dates: [],
      subscription: {
        engagements: Meteor.subscribe('engagements'),
        clients: Meteor.subscribe('clients'),
        playlists: Meteor.subscribe('playlists'),
        playerStatuses: Meteor.subscribe('playerstatus'),
      },
    }
  }

  optionsSorter = [
      { code: 'chronological', text: 'Chronological', sorter: { startTime: 1 } },
      { code: 'asc', text: 'Title (A–Z)', sorter: { name: 1 } },
      { code: 'desc', text: 'Title (Z–A)', sorter: { name: -1 } },

  ]

  handleOnChangeSorter = (code) => {
    this.setState({ selectedSort: code })
  }

  handleSearchFilter = (value) => {
    this.setState({ inputFilter: value });
  }

  handleClientFilter = (value) => {
    this.setState({ clientFilter: value });
  }

  handleDateFilter = (dateFilter) => {
    this.setState({ dateFilter });
  }

  handleSwitch = (listView) => {
    this.setState({ listView });
  }

  componentWillUnmount() {
    this.state.subscription.engagements.stop();
  }

  listClients() {
    return Clients.find({ cicId: this.getCurrentCic() }).fetch()
  }

  getCurrentCic() {
    return Session.get('cic')
  }

  listEngagements(future = true) {
    const filter = {}
    // Title, tags , need some more complex filtering
    if (this.state.inputFilter != '') {
      const tags = getTagsFromString(this.state.inputFilter)
      filter.$or = []
      filter.$or.push({ name: { $regex: this.state.inputFilter, $options: 'i' } })
      filter.$or.push({ tagIds: { $in: tags } })
    }

    // Filter Client
    if (this.state.clientFilter != '') {
      filter.clientId = this.state.clientFilter
    }

    // Filter by day
    if (this.state.dateFilter != '' && this.state.listView) {
      const date = moment(this.state.dateFilter)
      filter.startTime = {
        $gte: date.startOf('day').toDate(),
        $lt: date.endOf('day').toDate(),
      }
    }
    // Filter to get only future events
    if (future) {
      // Get the iso date for today morning
      const today = moment().startOf('day').toDate()
      filter.endTime = { $gte: today }
    }

    // Filter by CIC
    filter.cicId = this.getCurrentCic()

    // Sorter
    const sort = this.optionsSorter.find(option => option.code === this.state.selectedSort).sorter
    return Engagements.find(filter, { sort }).fetch()
  }

  listStars(future = true) {
    const filter = {}
    // Title, tags , need some more complex filtering
    if (this.state.inputFilter != '') {
      const tags = getTagsFromString(this.state.inputFilter)
      filter.$or = []
      filter.$or.push({ name: { $regex: this.state.inputFilter, $options: 'i' } })
      filter.$or.push({ tagIds: { $in: tags } })
    }

    // Filter Client
    if (this.state.clientFilter != '') {
      filter.clientId = this.state.clientFilter
    }

    filter.star = true

    // Filter by CIC
    filter.cicId = this.getCurrentCic()

    // Sorter
    const sort = this.optionsSorter.find(option => option.code === this.state.selectedSort).sorter
    return Engagements.find(filter, { sort }).fetch()
  }

  listEngagementsPure() {
    return Engagements.find({ cicId: this.getCurrentCic(), endTime: { $gte: moment().startOf('day').toDate() } }).fetch()
  }

  listDates() {
    // Use set to filter unique dates in the array
    const dates = new Set(
      this.listEngagementsPure().map(engagement => moment(engagement.startTime).format('YYYY-MM-DD')),
    )

    // Convert the set to an array of object complient with the standard select
    return [...dates].sort().map(date => ({
      _id: date,
      name: this.renderTimeSeparator(moment(date)),
    }))
  }

  removeEngagement = (_id) => {
    removeEngagement.call({ _id })
  }

  renderSwitcher() {
    return (
      <div id="engagements-view-switch" style={styles.switcher}>
        <FastIcon type="list" style={[styles.switchIcon, this.state.listView === VIEW.LIST && styles.switchSelected]} onClick={() => this.handleSwitch(VIEW.LIST)} />
        <FastIcon type="star-simple" style={[styles.switchIcon, this.state.listView === VIEW.STAR && styles.switchSelected]} onClick={() => this.handleSwitch(VIEW.STAR)} />
        <FastIcon type="cal" style={[styles.switchIcon, this.state.listView === VIEW.CALENDAR && styles.switchSelected]} onClick={() => this.handleSwitch(VIEW.CALENDAR)} />
      </div>
    )
  }


  renderTimeSeparator(parsedTime) {
    return parsedTime.calendar(null, {
      lastDay: '[Yesterday]',
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd DD/MM',
      sameElse: 'dddd DD/MM',
    })
  }

  renderCalendar() {
    return this.listEngagements(false).map(engagement => ({
      start: new Date(engagement.startTime),
      end: new Date(engagement.endTime),
      title: engagement.name,
    }))
  }

  renderList() {
    let date = 0
    const engagements = this.listEngagements()
    if (!engagements.length) return (<NoResult />)
    return engagements.map((engagement) => {
      let separator = null,
        sorter = null,
        spacing = null
      const parsedTime = moment(engagement.startTime)
      const compTime = parsedTime.format('YYDDDD')
      if (date === 0) {
        spacing = styles.separatorFirstline
        sorter = (<Sorter id="select-sorter" style={styles.separatorSorter} selected={this.state.selectedSort} options={this.optionsSorter} onChange={this.handleOnChangeSorter} />)
      }
      if (compTime > date && this.state.selectedSort === 'chronological') {
        separator = this.renderTimeSeparator(parsedTime)
        date = compTime
      }

      return (
        <div key={engagement._id}>
          {separator && <Item style={[styles.separator, spacing]}><div style={styles.separatorTitle}>{separator}</div>{sorter}</Item>}
          <EngagementsItem style={styles.item} deletable={!engagement.isPlaying()} deleteEngagement={this.removeEngagement} separator={separator} {...engagement} />
        </div>
      )
    })
  }

  renderStar() {
    const engagements = this.listStars()
    if (!engagements.length) return (<NoResult />)
    return engagements.map(engagement => (
      <div key={engagement._id}>
        <EngagementsItem style={styles.item} deletable={!engagement.isPlaying()} deleteEngagement={this.removeEngagement} {...engagement} />
      </div>
      ))
  }

  render() {
    return (
      <div style={styles.container}>
        <SndTopNav sndAction={this.renderSwitcher()}>
          <SndTopNavAction id="btn-new-engagement" href="/engagements/new" text="New Engagement" />
        </SndTopNav>
        <div style={styles.wrapper}>
          <LeftSidebar id="container-engagements-search-view">
            <Label>Filter</Label>
            <SearchInput id="form-search-keyword" placeholder="Title, keyword, tag" onChange={this.handleSearchFilter} />
            <Selector id="form-select-client" selected={this.state.clientFilter} data={this.listClients()} placeholder="Select client" onChange={this.handleClientFilter} />
            {this.state.listView && <Selector id="form-select-date" selected={this.state.dateFilter} onChange={this.handleDateFilter} data={this.listDates()} placeholder="Date" />}
          </LeftSidebar>
          {(this.state.listView === VIEW.LIST || this.state.listView === VIEW.STAR) &&
            <main style={styles.main}>
              {(this.state.selectedSort !== 'chronological') &&
              <div style={styles.topBar}>
                <div style={styles.topTitle}>
                  Engagements
                </div>
                <Sorter id="select-sorter" selected={this.state.selectedSort} options={this.optionsSorter} onChange={this.handleOnChangeSorter} />
              </div>
              }
              <div id="container-engagements-list-view">
                {this.state.listView === VIEW.LIST && this.renderList() || this.renderStar()}
              </div>
            </main>
          ||
            <main style={styles.main}>
              <Calendar id="container-engagements-calendar-view" events={this.renderCalendar()} />
            </main>
          }
        </div>
      </div>
    )
  }
}

const styles = {
  container: {
    height: 'calc(100% - 180px)',
  },
  wrapper: {
    display: 'flex',
    minHeight: '100%',
  },
  main: {
    flex: 1,
    width: '100%',
    padding: `0 ${cssVars.bodySpacing} ${cssVars.bodySpacing}`,
  },
  topBar: {
    display: 'flex',
    borderBottom: `1px solid ${cssVars.midGrey}`,
  },
  topTitle: {
    color: cssVars.brandColor,
    marginRight: 'auto',
    padding: '20px 0',
  },
  switchIcon: {
    width: '35px',
    height: '35px',
    padding: '7px',
  },
  switchSelected: {
    fill: cssVars.grey,
    background: cssVars.midGrey,
  },
  switcher: {
    display: 'flex',
    border: `1px solid ${cssVars.midGrey}`,
  },
  separator: {
    padding: '40px 0 30px',
    //color : cssVars.brandColor,
  },
  separatorFirstline: {
    padding: '29px 0 30px',
  },
  separatorTitle: {
    color: cssVars.brandColor,
    marginRight: 'auto',
  },
  separatorSorter: {
    padding: '15px 20px',
    marginBottom: '4px',
  },
}
