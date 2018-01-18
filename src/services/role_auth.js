import {Http, Config} from '../utils/rs/';

const prefix = `${Config.GetConfig('fxService')}/AM/RoleAuth`;

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Get`,params);
}

export async function add(params) {
  return Http.AutoError.Post(`${prefix}/Add`,params);
}
