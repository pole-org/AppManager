import React, {PureComponent} from 'react';
import {
  Select,
} from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import {Http, Convert, Ant, Config} from '../../utils/rs/';
import {createNav} from '../../utils/utils';

const Option = Select.Option;

@Ant.CreateSelect()
export default class extends React.Component {
  state = {
    options: [],
    key: 'itemCode',
    label: 'itemName',
  }

  componentDidMount() {
    const {typeCode, data} = this.props;
    if (typeCode) {
      this.getRemoteData(typeCode);
    }
    if (data) {
      this.setState({
        ...data,
      });
    }
  }

  componentWillUnmount() {
    this.setState({
      options: [],
    });
  }

  getRemoteData = (typeCode) => {
    Http.Base.Get(Config.GetConfig('fxApi') + '/dict/item/get', {
      typeCode,
    }).then(res => {
      if (res.data) {
        const data = res.data.model.isEmpty() ? [] : res.data.model.toObject();
        this.setState({
          options: createNav(data, 'parentID', 'itemID'),
        });
      }
    });
  }

  searchValues = (input, option) => {
    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  render() {
    const {options, key, label} = this.state;
    const {createAntSelect} = this.props;
    const props = cloneDeep(this.props);
    delete props.typeCode;
    delete props.data;
    delete props.createAntSelect;
    return (
      <Select
        allowClear
        showSearch
        {...props}
        optionFilterProp="children"
        filterOption={(input, option) => this.searchValues(input, option)}
      >
        {options.map(x => {
          return createAntSelect(x, key, label)
        })}
      </Select>
    )
  }

}
