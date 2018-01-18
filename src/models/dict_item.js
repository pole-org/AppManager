import modelExtend from 'dva-model-extend';
import {message} from 'antd';
import base from './extra/base';
import {getDictItemByCode, addDictItem, editDictItem, deleteDictItem} from '../services/dict';
import {createNav} from '../utils/utils';

export default modelExtend(base, {
  namespace: 'dict_item',
  state: {
    data: {
      list: [],
      origin: [],
    },
    selectItems: [],
  },

  effects: {
    *getDictItemByCode({payload}, {call, put}) {
      const res = yield call(getDictItemByCode, payload);
      if (res) {
        yield put({
          type: 'setStateOk',
          payload: {
            data: {
              list: createNav(res.model.DictItemList, 'parentID', 'itemID'),
              origin: res.model.DictItemList,
            },
          },
        });
      }
    },
    *addDictItem({payload}, {call, put}) {
      const res = yield call(addDictItem, payload);
      if (res.success) {
        message.success('添加成功');
      } else {
        message.error('添加失败');
      }
      return Promise.resolve(res.success);
    },
    *editDictItem({payload}, {call, put}) {
      const res = yield call(editDictItem, payload);
      if (res.success) {
        message.success('编辑成功');
      } else {
        message.error('编辑失败');
      }
      return Promise.resolve(res.success);
    },
    *deleteDictItem({payload}, {call, put}) {
      const res = yield call(deleteDictItem, payload);
      if (res.success) {
        message.success('删除成功');
      } else {
        message.error('删除失败');
      }
      return Promise.resolve(res.success);
    },
  },

  reducers: {},
});
