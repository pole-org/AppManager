import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Button,
  Switch,
  Input,
  Tag,
  Badge,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Component} from '../../utils/rs/';
import {SearchForm} from  '../../myComponents/Form/';
import {TableActionBar, TableContainer, StandardTable} from  '../../myComponents/Table/';
import {ViewCard, EditModal, AutoSelect} from '../../myComponents/Fx/';

const modelNameSpace = 'role';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
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
        title: 'RoleName',
        dataIndex: 'roleName',
        key: 'roleName',
      },
      {
        title: 'roleCode',
        dataIndex: 'roleCode',
        key: 'roleCode',
      },
      {
        title: '所属角色组',
        dataIndex: 'groupName',
        key: 'groupName',
        render: (text) => {
          return <Tag color="green">{text}</Tag>
        }
      },
      {
        title: 'Role状态',
        dataIndex: 'status',
        key: 'status',
        render: (text) => {
          const info = this.getBadgeInfo(text);
          return <Badge status={info.status} text={info.text}/>;
        },
      },
      {
        title: '操作',
        dataIndex: 'op',
        key: 'op',
        width: 150,
        render: (text, record) => {
          const action = [
            {
              label: '权限管理',
              submit: () => {
                this.setAuth(record);
              },
            }
          ];
          const more = [
            {
              label: '编辑',
              submit: () => {
                this.toggleModal({
                  visible: true,
                  content: record,
                  isAdd: false,
                  title: '编辑角色'
                });
              },
            },
            {
              label: '删除',
              pop: {},
              submit: () => {
                this.delete(record.roleID);
              }
            }
          ];
          return (
            <TableActionBar action={action} more={more}/>
          );
        },
      },
    ],
    modal: {
      visible: false,
      content: null,
      isAdd: true,
      title: '',
    },
  };

  setAuth = (record) => {
    const {model: {push}} = this.props;
    push(`/setting/role/auth?roleID=${record.roleID}`);
  }

  getList = (page) => {
    const {model: {get, setState}, [modelNameSpace]: {searchValues, pageIndex, pageSize}} = this.props;
    setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total: 0,
      }
    }).then(() => {
      get({
        ...searchValues,
        pageIndex,
        pageSize,
      });
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

  save = (values) => {
    const {model} = this.props;
    values.status = values.status ? 1 : 0;
    const {content, isAdd} = this.state.modal;
    const roleID = isAdd ? 0 : content.roleID;
    model.save(isAdd, {
      RoleEntity: {
        roleID,
        ...values,
      },
    }).then(res => {
      if (res) {
        this.toggleModal({visible: false});
        this.getList();
      }
    });
  }

  delete = (roleID) => {
    const {model} = this.props;
    model.delete({roleID}).then(success => {
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

  onSearch = (searchValues) => {
    const {model: {setState}} = this.props;
    setState({
      searchValues,
    }).then(() => {
      this.getList();
    });
  }

  componentDidMount() {
    this.getList();
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }

  renderSearchForm() {
    const item = [
      [
        {
          label: '角色组',
          key: 'GroupCode',
          render: () => {
            return (<AutoSelect style={{width: 150}} typeCode="role-group" placeholder="请选择角色组"/>);
          }
        },
        {
          label: '角色名称',
          key: 'RoleName',
          render: () => {
            return (<Input style={{width: 150}} placeholder="请输入角色名称"/>);
          }
        }
      ],
    ];
    return (
      <SearchForm
        item={item}
        onSearch={values => this.onSearch(values)}
      />
    );
  }

  renderEditPanel() {
    const {modal: {visible, title, content, isAdd}} = this.state;
    const item = [
      {
        key: 'roleName',
        label: '角色名称',
        value: isAdd ? "" : content.roleName,
        config: {
          rules: [{
            required: true, message: '请输入角色名称',
          }],
        },
        render: () => <Input placeholder="请输入角色名称"/>,
      },
      {
        key: 'roleCode',
        label: '角色代码',
        value: isAdd ? "" : content.roleCode,
        config: {
          rules: [{
            required: true, message: '请输入角色代码',
          }],
        },
        render: () => <Input placeholder="请输入角色代码"/>,
      },
      {
        key: 'groupCode',
        label: '角色组',
        value: isAdd ? "" : content.groupCode,
        config: {
          rules: [{
            required: true, message: '请选择角色组',
          }],
        },
        render: () => <AutoSelect typeCode="role-group" placeholder="请选择角色组"/>,
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
    ];
    return (
      <EditModal
        item={item}
        visible={visible}
        title={title}
        reset={isAdd}
        onCancel={() => this.toggleModal({visible: false})}
        onSubmit={values => this.save(values)}
      />
    )
  }

  renderTable() {
    const {
      [modelNameSpace]: {data: {list, total}, pageIndex, }, loading,pagination,
    } = this.props;
    const {columns} = this.state;
    return (
      <StandardTable
        rowKey={record => record.roleID}
        columns={columns}
        loading={loading.effects[`${modelNameSpace}/get`]}
        dataSource={list}
        pagination={pagination({pageIndex, total}, () => this.getList())}
      />
    );
  }

  render() {
    const {modal: {visible}} = this.state;
    const tools = {
      render: () => [
        <Button
          type="primary"
          icon="plus"
          onClick={() => this.toggleModal({visible: true, isAdd: true, content: null, title: '添加角色'})}
        >添加
        </Button>,
      ]
    }
    return (
      <PageHeaderLayout >
        <ViewCard
          title="角色管理"
        >
          <TableContainer
            searchForm={this.renderSearchForm()}
            tools={tools}
          >
            {this.renderTable()}
          </TableContainer>
        </ViewCard>
        {visible ? this.renderEditPanel() : null}
      </PageHeaderLayout>
    );
  }
}



