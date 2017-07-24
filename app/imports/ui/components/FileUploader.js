import React from 'react';
import { Meteor } from 'meteor/meteor'
import { moment } from 'meteor/momentjs:moment'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import Radium from 'radium'
import DropzoneComponent from 'react-dropzone'

@Radium
export default class FileUploader extends TrackerReact(DropzoneComponent){

  constructor(props){
    super(props)

    this.state = {
      ...this.state,
      uploading: [],
      progress: 0,
      timeLeft:0,
      inProgress: false,
      success: !!props.defaultValue,
      hover: false,
      fileBrowser: false,
      width:0,
      height:0,
      length:0,
      file: props.defaultValue || {
        _downloadRoute : '',
        _id : ''
      },
    }
    this.upload = this.upload.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
  }


  static defaultPropTypes = {
    ...DropzoneComponent.propTypes,
    onUploaded : () => {},
    reupload : false,
  }

  // Will be used if we support mediafile update
  // componentWillMount(){
  //   if(this.props.defaultValue){
  //     this.props.onUploaded(this.props.defaultValue._id,this.props.defaultValue.type);
  //   }
  // }

  componentWillReceiveProps(nextProps){
    if(nextProps.defaultValue && nextProps.defaultValue != this.props.defaultValue){
      this.setState({'success':1,'file':nextProps.defaultValue})
    }
  }

  onDrop(e) {
    e.preventDefault();

    // Reset the counter along with the drag on a drop.
    this.enterCounter = 0;

    this.setState({
      isDragActive: false,
      isDragReject: false
    });

    const droppedFiles = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    const max = this.props.multiple ? droppedFiles.length : Math.min(droppedFiles.length, 1);
    const acceptedFiles = [];
    const rejectedFiles = [];

    for (let i = 0; i < max; i++) {
      const file = droppedFiles[i];
      // We might want to disable the preview creation to support big files
      if (!this.props.disablePreview) {
        file.preview = window.URL.createObjectURL(file);
      }

      if (this.fileAccepted(file) && this.fileMatchSize(file)) {
        acceptedFiles.push(file);
      } else {
        rejectedFiles.push(file);
      }
    }

    if (this.props.onDrop) {
      this.props.onDrop.call(this, acceptedFiles, rejectedFiles, e);
    }

    if (rejectedFiles.length > 0) {
      if (this.props.onDropRejected) {
        this.props.onDropRejected.call(this, rejectedFiles, e);
      }
    } else if (acceptedFiles.length > 0) {
      this.upload(acceptedFiles)
      if (this.props.onDropAccepted) {
        this.props.onDropAccepted.call(this, acceptedFiles, e);
      }
    }
    this.isFileDialogActive = false;
  }

  getFile(){
    return this.props.fileCollection.findOne({_id : this.state.file._id})
  }


  upload(files){
    const file = files[0];
    if (file) {
      if(file.type.split('/')[0] === "image") {
        const image = new Image();
        image.onload = (e) => {
          this.state.height = e.path[0].height
          this.state.width = e.path[0].width
        };
        image.src = window.URL.createObjectURL(file);
      }

      const uploadInstance = this.props.fileCollection.insert({
        file,
        meta: {
          locator: this.props.fileLocator,
          userId: Meteor.userId() // Optional, used to check on server for file tampering
        },
        streams: 'dynamic',
        chunkSize: 'dynamic',
        allowWebWorkers: true // If you see issues with uploads, change this to false
      }, false);

      this.setState({
        uploading: uploadInstance, // Keep track of this instance to use below
        inProgress: true, // Show the progress bar now
        success: false,
      });

      uploadInstance.on('end',(error, fileObj) => {
        // Reset our state for the next file
        this.setState({
          uploading: [],
          progress: 0,
          hover:false,
          fileBrowser:false,
          inProgress: false,
          success: true,
          file: fileObj
        });
        if(fileObj.isImage){
          this.props.onUploaded(fileObj._id,'image',this.state.width,this.state.height,null,fileObj.name);
        }

      });

      uploadInstance.on('error', (error, fileObj) => {
        console.log(`Error during upload: ${  error}`);
      });

      uploadInstance.on('progress',(progress, fileObj) => {
        this.setState({
          progress,
          timeLeft: moment.duration(uploadInstance.estimateTime.curValue).humanize(true)
        })
      });
      uploadInstance.start(); // Must manually start the upload
    }
  }

  // We need to wait for the video be loaded in the preview to get all the metadata info.
  onUploadedVideo = (e) => {
    const ref = e.target
    const duration = Math.round(ref.duration);
    this.props.onUploaded(this.state.file._id,'video',ref.videoWidth,ref.videoHeight,duration,this.state.file.name);
  }

  togglePlay(e){
    this.refs.video.paused ? this.refs.video.play() : this.refs.video.pause()
  }

  handleMouseEnter = () => {
    if(this.props.reupload){
      this.setState({hover:true})
    }
  }

  handleMouseLeave = () => {
    if(this.props.reupload){
      this.setState({hover:false})
    }
  }

  onClick(e) {
    this.setState({fileBrowser:true})
    super.onClick(e)
  }

  render() {

    const styles = {
      loader : {
        textAlign: 'center'
      },
      imageWrapper : {
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      },
      video : {
        width: '100%',
        height: '100%'
      }
    }

    // When upload is in progress
    if(this.state.inProgress) {
      return (
        <div style={this.props.style}>
          <div style={styles.loader}>
            <div>Uploading {this.state.progress}%</div>
            <div>Ready {this.state.timeLeft}</div>
          </div>
        </div>)
    }



    // When the file is uploaded
    if(this.state.success && !this.state.hover && !this.state.fileBrowser && this.getFile()) {

      const downloadUrl = this.getFile().link()
      // if this is a image we render the inage
      if(this.getFile().isImage) {
        return (
          <div className="container-media-preview" onMouseEnter={this.handleMouseEnter} onDragEnter={this.handleMouseEnter} style={[this.props.style,styles.imageWrapper,{backgroundImage:`url(${downloadUrl})`}]}>
          </div>
        )
      }
      // if it's a video , we try to render as a html video'
      if(this.getFile().isVideo) {
        return (
          <div className="container-media-preview" style={this.props.style}  onDrop={this.onDrop}>
            <video ref="video" style={styles.video} src={downloadUrl} onLoadedMetadata={this.onUploadedVideo} onClick={this.togglePlay}></video>
          </div>
        )
      }
    }
    // Default view , inherit from react-dropzone
    return <div onMouseLeave={this.handleMouseLeave}>{super.render()}</div>
  }

};


