import React, {PureComponent} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import {Card, Button} from 'antd';

const ButtonGroup = Button.Group;

export default class extends PureComponent {
  renderExtra() {
    const {onBack, onReload} = this.props;
    return (
      <ButtonGroup>
        {onBack ? <Button
          ghost
          type='dashed'
          onClick={onBack}
          icon="rollback"
        >返回</Button> : null}
        {onReload ? <Button
          ghost
          type='dashed'
          onClick={onReload}
          icon="reload"
        >刷新</Button> : null}
      </ButtonGroup>
    )
  };

  render() {
    return (
      <Card
        className="fx-view-card"
        bordered={false}
        title={this.props.title}
        extra={this.renderExtra()}
      >{this.props.children}
      </Card>
    )
  }

}
