import {Http, Config} from '../utils/rs/';

const prefix = `${Config.GetConfig('fxService')}/AM/Department`;

export async function get() {
  return Http.AutoError.Get(`${prefix}/Get`);
}
