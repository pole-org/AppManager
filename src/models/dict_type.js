import modelExtend from 'dva-model-extend';
import {message} from 'antd';
import base from './extra/base';
import {getDictType, addDictType} from '../services/dict';

export default modelExtend(base, {
  namespace: 'dict_type',
  state: {
    data: {
      list: [],
      total: 0,
    }
  },

  effects: {
    *getDictType({payload}, {call, put}) {
      const res = yield call(getDictType, payload);
      if (res) {
        yield put({
          type: 'setStateOk',
          payload: {
            data: {
              list: res.model.DictTypeList,
              total: res.model.Total,
            },
          },
        });
      }
    },
    *addDictType({payload}, {call, put}) {
      const res = yield call(addDictType, payload);
      if (res.success) {
        message.success('添加成功');
      } else {
        message.error('添加失败');
      }
      return Promise.resolve(res.success);
    },
  },

  reducers: {},
});
