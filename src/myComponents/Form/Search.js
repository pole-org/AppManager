import React, {PureComponent} from 'react';
import lodash from 'lodash';
import {connect} from 'dva';
import {Form, Row, Button, Col} from 'antd';

const FormItem = Form.Item;

@Form.create()
export default class extends PureComponent {

  search = () => {
    const {form, onSearch} = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onSearch(fieldsValue);
    });
  }

  reload = () => {
    const {form, onSearch} = this.props;
    form.resetFields();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onSearch(fieldsValue);
    });
  }

  getRow(row, idx) {
    const {item, onSearch, reload} = this.props;
    const {form: {getFieldDecorator}} = this.props;
    return (
      <Row key={idx}>
        {row.map((i) => {
          return (
            <FormItem key={i.key} label={i.label}>
              {getFieldDecorator(i.key, {...(i.config) || {}})(i.render())}
            </FormItem>
          );
        })}
        {idx === item.length - 1 && onSearch ?
          <FormItem key={idx + 1}>
            <Button type="primary" onClick={e => this.search()} icon="search">查询</Button>
          </FormItem> : null
        }
        {idx === item.length - 1 && onSearch ?
          <FormItem key={idx + 2}>
            <Button onClick={e => this.reload()} icon="reload">重置</Button>
          </FormItem> : null
        }
      </Row>
    );
  }

  render() {
    const {item} = this.props;
    return (
      <Form layout="inline">
        {item.map((row, idx) => {
          return this.getRow(row, idx);
        })}
      </Form>
    );
  }
}

