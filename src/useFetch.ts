import { useState, useCallback, useEffect } from 'react';
interface FetchData<T> {
  data?: T;
  loading: boolean;
}

type DependencyList = ReadonlyArray<any>;

type Fetcher<T> = (paramsObj?: any) => Promise<T>;

type FetcherObject<T> = {
  [key: string]: Fetcher<T>;
};

type FetcherArray<T> = Fetcher<T>[];

type FetchersAll = FetcherObject<any> | FetcherArray<any>;

type FetchAllData<T extends FetchersAll> = T extends any[]
  ? any[]
  : {
      [property in keyof T]?: any;
    };

const isObject = (target: any) => {
  return Object === target.constructor;
};

const transformToObjectResult = (result: any[], fetcherKeys: string[]) => {
  if (!fetcherKeys.length) return {};
  return result.reduce((c, n, index) => {
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
const useFetch = <T extends unknown>(
  fetcher: Fetcher<T>,
  defaultValue?: T,
  deps: DependencyList = [],
  renderedFetchParams?: object
) => {
  const [fetchData, setFetchData] = useState<FetchData<T>>({
    loading: false,
    data: defaultValue
  });

  const fetch = useCallback((params = {}): Promise<T | void> => {
    if (!fetcher) return Promise.resolve(defaultValue);
    setFetchData(fetchData => ({
      loading: true,
      data: fetchData.data
    }));
    return fetcher({ ...params })
      .then(res => {
        setFetchData({
          loading: false,
          data: res || defaultValue
        });
        return res;
      })
      .catch(err => {
        setFetchData({
          loading: false,
          data: defaultValue
        });
        return defaultValue;
      });
  }, deps);

  useEffect(() => {
    if (!renderedFetchParams) return;
    fetch({ ...renderedFetchParams });
  }, []);

  return {
    loading: fetchData.loading,
    data: fetchData.data,
    fetch,
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
const useFetchAuto = <T extends unknown>(fetcher: Fetcher<T>, renderedFetchParams: object = {}, defaultValue?: T) =>
  useFetch<T>(fetcher, defaultValue, [], renderedFetchParams);

/**
 * Promise.all方式调取
 * @param fetchers 函数数组 | 函数值对象
 * @param deps fetch useCallback 依赖项数组
 * @return 与fetchers相同数组长度的数组 | 与fetchers key值相对应的对象
 */
const useFetchAll = <T extends FetchersAll>(fetchers: T, deps: DependencyList = []) => {
  const isFunctionArray = Array.isArray(fetchers) && fetchers.length && fetchers.every(v => typeof v === 'function');
  const isFunctionObject =
    isObject(fetchers) &&
    Object.keys(fetchers).length &&
    Object.keys(fetchers).every((k: string) => typeof (fetchers as FetcherObject<any>)[k] === 'function');
  if (!isFunctionArray && !isFunctionObject) {
    console.error('useFetchAllHook 传入的fetchers格式不正确');
  }

  const doubleCondition = (a: unknown, b: unknown, c?: unknown) => {
    if (isFunctionArray) return typeof a === 'function' ? a() : a;
    if (isFunctionObject) return typeof b === 'function' ? b() : b;
    return typeof c === 'function' ? c() : c;
  };

  const defaultValue = doubleCondition([], {});

  const [fetchData, setFetchData] = useState<FetchData<FetchAllData<T>>>({
    loading: false,
    data: defaultValue
  });

  const fetch = useCallback(
    (params = defaultValue): Promise<any> => {
      if (!isFunctionArray && !isFunctionObject) return Promise.resolve(defaultValue);

      setFetchData(fetchData => ({
        loading: true,
        data: fetchData.data
      }));

      const fetcherKeys = isFunctionObject ? Object.keys(fetchers) : [];

      const promises = doubleCondition(
        () =>
          fetchers.map((fetcher: Fetcher<any>, index: number) => {
            const requestParams = params[index] || {};
            return fetcher(requestParams);
          }),
        () =>
          fetcherKeys.map(key => {
            const fetcher: Fetcher<any> = (fetchers as FetcherObject<any>)[key];
            const requestParams = params[key] || {};
            return fetcher(requestParams);
          })
      );

      return Promise.all(promises)
        .then(result => {
          const data = doubleCondition(result, transformToObjectResult(result, fetcherKeys));
          setFetchData({
            loading: false,
            data
          });
          return data;
        })
        .catch(err => {
          console.log('err', err);
          setFetchData({
            loading: false,
            data: defaultValue
          });
          return defaultValue;
        });
    },
    [...deps, doubleCondition, isFunctionObject, isFunctionArray]
  );

  return {
    loading: fetchData.loading,
    data: fetchData.data,
    fetch,
    setData: setFetchData
  };
};

export { useFetchAuto, useFetchAll, useFetch };
