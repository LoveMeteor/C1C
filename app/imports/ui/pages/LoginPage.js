import React from 'react'
import { Meteor } from 'meteor/meteor';
import { SimpleInput,Button } from '/imports/ui/components/FormElements'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'
import { Session } from 'meteor/session'
import Radium from 'radium'

import { Roles } from 'meteor/alanning:roles';
import { ROLES } from '/imports/api/users/users.js';

import cssVars from '/imports/ui/cssVars'

@Radium
export default class LoginPage extends React.Component{

  constructor(props) {
    super(props)
    this.state = {
      errorMessage : '',
    }
  }

  // Handle when the user type enter in the login
  onKeyUp(event){
    if(event.type === "keyup" && event.key === "Enter" ) {
      this.submit()
    }
  }

  submit(){
    const email = this.refs.login.value,
        password = this.refs.password.value

    if(email,password) {
      Meteor.loginWithPassword(email,password,(error) => {
        if(error){
          this.setState({errorMessage:error.reason})
        }
        else {
          // Redirect the user to the good url
          const redirectionUrl = Session.get('redirectAfterLogin')
          if(Roles.userIsInRole( Meteor.userId(), [ ROLES.ADMIN ], Roles.GLOBAL_GROUP )){
            //console.log('admin');
            if(redirectionUrl){
             FlowRouter.redirect(redirectionUrl);
             Session.set('redirectAfterLogin',null)
            }
            else{
              FlowRouter.redirect('/engagements/');
            }


          }
          else if(Roles.userIsInRole( Meteor.userId(), [ ROLES.PRESENTER ], Roles.GLOBAL_GROUP )){
              FlowRouter.go('/presenter/')

          }
          else {
            this.setState({errorMessage: "You don't have any roles."});
          }
        }
      })
    }
    else {
      this.setState({errorMessage:'Please fill your login and password'})
    }

  }

  render(){
    return (
    <div onKeyUp={(event) => {this.onKeyUp(event)}}>
      <div style={styles.h1}>Welcome to Telstra’s Customer Insight Centre,<br />sign in below to get started.</div>
      <form ref="form" style={styles.form}>
        <SimpleInput ref='login' name="login" id="login" placeholder="Email or Username" onChange={this.handleLogin} />
        <SimpleInput ref='password' name="password" id="password" password={true} placeholder="Password" onChange={this.handlePassword} />
        <p style={styles.error}>{this.state.errorMessage}</p>
        <Button className="submit-login" onClick={() => this.submit()} style={styles.button} kind="danger">Sign In</Button>
        <p style={styles.signup}>Not registered?
          <a href='/signup' style={styles.signupLink} >Sign up now  ></a>
        </p>
      </form>
    </div>)
  }
}

const styles = {
  error : {
    color : cssVars.brandColor
  },
  signup : {
    textAlign: 'left',
    marginTop: '20px',
    color : '#FFF'
  },
  signupLink : {
    color : '#FFF',
    cursor: 'pointer',
    paddingLeft: '10px',
  },
  h1 : {
    fontSize : '32px',
    color: '#FFF',
    marginBottom: '30px'
  },
  form :{
    margin: '0 auto',
    width: '310px'
  },
  button : {
    width : '100%'
  }
}