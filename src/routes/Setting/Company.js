import React, {PureComponent} from 'react';
import lodash from 'lodash';
import {connect} from 'dva';
import {
  Button,
  Icon,
  Switch,
  Input,
  Badge,
  Tag,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Component, Uri, Convert} from '../../utils/rs/';
import {AutoSelect, AutoTreeSelect, ViewCard, EditModal} from '../../myComponents/Fx/';
import {TableContainer, TableActionBar, StandardTable} from '../../myComponents/Table/';

const modelNameSpace = 'company';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
export default class extends PureComponent {
  state = {
    columns: [
      {
        title: '公司名称',
        dataIndex: 'companyName',
        key: 'companyName',
      },
      {
        title: '公司代码',
        dataIndex: 'companyCode',
        key: 'companyCode',
      },
      {
        title: '是否为母公司',
        dataIndex: 'isMain',
        key: 'isMain',
        render: (text) => {
          return text === 1 ? "是" : '否';
        }
      },
      {
        title: '公司描述',
        dataIndex: 'companyDesc',
        key: 'companyDesc',
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
              label: '添加子公司',
              submit: () => {
                this.toggleModal({
                  visible: true,
                  isAdd: true,
                  parentID: record.companyID,
                  content: null,
                  title: '添加下属公司'
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
                  title: '编辑公司'
                });
              }
            },
            {
              label: '删除',
              pop: {},
              submit: () => {
                this.remove(record.companyID);
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

  remove = (companyID) => {
    const {model} = this.props;
    model.delete({companyID}).then(success => {
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

  save = (values) => {
    const {model} = this.props;
    const {isAdd, parentID, content} = this.state.modal;
    values.status = values.status ? 1 : 0;
    values.isMain = values.isMain ? 1 : 0;
    const companyID = isAdd ? 0 : content.companyID;
    model.save(isAdd, {
      companyEntity: {
        companyID,
        parentID,
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
        rowKey={record => record.companyID}
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
    const item = [
      {
        key: 'companyName',
        label: '公司名称',
        value: isAdd ? "" : content.companyName,
        config: {
          rules: [{
            required: true, message: '请输入公司名称',
          }],
        },
        render: () => <Input placeholder="请输入公司名称"/>,
      },
      {
        key: 'companyCode',
        label: '公司代码',
        value: isAdd ? "" : content.companyCode,
        config: {
          rules: [{
            required: true, message: '请输入公司代码',
          }],
        },
        render: () => <Input placeholder="请输入公司代码"/>,
      },
      {
        key: 'isMain',
        label: '母公司',
        value: isAdd ? true : content.status === 1,
        config: {
          valuePropName: 'checked',
        },
        render: () => <Switch />,
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
        key: 'companyDesc',
        label: '公司描述',
        value: content ? content.companyDesc : '',
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
        onSubmit={values => this.save(values)}
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
            onClick={() => this.toggleModal({visible: true, isAdd: true, parentID: 0, content: null, title: '添加公司'})}
          >添加
          </Button>,
        ];
      }
    }
    return (
      <PageHeaderLayout >
        <ViewCard
          title="公司列表"
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



