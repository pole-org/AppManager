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

const modelNameSpace = 'app_menu_action';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
export default class extends PureComponent {
  state = {
    columns: [
      {
        title: 'Action标题',
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
        title: 'Action权限码',
        dataIndex: 'code',
        key: 'code',
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
        title: '操作',
        dataIndex: 'op',
        key: 'op',
        render: (text, record) => {
          const action = [
            {
              label: '编辑',
              submit: () => {
                this.toggleModal({
                  visible: true,
                  content: record,
                  isAdd: false,
                  parentID: record.parentID,
                  title: '编辑操作'
                });
              },
            }
          ];
          const more = [
            {
              label: '删除',
              pop: {},
              submit: () => {
                this.remove(record.actionID);
              },
            }
          ];
          return (
            <TableActionBar action={action} more={more}/>
          )
        },
      },
    ],
    modal: {
      visible: false,
      content: null,
      isAdd: true,
      title: '添加',
    },
  };

  getList = () => {
    const {model} = this.props;
    model.get({
      AppID: parseInt(Uri.Query("appID")),
      MenuID: parseInt(Uri.Query("menuID")),
    });
  }

  toList = () => {
    const {model} = this.props;
    model.push(`/app/list/Menu?appID=${Uri.Query('appID')}`);
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

  getMaxShowIndex = () => {
    const {[modelNameSpace]: {data: {list}}} = this.props;
    const maxItem = IQueryable(list).OrderByDescending("showIndex").First();
    if (maxItem === null) {
      return 0;
    }
    return maxItem.showIndex + 1;
  }

  save = (values) => {
    const {model} = this.props;
    const appID = Convert.ToInt(Uri.Query('appID'));
    const menuID = Uri.Query('menuID').toInt();
    values.status = values.status ? 1 : 0;
    values.hideInMenu = values.hideInMenu ? 1 : 0;
    const {isAdd, content} = this.state.modal;
    const actionID = isAdd ? 0 : content.actionID;
    model.save(isAdd, {
      AppMenuAction: {
        actionID,
        menuID,
        appID,
        ...values,
      },
    }).then(res => {
      if (res) {
        this.toggleModal({visible: false});
        this.getList();
      }
    });
  }

  remove = (actionID) => {
    const {model} = this.props;
    const actionIDList = [];
    if (actionID) {
      actionIDList.push(actionID);
    }
    model.delete({actionIDList}).then(success => {
      if (success) {
        this.getList();
      }
    });
  }

  toggleModal = (modal) => {
    this.setState({
      modal,
    });
  }

  componentDidMount() {
    this.getList();
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
        label: 'Action名称',
        value: isAdd ? "" : content.name,
        config: {
          rules: [{
            required: true, message: '请输入Action名称',
          }],
        },
        render: () => <Input placeholder="请输入Action名称"/>,
      },
      {
        key: 'code',
        label: 'Action代码',
        value: isAdd ? "" : content.code,
        config: {
          rules: [{
            required: true, message: '请输入Action代码',
          }],
        },
        render: () => <Input placeholder="请输入Action代码"/>,
      },
      {
        key: 'showIndex',
        label: '显示顺序',
        value: isAdd ? this.getMaxShowIndex() : content.showIndex,
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
    ];
    return (
      <EditModal
        labelCol={5}
        item={item}
        visible={visible}
        title={title}
        onCancel={() => this.toggleModal({visible: false})}
        onSubmit={values => this.save(values)}
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
        rowKey={record => record.actionID}
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
            onClick={() => this.toggleModal({visible: true, isAdd: true, content: null, title: '添加操作', parentID: 0})}
          >添加
          </Button>
        ];
      }
    }
    return (
      <PageHeaderLayout >
        <ViewCard
          title="App模块操作列表"
          bordered={false}
          onBack={() => {
            this.toList();
          }}
          onReload={() => {
            this.getList();
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


