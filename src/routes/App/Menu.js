import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Button,
  Icon,
  Form,
  Popconfirm,
  Input,
  InputNumber,
  Badge,
  Switch,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Component, Uri, Convert} from '../../utils/rs/';
import {IQueryable} from '../../utils/rs/Linq';
import {ViewCard, EditModal} from '../../myComponents/Fx/';
import {TableActionBar, TableContainer, StandardTable} from '../../myComponents/Table/';

const modelNameSpace = 'app_menu';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Form.create()
@Component.Model(modelNameSpace)//注入model
export default class extends PureComponent {
  state = {
    columns: [
      {
        title: 'Menu标题',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (text, record) => {
          if (record.icon) {
            return <span style={{fontWeight: 600}}><Icon type={record.icon} style={{marginRight: 10}}/>{text}</span>;
          }
          return <Badge status="default" text={text} style={{fontWeight: 600}}/>;
        }
      },
      {
        title: 'Menu权限码',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: 'Path',
        dataIndex: 'path',
        key: 'path',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          const info = this.getBadgeInfo(text);
          return <Badge status={info.status} text={info.text}/>;
        }
      },
      {
        title: 'hideInMenu',
        dataIndex: 'hideInMenu',
        key: 'hideInMenu',
      },
      {
        title: '操作',
        dataIndex: 'op',
        key: 'op',
        render: (text, record) => {
          const action = [
            {
              label: '添加子目录',
              submit: () => {
                this.toggleModal({
                  visible: true,
                  isAdd: true,
                  parentID: record.menuID,
                  content: record,
                  title: '添加子目录'
                });
              },
            },
            {
              label: '操作管理',
              hide: record.parentID === 0,
              submit: () => {
                const {model} = this.props;
                model.push(`/app/list/menu/action?appID=${Uri.Query('appID')}&menuID=${record.menuID}`);
              }
            },
            {
              label: '字段管理',
              hide: record.parentID === 0,
              submit: () => {
                const {model} = this.props;
                model.push(`/app/list/menu/column?appID=${Uri.Query('appID')}&menuID=${record.menuID}`);
              }
            },
          ];
          const more = [
            {
              label: '编辑',
              submit: () => {
                this.toggleModal({
                  visible: true,
                  content: record,
                  isAdd: false,
                  parentID: record.parentID,
                  title: '编辑模块'
                });
              },
            },
            {
              label: '删除',
              pop: {},
              submit: () => {
                this.deleteMenu(record.menuID);
              },
            }
          ];
          return (
            <TableActionBar action={action} more={more}/>
          )
        },
      },
    ],
    isOpen: false,
    modal: {
      visible: false,
      content: null,
      parentID: 0,
      isAdd: true,
      title: '添加',
    },
  };

  getMenu = () => {
    const {model} = this.props;
    model.get({
      AppID: parseInt(Uri.Query("appID")),
    });
  }

  toList = () => {
    const {model} = this.props;
    model.push('/app/list');
  }

  getBadgeInfo = (type) => {
    const info = {};
    switch (type) {
      case 0:
        info.status = "warning";
        info.text = '已禁用';
        break;
      case 1:
        info.status = "success";
        info.text = '已启用';
        break;
      default:
        info.status = "warning";
        info.text = '已禁用';
        break;
    }
    return info;
  }

  getMaxShowIndex = (parentID) => {
    const {[modelNameSpace]: {data: {origin}}} = this.props;
    const maxItem = IQueryable(origin).Where(x => x.parentID === parentID).OrderByDescending("showIndex").First();
    if (maxItem === null) {
      return 0;
    }
    return maxItem.showIndex + 1;
  }

  saveMenu = (values) => {
    const {model} = this.props;
    const appID = Convert.ToInt(Uri.Query('appID'));
    values.status = values.status ? 1 : 0;
    values.hideInMenu = values.hideInMenu ? 1 : 0;
    const {isAdd, parentID, content} = this.state.modal;
    const menuID = isAdd ? 0 : content.menuID;
    model.save(isAdd, {
      AppMenu: {
        menuID,
        appID,
        parentID,
        ...values,
      },
    }).then(res => {
      if (res) {
        this.toggleModal({visible: false});
        this.getMenu();
      }
    });
  }

  deleteMenu = (MenuID) => {
    const {model} = this.props;
    model.delete({MenuID}).then(success => {
      if (success) {
        this.getMenu();
      }
    });
  }

  toggleModal = (modal) => {
    this.setState({
      modal,
    });
  }

  componentDidMount() {
    this.getMenu();
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }

  renderEditPanel() {
    const {modal: {visible, title, content, isAdd, parentID}} = this.state;
    const item = [
      {
        key: 'name',
        label: 'Menu名称',
        value: isAdd ? "" : content.name,
        config: {
          rules: [{
            required: true, message: '请输入Menu名称',
          }],
        },
        render: () => <Input placeholder="请输入Menu名称"/>,
      },
      {
        key: 'code',
        label: 'Menu代码',
        value: isAdd ? "" : content.code,
        config: {
          rules: [{
            required: true, message: '请输入Menu代码',
          }],
        },
        render: () => <Input placeholder="请输入Menu代码"/>,
      },
      {
        key: 'path',
        label: 'MenuPath',
        value: isAdd ? "" : content.path,
        config: {
          rules: [{
            required: true, message: '请输入MenuPath',
          }],
        },
        render: () => <Input placeholder='请输入MenuPath'/>,
      },
      {
        key: 'icon',
        label: 'MenuIcon',
        value: isAdd ? "" : content.icon,
        render: () => <Input placeholder='请输入MenuIcon'/>,
      },
      {
        key: 'showIndex',
        label: '显示顺序',
        value: isAdd ? this.getMaxShowIndex(parentID) : content.showIndex,
        render: () => <InputNumber />,
      },
      {
        key: 'status',
        label: '状态',
        value: content ? content.status === 1 : true,
        config: {
          valuePropName: 'checked',
        },
        render: () => <Switch />,
      },
      {
        key: 'hideInMenu',
        label: '不显示',
        value: isAdd ? false : content.hideInMenu === 1,
        config: {
          valuePropName: 'checked',
        },
        render: () => <Switch />,
      },
    ];
    return (
      <EditModal
        labelCol={5}
        item={item}
        visible={visible}
        title={title}
        onCancel={() => this.toggleModal({visible: false})}
        onSubmit={values => this.saveMenu(values)}
      />
    )
  }

  renderTable() {
    const {
      [modelNameSpace]: {data: {list}}, loading,
    } = this.props;
    const {columns} = this.state;
    return (
      <StandardTable
        rowKey={record => record.menuID}
        columns={columns}
        loading={loading.effects[`${modelNameSpace}/get`]}
        dataSource={list}
        pagination={false}
      />
    );
  }

  render() {
    const tools = {
      render: () => {
        return [
          <Button
            type="primary"
            icon="plus"
            onClick={() => this.toggleModal({visible: true, isAdd: true, content: null, title: '添加根目录', parentID: 0})}
          >添加目录
          </Button>
        ];
      }
    }
    return (
      <PageHeaderLayout >
        <ViewCard
          title="App模块列表"
          bordered={false}
          onBack={() => {
            this.toList();
          }}
          onReload={() => {
            this.getMenu();
          }}
        >
          <TableContainer tools={tools}>
            {this.renderTable()}
          </TableContainer>
        </ViewCard>
        {this.state.modal.visible ? this.renderEditPanel() : null}
      </PageHeaderLayout>
    );
  }
}


