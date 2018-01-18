import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Button,
  Switch,
  Input,
  Tag,
  Modal,
  Badge,
  Avatar,
  Checkbox,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Component, Config} from '../../utils/rs/';
import {SearchForm} from  '../../myComponents/Form/';
import {TableActionBar, TableContainer, StandardTable} from  '../../myComponents/Table/';
import {ViewCard, EditModal, AutoSelect, AutoTreeSelect} from '../../myComponents/Fx/';

const modelNameSpace = 'user';
const CheckGroup = Checkbox.Group;

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
        title: '头像',
        dataIndex: 'headImg',
        key: 'headImg',
        render: (text, record, index) => {
          var imgUrl = text.IsEmpty() ? Config.defaultAvator : `${Config.imgServer}${text}`;
          return <Avatar size="small" src={imgUrl}/>;
        }
      },
      {
        title: '用户姓名',
        dataIndex: 'userName',
        key: 'userName',
      },
      {
        title: '用户账号',
        dataIndex: 'userAccount',
        key: 'userAccount',
      },
      {
        title: '所属部门',
        dataIndex: 'depName',
        key: 'depName',
        render: (text) => <Tag color="green">{text}</Tag>
      },
      {
        title: '用户职位',
        dataIndex: 'userPositionList',
        key: 'userPositionList',
        render: (text) => {
          return (
            <div>
              {text.map((position, idx) => {
                return <Tag key={idx} color="cyan">{position.positionName}</Tag>
              })}
            </div>)
        }
      },
      {
        title: '状态',
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
              label: '授权',
              submit: () => {
                this.toggleAuthModal({
                  visible: true,
                  content: record,
                  title: '授权'
                });
              },
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
                  title: '编辑职位等级'
                });
              }
            },
            {
              label: '删除',
              submit: () => {
                this.deleteUser(record.roleID);
              },
            },
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
    authModal: {
      visible: false,
      title: '授权',
      content: null,
    }
  };

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

  savePositionLevel = (values) => {
    const {model} = this.props;
    values.status = values.status ? 1 : 0;
    const {isAdd, content} = this.state.modal;
    const levelID = isAdd ? 0 : content.levelID;
    const dispatchName = isAdd ? 'addPositionLevel' : 'editPositionLevel';
    model.dispatch({
      type: dispatchName,
      payload: {
        LevelEntity: {
          levelID,
          ...values,
        },
      }
    }).then(res => {
      if (res) {
        this.toggleModal({visible: false});
        this.getList();
      }
    });
  }

  setUserPosition = (values) => {
    const {model} = this.props;
    const {content} = this.state.authModal;
    const {userPositionList} = values;
    const list = [];
    userPositionList.forEach(x => {
      list.push(x.value.toInt());
    });
    model.dispatch({
      type: 'setUserPosition',
      payload: {
        userID: content.userID,
        userPositionList: list,
      }
    }).then(res => {
      if (res) {
        this.toggleAuthModal({visible: false});
        this.getList();
      }
    });
  }

  deleteUser = (positionID) => {
    const {model: {call, setState}, [modelNameSpace]: {selectItems}} = this.props;
    Modal.confirm({
      title: '删除数据',
      content: '确定要删除吗,删除数据后将无法恢复',
      onOk: () => {
        if (positionID) {
          const arr = [];
          arr.push(positionID);
          setState({
            selectItems: arr
          });
        }
        call("deletePositionLevel", {deleteItems: selectItems}).then(success => {
          if (success)
            setState({
              selectItems: [],
            })
          this.getList();
        });
      }
    });
  }

  toggleModal = (modal) => {
    this.setState({
      modal,
    });
  }

  toggleAuthModal = (authModal) => {
    this.setState({
      authModal,
    });
  }

  renderSearchForm = () => {
    const item = [
      [
        {
          label: '用户姓名',
          key: 'userName',
          render: () => {
            return (<Input placeholder="请输入用户姓名" style={{width: 150}}/>);
          }
        },
        {
          label: '状态',
          key: 'statusList',
          config: {
            initialValue: [1],
          },
          render: () => {
            return (
              <CheckGroup>
                <Checkbox value={1}>启用</Checkbox>
                <Checkbox value={0}>禁用</Checkbox>
              </CheckGroup>
            );
          }
        }
      ],
    ];
    return (
      <SearchForm
        item={item}
        onSearch={values => this.onSearch(values)}
      />
    )
  }

  onSearch = (searchValues) => {
    const {model: {setState}} = this.props;
    setState({
      searchValues,
      pageIndex: 1,
    }).then(() => {
      this.getList();
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
    const {model: {call}} = this.props;
    this.getList();
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }

  renderEditPanel() {
    const {modal: {visible, title, content, isAdd}} = this.state;
    const item = [
      {
        key: 'levelName',
        label: '职位等级名称',
        value: isAdd ? "" : content.levelName,
        config: {
          rules: [{
            required: true, message: '请输入职位等级名称',
          }],
        },
        render: () => <Input placeholder="请输入职位等级名称"/>,
      },
      {
        key: 'levelCode',
        label: '职位等级代码',
        value: isAdd ? "" : content.levelCode,
        config: {
          rules: [{
            required: true, message: '请输入职位等级代码',
          }],
        },
        render: () => <Input placeholder="请输入角色代码"/>,
      },
      {
        key: 'levelGroupCode',
        label: '职位等级组',
        value: isAdd ? "" : content.levelGroupCode,
        config: {
          rules: [{
            required: true, message: '请选择职位等级组',
          }],
        },
        render: () => <AutoSelect typeCode="position-level-group" placeholder="请选择角色组"/>,
      },
      {
        key: 'levelSalary',
        label: '基础工资',
        value: isAdd ? "" : content.levelSalary,
        config: {
          rules: [{
            required: true, message: '请输入基础工资',
          }],
        },
        render: () => <Input placeholder="请输入角色代码"/>,
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
        key: 'levelDesc',
        label: '职位等级说明',
        value: isAdd ? "" : content.levelDesc,
        render: () => <Input.TextArea autosize={{minRows: 4}}/>,
      },
    ];
    return (
      <EditModal
        labelCol={6}
        item={item}
        visible={visible}
        title={title}
        reset={isAdd}
        onCancel={() => this.toggleModal({visible: false})}
        onSubmit={values => this.savePositionLevel(values)}
      />
    )
  }

  renderAuthPanel() {
    const {authModal: {visible, content, title}} = this.state;
    const {[modelNameSpace]: {treeList}} = this.props;
    const {userPositionList} = content;
    const list = [];
    userPositionList.forEach(x => {
      const {positionName, position} = x;
      list.push({
        label: positionName,
        value: position.toString(),
      });
    });
    const item = [
      {
        key: 'userPositionList',
        label: '选择职位',
        value: list,
        config: {
          rules: [{
            required: true, message: '请选择职位',
          }],
        },
        render: () => {
          return (
            <AutoTreeSelect
              treeCheckable
              treeCheckStrictly
              treeData={treeList}
              placeholder="请选择关联角色"
            />)
        }
      },
    ];
    return (
      <EditModal
        labelCol={4}
        item={item}
        visible={visible}
        title={title}
        onCancel={() => this.toggleAuthModal({visible: false})}
        onSubmit={values => this.setUserPosition(values)}
      />
    );
  }

  renderTable() {
    const {
      [modelNameSpace]: {data: {list, total}, pageIndex, selectItems}, loading, model, pagination,
    } = this.props;
    const {columns} = this.state;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        model.setState({
          selectItems: selectedRowKeys,
        });
      },
      selectedRowKeys: selectItems,
    };
    return (
      <StandardTable
        rowKey={record => record.userID}
        columns={columns}
        loading={loading.effects[`${modelNameSpace}/get`]}
        dataSource={list}
        pagination={pagination({pageIndex, total}, () => this.getList())}
        rowSelection={rowSelection}
      />
    );
  }

  render() {
    const {modal: {visible}} = this.state;
    const {[modelNameSpace]: {selectItems}} = this.props;
    const tools = {
      layout: 'left',
      render: () => [
        <Button
          type="primary"
          icon="plus"
          onClick={() => this.toggleModal({visible: true, isAdd: true, content: null, title: '添加职位等级'})}
        >添加
        </Button>,
        <Button icon="delete" type='danger' onClick={e => this.deletePositionLevel()}
                disabled={selectItems.length === 0}>删除</Button>
      ]
    }
    return (
      <PageHeaderLayout >
        <ViewCard
          title="用户列表"
        >
          <TableContainer
            searchForm={this.renderSearchForm()}
            tools={tools}
          >
            {this.renderTable()}
          </TableContainer>
        </ViewCard>
        {visible ? this.renderEditPanel() : null}
        {this.state.authModal.visible ? this.renderAuthPanel() : null}
      </PageHeaderLayout>
    );
  }
}



