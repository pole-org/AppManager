import {message} from 'antd';
import {createModel} from '../utils/rs/Model';
import {get,add,edit,remove} from '../services/app';

export default createModel({
  namespace: 'app',
  initialState: {
    data: {
      list: [],
    },
  },
  effects: {
    *get(_, {call, put}) {
      const res = yield call(get);
      if (res.data) {
        const data = res.data.toObject();
        const {list} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            data: {
              list: list.toObject(),
            },
          },
        });
      }
    },
    *add({payload}, {call, put}) {
      const res = yield call(add, payload);
      yield put({type: 'addMsg', payload: res.success});
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
})

