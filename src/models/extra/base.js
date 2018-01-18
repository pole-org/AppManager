import {routerRedux} from 'dva/router';

export default {
  namespace: 'BaseModel',
  state: {
    pageIndex: 1,
    pageSize: localStorage.getItem('pageSize') === null ? 10
      : parseInt(localStorage.getItem('pageSize')),
    searchValues: {},
  },
  subscriptions: {
    setup({history, dispatch}) {
      return history.listen(({pathname}) => {
      });
    },
  },

  effects: {
    *setState({payload}, {put}) {
      yield put({
        type: 'setStateOk',
        payload,
      });
    },
    *changeRoute({payload}, {put}) {
      yield put(routerRedux.push(payload.path));
    },
    *clear({payload}, {put}){
      yield put({
        type: 'clearOk',
      });
    },
    *resetState({payload}, {put}){
      yield put({
        type: 'resetPage',
      });
      yield put({
        type: 'resetStateOk',
      });
    },
    *resetPage({payload}, {put}){
      yield put({
        type: 'resetPageOk',
      });
    }
  },
  reducers: {
    setStateOk(state, {payload}) {
      return {
        ...state,
        ...payload,
      };
    },
    resetPageOk(state, {payload}){
      return {
        ...state,
        pageIndex: 1,
      };
    },
  },
};
