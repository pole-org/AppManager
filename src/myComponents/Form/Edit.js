import React, {PureComponent} from 'react';
import {Form, Button,Popconfirm} from 'antd';

const FormItem = Form.Item;

@Form.create()
export default class extends React.Component {

  submit = () => {
    const {form, onSubmit} = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onSubmit(fieldsValue);
    });
  }

  resetForm = () => {
    const {form} = this.props;
    form.resetFields();
  }

  render() {
    const {form: {getFieldDecorator}, item, onSubmit, labelCol = 4, reset} = this.props;
    const formItemLayout = {
      labelCol: {span: labelCol},
      wrapperCol: {span: 24 - labelCol},
    };
    const buttonLayout = {
      wrapperCol: {span: 24 - labelCol, offset: labelCol},
    }
    return (
      <Form
        layout="horizontal"
      >
        {item.map(i => {
          return (
            <FormItem
              key={i.key}
              label={i.label}
              {...formItemLayout}
            >
              {getFieldDecorator(i.key, {
                  initialValue: i.value,
                  ...i.config,
                }
              )(i.render())}
            </FormItem>
          )
        })}
        {
          onSubmit ?
            <FormItem
              {...buttonLayout}
            >
              <Button type='primary' style={{marginRight:10}} onClick={e => this.submit()}>保存</Button>
              {reset ?
                <Popconfirm
                  placement="top"
                  title={'确定要重置吗，操作后将无法撤回。'}
                  onConfirm={e => this.resetForm()}>
                  <Button>重置</Button>
                </Popconfirm>
                 : null
              }
            </FormItem> : null
        }
      </Form>
    );
  }
}
