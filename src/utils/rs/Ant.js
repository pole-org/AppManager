import React, {PureComponent} from 'react';
import cloneDeep from 'lodash/cloneDeep'
import {Tree, Select} from 'antd';

const TreeNode = Tree.TreeNode;
const {Option, OptGroup} = Select;

const Ant = {};

Ant.CreateTree = () => {
  return (WrappedComponent) => {
    return class extends PureComponent {
      render() {
        const createAntTree = (dataObj, key, title) => {
          const data = cloneDeep(dataObj);
          if (data.children) {
            return (
              <TreeNode key={data[key]} title={data[title]}>
                {data.children.map(child => {
                  return createAntTree(child, key, title);
                })}
              </TreeNode>
            );
          }
          return (<TreeNode key={data[key]} title={data[title]} isleaf={true}/>);
        }
        return <WrappedComponent createAntTree={createAntTree} {...this.props}/>;
      }
    };
  };
}

Ant.CreateSelect = () => {
  return (WrappedComponent) => {
    return class extends PureComponent {
      render() {
        const createAntSelect = (dataObj, key, title) => {
          const data = cloneDeep(dataObj);
          if (data.children) {
            return (
              <OptGroup key={data[key]} value={data[key]} label={data[title]}>
                {data.children.map(child => {
                  return createAntSelect(child, key, title);
                })}
              </OptGroup>
            );
          }
          return (<Option key={data[key]} value={data[key].toString()}>{data[title]}</Option>);
        }
        return <WrappedComponent createAntSelect={createAntSelect} {...this.props}/>;
      }
    };
  };
}

export default Ant;
