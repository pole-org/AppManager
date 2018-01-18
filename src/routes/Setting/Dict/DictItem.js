import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Button,
  Popconfirm,
  Input,
  InputNumber,
  Badge,
  Switch,
  Modal,
} from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {Component, Uri} from '../../../utils/rs/';
import {IQueryable} from '../../../utils/rs/Linq';
import {SearchForm} from '../../../myComponents/Form/';
import {TableActionBar, TableContainer, StandardTable} from '../../../myComponents/Table/';
import {ViewCard, EditModal} from '../../../myComponents/Fx/';


const modelNameSpace = 'dict_item';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
export default class extends PureComponent {
  state = {
    columns: [
      {
        title: '条目名称',
        dataIndex: 'itemName',
        key: 'itemName',
      },
      {
        title: '条目代码',
        dataIndex: 'itemCode',
        key: 'itemCode',
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
          const isUse = record.status === 1;
          const action = [
            {
              label: '添加子条目',
              submit: () => {
                this.toggleModal({
                  visible: true,
                  isAdd: true,
                  parentID: record.itemID,
                  content: null,
                  title: '添加子条目',
                });
              },
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
                  title: '编辑条目'
                });
              },
            },
            {
              label: '删除',
              pop: {},
              submit: () => {
                this.deleteItem(record.itemID);
              }
            },
          ];
          return (
            <TableActionBar action={action} more={more} />
          )
        },
      },
    ],
    isOpen: false,
    modal: {
      visible: false,
      content: null,
      isAdd: true,
      parentID: 0,
      title: '添加',
    },
  };

  getItemList = () => {
    const {model: {call, setState}, [modelNameSpace]: {searchValues}} = this.props;
    call('getDictItemByCode', {
      typeCode: Uri.Query('typeCode'),
      ...searchValues,
    });

  }

  toList = () => {
    const {model: {push}} = this.props;
    push('/setting/dict');
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

  saveItem = (values) => {
    const {model} = this.props;
    const typeCode = Uri.Query('typeCode');
    values.status = values.status ? 1 : 0;
    const {isAdd, content, parentID} = this.state.modal;
    const itemID = isAdd ? 0 : content.itemID;
    const fucName = isAdd ? 'addDictItem' : 'editDictItem';
    model.dispatch({
      type: fucName,
      payload: {
        ItemEntity: {
          itemID,
          typeCode,
          parentID,
          ...values,
        },
      }
    }).then(res => {
      if (res) {
        this.toggleModal({visible: false});
        this.getItemList();
      }
    });
  }

  deleteItem = (itemID) => {
    const {model: {call, setState}, [modelNameSpace]: {selectItems}} = this.props;
    Modal.confirm({
      title: '确定要删除吗',
      content: '删除数据后将无法恢复',
      onOk: () => {
        let Items = [];
        if (itemID) {
          Items.push(itemID);
        } else {
          Items = selectItems;
        }
        call('deleteDictItem', {
          Items,
        }).then(success => {
          if (success) {
            this.getItemList();
            setState({
              selectItems: [],
            })
          }
        });
      }
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
      this.getItemList();
    });
  }

  componentDidMount() {
    this.getItemList();
  }

  componentWillUnmount() {
    const {model: {setState}} = this.props;
    setState({
      data: {
        list: [],
        origin: [],
      },
      searchValues: {},
    });
  }

  renderEditPanel() {
    const {modal: {visible, title, content, isAdd, parentID}} = this.state;
    const item = [
      {
        key: 'itemName',
        label: '条目名称',
        value: isAdd ? "" : content.itemName,
        config: {
          rules: [{
            required: true, message: '请输入条目名称',
          }],
        },
        render: () => <Input placeholder="请输入条目名称"/>,
      },
      {
        key: 'itemCode',
        label: '条目代码',
        value: isAdd ? "" : content.itemCode,
        config: {
          rules: [{
            required: true, message: '请输入条目代码',
          }],
        },
        render: () => <Input placeholder="请输入条目代码"/>,
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
        value: isAdd ? true : content.status === 1,
        config: {
          valuePropName: 'checked',
        },
        render: () => <Switch />,
      },
      {
        key: 'itemDesc',
        label: '条目描述',
        value: isAdd ? '' : content.itemDesc,
        render: () => <Input.TextArea autosize={{minRows: 4}}/>,
      },
    ];
    return (
      <EditModal
        item={item}
        visible={visible}
        title={title}
        onCancel={() => this.toggleModal({visible: false})}
        onSubmit={values => this.saveItem(values)}
      />
    )
  }

  renderSearchForm() {
    const item = [
      [
        {
          label: '条目Code',
          key: 'itemCode',
          render: () => {
            return (<Input style={{width: 150}}/>);
          }
        },
        {
          label: '条目名称',
          key: 'itemName',
          render: () => {
            return (<Input style={{width: 150}}/>);
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

  renderTable() {
    const {
      [modelNameSpace]: {data: {list}, selectItems}, loading, model,
    } = this.props;
    const {columns} = this.state;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        model.setState({
          selectItems: selectedRowKeys,
        })
      },
      selectedRowKeys: selectItems,
    };
    return (
      <StandardTable
        rowKey={record => record.itemID}
        columns={columns}
        loading={loading.effects[`${model.name}/getDictItemByCode`]}
        dataSource={list}
        pagination={false}
        rowSelection={rowSelection}
      />
    );
  }

  render() {
    const {modal: {visible}} = this.state;
    const {[modelNameSpace]: {selectItems}} = this.props;
    const tools = {
      layout: 'left',
      render: () => {
        return [
          <Button
            type="primary"
            icon="plus"
            onClick={() => this.toggleModal({visible: true, isAdd: true, parentID: 0, content: null, title: '添加条目'})}
          >添加条目
          </Button>,
          <Button icon="delete" type='danger' onClick={e => this.deleteItem()}
                  disabled={selectItems.length === 0}>删除</Button>
        ];
      }
    }
    return (
      <PageHeaderLayout>
        <ViewCard
          title="字典条目"
          onBack={e => this.toList()}
        >
          <TableContainer
            tools={tools}
            searchForm={this.renderSearchForm()}
          >
            {this.renderTable()}
          </TableContainer>
        </ViewCard>
        {visible ? this.renderEditPanel() : null}
      </PageHeaderLayout>
    );
  }
}



