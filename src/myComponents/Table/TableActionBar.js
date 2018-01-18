import React, {PureComponent} from 'react';
import {Divider, Popconfirm} from 'antd';
import MoreBtn from '../Fx/MoreBtn';
import WrapComponent from '../Fx/WrapComponent';
import {IsArray} from '../../utils/rs/';

export default class extends React.Component {
  renderWrap(child, idx, divider) {
    return (
      <WrapComponent key={idx}>
        {child.pop ?
          <Popconfirm
            placement="left"
            title={'确定要删除吗，操作后将无法撤回。'}
            onConfirm={e => child.submit()}
            {...pop}
          >
            <a>{child.label}</a>
          </Popconfirm> : <a onClick={e => child.submit()}>{child.label}</a>
        }
        {divider ? <Divider type="vertical"/> : null}
      </WrapComponent>
    )
  }

  render() {
    const {action, more} = this.props;
    const length = action.length;
    return (
      <div>
        {action.map((child, idx) => {
          if (!child.hide) {
            if (length - 1 === idx) {
              if (more) {
                return this.renderWrap(child, idx, true);
              }
              return this.renderWrap(child, idx, false);
            }
            return this.renderWrap(child, idx, true);
          }
        })
        }
        {more ? <MoreBtn items={more}/> : null}
      </div>
    );
  }
}
