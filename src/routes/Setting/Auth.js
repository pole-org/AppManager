import React, {PureComponent} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import {connect} from 'dva';
import {Tabs, Card, Tree, Button, Modal} from 'antd';
import {Component, Convert, Ant, Uri} from '../../utils/rs/';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import FooterToolbar from '../../components/FooterToolbar/';

const TabPane = Tabs.TabPane;
const TreeNode = Tree.TreeNode;
const modelNameSpace = 'role_auth';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Ant.CreateTree()
export default class extends PureComponent {
  state = {
    currentAuthTab: 'view',
  }

  componentDidMount() {
    const {model: {call},} = this.props;
    call('getAppList');
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }

  changeAppTabs = (current) => {
    const {model, [modelNameSpace]: {app}} = this.props;
    Modal.confirm({
      title: '确定想要切换系统?',
      content: '当点击确定按钮会重置数据，请先确认是否已保存数据',
      onOk() {
        model.setState({
          app: {
            ...app,
            current,
          }
        }).then(() => {
          model.get({
            AppID: current.toInt(),
            RoleID: Uri.Query('roleID').toInt(),
          });
        });
      },
    });
  }

  changeAuthTabs = (currentAuthTab) => {
    this.setState({
      currentAuthTab,
    })
  }

  changeKeys = (type, keys) => {
    const {model: {setState}} = this.props;
    switch (type) {
      case 'view':
        setState({
          viewAuthCheckedKeys: keys.checked,
        });
        break;
      case 'action':
        setState({
          actionAuthCheckedKeys: keys.checked,
        });
        break;
      case 'info':
        setState({
          infoAuthCheckedKeys: keys.checked,
        });
        break;
    }
  }

  save = () => {
    const {model, [modelNameSpace]: {app: {current}, viewAuthCheckedKeys, actionAuthCheckedKeys}} = this.props;
    const RoleID = Convert.ToInt(Uri.Query('roleID'));
    Modal.confirm({
      title: '保存数据?',
      content: '确定要保存数据？',
      onOk() {
        model.add({
          RoleID,
          AppID: current,
          RoleViewAuthList: viewAuthCheckedKeys,
          RoleActionAuthList: actionAuthCheckedKeys,
        }).then(success => {
          if (success) {
            model.get({
              AppID: current.toInt(),
              RoleID: Uri.Query('roleID').toInt(),
            });
          }
        });
      },
    });
  }
  back = () => {
    const {model} = this.props;
    model.push('/setting/role/');
  }

  createActionTree(dataObj) {
    const data = cloneDeep(dataObj);
    if (data.children) {
      return (
        <TreeNode key={`menu-${data.menuID}`} title={data.menuTitle} disableCheckbox>
          {data.children.map(child => {
            return this.createActionTree(child);
          })}
        </TreeNode>
      );
    }
    return (
      <TreeNode key={`menu-${data.menuID}`} title={data.menuTitle} disableCheckbox>
        {data.menuAction.map(action => {
          return <TreeNode key={action.actionID} title={action.name} isleaf={true}/>
        })}
      </TreeNode>
    );
  }

  renderAppTabs() {
    const {[modelNameSpace]: {app: {list, current}}} = this.props;
    return (
      <Tabs activeKey={current.toString()} onChange={tab => this.changeAppTabs(tab)}>
        {list.map((app) => {
          return (<TabPane tab={app.appName} key={app.id}/>);
        })}
      </Tabs>
    )
  }

  renderAuthTabs() {
    return (
      <Tabs type="card" activeKey={this.state.currentAuthTab} onChange={tab => this.changeAuthTabs(tab)}>
        <TabPane tab='模块访问授权' key='view'>
          <div className="dashed-container">{this.renderViewAuth()}</div>
        </TabPane>
        <TabPane tab='模块操作授权' key='action'>
          <div className="dashed-container">{this.renderActionAuth()}</div>
        </TabPane>
        <TabPane tab='模块信息授权' key='info'/>
      </Tabs>
    )
  }

  renderViewAuth() {
    const {[modelNameSpace]: {viewAuthCheckedKeys, menuList}, createAntTree} = this.props;
    return (
      <Tree
        checkable
        showLine
        checkStrictly
        defaultExpandAll={true}
        checkedKeys={viewAuthCheckedKeys}
        onCheck={keys => this.changeKeys('view', keys)}
      >
        {menuList.map(menu => {
          return createAntTree(menu, 'menuID', 'menuTitle');
        })}
      </Tree>
    );
  }

  renderActionAuth() {
    const {[modelNameSpace]: {app: {list, current}, menuActionList, actionAuthCheckedKeys}} = this.props;
    return (
      <Tree
        checkable
        showLine={true}
        checkStrictly
        checkedKeys={actionAuthCheckedKeys}
        defaultExpandAll={true}
        onCheck={keys => this.changeKeys('action', keys)}
      >
        {menuActionList.map(menu => {
          return this.createActionTree(menu);
        })}
      </Tree>
    )
  }

  render() {
    return (
      <PageHeaderLayout>
        <Card
          bordered={false}
        >
          {this.renderAppTabs()}
          {this.renderAuthTabs()}
        </Card>
        <FooterToolbar className="contentWidth" extra="提交权限数据">
          <Button onClick={e => this.back()}>返回角色列表</Button>
          <Button type='primary' onClick={e => this.save()}>提交</Button>
        </FooterToolbar>
      </PageHeaderLayout>
    )
  }
}
