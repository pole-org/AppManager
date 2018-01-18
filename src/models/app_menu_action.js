import {message} from 'antd';
import {createModel} from '../utils/rs/Model';
import {get, add, edit, remove} from '../services/app_menu_action';

export default createModel({
  namespace: 'app_menu_action',
  initialState: {
    data: {
      list: [],
    },
  },
  effects: {
    *get({payload}, {call, put}) {
      const res = yield call(get, payload);
      if (res.data) {
        const data = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            data,
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

