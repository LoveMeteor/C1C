import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import SndTopNav, { SndTopNavAction } from '/imports/ui/components/SndTopNav'
import cssVars from '/imports/ui/cssVars'
import LeftSidebar from '/imports/ui/components/LeftSidebar'
import Sorter from '/imports/ui/components/Sorter'
import ItemPlaylist from '/imports/ui/partials/Playlist/ItemPlaylist'

import { getTagsFromString } from '/imports/ui/helpers'
import NoResult from '/imports/ui/components/NoResult'

import { subsManager } from '../../startup/client/routes'


import TagContainer, { ITEM_TYPES } from '/imports/ui/components/TagContainer'
import { SearchInput, Selector, Label, Radio } from '/imports/ui/components/FormElements'
import { CanoncialPlaylists } from '/imports/api/canoncialplaylist/canoncialplaylists'
import { Industries } from '/imports/api/industry/industry'
import { Themes } from '/imports/api/themes/themes'
import { PresentationMachines } from '/imports/api/presentationmachines/presentationmachines'

export default class PlaylistPage extends TrackerReact(React.Component) {
  constructor() {
    super();


    this.state = {
      inputFilter: '',
      mediaFilter: 'all',
      pmFilter: 'all',
      industryFilter: [],
      themeFilter: '',
      selectedSort: 'newest',
      subscription: {
        playlist: subsManager.subscribe('canoncialPlaylists'),
        items: subsManager.subscribe('playlistitems'),
        industries: subsManager.subscribe('industries'),
        themes: subsManager.subscribe('themes'),
        media: subsManager.subscribe('medias'),
        tag: subsManager.subscribe('tags'),
        presentationmachines: subsManager.subscribe('presentationmachines'),
        mediafiles: subsManager.subscribe('mediafiles'),
      },
    }
  }

  handleOnChangeSorter = (code) => {
    this.setState({ selectedSort: code })
  }

  handleSearchFilter = (value) => {
    this.setState({ inputFilter: value });
  }

  handleIndustryFilter = (value) => {
    this.setState({ industryFilter: value });
  }

  handleThemeFilter = (value) => {
    this.setState({ themeFilter: value });
  }

  handlePMFilter = (value) => {
    this.setState({ pmFilter: value });
  }


  removeElement = (value, type) => {
    if (type === ITEM_TYPES.THEME) {
      this.setState({ themeFilter: '' })
    }
    if (type === ITEM_TYPES.INDUSTRY) {
      const industryIds = new Set(this.state.industryFilter)
      industryIds.delete(value)
      this.setState({ industryFilter: [...industryIds] })
    }
  }


  optionsSorter = [
		{ code: 'asc', text: 'Title (A–Z)', sorter: { name: 1 } },
    { code: 'desc', text: 'Title (Z-A)', sorter: { name: -1 } },
		{ code: 'newest', text: 'Newest', sorter: { createdAt: -1 } },
		{ code: 'oldest', text: 'Oldest', sorter: { createdAt: 1 } },
  ]

  listPlaylists() {
    const filter = {}

    // Filter industry
    if (this.state.industryFilter.length) {
      filter.industryIds = { $in: this.state.industryFilter }
    }
    // Filter theme
    if (this.state.themeFilter != '') {
      filter.themeId = this.state.themeFilter
    }
    // Filter PM
    if (this.state.pmFilter != 'all') {
      filter.presentationMachineId = this.state.pmFilter
    }
		// Title, tags , need some more complex filtering
    if (this.state.inputFilter != '') {
      const tags = getTagsFromString(this.state.inputFilter)
      filter.$or = []
      filter.$or.push({ name: { $regex: this.state.inputFilter, $options: 'i' } })
      filter.$or.push({ tagIds: { $in: tags } })
    }
    // Sorter
    const sorter = this.optionsSorter.find(option => option.code === this.state.selectedSort).sorter

    return CanoncialPlaylists.find(filter, { sort: sorter }).fetch();
  }

  listPresentationMachines() {
    return PresentationMachines.find({}).fetch();
  }

  listIndustries() {
    return Industries.find({}).fetch();
  }

  listThemes() {
    return Themes.find({}).fetch()
  }

  deletePlaylist(id) {
    Meteor.call('canoncialplaylists.remove', { _id: id }, () => {
      console.log(arguments);
    })
  }

  renderPlaylistItems() {
    const playlists = this.listPlaylists()
    if (!playlists.length) return (<NoResult />)
    return playlists.map(playlist => <ItemPlaylist className="playlist-item-container" {...playlist} items={playlist.items()} deletePlaylist={this.deletePlaylist} typeMedia="playlist" key={playlist._id} />);
  }

  render() {
    return (
      <div style={styles.container}>
        <SndTopNav id="ButtonSearch">
          <SndTopNavAction href="/Playlists/createPlaylist" id="btn-new-playlist" text="New Playlist" />
        </SndTopNav>
        <div style={styles.wrapper}>
          <LeftSidebar>
            <Label>Search by</Label>
            <SearchInput id="form-search-keyword" onChange={this.handleSearchFilter} placeholder="Title, keyword, tag" />
            <Selector selected={this.state.industryFilter} id="form-select-industry" placeholder="Select industry" multiple onChange={this.handleIndustryFilter} data={this.listIndustries()} />
            <Selector selected={this.state.themeFilter} id="form-select-theme" placeholder="Select theme" onChange={this.handleThemeFilter} data={this.listThemes()} />
            <TagContainer industries={this.state.industryFilter} themes={this.state.themeFilter} onClick={this.removeElement} />
            <Label>Filter results</Label>
            <Radio id="SelectAllAreas" current={this.state.pmFilter} value="all" onClick={this.handlePMFilter}>All areas</Radio>
            {this.listPresentationMachines().map(pm => <Radio dataId={pm._id} className="DivPresentationMachines" key={pm._id} current={this.state.pmFilter} value={pm._id} onClick={this.handlePMFilter}>{pm.name}</Radio>)}
          </LeftSidebar>
          <main style={styles.main}>
            <div style={styles.topBar}>
              <div style={styles.topTitle}>
                Playlist
              </div>
              <Sorter id="SelectSorting" selected={this.state.selectedSort} onChange={this.handleOnChangeSorter} options={this.optionsSorter} />
            </div>
            <div id="container-playlists">
              {this.renderPlaylistItems()}
            </div>
          </main>
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
    overflow: 'hidden',
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
}
