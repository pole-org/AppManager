import {Http, Config} from '../utils/rs/';

const prefix = `${Config.GetConfig('fxService')}/AM/Company`;

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Get`, params);
}

export async function add(params) {
  return Http.AutoError.Post(`${prefix}/Add`, params);
}

export async function edit(params) {
  return Http.AutoError.Post(`${prefix}/Edit`, params);
}

export async function remove(params) {
  return Http.AutoError.Post(`${prefix}/Delete`, params);
}


