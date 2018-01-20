import {message} from 'antd';
import {createModel} from '../utils/rs/Model';
import {createTree, createTreeData} from '../utils/utils';
import {get, add, edit, remove} from '../services/company';

export default createModel({
  namespace: 'company',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
  },
  effects: {
    *get({payload}, {call, put}) {
      const res = yield call(get);
      if (res.data) {
        const data = res.data.toObject();
        const {list} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            data: {
              list: createTree(list || [], 'companyID'),
            },
          },
        });
      }
    },
    *add({payload}, {call, put}) {
      const res = yield call(add, payload);
      if (res.success) {
        message.success('添加成功');
      } else {
        message.error('添加失败');
      }
      return Promise.resolve(res.success);
    },
    *edit({payload}, {call, put}) {
      const res = yield call(edit, payload);
      if (res.success) {
        message.success('编辑成功');
      } else {
        message.error('编辑失败');
      }
      return Promise.resolve(res.success);
    },
  },
});


