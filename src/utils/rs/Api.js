import {Http, Convert, Config} from '../../utils/rs/';


const getRemoteData = (url, params) => {
  return Http.Base.Get(Config.GetConfig('fxApi') + url, params);
}

export function getDictItemText(typeCode, itemCode) {
  const data = getRemoteData('/dict/item/get', {typeCode, itemCode});
  data.then(res => {
    if (res.data) {
      const data = res.data.model.IsEmpty() ? [] : Convert.ToObject(res.data.model);
      if (data.length > 0) {
        return data[0].itemName;
      }
    }
  });
}
