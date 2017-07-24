import { Meteor } from 'meteor/meteor'
import { chai } from 'meteor/practicalmeteor:chai'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import { MediaFiles } from './mediafiles'

//describe('MediaFiles', function(){
//  beforeEach(function(){
//    resetDatabase();
//  })
//  it('should be able to create a MediaFile record', function(){
//    console.log(MediaFiles.insert);
//    MediaFiles.insert({type:'image', name:'sample.png', size:'100', preview: 'blob:http://sample.com/sample.png', idFile: 'MYIDFILESAMPLETEST'});
//    chai.assert.equal(MediaFiles.find({}).count(),1)
//  })
//
//  it('should be able to find a MediaFile record by idFile', function(){
//    MediaFiles.insert({type:'image', name:'sample.png', size:'100', preview: 'blob:http://sample.com/sample.png', idFile: 'MYIDFILESAMPLETEST'});
//    chai.assert.equal(MediaFiles.find({idFile:'MYIDFILESAMPLETEST'}).count(),1)
//  })
//
//  it('should be able to find all MediaFiles records', function(){
//    MediaFiles.insert({type:'image', name:'sample1.png', size:'100', preview: 'blob:http://sample.com/sample1.png', idFile: 'MYIDFILESAMPLETEST1'})
//    MediaFiles.insert({type:'video', name:'sample2.png', size:'1000000', preview: 'blob:http://sample.com/sample2.png', idFile: 'MYIDFILESAMPLETEST2'})
//    MediaFiles.insert({type:'image', name:'sample3.png', size:'100', preview: 'blob:http://sample.com/sample3.png', idFile: 'MYIDFILESAMPLETEST3'})
//    chai.assert.equal(MediaFiles.find({}).count(),3)
//  })
//  it('should be able to delete a MediaFile record by idFile', function(){
//    MediaFiles.insert({type:'image', name:'sample.png', size:'100', preview: 'blob:http://sample.com/sample.png', idFile: 'MYIDFILESAMPLETEST'})
//    chai.assert.equal(MediaFiles.find({}).count(),1)
//    MediaFiles.remove({idFile:'MYIDFILESAMPLETEST'})
//    chai.assert.equal(MediaFiles.find({}).count(),0)
//  })
//})