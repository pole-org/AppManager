import React, {PureComponent} from 'react';
import lodash from 'lodash';
import {connect} from 'dva';
import {
  Button,
  Switch,
  Form,
  Input,
  Badge,
} from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {Component} from '../../../utils/rs/';
import {StandardTable, TableContainer, TableActionBar} from '../../../myComponents/Table/';
import {SearchForm} from '../../../myComponents/Form/';
import {ViewCard, EditModal} from '../../../myComponents/Fx/';


const modelNameSpace = 'dict_type';
const FormItem = Form.Item;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Form.create()
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {
  state = {
    columns: [
      {
        title: '字典名称',
        dataIndex: 'typeName',
        key: 'typeName',
      },
      {
        title: '字典Code',
        dataIndex: 'typeCode',
        key: 'typeCode',
      },
      {
        title: '字典状态',
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
              label: '条目管理',
              submit: () => {
                this.toItem(record);
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
                  title: '编辑字典'
                });
              },
            },
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

  componentDidMount() {
    this.getList();
  }

  componentWillUnmount() {
    const {model: {setState}} = this.props;
    setState({
      data: {
        list: [],
      },
      searchValues: {},
    });
  }

  toItem = (record) => {
    const {model: {push}} = this.props;
    push(`/setting/dict/item?typeCode=${record.typeCode}`);
  }

  getList = (page) => {
    const {model: {call, setState}, [modelNameSpace]: {pageIndex, pageSize, searchValues}} = this.props;
    setState({
      pageIndex: page || pageIndex,
    }).then(() => {
      call('getDictType', {
        pageIndex,
        pageSize,
        ...searchValues,
      });
    });
  }

  editDictType = (values) => {
    const {model} = this.props;
    const {type, isAdd} = this.state.modal;
    const action = isAdd ? 'addDictType' : 'editDictType';
    const typeID = isAdd ? 0 : content.typeID;
    values.status = values.status ? 1 : 0;
    model.dispatch({
      type: action,
      payload: {
        TypeEntity: {
          typeID,
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

  deleteRoleGroup = (groupID) => {
    const {model: {call}} = this.props;
    call("deleteRoleGroup", {groupID}).then(res => {
      this.getList();
    });
  }

  toggleModal = (modal) => {
    this.setState({
      modal,
    });
  }

  onSearch = (values) => {
    const {model: {setState}} = this.props;
    setState({
      searchValues: values,
    }).then(() => {
      this.getList();
    });
  }

  renderSearchForm() {
    const item = [
      [
        {
          label: '字典名称',
          key: 'typeName',
          render: () => {
            return (<Input style={{width: 150}} placeholder="请输入字典名称"/>);
          }
        },
        {
          label: '字典Code',
          key: 'typeCode',
          render: () => {
            return (<Input style={{width: 150}} placeholder="请输入字典Code"/>);
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

  renderEditPanel() {
    const {modal: {visible, title, content, isAdd}} = this.state;
    const item = [
      {
        key: 'typeName',
        label: '字典名称',
        value: isAdd ? "" : content.typeName,
        config: {
          rules: [{
            required: true, message: '请输入字典名称',
          }],
        },
        render: () => <Input placeholder="请输入职位名称"/>,
      },
      {
        key: 'typeCode',
        label: '字典代码',
        value: isAdd ? "" : content.typeCode,
        config: {
          rules: [{
            required: true, message: '请输入字典代码',
          }],
        },
        render: () => <Input placeholder="请输入字典代码"/>,
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
        key: 'typeDesc',
        label: '字典描述',
        value: isAdd ? '' : content.typeDesc,
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
        onSubmit={values => this.editDictType(values)}
      />
    )
  }

  renderTable() {
    const {
      [modelNameSpace]: {data: {list, total}, pageIndex}, loading, model, pagination,
    } = this.props;
    const {columns} = this.state;
    return (
      <StandardTable
        rowKey={record => record.typeID}
        columns={columns}
        size="small"
        loading={loading.effects[`${model.name}/getDictType`]}
        dataSource={list}
        pagination={pagination({pageIndex, total}, e => this.getList())}
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
          onClick={() => this.toggleModal({visible: true, isAdd: true, content: null, title: '添加字典'})}
        >添加
        </Button>,
      ]
    }
    return (
      <PageHeaderLayout>
        <ViewCard
          title="字典管理"
          bordered={false}
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



