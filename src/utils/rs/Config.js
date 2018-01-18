const Config = {
  title: '应用管理系统',
  logo: '',
  cdn: 'http://cdn.polelong.com',
  defaultImage: 'http://cdn.polelong.com/image/loading.gif',
  defaultAvator: 'http://cdn.polelong.com/image/defaultLogo.jpg',
  serialLogo: 'http://cdn.polelong.com/image/serialLogo.png',
  imgServer: 'http://erpimg1.polelong.com',
  dev: {
    url: 'http://appManager.lpole.com:8083/',
    fxService: 'http://fxServer.lpole.com',
    fxApi: 'http://fxServer.lpole.com/api',
    loginServer:'http://login.lpole.com/#/user/login',
  },
  prod: {
    url: 'http://appManager.polelong.com/',
    fxService: 'http://fxServer.polelong.com',
    fxApi: 'http://fxServer.polelong.com/api',
    loginServer:'http://login.polelong.com/#/user/login',
  },
  GetConfig(key) {
    if (process.env.NODE_ENV === 'production') {
      return this.prod[key];
    } else {
      return this.dev[key];
    }
  },
}
export default Config;
