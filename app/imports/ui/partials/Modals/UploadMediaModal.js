import React from 'react'
import { SimpleInput, TagInput, Radio } from '/imports/ui/components/FormElements'
import { Selector } from '../../components'
import cssVars from '/imports/ui/cssVars'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import DropzoneComponent from 'react-dropzone'
import FileUploader from '/imports/ui/components/FileUploader'
import TagContainer, { ITEM_TYPES } from '/imports/ui/components/TagContainer'

import { Medias } from '/imports/api/medias/medias';
import { Tags } from '/imports/api/tags/tags'
import { MediaFiles } from '/imports/api/mediafiles/mediafiles'


export default class UploadMediaModal extends TrackerReact(DropzoneComponent) {

  constructor() {
    super();
    this.state = {
      name: '',
      type: '',
      mediaFileId: '',
      width: '',
      height: '',
      videoDuration: '',
      themeId: '',
      industryIds: [],
      tagIds: [],
      presentationMachineIds: [],
      tags: new Map(),
    }
    this.onUploaded = this.onUploaded.bind(this)
    this.onTitleChange = this.onTitleChange.bind(this)
    this.setTheme = this.setTheme.bind(this)
    this.setIndustries = this.setIndustries.bind(this)
    this.handlePMSelect = this.handlePMSelect.bind(this)
  }

  componentWillMount() {
    if (this.props.media._id) {
      this.setState({ ...this.props.media })
    }
    if (this.props.media && this.props.media.presentationMachineIds) {
      this.setState({ presentationMachineIds: this.props.media.presentationMachineIds })
    }
    if (this.props.media && this.props.media.tagIds) {
      const tags = Tags.find({ _id: { $in: this.props.media.tagIds } }).map(tag => [tag.name, tag]);
      this.setState({ tags: new Map(tags) })
    }
  }

  static defaultProps = {
    isValid: () => {},
    media: [],
  }

