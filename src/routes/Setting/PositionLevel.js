import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Button,
  Switch,
  Popconfirm,
  Input,
  Tag,
  Modal,
  Badge,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Component, Format} from '../../utils/rs/';
import {SearchForm} from  '../../myComponents/Form/';
import {TableActionBar, TableContainer, StandardTable} from  '../../myComponents/Table/';
import {ViewCard, EditModal, AutoSelect} from '../../myComponents/Fx/';

const modelNameSpace = 'position_level';

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
        title: '职位等级名称',
        dataIndex: 'levelName',
        key: 'levelName',
      },
      {
        title: '职位等级代码',
        dataIndex: 'levelCode',
        key: 'levelCode',
      },
      {
        title: '职位等级组',
        dataIndex: 'levelGroupName',
        key: 'levelGroupName',
        render: (text) => {
          return <Tag color="green">{text}</Tag>
        }
      },
      {
        title: '对应基础工资',
        dataIndex: 'levelSalary',
        key: 'levelSalary',
        className: 'align-right',
        render: (text) => Format.Money.Rmb(text)
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
              label: '编辑',
              submit: () => {
                this.toggleModal({
                  visible: true,
                  content: record,
                  isAdd: false,
                  title: '编辑职位等级'
                })
              }
            }
          ];
          const more = [
            {
              label: '删除',
              pop: {},
              submit: () => {
                this.deletePositionLevel(record.roleID);
              }
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
      title: '',
    },
  };

  getList = (page) => {
    const {model, [modelNameSpace]: {searchValues, pageIndex, pageSize}} = this.props;
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total: 0,
      }
    }).then(() => {
      model.get({
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

  deletePositionLevel = (positionID) => {
    const {model: {call, setState}, [modelNameSpace]: {selectItems}} = this.props;
    Modal.confirm({
      title: '确定要删除吗',
      content: '删除数据后将无法恢复',
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

  renderSearchForm = () => {
    const item = [
      [
        {
          label: '职位等级组',
          key: 'positionLevelGroup',
          render: () => {
            return (<AutoSelect style={{width: 150}} typeCode="position-level-group" placeholder="请选择职位等级组"/>);
          }
        }
      ],
    ];
    return (
      <SearchForm
        item={item}
        onSearch={values => this.onSearch(values)}
        reload={() => this.reload()}
      />
    )
  }

  onSearch = (searchValues) => {
    const {model: {setState}} = this.props;
    setState({
      searchValues,
    }).then(() => {
      this.getList();
    });
  }

  reload = () => {
    const {model: {setState}} = this.props;
    setState({
      searchValues: {},
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
        rowKey={record => record.levelID}
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
          title="职位等级列表"
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



