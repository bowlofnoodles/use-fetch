import { useState, useCallback, useEffect } from 'react';

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var isObject = function isObject(target) {
  return Object === target.constructor;
};

var transformToObjectResult = function transformToObjectResult(result, fetcherKeys) {
  if (!fetcherKeys.length) return {};
  return result.reduce(function (c, n, index) {
    c[fetcherKeys[index]] = n;
    return c;
  }, {});
};
/**
 * ???promise??????????????????????????????hook????????????
 * @param fetcher ????????????fetcher, ??????????????????promise??????????????????????????????resolve?????????????????????????????????
 * @param defaultValue ?????????
 * @param deps fetch???useCallback func??????????????????????????????????????????
 * @param renderedFetchParams ????????????????????????????????????useEffect??????????????????????????????????????????????????????useFetchAuto
 * @returns {
 *  data: ????????????,
 *  loading: ??????loading,
 *  fetch: ???????????????fetch, ???????????????????????????loading?????????promise??????resolve?????????????????????????????????????????????????????????????????????????????????????????????????????????
 *  setData: ??????????????????data, loading???????????????setData({loading: false, data: 'some data'});
 * }
 */


var useFetch = function useFetch(fetcher, defaultValue) {
  var deps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var renderedFetchParams = arguments.length > 3 ? arguments[3] : undefined;

  var _useState = useState({
    loading: false,
    data: defaultValue
  }),
      _useState2 = _slicedToArray(_useState, 2),
      fetchData = _useState2[0],
      setFetchData = _useState2[1];

  var fetch = useCallback(function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (!fetcher) return Promise.resolve(defaultValue);
    setFetchData(function (fetchData) {
      return {
        loading: true,
        data: fetchData.data
      };
    });
    return fetcher(_objectSpread2({}, params)).then(function (res) {
      setFetchData({
        loading: false,
        data: res || defaultValue
      });
      return res;
    })["catch"](function (err) {
      setFetchData({
        loading: false,
        data: defaultValue
      });
      return defaultValue;
    });
  }, deps);
  useEffect(function () {
    if (!renderedFetchParams) return;
    fetch(_objectSpread2({}, renderedFetchParams));
  }, []);
  return {
    loading: fetchData.loading,
    data: fetchData.data,
    fetch: fetch,
    setData: setFetchData
  };
};
/**
 * ???useFetch????????????????????????????????????renderedFetchParams????????????????????????useEffect????????????????????????
 * @param fetcher ???useFetch???fetcher??????
 * @param renderedFetchParams ???????????????????????????
 * @param defaultValue ?????????
 * @returns ???useFetch???????????????
 */


var useFetchAuto = function useFetchAuto(fetcher) {
  var renderedFetchParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var defaultValue = arguments.length > 2 ? arguments[2] : undefined;
  return useFetch(fetcher, defaultValue, [], renderedFetchParams);
};
/**
 * Promise.all????????????
 * @param fetchers ???????????? | ???????????????
 * @param deps fetch useCallback ???????????????
 * @return ???fetchers??????????????????????????? | ???fetchers key?????????????????????
 */


var useFetchAll = function useFetchAll(fetchers) {
  var deps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var isFunctionArray = Array.isArray(fetchers) && fetchers.length && fetchers.every(function (v) {
    return typeof v === 'function';
  });
  var isFunctionObject = isObject(fetchers) && Object.keys(fetchers).length && Object.keys(fetchers).every(function (k) {
    return typeof fetchers[k] === 'function';
  });

  if (!isFunctionArray && !isFunctionObject) {
    console.error('useFetchAllHook ?????????fetchers???????????????');
  }

  var doubleCondition = function doubleCondition(a, b, c) {
    if (isFunctionArray) return typeof a === 'function' ? a() : a;
    if (isFunctionObject) return typeof b === 'function' ? b() : b;
    return typeof c === 'function' ? c() : c;
  };

  var defaultValue = doubleCondition([], {});

  var _useState3 = useState({
    loading: false,
    data: defaultValue
  }),
      _useState4 = _slicedToArray(_useState3, 2),
      fetchData = _useState4[0],
      setFetchData = _useState4[1];

  var fetch = useCallback(function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultValue;
    if (!isFunctionArray && !isFunctionObject) return Promise.resolve(defaultValue);
    setFetchData(function (fetchData) {
      return {
        loading: true,
        data: fetchData.data
      };
    });
    var fetcherKeys = isFunctionObject ? Object.keys(fetchers) : [];
    var promises = doubleCondition(function () {
      return fetchers.map(function (fetcher, index) {
        var requestParams = params[index] || {};
        return fetcher(requestParams);
      });
    }, function () {
      return fetcherKeys.map(function (key) {
        var fetcher = fetchers[key];
        var requestParams = params[key] || {};
        return fetcher(requestParams);
      });
    });
    return Promise.all(promises).then(function (result) {
      var data = doubleCondition(result, transformToObjectResult(result, fetcherKeys));
      setFetchData({
        loading: false,
        data: data
      });
      return data;
    })["catch"](function (err) {
      console.log('err', err);
      setFetchData({
        loading: false,
        data: defaultValue
      });
      return defaultValue;
    });
  }, [].concat(_toConsumableArray(deps), [doubleCondition, isFunctionObject, isFunctionArray]));
  return {
    loading: fetchData.loading,
    data: fetchData.data,
    fetch: fetch,
    setData: setFetchData
  };
};

export default useFetch;
export { useFetchAll, useFetchAuto };
