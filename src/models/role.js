import {message} from 'antd';
import {createModel} from '../utils/rs/Model';
import {get, add, edit, remove} from '../services/role';

export default createModel({
  namespace: 'role',
  initialState: {
    data: {
      list: [],
      total: 0,
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
            data: {
              ...data,
            },
          },
        });
      }
    },
    *add({payload}, {call}) {
      const res = yield call(add, payload);
      if (res.success) {
        message.success('添加成功');
      } else {
        message.error('添加失败');
      }
      return Promise.resolve(res.success);
    },
    *edit({payload}, {call}) {
      const res = yield call(edit, payload);
      if (res.success) {
        message.success('编辑成功');
      } else {
        message.error('编辑失败');
      }
      return Promise.resolve(res.success);
    },
    *delete({payload}, {call}) {
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

