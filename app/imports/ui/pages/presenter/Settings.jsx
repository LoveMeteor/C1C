import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

import { subsManager } from '../../../startup/client/routes'

import { ListView } from '/imports/ui/partials/Presenter/ContainerView'
import { SimpleInput,Button,Label,ErrorLine } from '/imports/ui/components/FormElements'

export default class Search extends React.Component{

  constructor(){
    super()
    this.state = {
      updated : false,
      oldPass : '',
      newPass : '',
      confirmPass : '',
      isValid : false,
      errorMessage : '',
      subscription : {
        user : subsManager.subscribe('users')
      }
    }
  }

  handleOldPass = (oldPass) => {
    this.state.oldPass = oldPass
    this.validate()
  }

  handleNewPass = (newPass) => {
    this.state.newPass = newPass
    this.validate()
  }

  handleConfirmPass = (confirmPass) => {
    this.state.confirmPass = confirmPass
    this.validate()
  }

  validate(){
    const {oldPass,newPass,confirmPass} = this.state
    if(oldPass !== '' && newPass !== '' && confirmPass !== ''){
      if(newPass === confirmPass){
        this.setState({isValid:true,errorMessage:''})
      }
      else{
        this.setState({isValid:false,errorMessage:'Password and Confirmation are not equal'})
      }
    }
    else {
      this.setState({isValid:false,errorMessage:''})
    }
  }

  changePassword =() => {
    const {oldPass,newPass} = this.state
    Accounts.changePassword(oldPass, newPass,(error) => {
      if(error){
        this.setState({isValid:false,errorMessage:error.reason})
      }
      else{
        this.setState({updated:true})
      }
    })
  }

  getUser(){
    return Meteor.user()
  }

  render(){
    const user = this.getUser()
    console.log(user.username)
    return  (
      <ListView title="Settings">
        <Label>Your details</Label>
        <SimpleInput defaultValue={user.username} disabled={true} placeholder="Your username" />
        {this.state.updated &&
          <div>Password updated !</div>
          ||
          <div>
            <Label>Change password</Label>
            <SimpleInput onChange={this.handleOldPass} password={true} placeholder="Old password" />
            <SimpleInput onChange={this.handleNewPass} password={true} placeholder="New password" />
            <SimpleInput onChange={this.handleConfirmPass} password={true} placeholder="Confirm new password" />
            <ErrorLine>{this.state.errorMessage}</ErrorLine>
            <Button onClick={this.changePassword} disabled={!this.state.isValid} kind="danger">Update Password</Button>
          </div>
        }
      </ListView>)
  }
}