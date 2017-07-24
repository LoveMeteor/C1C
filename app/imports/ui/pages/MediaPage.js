import React from 'react'
import { Meteor } from 'meteor/meteor'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import KeyHandler, { KEYPRESS } from 'react-key-handler'

import SndTopNav, { SndTopNavAction } from '/imports/ui/components/SndTopNav'
import cssVars from '/imports/ui/cssVars'
import { getTagsFromString } from '/imports/ui/helpers'

import LeftSidebar from '/imports/ui/components/LeftSidebar'
import Sorter from '/imports/ui/components/Sorter'
import ItemMediaFile from '/imports/ui/partials/Media/ItemMediaFile'
import { Button, SearchInput, Selector, Label, Radio } from '/imports/ui/components/FormElements'
import UploadMediaModal from '/imports/ui/partials/Modals/UploadMediaModal'
import ModalAnimation from '/imports/ui/components/ModalAnimation'
import TagContainer, { ITEM_TYPES } from '/imports/ui/components/TagContainer'

import { subsManager } from '../../startup/client/routes'

import NoResult from '/imports/ui/components/NoResult'
import { insertMultipleTags } from '/imports/api/tags/methods';

import { Industries, Themes, PresentationMachines, Medias, Cics  } from '../../api/models'

export default class MediaPage extends TrackerReact(React.Component) {
  constructor() {
    super();
    this.state = {
      subscription: {
        themes: subsManager.subscribe('themes'),
        medias: subsManager.subscribe('medias'),
        industries: subsManager.subscribe('industries'),
        tags: subsManager.subscribe('tags'),
        presentationmachines: subsManager.subscribe('presentationmachines'),
        mediafiles: subsManager.subscribe('mediafiles'),
        canoncialPlaylists: subsManager.subscribe('canoncialPlaylists'),
        playlists: subsManager.subscribe('playlists'),
        playlistitems: subsManager.subscribe('playlistitems'),

      },
      selectedSort: 'newest',
      inputFilter: '',
      mediaFilter: 'all',
      pmFilter: 'all',
      industryFilter: [],
      themeFilter: '',
      formValid: false,
      media: [],
      createMedia: false,
      tags: new Map(),
    }
    this.handleOnChangeSorter = this.handleOnChangeSorter.bind(this)
    this.handleMediaFilter = this.handleMediaFilter.bind(this)
    this.handlePMFilter = this.handlePMFilter.bind(this)
    this.handleThemeFilter = this.handleThemeFilter.bind(this)
    this.handleIndustryFilter = this.handleIndustryFilter.bind(this)
    this.handleSearchFilter = this.handleSearchFilter.bind(this)
    this.isValid = this.isValid.bind(this)
    this.addMedia = this.addMedia.bind(this)
  }

  handleOnChangeSorter(code) {
    this.setState({ selectedSort: code })
  }

  handleSearchFilter(value) {
    this.setState({ inputFilter: value });
  }

  handleMediaFilter(value) {
    this.setState({ mediaFilter: value });
  }

  handleIndustryFilter(value) {
    this.setState({ industryFilter: value });
  }

  handleThemeFilter(value) {
    this.setState({ themeFilter: value });
  }

  handlePMFilter(value) {
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
      { code: 'desc', text: 'Title (Z–A)', sorter: { name: -1 } },
      { code: 'newest', text: 'Newest', sorter: { createdAt: -1 } },
      { code: 'oldest', text: 'Oldest', sorter: { createdAt: 1 } },
  ]

  listIndustries() {
    return Industries.find({}).fetch();
  }

  listThemes() {
    return Themes.find({}).fetch();
  }

  listMedias() {
    const filter = {}
		// Title, tags , need some more complex filtering
    if (this.state.inputFilter != '') {
      const tags = getTagsFromString(this.state.inputFilter)
      filter.$or = []
      filter.$or.push({ name: { $regex: this.state.inputFilter, $options: 'i' } })
      filter.$or.push({ tagIds: { $in: tags } })
    }
    // Filter industry
    if (this.state.industryFilter.length) {
      filter.industryIds = { $in: this.state.industryFilter }
    }
    // Filter theme
    if (this.state.themeFilter != '') {
      filter.themeId = this.state.themeFilter
    }
    // Filter media
    if (this.state.mediaFilter != 'all') {
      filter.type = this.state.mediaFilter
    }
    // Filter PM
    if (this.state.pmFilter != 'all') {
      filter.presentationMachineIds = this.state.pmFilter
    }
    // Sorter
    const sorter = this.optionsSorter.find(option => option.code === this.state.selectedSort).sorter

    return Medias.find(filter, { sort: sorter }).fetch();
  }

  listPresentationMachines() {
      return PresentationMachines.find().fetch()
  }

  listPresentationMachinesForSelect() {
      return Cics.find().fetch().map((cic) => ({
          _id: cic._id,
          name: cic.name,
          children: PresentationMachines.find({cicId:cic._id}).map((pm)=>({_id:pm._id,name:pm.name}))
      }))
  }

