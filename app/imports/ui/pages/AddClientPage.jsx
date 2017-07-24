import React from 'react'
import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import KeyHandler, {KEYPRESS} from 'react-key-handler'

import SndTopNav from '/imports/ui/components/SndTopNav'
import CollapsableItem, { ReviewItem } from '/imports/ui/components/CollapsableItem'
import cssVars from '/imports/ui/cssVars'
import { Selector, SimpleInput , Button , InputInline } from '/imports/ui/components/FormElements'
import { FastIcon } from '/imports/ui/components/CustomSvg'
import FileUploader from '/imports/ui/components/FileUploader'

import { subsManager } from '../../startup/client/routes'

import { Industries } from '/imports/api/industry/industry'
import { Clients,ClientLogoFile } from '/imports/api/clients/clients'
import { insertClient , updateClient } from '/imports/api/clients/methods'

export default class AddClientPage extends TrackerReact(React.Component){
  constructor(){
    super()

    this.state = {
      subscription : {
        industries: subsManager.subscribe('industries'),
        logofiles: subsManager.subscribe('logofiles'),
      },
      client : {
        name : '',
        logoFileId: '',
        website: '',
        industryId: '',
        facebook: '',
        twitter: '',
        instagram: '',
      },
      panels : {
        'pos1' : {
          pick : ['name','industryId']
        },
        'pos2' : {
          pick : ['logoFileId']
        },
        'pos3' : {
          pick : ['facebook','twitter','instagram']
        },
        'pos4' : {
        }
      },
      currentPanel: 1
    }
  }

  componentWillMount(){
    // Edit playlist
    if(this.props.clientId){
      const clientId = this.props.clientId
      // Set the values to edit
      const client  = this.getClientById(clientId)
      this.state.client = client;
    }
  }

  getClientById(_id){
    return Clients.findOne(_id)
  }

  setClient(item,value){
    const client = this.state.client
    client[item] = value
    this.setState({client})
  }

  isValid(panelId){
    const panel = this.state.panels[`pos${panelId}`]
    const state = Object.assign({},this.state.client);
    const validityContext = Clients.schema.pick(panel.pick).newContext()
    const cleanedState = Clients.schema.pick(panel.pick).clean(state)
    let valid = validityContext.validate(cleanedState)

    if(panelId>1) for(let i=panelId-1; i>=1; i--) valid = valid && this.isValid(i)

    return valid
  }

  // active events
  handleName = (value) => {
    this.setClient('name',value)
  }

  handleIndustry = (value) => {
    this.setClient('industryId',value)
  }

  handleUpload = (mediaId) => {
    this.setClient('logoFileId',mediaId)
  }

  handleSocial = (value,type) => {
    this.setClient(type,value)
  }

  goToPanel(panelId){
      if(panelId == 1) {
          this.setState({currentPanel: 1})
      } else if(this.isValid(panelId-1)) {
          this.setState({currentPanel: panelId})
      }
  }

  onKeyHandle = (event) => {
      event.preventDefault()

      const {currentPanel} = this.state

      if(currentPanel < 4) {
          this.goToPanel(currentPanel + 1)
      } else if(this.isValid(3)) {
          this.createClient()
      }
  }

  listIndustries(){
    return Industries.find({}, {sort:{name:1}}).fetch();
  }

  getIndustryName(id){
    if(id && this.state.subscription.industries.ready()){
       return Industries.findOne({_id:id}).name
    }
    return ''
  }

  createClient(){
    const state = Object.assign({},this.state.client)
    if(this.props.clientId) {
      const {createdAt,...sanitizedState} = state
      updateClient.call(sanitizedState,(error) => {
        if(error){
          console.log(error);
        }
        else {
          FlowRouter.go("/client/");
        }
      })
    }
    else {

      insertClient.call({...state, cicId : Session.get('cic')},(error) => {
        if(error){
          console.log(error);
        }
        else {
          if(FlowRouter.getQueryParam('closeAfter')){
            window.close()
          }
          else {
            FlowRouter.go("/client/")
          }
        }
      })
    }
  }

