import React, {PureComponent} from 'react';
import {Button, Form} from 'antd';
import classNames from 'classnames';
import styles from './ToolBar.less';

const FormItem = Form.Item;
const ButtonGroup = Button.Group;

@Form.create()
export default class extends PureComponent {
  render() {
    const {tools} = this.props;
    const {tools: {layout = 'left', render,}} = this.props;
    return (
      <div className={styles.titleBar}>
        {tools ?
          <div className={layout === 'left' ? styles.toolLeft : styles.toolRight}>
            <Form layout="inline">
              {render().map((tool, idx) => {
                return (
                  <FormItem key={idx}>
                    {tool}
                  </FormItem>
                )
              })}
            </Form>
          </div> : null}
      </div>
    )
  }
}


