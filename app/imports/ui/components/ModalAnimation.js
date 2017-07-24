import React from 'react'
import { FastIcon }from '/imports/ui/components/CustomSvg'
import Boron from 'boron-scroll/FadeModal';
import ButtonSvg from '/imports/ui/components/ButtonSvg'
import { Modal } from 'react-bootstrap'
import Radium , { Style } from 'radium'
import cssVars from '/imports/ui/cssVars'

@Radium
export default class ModalAnimation extends React.Component{

  constructor(){
    super()

    this.closeModal = this.closeModal.bind(this)
    this.showModal = this.showModal.bind(this)
    this.state = {
      open : false
    }
  }

  static defaultProps = {
    onPressEnter:() => {}
  }

  // Handle when the user type enter in the login
  onKeyDown = (event) => {
    if( event.key === "Enter" ) {
      console.log(event)
      this.props.onPressEnter()
    }
  }

  closeModal(){
    this.refs.modal.hide();
  }
  showModal(){
    this.setState({open:true})
  }
  onShowModal(){
    this.setState({open:true})
  }
  onHideModal(){
    this.setState({open:false})
  }
  componentDidUpdate(prevProps, prevState){
    if(this.state.open && prevState.open !== this.state.open){
      this.refs.modal.show();
    }
  }
  renderFooter(){
    if(typeof this.props.modalFooter === 'function'){
      return this.props.modalFooter()
    }
    return this.props.modalFooter
  }

  render(){
    let modal = null
    if(this.state.open){
      modal = (
        <div onKeyDown={this.onKeyDown}>
          <Boron closeOnClick={false} className="modal-boron" ref="modal"  onHide={() => {this.onHideModal()}} onShow={() => {this.onShowModal()}} backdropStyle={styles.backdrop} modalStyle={styles.modal}>
            <div style={styles.modalTop} className="modal-top">
                <FastIcon style={styles.modalTop.icon} type={this.props.modalTitleIcon}/>
                <div style={styles.modalTop.title}>{this.props.modalTitle}</div>
                <ButtonSvg style={styles.modalTop.close} onClick={this.closeModal} icon="/images/icons/icon_close.svg" />
            </div>
            <Modal.Body style={styles.modalBody}>
              {this.props.modalBody}
            </Modal.Body>
            <Modal.Footer style={styles.modalFooter}>
              {this.renderFooter()}
            </Modal.Footer>
          </Boron>
          <Style rules={{
            body: {
              overflow : 'hidden'
            }
          }} />
        </div>
      )
    }
    return(
      <div className={this.props.className} style={this.props.style}>
        <span style={styles.link} onClick={this.showModal}>
          {this.props.children}
        </span>
        {modal}
      </div>


    )
  }
}

const styles = {
  modal: {
    width: '675px',
    color: '#606060',
  },
  backdrop : {
    backgroundColor: cssVars.overlay
  },
  modalTop: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft : '20px',
    background : cssVars.brandColor,
    title: {
      marginLeft : '10px',
      marginRight : 'auto',
      color: '#FFFFFF',
    },
    icon : {
      width: '20px',
      fill : '#FFF'
    },
    close : {
      width: "50px",
      display: "inline-block",
      padding: "10px 12px 10px 12px",
      cursor : 'pointer',
      svg : {
        fill : '#FFF'
      }
    }
  },
  modalBody : {
    padding: '0'
  },
  modalFooter: {
    margin: '0 20px',
    textAlign: 'left',
    padding: '20px 0'
  },
  link: {
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    ':hover' : {
      textDecoration : 'none'
    }
  }
}