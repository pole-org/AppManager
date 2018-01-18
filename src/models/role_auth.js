import {message} from 'antd';
import {
  get as getAppList,
} from '../services/app';
import {get, add} from '../services/role_auth';
import {createModel} from '../utils/rs/Model';
import {createNav} from '../utils/utils';
import {Uri} from '../utils/rs/';

export default createModel({
  namespace: 'role_auth',
  initialState: {
    app: {
      list: [],
      current: 0,
    },
    menuList: [],
    menuActionList: [],
    viewAuthCheckedKeys: [],
    actionAuthCheckedKeys: [],
    infoAuthCheckedKeys: [],
  },
  effects: {
    *get({payload}, {call, put}){
      const res = yield call(get, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {menuList, menuActionList, roleMenuList, roleMenuActionList} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            menuList: createNav(menuList),
            menuActionList: createNav(menuActionList),
            viewAuthCheckedKeys: roleMenuList,
            actionAuthCheckedKeys: roleMenuActionList,
          },
        });
      }
    },
    *add({payload}, {call, put}){
      const res = yield call(add, payload);
      if (res) {
        if (res.success) {
          message.success('设置权限成功');
        } else {
          message.error('设置权限失败');
        }
        return Promise.resolve(res.success);
      }
    },
    *getAppList(_, {call, put, select}) {
      const res = yield call(getAppList);
      if (res.data) {
        const data = res.data.toObject();
        const {list} = data;
        const _list = list.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            app: {
              list: _list,
              current: _list[0].id,
            },
          },
        });
        yield put({
          type: 'get',
          payload: {
            AppID: _list[0].id,
            RoleID: Uri.Query('roleID').toInt(),
          }
        })
      }
    },
  },
});


