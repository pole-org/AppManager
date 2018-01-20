import {Http, Config} from '../utils/rs/';

const prefix = `${Config.GetConfig('fxService')}/User/Config`;

export async function GetUserMenu(params) {
  return Http.AutoError.Get(`${prefix}/GetUserMenu`, params);
}
