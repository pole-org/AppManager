import React, {PureComponent} from 'react';
import lodash from 'lodash';
import {connect} from 'dva';
import {
  Button,
  Icon,
  Switch,
  Form,
  Popconfirm,
  Input,
  Badge,
  Tag,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Component, Uri, Convert} from '../../utils/rs/';
import {AutoSelect, AutoTreeSelect, ViewCard, EditModal} from '../../myComponents/Fx/';
import {TableContainer, TableActionBar, StandardTable} from '../../myComponents/Table/';

const modelNameSpace = 'position';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
export default class extends PureComponent {
  state = {
    columns: [
      {
        title: '职位名称',
        dataIndex: 'positionName',
        key: 'positionName',
        render: (text) => {
          return (<span><Icon type="user"/>{text}</span>)
        }
      },
      {
        title: '职位代码',
        dataIndex: 'positionCode',
        key: 'positionCode',
      },
      {
        title: '职位组',
        dataIndex: 'positionTypeName',
        key: 'positionTypeName',
        render: (text) => <Tag color="green">{text}</Tag>,
      },
      {
        title: '职位说明',
        dataIndex: 'positionDesc',
        key: 'positionDesc',
      },
      {
        title: '关联角色',
        dataIndex: 'roleNames',
        key: 'roleNames',
        render: (text) => {
          return (
            <div>{
              text.ToList().map((role, idx) => {
                return <Tag key={idx} style={{marginRight: 5}} color="cyan">{role}</Tag>
              })
            }
            </div>
          )
        }
      },
      {
        title: '状态',
        dataIndex: 'positionStatus',
        key: 'positionStatus',
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
              label: '添加下属',
              submit: () => {
                this.toggleModal({
                  visible: true,
                  isAdd: true,
                  parentID: record.positionID,
                  content: null,
                  title: '添加下属职位'
                });
              }
            }
          ]
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
                });
              }
            },
            {
              label: '删除',
              pop: {},
              submit: () => {
                this.deletePosition(record.menuID)
              }
            }
          ]
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
      title: '添加职位',
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

  deletePosition = (positionID) => {
    const {model} = this.props;
    model.delete({positionID}).then(success => {
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

  savePosition = (values) => {
    const {model} = this.props;
    const {isAdd, parentID, content} = this.state.modal;
    values.positionStatus = values.positionStatus ? 1 : 0;
    values.roleIDs = values.roleIDs.join(',');
    const positionID = isAdd ? 0 : content.positionID;
    const relation = isAdd ? "" : content.relation;
    model.save(isAdd, {
      PositionEntity: {
        positionID,
        parentID,
        relation,
        ...values,
      },
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
    const {model: {resetState}} = this.props;
    resetState();
  }

  renderTable() {
    const {
      [modelNameSpace]: {data: {list}}, loading,
    } = this.props;
    const {columns} = this.state;
    return (
      <StandardTable
        rowKey={record => record.positionID}
        columns={columns}
        loading={loading.effects[`${modelNameSpace}/get`]}
        dataSource={list}
        pagination={false}
      />
    );
  }

  renderEditPanel() {
    const {modal: {visible, title, content, isAdd}} = this.state;
    const {[modelNameSpace]: {roleList}} = this.props;
    const selectData = {
      options: roleList,
      key: 'roleID',
      label: 'roleName',
    }
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
        key: 'roleIDs',
        label: '关联角色',
        value: isAdd ? [] : content.roleIDs.ToList(),
        config: {
          rules: [{
            required: true, message: '请选择关联角色',
          }],
        },
        render: () => {
          return (
            <AutoSelect
              mode="multiple"
              data={selectData}
              placeholder="请选择关联角色"
            />)
        }
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
        reset={isAdd}
        onCancel={() => this.toggleModal({visible: false})}
        onSubmit={values => this.savePosition(values)}
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
            onClick={() => this.toggleModal({visible: true, isAdd: true, parentID: 0, content: null, title: '添加职位'})}
          >添加
          </Button>,
        ];
      }
    }
    return (
      <PageHeaderLayout >
        <ViewCard
          title="职位列表"
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