  render(){

    const logo = this.state.client.logoFileId !== '' ? {backgroundImage: `url(/logos/${this.state.client.logoFileId})`} : {}
    const defaultLogo = this.state.client.logoFile ? this.state.client.logoFile() || null : null;
    const {currentPanel} = this.state

    return (
      <div style={styles.container}>
        <KeyHandler keyEventName={KEYPRESS} keyValue="Enter" onKeyHandle={this.onKeyHandle}/>
        <SndTopNav />
        <div style={styles.wrapper}>

          <CollapsableItem id="create-client-collapse-title" pos={1} title={'Name'} visible={currentPanel===1} onClick={() => {this.goToPanel(1)}} clickable={true}>
            <InputInline style={{width: '50%'}}>
              <SimpleInput placeholder="Client name" defaultValue={this.state.client.name} onChange={this.handleName} />
            </InputInline>
            <InputInline style={{width: '40%'}}>
              <Selector selected={this.state.client.industryId} className="selector-industry" data={this.listIndustries()} onChange={this.handleIndustry} placeholder="Select industry" />
              <Button className="btn-continue" disabled={!this.isValid(1)} onClick={() => {this.goToPanel(2)}} kind="danger">Continue</Button>
            </InputInline>
          </CollapsableItem>

          <CollapsableItem id="create-client-collapse-logo" pos={2} title={'Logo'} visible={currentPanel===2} onClick={() => {this.goToPanel(2)}} clickable={this.isValid(1)}>
            <div style={styles.centerBlock}>
              <FileUploader reupload fileCollection={ClientLogoFile} defaultValue={defaultLogo} onUploaded={(mediaId) => {this.handleUpload(mediaId)}} style={styles.uploader}><div style={styles.uploaderText}>Drag & drop<br />logo here,<br />or <span style={styles.uploaderLink}>Browse</span></div></FileUploader>
              <Button className="btn-continue" disabled={!this.isValid(2)} onClick={() => {this.goToPanel(3)}} kind="danger">Continue</Button>
            </div>
          </CollapsableItem>

          <CollapsableItem id="create-client-collapse-social" pos={3} title={'Connect Social'} visible={currentPanel===3} onClick={() => {this.goToPanel(3)}} clickable={this.isValid(2)}>
            {this.state.panels.pos3.pick.map((social,index) => (
                  <InputInline key={social+index}>
                    <FastIcon type={social} /><SimpleInput placeholder={`${social} link`} defaultValue={this.state.client[social]} onChange={(value) => {this.handleSocial(value,social)}} />
                  </InputInline>
              ))}
            <InputInline>
              <Button className="btn-continue" disabled={!this.isValid(3)} onClick={() => {this.goToPanel(4)}} kind="danger">Continue</Button>
            </InputInline>
          </CollapsableItem>

          <CollapsableItem id="create-client-collapse-review" pos={4} title={'Review'} visible={currentPanel===4} onClick={() => {this.goToPanel(4)}} clickable={this.isValid(3)}>
            <ReviewItem title={'Name'} onClick={() => {this.goToPanel(1)}}>
              <div>{this.state.client.name}</div>
              <div><i>{this.getIndustryName(this.state.client.industryId)}</i></div>
            </ReviewItem>
            <ReviewItem title={'Logo'} onClick={() => {this.goToPanel(2)}}>
              <div style={[styles.uploader,logo]} />
            </ReviewItem>
            {<ReviewItem title={'Connect Social'} onClick={() => {this.goToPanel(3)}}>
              {this.state.panels.pos3.pick.map((social,index) => this.state.client[social] != '' && (
                     <div style={styles.centerBlock} key={`review${social}${index}`}><FastIcon style={styles.icon} type={social} /><span>{this.state.client[social]}</span></div>
                ))}
            </ReviewItem>}
            <InputInline>
              <Button className="btn-save" disabled={!this.isValid(3)} onClick={() => {this.createClient()}} kind="danger">Save & Finish</Button>
            </InputInline>
          </CollapsableItem>

        </div>
      </div>
    )
  }
}

const styles = {
  container : {
    height: 'calc(100% - 181px)',
  },
  wrapper : {
    height: "100%"
  },
  centerBlock : {
    display:'flex',
    alignItems:'center',
    marginBottom: '10px'
  },
  uploader : {
    display:'flex',
    backgroundColor:'#FFF',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width:'130px',
    height:'130px',
    borderRadius: '65px',
    marginRight: '50px',
    overflow: 'hidden',
    padding: '20px',
    textAlign: 'center',
    alignItems:'center',
    color: cssVars.darkGrey,
    fontStyle: 'italic',
    cursor : 'pointer',
  },
  uploaderLink : {
    color: cssVars.brandColor,
    textDecoration : 'underline'
  },
  icon : {
    width : '30px',
    height : '30px',
    marginRight: '20px'
  }
}