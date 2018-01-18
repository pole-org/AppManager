import {Http, Config} from '../utils/rs/';

const fx = Config.GetConfig('fxService');

export async function getDictType(params) {
  return Http.AutoError.Get(`${fx}/AM/Dict/GetDictType`, params);
}

export async function getDictItemByCode(params) {
  return Http.AutoError.Get(`${fx}/AM/Dict/GetDictItemByCode`, params);
}

export async function addDictType(params) {
  return Http.AutoError.Post(`${fx}/AM/Dict/AddDictType`, params);
}

export async function addDictItem(params) {
  return Http.AutoError.Post(`${fx}/AM/Dict/AddDictItem`, params);
}

export async function editDictItem(params) {
  return Http.AutoError.Post(`${fx}/AM/Dict/UpdateDictItem`, params);
}

export async function deleteDictItem(params) {
  return Http.AutoError.Post(`${fx}/AM/Dict/DeleteDictItem`, params);
}