  deleteMedia(mediaId) {
    Meteor.call('medias.remove', { _id: mediaId }, () => {
      console.log(arguments);
    })
  }

  // Used to activate the button in modals
  isValid(valid, media, tags) {
    this.state = { ...this.state, media, tags }
    if (valid !== this.state.formValid) {
      this.setState({ formValid: valid, tags })
    }
  }

  createTags(tags = this.state.tags) {
    const tagsItem = [...tags.values()].map(tag => tag.name)
    return insertMultipleTags.call({ names: tagsItem })
  }

  updateMedia = (media, closeModal, tags) => {
    // TODO get a way to clean the data by using the clean schema function
    const tagIds = this.createTags(tags)
    const { type, mediaFileId, ...cleanedMedia } = media // eslint-disable-line no-unused-vars
    Meteor.call('medias.update', { ...cleanedMedia, tagIds }, (error) => {
      if (error) {
        console.log(error);
      } else {
        closeModal()
      }
    })
  }

  addMedia() {
    if (!this.state.createMedia && this.state.formValid) {
      this.state.formValid = false;
      this.setState({ createMedia: true })
      const tagIds = this.createTags()
      Meteor.call('medias.insert', { ...this.state.media, tagIds }, (error) => {
        this.setState({ createMedia: false })
        if (error) {
          console.log(error);
        } else {
          this.refs.addMediaModal.closeModal()
        }
      })
    }
  }
  renderMediasItems() {
    const medias = this.listMedias()
    if (!medias.length) return (<NoResult />)
    return medias.map(media => <ItemMediaFile className="media-item-container" deleteMedia={this.deleteMedia} updateMedia={this.updateMedia} key={media._id} media={media} PM={this.listPresentationMachinesForSelect} themes={this.listThemes} industries={this.listIndustries} />)
  }

  render() {
    return (
      <div style={styles.container}>
        <SndTopNav>
          <ModalAnimation
            ref="addMediaModal"
            style={styles}
            typeModal="FadeModal"
            onPressEnter={() => { this.addMedia() }}
            modalTitleIcon="upload"
            modalTitle="Upload Media"
            modalBody={<UploadMediaModal ref="uploadModal" PM={this.listPresentationMachinesForSelect} themes={this.listThemes} tags={this.listTags} industries={this.listIndustries} isValid={this.isValid} />}
            modalFooter={
              <Button className="btn-submit" onClick={() => this.addMedia()} disabled={!this.state.formValid} kind="danger">
                <KeyHandler keyEventName={KEYPRESS} keyValue="Enter" onKeyHandle={() => this.addMedia()} />Submit Media
                  </Button>
                }
          >
            <SndTopNavAction id="btn-upload-media" text="Upload Media" />
          </ModalAnimation>
        </SndTopNav>
        <div style={styles.wrapper}>
          <LeftSidebar id="search-media-sidebar">
            <Label>Search by</Label>
            <SearchInput id="search-title" onChange={this.handleSearchFilter} placeholder="Title, keyword, tag" />
            <Selector selected={this.state.industryFilter} id="search-industry" placeholder="Select industry" multiple onChange={this.handleIndustryFilter} data={this.listIndustries()} />
            <Selector selected={this.state.themeFilter} id="search-theme" placeholder="Select theme" onChange={this.handleThemeFilter} data={this.listThemes()} />
            <TagContainer industries={this.state.industryFilter} themes={this.state.themeFilter} onClick={this.removeElement} />
            <Label>Filter results</Label>
            <Radio id="filter-all-media" current={this.state.mediaFilter} value="all" onClick={this.handleMediaFilter}>All media</Radio>
            <Radio id="filter-video" current={this.state.mediaFilter} value="video" onClick={this.handleMediaFilter}>Videos</Radio>
            <Radio id="filter-image" current={this.state.mediaFilter} value="image" onClick={this.handleMediaFilter}>Images</Radio>
            <hr style={styles.separator} />
            <Radio id="filter-all-area" current={this.state.pmFilter} value="all" onClick={this.handlePMFilter}>All areas</Radio>
            {this.listPresentationMachines().map(pm => <Radio dataId={pm._id} className="filter-machine" key={pm._id} current={this.state.pmFilter} value={pm._id} onClick={this.handlePMFilter}>{pm.name}</Radio>)}
          </LeftSidebar>
          <main style={styles.main}>
            <div style={styles.topBar}>
              <div style={styles.topTitle}>
                All Media
              </div>
              <Sorter id="select-sorter" options={this.optionsSorter} selected={this.state.selectedSort} onChange={this.handleOnChangeSorter} />
            </div>
            <div id="container-medias">
              {this.renderMediasItems()}
            </div>
          </main>
        </div>
      </div>
    )
  }
}

const styles = {
  container: {
    height: 'calc(100% - 181px)',
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
  separator: {
    borderColor: '#FFF',
  },
}
