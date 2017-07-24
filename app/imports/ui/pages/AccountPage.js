import React from 'react'
import { Meteor } from 'meteor/meteor'
import TrackerReact from 'meteor/ultimatejs:tracker-react'

import SndTopNav from '/imports/ui/components/SndTopNav'
import cssVars from '/imports/ui/cssVars'


import ItemUser from '/imports/ui/partials/Account/ItemUser'
import Sorter from '/imports/ui/components/Sorter'
import { PASSWORD_REGEX } from '/imports/api/users/users';
import { SimpleInput,Label, Button , InputInline} from '/imports/ui/components/FormElements'

export default class AccountPage extends TrackerReact(React.Component){
	constructor(){
    super();
    this.state = {
      subscription: {
        users : Meteor.subscribe('users'),
      },
      selectedSort: 'asc',
      oldPassword : '',
      newPassword : '',
      confirmPassword : ''
    }

    this.handleOnChangeSorter = this.handleOnChangeSorter.bind(this)
  }

  logoutHandler(){
    Meteor.logout()
  }

	handleOnChangeSorter(code){
		this.setState({selectedSort: code})
	}

  optionsSorter = [
      {code : 'asc', text: 'Title (A–Z)', sorter: {username: 1}},
      {code : 'desc', text: 'Title (Z–A)', sorter:{username: -1}},
      {code : 'newest', text: 'Newest', sorter: {createdAt: -1}},
      {code : 'oldest', text: 'Oldest', sorter: {createdAt: 1}}
	]

  listUsers(){
    const sorter = this.optionsSorter.find(option => option.code === this.state.selectedSort).sorter
    return Meteor.users.find({}, {sort: sorter}).fetch()
  }

  getUser() {
    return Meteor.user()
  }

  deleteUser(usersId){
    Meteor.call('users.remove',{_id : usersId},(error) => {
      console.log(error);
    })
  }

  handleInput = (el,value) => {
    this.setState({[el]:value,isValid:true})
  }

  componentWillUnmount() {
    this.state.subscription.users.stop();
  }

  isPasswordValid = () => {
    if(this.state.newPassword === '') return true
    return this.state.newPassword.match(PASSWORD_REGEX)
  }

  isPasswordEqual = () => {
    return this.state.confirmPassword === '' || this.state.newPassword === this.state.confirmPassword
  }

  changePassword = () => {
    const {oldPassword,newPassword} = this.state
    Accounts.changePassword(oldPassword, newPassword,(error) => {
      if(error){
        this.setState({isValid:false,errorMessage:error.reason})
      }
      else{
        this.setState({updated:true})
      }
    })
  }

  onKeyDown = (evt) => {
    if(evt.keyCode === 13) {
      if(evt.target === this.oldPasswordInput){
        this.newPasswordInput.focus()
      } else if(evt.target === this.newPasswordInput) {
        this.confirmPasswordInput.focus()
      } else if(evt.target === this.confirmPasswordInput) {
        if(this.state.oldPassword === '' || this.state.newPassword === '' || this.state.confirmPassword === '' ||  !this.isPasswordValid() && !this.isPasswordEqual()) return
          this.changePassword()
      }
    }
  }
  render(){

    const usersItems = this.listUsers().map((users) => <ItemUser deleteUser={this.deleteUser} className="item-user" key={users._id} {...users} />);
    const username = this.getUser() ? this.getUser().username : '';


    return (
      <div style={styles.container}>
        <SndTopNav>
          <Button onClick={this.logoutHandler}>Sign out</Button>
        </SndTopNav>
        <div style={styles.wrapper}>
          <div style={styles.details}>
            <Label>Your details</Label>
            <InputInline style={styles.changeEmail}>
              <SimpleInput defaultValue={username} disabled={true} />
            </InputInline>
            <InputInline style={styles.changePwd}>
              <SimpleInput password={true} onChange={(value) => this.handleInput('oldPassword',value)} placeholder="Old password" style={styles.changePwdInput} inputRef={el => this.oldPasswordInput = el} onKeyDown={this.onKeyDown} />
              <SimpleInput password={true} error={!this.isPasswordValid()} onChange={(value) => this.handleInput('newPassword',value)} placeholder="New password" style={styles.changePwdInput} inputRef={el => this.newPasswordInput = el} onKeyDown={this.onKeyDown}  />
              <SimpleInput password={true} error={!this.isPasswordEqual()}  onChange={(value) => this.handleInput('confirmPassword',value)} placeholder="Confirm new password" style={styles.changePwdInput} inputRef={el => this.confirmPasswordInput = el} onKeyDown={this.onKeyDown}  />
              <Button disabled={this.state.oldPassword === '' || this.state.newPassword === '' || this.state.confirmPassword === '' ||  !this.isPasswordValid() && !this.isPasswordEqual()} kind="danger" onClick={this.changePassword}>Update</Button>

            </InputInline>
              {!this.isPasswordValid() && <div style={styles.errorText}>Password need to be 12 characters long and contain at least 1 uppercase letter, 1 lowercase letter , 1 number and 1 special character</div>}
              {!this.isPasswordEqual() && <div style={styles.errorText}>Password and Confirmation are not equal</div>}
              {!this.state.isValid && <div style={styles.errorText}>{this.state.errorMessage}</div>}
              {this.state.updated && <div>Password Updated !</div>}
          </div>
          <div style={styles.userList}>
            <div style={styles.topBar}>
              <div style={styles.topTitle}>
                Users
              </div>
              <Sorter options={this.optionsSorter} selected={this.state.selectedSort} onChange={this.handleOnChangeSorter}  />
            </div>
            <div className="list-users">
              {usersItems}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const styles = {
  container : {
    //height: '100%',
  },
  details : {
    background: cssVars.bgGrey,
    padding : `10px ${ cssVars.bodySpacing}`
  },
  changeEmail : {
    width : '50%',
  },
  changePwdInput : {
    width : 'calc( 25% - 20px )',
    marginRight : "20px"
  },
  wrapper : {
    minHeight: "calc(100% - 180px)"
  },
  userList : {
    padding : `10px ${ cssVars.bodySpacing} ${ cssVars.bodySpacing}`
  },
  topBar: {
    display: 'flex',
    borderBottom: `1px solid ${  cssVars.midGrey}`
  },
  topTitle: {
    color: cssVars.brandColor,
    marginRight : 'auto',
    padding: '20px 0',
    fontSize: '32px'
  },
  errorText : {
    color : cssVars.brandColor,
    marginBottom : '30px'
  }
}