const IsArray = function (ary) {
  return Object.prototype.toString.call(ary) === '[object Array]';
};

const String = {};
String.IsNullOrEmpty = function (str) {
  if (str === null || str === '' || str === undefined) {
    return true;
  }
  return false;
};

export {
  IsArray,
  String,
};

