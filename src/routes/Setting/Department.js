import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Button,
  Icon,
  Switch,
  Popconfirm,
  Input,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Component} from '../../utils/rs/';
import {AutoSelect, ViewCard, EditModal} from '../../myComponents/Fx/';
import {TableContainer, TableActionBar, StandardTable} from '../../myComponents/Table/';


const modelNameSpace = 'department';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
export default class extends PureComponent {
  state = {
    columns: [
      {
        title: '部门名称',
        dataIndex: 'depName',
        key: 'depName',
        render: (text) => {
          return (<span><Icon type="team"/>{text}</span>);
        }
      },
      {
        title: '部门描述',
        dataIndex: 'depContent',
        key: 'depContent',
      },
      {
        title: '操作',
        dataIndex: 'op',
        key: 'op',
        render: (text, record) => {
          const action = [
            {
              label: '添加子部门',
              submit: () => {
                this.toggleModal({
                  visible: true,
                  isAdd: true,
                  parentID: record.positionID,
                  content: null,
                  title: '添加子部门'
                });
              }
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
                  parentID: record.parentID,
                  title: '编辑职位'
                })
              }
            },
            {
              label: '删除',
              pop: {},
              submit: () => {
                this.deleteDepartment(record.depID);
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
      parentID: 0,
      title: '添加部门',
    },
  };

  getList = () => {
    const {model} = this.props;
    model.get();
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

  deleteDepartment = (roleID) => {
    const {model: {call}} = this.props;
    call("deleteRole", {roleID}).then(res => {
      this.getList();
    });
  }

  toggleModal = (modal) => {
    this.setState({
      modal,
    });
  }

  saveDepartment = (values) => {
    const {model: {dispatch}} = this.props;
    const {isAdd, parentID, content} = this.state.modal;
    values.Status = values.status ? 1 : 0;
    const dispatchName = isAdd ? 'addPosition' : 'editPosition';
    const positionID = isAdd ? 0 : content.positionID;
    const relation = isAdd ? "" : content.relation;
    dispatch({
      type: dispatchName,
      payload: {
        PositionEntity: {
          positionID,
          parentID,
          relation,
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

  componentDidMount() {
    this.getList();
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }

  renderTable() {
    const {
      [modelNameSpace]: {data: {list}}, loading, model,
    } = this.props;
    const {columns} = this.state;
    return (
      <StandardTable
        rowKey={record => record.depID}
        columns={columns}
        loading={loading.effects[`${modelNameSpace}/get`]}
        dataSource={list}
        pagination={false}
      />
    );
  }

  renderEditPanel() {
    const {modal: {visible, title, content}} = this.state;
    const item = [
      {
        key: 'positionName',
        label: '职位名称',
        value: content ? content.positionName : "",
        config: {
          rules: [{
            required: true, message: '请输入职位名称',
          }],
        },
        render: () => <Input placeholder="请输入职位名称"/>,
      },
      {
        key: 'positionCode',
        label: '职位代码',
        value: content ? content.positionCode : "",
        config: {
          rules: [{
            required: true, message: '请输入职位代码',
          }],
        },
        render: () => <Input placeholder="请输入职位代码"/>,
      },
      {
        key: 'positionType',
        label: '职位组',
        value: content ? content.positionType : "",
        config: {
          rules: [{
            required: true, message: '请选择职位组',
          }],
        },
        render: () => <AutoSelect typeCode="position-group" placeholder="请选择职位组"/>,
      },
      {
        key: 'positionStatus',
        label: '职位状态',
        value: content ? content.positionStatus === 1 : true,
        config: {
          valuePropName: 'checked',
        },
        render: () => <Switch />,
      },
      {
        key: 'positionDesc',
        label: '职位描述',
        value: content ? content.positionDesc : '',
        render: () => <Input.TextArea autosize={{minRows: 4}}/>,
      },
    ];
    return (
      <EditModal
        item={item}
        visible={visible}
        title={title}
        onCancel={() => this.toggleModal({visible: false})}
        onSubmit={values => this.saveDepartment(values)}
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
            onClick={() => this.toggleModal({visible: true, isAdd: true, parentID: 0, content: null, title: '添加部门'})}
          >添加部门
          </Button>,
        ];
      }
    }
    return (
      <PageHeaderLayout >
        <ViewCard
          bordered={false}
          title="部门列表"
          onReload={e => this.getList()}
        >
          <TableContainer
            tools={tools}
          >
            {this.renderTable()}
          </TableContainer>
        </ViewCard>
        {this.state.modal.visible ? this.renderEditPanel() : null}
      </PageHeaderLayout>
    );
  }
}