  onUploaded(_id, type, width, height, duration, name) {
    const state = {
      mediaFileId: _id,
      type,
      width,
      height,
    }
    if (this.state.name === '') {
      state.name = name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
    }
    if (duration) {
      state.videoDuration = duration
    }
    this.setState(state)
  }
  onTitleChange(value) {
    this.setState({ name: value })
  }
  setIndustries(value) {
    this.setState({ industryIds: value })
  }
  setTheme(value) {
    this.setState({ themeId: value })
  }
  setPresentationMachines = (value) => {
    this.setState({ presentationMachineIds: value })
  }
  handlePMSelect(PMId) {
    const lastSelectState = new Set(this.state.presentationMachineIds)
    if (lastSelectState.has(PMId)) {
      lastSelectState.delete(PMId);
    } else {
      lastSelectState.add(PMId);
    }
    // Concat do a deep copy of the object for triggering rerend
    this.setState({ presentationMachineIds: [...lastSelectState] })
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state !== nextState) {
      this.isValid(nextState)
    }
  }


  // Custom validation
  isValid(state) {
    let pick
    // TODO this data need to be given by the model
    if (this.state._id) {
      pick = ['_id', 'name', 'themeId', 'industryIds', 'industryIds.$', 'tagIds', 'tagIds.$', 'presentationMachineIds', 'presentationMachineIds.$']
    } else {
      pick = ['name', 'type', 'mediaFileId', 'width', 'height', 'videoDuration', 'themeId', 'industryIds', 'industryIds.$', 'tagIds', 'tagIds.$', 'presentationMachineIds', 'presentationMachineIds.$']
    }

    const { tags, ...tempState } = state
    const validityContext = Medias.schema.pick(pick).newContext();

    const cleanedState = Medias.schema.pick(pick).clean(tempState)
    const valid = validityContext.validate(cleanedState)
    this.props.isValid(valid, tempState, tags)
    // Can be used to show errors
    // console.log(validityContext.invalidKeys())
  }

  listTags(text) {
    return Tags.find({ name: { $regex: text, $options: 'ig' } }).fetch()
  }

  handleTags = (value) => {
    this.state.tags.set(value.name, value)
    this.forceUpdate()
  }

  removeElement = (value, type) => {
    if (type === ITEM_TYPES.TAG) {
      this.state.tags.delete(value)
      this.forceUpdate()
    }
    if (type === ITEM_TYPES.THEME) {
      this.setState({ themeId: '' })
    }
    if (type === ITEM_TYPES.INDUSTRY) {
      const industryIds = new Set(this.state.industryIds)
      industryIds.delete(value)
      this.setState({ industryIds: [...industryIds] })
    }
  }

  renderRadio(pm, machinesUsedMedia) {
    const disabled = machinesUsedMedia.find(pmId => pm._id === pmId)
    return <Radio className="container-presentation-machine-item" dataId={pm._id} size="xl" key={pm._id} disabled={disabled} current={this.state.presentationMachineIds} value={pm._id} icon={pm.logo} onClick={this.handlePMSelect}>{pm.name}</Radio>
  }

  render() {
    let machinesUsedMedia = []
    if (this.props.media._id) {
      machinesUsedMedia = this.props.media.machinesUsedMedia().map(({ _id }) => _id)
    }
    const mediaFile = this.props.media.mediaFile ? this.props.media.mediaFile() : undefined;
    return (

      <div id="container-upload-media-modal-body">
        <FileUploader defaultValue={mediaFile} multiple={false} style={styles.dropzone} fileCollection={MediaFiles} onUploaded={this.onUploaded} accept="image/jpg,image/jpeg,image/gif,image/png,video/mp4,video/webm,video/mov">
          <div>Drag and drop file here or <span style={styles.dropzone.a}>browse</span></div>
        </FileUploader>
        <div style={styles.form}>
          <SimpleInput name="name" defaultValue={this.state.name} placeholder="Title" onChange={this.onTitleChange} />
          <div style={styles.categoryAndTags}>
            <div style={styles.category}>
              <div style={styles.label}>Category</div>
              <div style={styles.category.categorySelectors}>
                <Selector selected={this.state.industryIds} id="selector-upload-media-industry" name="industries" style={styles.category.industry} data={this.props.industries()} onChange={this.setIndustries} multiple placeholder="Select industry" />
                <Selector selected={this.state.themeId} id="selector-upload-media-theme" name="themes" data={this.props.themes()} onChange={this.setTheme} placeholder="Select theme" />
              </div>
            </div>
            <div style={styles.tags}>
              <div style={styles.label}>Tags <span style={styles.label.context}>(required)</span></div>
              <TagInput id="selector-upload-media-tag" ref="formTags" tags={this.listTags} placeholder="Select Tags" onChange={this.handleTags} />
            </div>
          </div>
          <TagContainer id="container-upload-media-tag" tags={this.state.tags} industries={this.state.industryIds} themes={this.state.themeId} onClick={this.removeElement} />
          <div style={styles.label}>
            Available area/s <span style={styles.label.context}>(see specifications for media sizes)</span>
          </div>
          <div id="container-upload-media-presentation-machines" style={styles.PMWrapper}>
            <Selector selected={this.state.presentationMachineIds} id="selector-upload-media-area" name="areas" data={this.props.PM()} onChange={this.setPresentationMachines} multiple placeholder="Select area/s" />
          </div>
        </div>
      </div>
    )
  }
}

const styles = {
  dropzone: {
    backgroundColor: cssVars.lightGrey,
    minHeight: '300px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    cursor: 'pointer',
    a: {
      color: cssVars.brandColor,
      textDecoration: 'underline',
    },
  },
  titleInput: {
    backgroundColor: '#E9E9E9',
    borderColor: 'transparent',
    paddingLeft: '10px',
    height: '40px',
    width: '100%',
  },
  form: {
    margin: '20px',
  },
  categoryAndTags: {
    display: 'flex',
  },
  category: {
    width: '60%',
    paddingRight: '10px',
    categorySelectors: {
      display: 'flex',
    },
    industry: {
      width: '100%',
      marginRight: '5px',
    },
    theme: {
      width: '100%',
      marginLeft: '5px',
    },
  },
  tags: {
    width: '40%',
  },
  label: {
    fontSize: '16px',
    marginBottom: '10px',
    context: {
      fontSize: '14px',
    },
  },
  PMWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}
