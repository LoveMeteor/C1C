import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import DatePicker from './DatePicker.jsx'

storiesOf('DatePicker', module)
  .add('Open', () => (
    <DatePicker onChange={ action('onChange') } active icon="calendar" />
  ))

;
