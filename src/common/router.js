import React from 'react';
import dynamic from 'dva/dynamic';
import {getMenuData} from './menu';

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => dynamic({
  app,
  // eslint-disable-next-line no-underscore-dangle
  models: () => models.filter(m => !app._models.some(({namespace}) => namespace === m)).map(m => import(`../models/${m}.js`)),
  // add routerData prop
  component: () => {
    const p = component();
    return new Promise((resolve, reject) => {
      p.then((Comp) => {
        resolve(props => <Comp {...props} routerData={getRouterData(app)}/>);
      }).catch(err => reject(err));
    });
  },
});

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach((item) => {
    if (item.children) {
      keys[item.path] = item.name;
      keys = {...keys, ...getFlatMenuData(item.children)};
    } else {
      keys[item.path] = item.name;
    }
  });
  return keys;
}

export const getRouterData = (app) => {
  const routerData = {
    '/': {
      component: dynamicWrapper(app, ['user'], () => import('../layouts/BasicLayout')),
    },
    '/app/list': {
      component: dynamicWrapper(app, ['app'], () => import('../routes/App/List')),
    },
    '/app/list/menu': {
      component: dynamicWrapper(app, ['app_menu'], () => import('../routes/App/Menu')),
    },
    '/app/list/menu/action': {
      component: dynamicWrapper(app, ['app_menu_action'], () => import('../routes/App/Action')),
    },
    '/setting/department': {
      component: dynamicWrapper(app, ['department'], () => import('../routes/Setting/Department')),
    },
    '/setting/dict': {
      component: dynamicWrapper(app, ['dict_type'], () => import('../routes/Setting/Dict/DictType')),
    },
    '/setting/dict/item': {
      component: dynamicWrapper(app, ['dict_item'], () => import('../routes/Setting/Dict/DictItem')),
    },
    '/setting/position': {
      component: dynamicWrapper(app, ['position'], () => import('../routes/Setting/Position')),
    },
    '/setting/position-level': {
      component: dynamicWrapper(app, ['position_level'], () => import('../routes/Setting/PositionLevel')),
    },
    '/setting/user': {
      component: dynamicWrapper(app, ['user'], () => import('../routes/Setting/User')),
    },
    '/setting/role': {
      component: dynamicWrapper(app, ['role'], () => import('../routes/Setting/Role')),
    },
    '/setting/role/auth': {
      component: dynamicWrapper(app, ['role_auth'], () => import('../routes/Setting/Auth')),
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () => import('../routes/Exception/triggerException')),
    },
    // '/user/:id': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/SomeComponent')),
    // },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());
  const routerDataWithName = {};
  Object.keys(routerData).forEach((item) => {
    routerDataWithName[item] = {
      ...routerData[item],
      name: routerData[item].name || menuData[item.replace(/^\//, '')],
    };
  });
  return routerDataWithName;
};
