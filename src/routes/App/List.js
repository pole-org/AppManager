import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Button,
  Switch,
  Popconfirm,
  Input,
  Badge,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Component} from '../../utils/rs/';
import {ViewCard, EditModal} from '../../myComponents/Fx/';
import {TableContainer, StandardTable, TableActionBar} from '../../myComponents/Table/';

const modelNameSpace = 'app';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
export default class extends PureComponent {
  state = {
    columns: [
      {
        title: '#',
        dataIndex: 'index',
        key: 'index',
        render: (text, record, index) => {
          return index + 1;
        }
      },
      {
        title: 'AppCode',
        dataIndex: 'appCode',
        key: 'appCode',
      },
      {
        title: 'App名称',
        dataIndex: 'appName',
        key: 'appName',
      },
      {
        title: 'App链接',
        dataIndex: 'appLink',
        key: 'appLink',
        render: (text) => {
          return (<a href={text} target="_blank">{text}</a>)
        },
      },
      {
        title: 'App状态',
        dataIndex: 'status',
        key: 'status',
        render: (text) => {
          const info = this.getBadgeInfo(text);
          return <Badge status={info.status} text={info.text}/>;
        },
      },
      {
        title: 'App描述',
        dataIndex: 'appDesc',
        key: 'appDesc',
      },
      {
        title: '操作',
        dataIndex: 'op',
        key: 'op',
        width: 150,
        render: (text, record) => {
          const action = [
            {
              label: '模块',
              submit: () => {
                this.setMenu(record);
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
                  title: '编辑App'
                })
              }
            },
            {
              label: '删除',
              pop: {},
              submit: () => {
                this.deleteApp(record.id);
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
      title: '添加App',
    },
  };

  setMenu = (record) => {
    const {model: {push}} = this.props;
    push(`/app/list/menu?appID=${record.id}`);
  }

  getList = () => {
    const {model: {get}} = this.props;
    get();
  }

  saveApp = (values) => {
    const {model} = this.props;
    values.status = values.status ? 1 : 0;
    const {isAdd, content} = this.state.modal;
    const id = isAdd ? 0 : content.id;
    model.save(isAdd, {
      App: {
        id,
        ...values,
      },
    }).then(res => {
      if (res) {
        this.toggleModal({visible: false});
        this.getList();
      }
    });
  }

  deleteApp = (appID) => {
    const {model} = this.props;
    model.delete({appID}).then(success => {
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

  componentDidMount() {
    this.getList();
  }

  componentWillUnmount() {
    const {model: {setState}} = this.props;
    setState({
      data: {
        list: [],
      }
    });
  }

  renderEditPanel() {
    const {modal: {visible, title, content, isAdd}} = this.state;
    const item = [
      {
        key: 'appName',
        label: 'App名称',
        value: isAdd ? "" : content.appName,
        config: {
          rules: [{
            required: true, message: '请输入App名称',
          }],
        },
        render: () => <Input placeholder="请输入App名称"/>,
      },
      {
        key: 'appCode',
        label: 'App代码',
        value: isAdd ? "" : content.appCode,
        config: {
          rules: [{
            required: true, message: '请输入App代码',
          }],
        },
        render: () => <Input placeholder="请输入App代码"/>,
      },
      {
        key: 'appLink',
        label: 'App链接',
        value: isAdd ? "" : content.appLink,
        config: {
          rules: [{
            required: true, message: '请输入App链接',
          }],
        },
        render: () => <Input placeholder='请输入App链接'/>,
      },
      {
        key: 'status',
        label: '状态',
        value: isAdd ? true : content.status === 1,
        config: {
          valuePropName: 'checked',
        },
        render: () => <Switch />,
      },
      {
        key: 'appDesc',
        label: 'App描述',
        value: isAdd ? '' : content.appDesc,
        render: () => <Input.TextArea autosize={{minRows: 4}}/>,
      },
    ];
    return (
      <EditModal
        item={item}
        visible={visible}
        title={title}
        onCancel={() => this.toggleModal({visible: false})}
        onSubmit={values => this.saveApp(values)}
      />
    )
  }

  renderTable() {
    const {
      [modelNameSpace]: {data: {list,}}, loading,
    } = this.props;
    const {columns} = this.state;
    return (
      <StandardTable
        rowKey={record => record.id}
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
            onClick={() => this.toggleModal({visible: true, isAdd: true, content: null, title: '添加App'})}
          >添加
          </Button>
        ];
      }
    }
    return (
      <PageHeaderLayout>
        <ViewCard
          title="App列表"
          onReload={e => this.getList()}
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

