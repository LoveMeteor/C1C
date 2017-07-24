import React from 'react'
import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import KeyHandler, {KEYPRESS} from 'react-key-handler'

import { Roles } from 'meteor/alanning:roles';
import { UserSchema,ROLES,PASSWORD_REGEX } from '/imports/api/users/users';
import { Cics } from '/imports/api/cics/cics';
import { updateUser , updateUserRole , updatePresentationMachinePassword} from '/imports/api/users/methods'
import SndTopNav from '/imports/ui/components/SndTopNav'
import cssVars from '/imports/ui/cssVars'
import { Selector, SimpleInput , Button , InputInline } from '/imports/ui/components/FormElements'

export default class EditUser extends TrackerReact(React.Component){
  constructor(){
    super()

    this.state = {
      username : '',
      firstName : '',
      lastName: '',
      role : '',
      isValid : true,
      cicId : null,
      password : '',
      subscription: {
        users : Meteor.subscribe('users'),
      },
    }
  }

  componentWillMount(){
    if(this.props.userId){
      this.loadToState()
    }
  }

  componentWillUpdate(nextProps, nextState){
    const {firstName,lastName} = nextState
    const validityContext = new SimpleSchema({
          firstName: UserSchema.schema('firstName'),
          lastName: UserSchema.schema('lastName')
      }).newContext()
    this.state.isValid = validityContext.validate({firstName,lastName})
  }

  loadToState(){
    console.log(this.getUser())
    if(this.getUser()){
      const {username = '',firstName,lastName,cicId} = this.getUser()
      const [role = ''] = Roles.getRolesForUser(this.props.userId)

      this.setState({username,firstName,lastName,cicId,role : role.toUpperCase()})
    }

  }

  getUser(){
    return Meteor.users.findOne(this.props.userId)
  }

  getRoles(){
    return Object.entries(ROLES).map(([key,value]) => ({_id : key,name:value}))
  }

  getCics(){
    return Cics.find({}).fetch()
  }

  handleRole = (role) => {
    this.setState({role})
  }

  handleCic = (cicId) => {
    this.setState({cicId})
  }

  handleInput = (el,value) => {
    this.setState({[el]:value})
  }

  updateUser = () => {
    const {role,firstName,lastName,cicId} = this.state;
    const _id = this.props.userId
    updateUser.call({_id,firstName,lastName,cicId},() => {
      updateUserRole.call({_id,role : role.toLowerCase()},() => {
        FlowRouter.go("/account")
      })
    })
  }

  isPasswordValid = () => {
    if(this.state.password === '') return true
    return this.state.password.match(PASSWORD_REGEX)
  }

  updatePassword = () => {

    const { password } = this.state;
    const { userId }  = this.props

    if(this.isPasswordValid() && password !== "") {
      updatePresentationMachinePassword.call({userId,password},(err) => {
        FlowRouter.go("/account")
      })
    }
  }

  isValid() {
      const {role,firstName,lastName,cicId} = this.state

      return role!=='' && firstName!=='' && lastName!==''
  }

  onKeyHandle = (event) => {
      event.preventDefault()
      if(this.isValid())
        this.updateUser()
  }

  onKeyDown = (evt) => {
      if(evt.keyCode === 13) {
          if(evt.target === this.firstNameInput){
              this.lastNameInput.focus()
          } else if(evt.target === this.lastNameInput) {
              this.lastNameInput.blur()
          }
      }
  }

  render(){
    const {role,firstName,lastName,cicId} = this.state
    return (
      <div id="edit-user-container" style={styles.container}>
        <KeyHandler keyEventName={KEYPRESS} keyValue="Enter" onKeyHandle={this.onKeyHandle}/>
        <SndTopNav />
        <div style={styles.wrapper}>
          <div style={styles.main}>
            <InputInline style={{width: '50%'}}>
              {/*<SimpleInput defaultValue={username} onChange={(value)=>this.handleInput('username',value)} placeholder="Username"/>*/}
              <SimpleInput defaultValue={firstName} onChange={(value) => this.handleInput('firstName',value)} placeholder="First Name" inputRef={el => this.firstNameInput = el} onKeyDown={this.onKeyDown} />
              <SimpleInput defaultValue={lastName} onChange={(value) => this.handleInput('lastName',value)} placeholder="Last Name" inputRef={el => this.lastNameInput = el} onKeyDown={this.onKeyDown}/>
            </InputInline>
            <InputInline style={{width: '50%'}}>
              <Selector className="selector-role" selected={role} placeholder="Select User Role" onChange={this.handleRole} data={this.getRoles()} />
            </InputInline>
            {role === ROLES.PRESENTER.toUpperCase() &&
              <InputInline style={{width: '50%'}}>
                <Selector className="selector-cic" selected={cicId} placeholder="Select CIC" onChange={this.handleCic} data={this.getCics()} />
              </InputInline>
            }
            <Button className="btn-continue" disabled={!this.isValid()} onClick={this.updateUser} kind="danger">Save</Button>
            {role === ROLES.MACHINE.toUpperCase() &&
              <div style={styles.passwordBlock}>
                <InputInline style={{width: '50%'}}>
                  <SimpleInput error={!this.isPasswordValid()} defaultValue={''} onChange={(value) => this.handleInput('password',value)} placeholder="New Password"/>
                </InputInline>
                {!this.isPasswordValid() && <div style={styles.errorText}>Password need to be 12 characters long and contain at least 1 uppercase letter, 1 lowercase letter , 1 number and 1 special character</div>}
                <Button className="btn-continue" disabled={!this.isPasswordValid() || this.state.password === ""} onClick={this.updatePassword} kind="danger">Change Password</Button>
              </div>
            }

          </div>
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
  main : {
    flex:1,
    width: '100%',
    padding:`30px ${cssVars.bodySpacing}`,
  },
  icon : {
    width : '30px',
    height : '30px',
    marginRight: '20px'
  },
  passwordBlock : {
    paddingTop : '60px'
  },
  errorText : {
    color : cssVars.brandColor,
    marginBottom : '30px'
  }
}