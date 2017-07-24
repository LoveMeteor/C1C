import React from 'react'
import { SimpleInput,Button } from '/imports/ui/components/FormElements'
import Radium from 'radium'

import { insertUser } from '/imports/api/users/methods.js';

import cssVars from '/imports/ui/cssVars'

@Radium
export default class SignupPage extends React.Component{

  constructor(props) {
    super(props)
    this.state = {
      errorMessage : '',
      registered: false
    }
  }

  // Handle when the user type enter in the login
  onKeyUp(event){
    if(event.type === "keyup" && event.key === "Enter" ) {
      this.submit()
    }
  }

  submit(){
    const email = this.refs.email.value,
      password = this.refs.password.value,
      passwordConfirm = this.refs.passwordConfirm.value,
      firstName = this.refs.firstName.value,
      lastName = this.refs.lastName.value,
      username = this.refs.username.value;

    if(email,username,password) {
      if(passwordConfirm == password) {
        const user = {username, firstName, lastName, password, email};

        insertUser.call(user, (error) => {
          if(error){
            this.setState({errorMessage: error.reason})
          }
          else {
            this.setState({registered: true})
          }
        })
      }
      else {
        this.setState({errorMessage:'Please confirm password again'})
      }
    }
    else {
      this.setState({errorMessage:'Please fill your account info'})
    }

  }

  render(){
    return (
    <div onKeyUp={(event) => {this.onKeyUp(event)}}>
      <div style={styles.h1}>Welcome to Telstra’s Customer Insight Centre,<br />sign up below to get started.</div>
      {
        this.state.registered ?
          <p style={styles.h1}>You have been registered successfully!</p> :
          <div ref="form" style={styles.form}>
            <SimpleInput ref='username' placeholder="Username" />
            <SimpleInput ref='firstName' placeholder="First Name" />
            <SimpleInput ref='lastName' placeholder="Last Name" />
            <SimpleInput ref='email' placeholder="Email" />
            <SimpleInput ref='password' password={true} placeholder="Password" />
            <SimpleInput ref='passwordConfirm' password={true} placeholder="Password Confirm" />
            <p style={styles.error}>{this.state.errorMessage}</p>
            <Button onClick={() => this.submit()} style={styles.button} kind="danger">Sign Up</Button>
            <p style={styles.signup}><a href='/login' style={styles.signupLink} >{'<  Back to Log in'}</a></p>
          </div>
      }
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
    cursor: 'pointer'
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