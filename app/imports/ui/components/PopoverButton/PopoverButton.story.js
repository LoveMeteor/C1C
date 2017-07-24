import React from 'react';
import classnames from 'classnames'
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import PopoverButton from './PopoverButton'

const items = [{
  name: 'Reception wall',
}, {
  name: 'Insight Ring',
}, {
  name: 'Partnership Hub',
}, {
  name: 'Expo 1 Centre',
}, {
  name: 'All Screens',
  reverse: true,
}]

const trigger = <button>Click me</button>
storiesOf('PopoverButton', module)
    .add('Default', () => (
      <div style={{ position: 'absolute' }}>
        <PopoverButton trigger={trigger} popoverStyle={{ width: 150 }}>
          {
                    items.map((item) => {
                      const itemCls = classnames({
                        item: true,
                        reverse: item.reverse,
                      })
                      return <div key={item.name} className={itemCls}>{item.name}</div>
                    })
                }
        </PopoverButton>
      </div>
    ))
    .add('Pull Right', () => (
      <div style={{ position: 'absolute', marginLeft: 100 }}>
        <PopoverButton pullRight trigger={trigger} popoverStyle={{ width: 150 }}>
          {
                    items.map((item) => {
                      const itemCls = classnames({
                        item: true,
                        reverse: item.reverse,
                      })
                      return <div key={item.name} className={itemCls}>{item.name}</div>
                    })
                }
        </PopoverButton>
      </div>
    ))

;
