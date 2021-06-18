/// <reference types="react" />
interface FetchData<T> {
    data?: T;
    loading: boolean;
}
declare type DependencyList = ReadonlyArray<any>;
declare type Fetcher<T> = (paramsObj?: any) => Promise<T>;
declare type FetcherObject<T> = {
    [key: string]: Fetcher<T>;
};
declare type FetcherArray<T> = Fetcher<T>[];
declare type FetchersAll = FetcherObject<any> | FetcherArray<any>;
declare type FetchAllData<T extends FetchersAll> = T extends any[] ? any[] : {
    [property in keyof T]?: any;
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
declare const useFetch: <T extends unknown>(fetcher: Fetcher<T>, defaultValue?: T | undefined, deps?: DependencyList, renderedFetchParams?: object | undefined) => {
    loading: boolean;
    data: T | undefined;
    fetch: (params?: any) => Promise<void | T>;
    setData: import("react").Dispatch<import("react").SetStateAction<FetchData<T>>>;
};
/**
 * 在useFetch的基础上快速调用，通过传renderedFetchParams的形式，会自动在useEffect中自己调一次接口
 * @param fetcher 与useFetch的fetcher一样
 * @param renderedFetchParams 首次调用的接口参数
 * @param defaultValue 默认值
 * @returns 与useFetch返回值一致
 */
declare const useFetchAuto: <T extends unknown>(fetcher: Fetcher<T>, renderedFetchParams?: object, defaultValue?: T | undefined) => {
    loading: boolean;
    data: T | undefined;
    fetch: (params?: any) => Promise<void | T>;
    setData: import("react").Dispatch<import("react").SetStateAction<FetchData<T>>>;
};
/**
 * Promise.all方式调取
 * @param fetchers 函数数组 | 函数值对象
 * @param deps fetch useCallback 依赖项数组
 * @return 与fetchers相同数组长度的数组 | 与fetchers key值相对应的对象
 */
declare const useFetchAll: <T extends FetchersAll>(fetchers: T, deps?: DependencyList) => {
    loading: boolean;
    data: FetchAllData<T> | undefined;
    fetch: (params?: any) => Promise<any>;
    setData: import("react").Dispatch<import("react").SetStateAction<FetchData<FetchAllData<T>>>>;
};
export { useFetchAuto, useFetchAll, useFetch };
