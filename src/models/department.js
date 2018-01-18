import modelExtend from 'dva-model-extend';
import {message} from 'antd';
import {createModel} from '../utils/rs/Model';
import base from './extra/base';
import {get} from '../services/department';
import {createTree} from '../utils/utils';

export default createModel({
  namespace: 'department',
  initialState: {
    data: {
      list: [],
    }
  },
  effects: {
    *get({payload}, {call, put}) {
      const res = yield call(get);
      if (res.data) {
        const data = res.data.toObject();
        const {list} = data;
        const _list = list.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            data: {
              list: createTree(_list, 'depID', 'parentID', 'showIndex'),
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



