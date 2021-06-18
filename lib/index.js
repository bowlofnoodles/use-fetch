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
 * 将promise形式的接口调用形式和hook接口起来
 * @param fetcher 接口调用fetcher, 可以是任意的promise形式的接口调用，保证resolve出来的值是想要的值就行
 * @param defaultValue 默认值
 * @param deps fetch的useCallback func的依赖改变数组，默认为空数组
 * @param renderedFetchParams 如果传了，则内部会自动在useEffect中调用一次接口，不传则跳过，功能类似useFetchAuto
 * @returns {
 *  data: 接口数据,
 *  loading: 接口loading,
 *  fetch: 调用接口的fetch, 调用会自动设置值和loading，返回promise值，resolve的值为接口传递出去的值，如果接口成功就是接口值，接口不成功就是默认值，
 *  setData: 外部自己设置data, loading，使用形如setData({loading: false, data: 'some data'});
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
 * 在useFetch的基础上快速调用，通过传renderedFetchParams的形式，会自动在useEffect中自己调一次接口
 * @param fetcher 与useFetch的fetcher一样
 * @param renderedFetchParams 首次调用的接口参数
 * @param defaultValue 默认值
 * @returns 与useFetch返回值一致
 */


var useFetchAuto = function useFetchAuto(fetcher) {
  var renderedFetchParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var defaultValue = arguments.length > 2 ? arguments[2] : undefined;
  return useFetch(fetcher, defaultValue, [], renderedFetchParams);
};
/**
 * Promise.all方式调取
 * @param fetchers 函数数组 | 函数值对象
 * @param deps fetch useCallback 依赖项数组
 * @return 与fetchers相同数组长度的数组 | 与fetchers key值相对应的对象
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
    console.error('useFetchAllHook 传入的fetchers格式不正确');
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
