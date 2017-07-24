import React from 'react';
import classnames from 'classnames'
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions'
import CircleButton from './CircleButton'


storiesOf('CircleButton', module)
    .add('Default', () => (
      <div>
          <CircleButton/>
      </div>
    ))
    .add('With children', () => (
      <div style={{display:'flex'}}>
          <CircleButton>1</CircleButton>
          <CircleButton>2</CircleButton>
          <CircleButton>30</CircleButton>
      </div>
    ))
    .add('With title', () => (
      <div style={{display:'flex'}}>
          <CircleButton title="5"/>
      </div>
    ))
    .add('With icon', () => (
      <div style={{display:'flex'}}>
          <CircleButton icon="video" size="30"/>
      </div>
    ))
    .add('With color', () => (
      <div style={{display:'flex'}}>
          <CircleButton title="5" color="#ff5600"/>
          <CircleButton icon="video" color="#ff5600"/>
      </div>
    ))

;
