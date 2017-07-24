import React from 'react'
import Dropzone from 'react-dropzone'
import { Meteor } from 'meteor/meteor';
import { MediaFiles } from '../../api/mediafiles/mediafiles'
import { Bert } from 'meteor/themeteorchef:bert'
import { Random } from 'meteor/random'
import { DropdownButton, MenuItem } from 'react-bootstrap'

export default class MyDropzone extends React.Component{
  constructor(){
    super()
    Meteor.subscribe('mediafiles')
    this.handleUpload = this.handleUpload.bind(this)
    this.showUploads = this.showUploads.bind(this)
    this.state = {
      uploading: [],
      progress: 0,
      inProgress: false
    }
  }

  handleUpload(files){
    let self = this;
    console.log(files)
    files.map((file) =>{
      var validType= null;
      var uploadInstance= null;

      var settings = {
        file: file,
        meta : {
          machine: 'MACHINE1'
        },
        transport: 'http',
        streams: 'dynamic',
        chunkSize: 'dynamic',
        allowWebWorkers: true // If you see issues with uploads, change this to false
      }
      if(file.type.includes('image') || file.type.includes('video')){
        validType= true;
        uploadInstance = MediaFiles.insert(settings, false);
      }
      else{
        validType = false;
      }

      if(validType){
        self.setState({
          uploading: uploadInstance,
          inProgress: true
        })

        // These are the event functions, don't need most of them, it shows where we are in the process
        uploadInstance.on('start', function () {
          console.log('Starting');
        });

        uploadInstance.on('end', function (error, fileObj) {
          console.log('On end File Object: ', fileObj);
        });

        uploadInstance.on('uploaded', function (error, fileObj) {
          console.log('uploaded: ', fileObj);
          // Reset our state for the next file
          self.setState({
            uploading: [],
            progress: 0,
            inProgress: false
          });
        })

        uploadInstance.on('error', function (error, fileObj) {
          console.log('Error during upload: ' + error);
        });

        uploadInstance.on('progress', function (progress, fileObj) {
          console.log('Upload Percentage: ' + progress);
          // Update our progress bar
          self.setState({
            progress: progress
          })
        });

        uploadInstance.start();

      }else{
        console.log('Not Valid Type - Not inserted')
        Bert.alert( 'This type of file is not supported, Please upload only image or video files', 'danger', 'fixed-top', 'fa-frown-o' );
      }
    })
  }

  // This is our progress bar, bootstrap styled
  // Remove this function if not needed
  showUploads() {
    //console.log('**********************************', this.state.uploading);

    if (!_.isEmpty(this.state.uploading)) {
      return <div>
        {this.state.uploading.file.name}

        <div className="progress progress-bar-default">
          <div style={{width: this.state.progress + '%'}} aria-valuemax="100"
             aria-valuemin="0"
             aria-valuenow={this.state.progress || 0} role="progressbar"
             className="progress-bar">
            <span className="sr-only">{this.state.progress}% Complete (success)</span>
            <span>{this.state.progress}%</span>
          </div>
        </div>
      </div>
    }
  }

  render(){
    var dropzoneContent= <div><img src="images/icons/media-upload.png" width="100" height="100" />
                              <h4> Upload Media </h4>
                              <div className="desc"> Select Files to Upload or drag and drop video files </div>
                         </div>
    return(
      <div className="media-upload-box">
           <Dropzone id="dropzone" className="dropzone"
            onDrop={this.handleUpload}>
            {this.showUploads()}
            {
              dropzoneContent
            }
            <DropdownButton title="Select Area">
              <MenuItem eventKey="1"> AREA 1</MenuItem>
              <MenuItem eventKey="2"> AREA 2</MenuItem>
            </DropdownButton>
          </Dropzone>
      </div>
    )
  }
}
