import {message} from 'antd';
import {createModel} from '../utils/rs/Model';
import {createTree, createTreeData} from '../utils/utils';
import {get, add, edit, remove} from '../services/position';
import {getRoleOption} from '../services/role';

export default createModel({
  namespace: 'position',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    roleList: [],
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
              list: createTree(list || [], 'positionID'),
            },
          },
        });
        yield put({
          type: 'getRoleOption',
        })
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
    *getRoleOption({_}, {call, put}){
      const res = yield call(getRoleOption);
      if (res.data) {
        const data = res.data.toObject();
        const {list} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            roleList: list
          },
        });
      }
    },
  },
});


