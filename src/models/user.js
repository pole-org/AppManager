import {message} from 'antd';
import {createModel} from '../utils/rs/Model';
import {createTreeData} from '../utils/utils';
import {get, setUserPosition} from '../services/user';
import {get as getPosition} from '../services/position';

export default createModel({
  namespace: 'user',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    treeList: [],
    selectItems: [],
    searchValues: {
      username: '',
      statusList: [1],
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
            }
          },
        });
        yield put({type: 'getPosition'});
      }
    },
    *getPosition({payload}, {call, put}){
      const res = yield call(getPosition, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {list} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            treeList: createTreeData(list, 'positionName', 'positionID'),
          },
        });
      }
    },
    *setUserPosition({payload}, {call, put}){
      const res = yield call(setUserPosition, payload);
      if (res.success) {
        message.success("授权成功");
      } else {
        message.error("授权失败");
      }
      return Promise.resolve(res.success);
    }
  },

});


