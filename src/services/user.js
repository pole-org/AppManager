import {Http, Config} from '../utils/rs/';

const prefix = `${Config.GetConfig('fxService')}/AM/User`;

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Get`, params);
}

export async function setUserPosition(params) {
  return Http.AutoError.Post(`${prefix}/Position/Set`, params);
}
