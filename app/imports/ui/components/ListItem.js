import React from 'react'
import { Col, Row } from 'react-bootstrap'
import MenuItem from '/imports/ui/components/MenuItem'
import CustomModal from '/imports/ui/components/CustomModal'

export default class ListItem extends React.Component{

    constructor(){
      super()
      this.openModal = this.openModal.bind(this);
      this.checkListFile = this.checkListFile.bind(this)
      this.state = {
        checked : false,
        showModal: false,
        checkedList : !!Session.get('checkedlist') ?
                             Session.get('checkedlist') : []
      }

    }

    openModal(event){
      event.preventDefault()
      this.setState({showModal: true})
    }

    changeSelection(event) {
      this.setState({checked: !this.state.checked})
    }

    removeValueList (key, value){
       data = Session.get('checkedlist')
       let array = $.map(data, function(v,i){
          return v[key] == value ? null : v;
       });
       console.log('Array Length:'+array.length)
       Session.set('checkedlist',array)
    }

    getObjectByKey(key, value, data){
      var i, len = data.length;
      for (i = 0; i < len; i++) {
          if (data[i] && data[i].hasOwnProperty(key)) {
              if(data[i][key] == value){
                return data[i];
              }
          }
      }
      return -1;
    }

    checkListFile(event,id){
      var checkedList =  !Session.get('checkedlist') ? [] :
                           Session.get('checkedlist')

      console.log('checked:'+event.target.checked)
      if(!event.target.checked){
        this.removeValueList('id', this.props.file._id)
      }else{
        var obj = this.getObjectByKey('id',this.props.file._id,checkedList)
        if(obj.id===this.props.file._id){
          console.log('Obj exists')
          this.removeValueList('id', this.props.file._id)
          checkedList = Session.get('checkedlist')
          checkedList.push(
              {
                id: this.props.file._id,
                state: event.target.checked
              }
          )
        }else{
          checkedList.push(
              {
                id: this.props.file._id,
                state: event.target.checked
              }
          )
        }
      }

      console.log('checked:'+ checkedList)
      Session.set('checkedlist' , checkedList)
    }

    render(){
      //var find = '\"';
      //var re = new RegExp(find, 'g');

      urlPreview = this.props.file.link()
      videoPreview = <div className="embed-responsive embed-responsive-4by3">
                       <div className="embed-responsive-item">
                         <iframe width="480" height="320"
                           src={urlPreview} frameBorder="0"
                           allowFullScreen></iframe>
                       </div>
                     </div>
      previewContent = this.props.file.type.includes('image') ? <img className="img-responsive" src={urlPreview}/> : videoPreview

      modalFooter = <div> </div>
      modalHeader = <div className="text-orange"> Preview {this.props.file.name} </div>
      modalBody   = <div>
                      <Row>
                        <Col sm={3} className="list-item-detail">
                          <Row>
                            Name: {this.props.file.name}
                          </Row>
                          <Row>
                            Type: {this.props.file.type}
                          </Row>
                          <Row>
                            Link:{this.props.file.link()}
                          </Row>
                          <Row>
                            Id File:
                          </Row>
                          <Row>
                            Size: {this.props.file.size}
                          </Row>
                        </Col>
                        <Col sm={9}>
                          {previewContent}
                        </Col>
                      </Row>
                    </div>
      icon = ''
      if(this.props.file.type.includes('image')){
        icon = 'images/icons/image.png'
      }else if(this.props.file.type.includes('video')){
        icon = 'images/icons/video.png'
      }
      return(
        <li>
          <CustomModal showModal={this.state.showModal} modalFooter={modalFooter} modalHeader={modalHeader} modalBody={modalBody}/>
          <Row className="show-grid">
            <Col sm={8}>
              <input type="checkbox" onChange={this.checkListFile} />
              <img src={icon} width="25" height="25"/>
              <a href="" className="text-orange" onClick={this.openModal}>{this.props.file.name}</a>
            </Col>
            <Col sm={4}>
              <span className="text-time"></span>
            </Col>
          </Row>
        </li>
      )
    }
}
