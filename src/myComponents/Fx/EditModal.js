import React, {PureComponent} from 'react';
import {Modal} from 'antd';
import EditForm from '../Form/Edit';

export default class extends React.Component {

  render() {
    const {visible, title, onSubmit, item, onCancel, width = 500,labelCol=4,reset} = this.props;
    return (
      <div>
        {visible ?
          <Modal
            destroyOnClose
            width={width}
            className="ant-modal-compact"
            visible={visible}
            title={title}
            onCancel={onCancel}
            footer={null}
          >
            <EditForm onSubmit={onSubmit} onCancel={onCancel} item={item} labelCol={labelCol} reset={reset}/>
          </Modal>
          : null}
      </div>
    )
  }
}
