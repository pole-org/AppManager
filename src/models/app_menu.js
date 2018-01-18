import {message} from 'antd';
import {createModel} from '../utils/rs/Model';
import {get,add,edit,remove} from '../services/app_menu';
import {createNav} from '../utils/utils';

export default createModel({
  namespace: 'app_menu',
  initialState: {
    data: {
      list: [],
      origin: [],
      appCode: '',
    },
  },
  effects: {
    *get({payload}, {call, put}) {
      const res = yield call(get, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {list, appCode} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            data: {
              list: createNav(list.toObject()),
              origin: list.toObject() || [],
              appCode,
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
    *delete({payload}, {call, put}) {
      const res = yield call(remove, payload);
      if (res.success) {
        message.success('删除成功');
      } else {
        message.error('删除失败');
      }
      return Promise.resolve(res.success);
    },
  },
});

