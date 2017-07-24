import React from 'react';
import { storiesOf, action } from '@storybook/react';

import Selector1 from './Selector'
import {BsStyle, BsSize} from './Selector.style'

const data = [{
  _id: 'option1',
  name: 'option1',
}, {
  _id: 'option2',
  name: 'option2',
}, {
  _id: 'option3',
  name: 'option3',
}, {
  _id: 'option4',
  name: 'option4',
}, {
  _id: 'option5',
  name: 'option5',
}, {
  _id: 'option6',
  name: 'option6',
}]

const data2d = [{
  _id: 'category1',
  name: 'category1',
  children: [{
    _id: 'option1',
    name: 'option1',
  }, {
    _id: 'option2',
    name: 'option2',
  }, {
    _id: 'option3',
    name: 'option3',
  }],
}, {
  _id: 'category2',
  name: 'category2',
  children: [{
    _id: 'option4',
    name: 'option4',
  }, {
    _id: 'option5',
    name: 'option5',
  }],
}]
storiesOf('Selector', module)
    .add('Default', () => <Selector1 data={data} />)
    .add('With placeholder', () => <Selector1 data={data} placeholder="Select an option" />)
    .add('Selected', () => <Selector1 data={data} selected={data[2]._id} />)
    .add('Multiple selected', () => <Selector1 data={data} selected={[data[0]._id, data[2]._id, data[4]._id]} multiple />)
    .add('With category', () => <Selector1 data={data2d} />)
    .add('Selected with category', () => <Selector1 data={data2d} selected={data2d[0].children[1]._id} />)
    .add('Multiple selected with category', () => <Selector1 data={data2d} selected={[data2d[0].children[1]._id, data2d[1].children[1]._id]} multiple />)
    .add('Orange style', () => <Selector1 data={data} selected={data[1]._id} bsStyle={BsStyle.ORANGE}/>)
    .add('Orange style with category', () => <Selector1 data={data2d} selected={[data2d[0].children[1]._id, data2d[1].children[0]._id]} bsStyle={BsStyle.ORANGE}/>)
    .add('With large height wrapper', () => <Selector1 data={data2d} selected={[data2d[0].children[1]._id, data2d[1].children[0]._id]} bsStyle={BsStyle.ORANGE} bsSize={BsSize.LARGE} style={{height:46}}/>)
;
