import {Http, Config} from '../utils/rs/';

const prefix = `${Config.GetConfig('fxService')}/AM/App`;

export async function get() {
  return Http.AutoError.Get(`${prefix}/Get`);
}

export async function add(parmas) {
  return Http.AutoError.Post(`${prefix}/Add`, parmas);
}

export async function edit(params) {
  return Http.AutoError.Post(`${prefix}/Edit`, params);
}

export async function remove(params) {
  return Http.AutoError.Post(`${prefix}/Delete`, params);
}




