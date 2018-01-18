import LoadingService from './LoadingService';
import Config from './Config';
import Format from './Format';
import Uri from './Uri';
import Http from './Http';
import Component from './Component';
import Convert from './Convert';
import Ant from './Ant';

const IsArray = function (ary) {
  return Object.prototype.toString.call(ary) == '[object Array]';
}

export {
  LoadingService,
  Config,
  Format,
  Uri,
  Http,
  Component,
  Convert,
  Ant,
  IsArray,
}

