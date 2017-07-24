import React from 'react';
import { storiesOf, action } from '@storybook/react';

import BoolButton from './BoolButton.jsx'

storiesOf('BoolButton', module)
  .add('On', () => (
    <BoolButton onClick={() => { action('click') }} active icon="star" />
  ))
  .add('Off', () => (
    <BoolButton onClick={() => { action('click') }} active={false} icon="star" />
  ))
;
