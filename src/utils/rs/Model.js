import modelExtend from 'dva-model-extend';
import {message} from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import baseModel from '../../models/extra/base';

export function createModel({initialState, namespace, effects, reducers}) {
  return modelExtend(baseModel, {
    namespace,
    state: cloneDeep(initialState),
    effects: {
      ...effects,
      *addMsg({payload}, {put}){
        if (payload) {
          message.success('添加成功');
        } else {
          message.error('添加失败');
        }
      },
      *editMsg({payload}, {put}){
        if (payload) {
          message.success('编辑成功');
        } else {
          message.error('编辑失败');
        }
      },
      *deleteMsg({payload}, {put}){
        if (payload) {
          message.success('删除成功');
        } else {
          message.error('删除失败');
        }
      },
    },
    reducers: {
      ...reducers,
      resetStateOk(state){
        return {
          ...state,
          ... cloneDeep(initialState),
        };
      },
    },
  });
};
