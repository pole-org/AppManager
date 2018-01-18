import React, {PureComponent} from 'react';
import {Table} from 'antd';

export default class extends PureComponent {

  render() {
    const {model,loading} = this.props;
    return (
      <div className="fx-table">
        <Table
          size="small"
          pagination={false}
          {...this.props}
        />
      </div>
    );
  }
}

