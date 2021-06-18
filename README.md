# use-fetch

react use-fetch hook

## 安装

> 注意：使用了`react hooks`，所以要求在`react>=16.8.0`版本中使用。

``` bash
npm install --save wolf-use-fetch
```

## 使用

### useFetch

需要一个必须的`fetcher`参数，`fetcher`是一个函数，返回一个`Promise`，`Promise`的`resolve`的值（一般就指接口返回值）就是`useFetch hook`返回的对象中的`data`。

+ 调用形式

``` ts
const {data, loading, setData, fetch} = useFetch(fetcher, defaultValue, deps, renderedFetchParams);
```

+ 参数说明

| 参数 | 说明 | 类型 | 默认值 | 是否必填 |
| -- | -- | -- | -- | -- |
| `fetcher` | `fetcher`是一个函数，返回一个`Promise`，`Promise`的`resolve`的值（一般就指接口返回值）就是`useFetch hook`返回的对象中的`data`。 | `(paramsObj?: any) => Promise` | - | 是 |
| `defaultValue` | 默认值 | `any` | - | - |
| `deps` | `fetch`内部被`useCallback`包裹的依赖项数组 | `any[]` | `[]` | - |
| `renderedFetchParams` | 首次`useEffect`的调用参数，不传则跳过 | `any` | - | - |

+ 返回结构说明：

| key | 说明 |
| -- | -- |
| `data` | `fetcher` 返回的 `Promise` 的 `resolve` 的值（一般就指接口返回值）。 |
| `loading` | 接口`loading`。|
| `setData` | 外部手动设置值。 |

+ Demo

``` tsx
import React, { useEffect } from 'react';
import { Spin } from 'antd';
import useFetch from 'wolf-use-fetch';
import axios from 'axios';

interface IProps {
}

const fetcher = params =>
  axios.get('/apis/an_api_url', { params }).then(res => res.data);

const Demo = (props: IProps) => {
  const { data, loading, fetch, setData } = useFetch(fetcher);

  useEffect(() => {
    fetch({
      params: 1
    });
  }, []);

  const onManual = () => {
    setData({
      result: 'an_api_url_result'
    })
  };

  return (
    <Spin spinning={loading}>
      <div>{JSON.stringify(data)}</div>
      <div onClick={onManual}>手动设置值</div>
    </Spin>
  );
};

export default Demo;
```

### useFetchAuto

实际是`useFetch`的语法糖。在`useFetch`的基础上自动执行首次`useEffect`时的调用，需要传首次调用的参数。返回与`useFetch`一样。

+ 调用形式

``` ts
const {data, loading, setData, fetch} = useFetchAuto(fetcher, renderedFetchParams, defaultValue);
```

+ 参数说明

参考`useFetch`。

+ 返回结构说明：

参考`useFetch`。

+ Demo

``` tsx
import React, { useEffect } from 'react';
import { Spin } from 'antd';
import useFetch, { useFetchAuto } from 'wolf-use-fetch';
import axios from 'axios';

interface IProps {
}

const fetcher = params =>
  axios.get('/apis/an_api_url', { params }).then(res => res.data);

const Demo = (props: IProps) => {
  const { data, loading, fetch } = useFetchAuto(fetcher, {params: 1});

  return (
    <Spin spinning={loading}>
      <div>{JSON.stringify(data)}</div>
    </Spin>
  );
};

export default Demo;

```
### useFetchAll

一些可以一起发起的异步接口就很适合用`useFetchAll`。内部会用`Promise.all`调用传入的`fetchers`数组。使用跟`useFetch`大同小异，区别在于返回的值是按照`Promise.all`的返回形式，是个有顺序的数组。也可以是一个`key`值对象，返回会按照`key`值返回。

+ 调用形式

``` ts
const {data, loading, setData, fetch} = useFetchAll(fetchers, deps);
```

+ 参数说明

| 参数 | 说明 | 类型 | 默认值 | 是否必填 |
| -- | -- | -- | -- | -- |
| `fetchers` | `fetchers`是一个`fetcher`数组或者一个`fetcher`对象。 | `((paramsObj?: any) => Promise)[] 或 {[key: string]: (paramsObj?: any) => Promise}` | - | 是 |
|`deps` | `fetch`内部被`useCallback`包裹的依赖项数组 | `any[]` | `[]` | - |

+ 返回结构说明：

| key | 说明 |
| -- | -- |
| data | 接口返回值的顺序 与传入`useFetchAll`的`fetchers`的顺序一致，或者`key`值对应。 |
| loading | 接口`loading`。|
| setData | 外部手动设置值。 |

+ Demo

``` tsx
import React, { useState, useEffect, useCallback } from 'react';
import {useFetchAll} from 'wolf-use-fetch';
import { Spin } from 'antd';

interface IProps {
}

const fetcher1 = params =>
  axios.get('/apis/first_api_url', { params }).then(res => res.data);

const fetcher2 = params =>
  axios.get('/apis/twice_api_url', { params }).then(res => res.data);

const Demo = (props: IProps) => {
  // 数组形式
  const {data: data1 = [], loading: loading1, fetch: fetchData1} = useFetchAll([
    fetcher1,
    fetcher2
  ]);

  // 对象形式
  const {data: data2 = [], loading: loading2, fetch: fetchData2} = useFetchAll({
    fetcher1,
    fetcher2,
  });

  // 接口返回值的顺序 与传入useFetchAll的fetchers的顺序一致，这是Promise.all的逻辑
  const [
    fetcherArrayData1,
    fetcherArrayData2,
  ] = data1;

  // 接口返回值也是个对象 与传入useFetchAll的fetchers的key值对应
  const {
    fetcher1: fetcherObjectData1,
    fetcher2: fetcherObjectData2
   } = data2;

  useEffect(() => {
    // 调用参数也是个数组，传入的顺序也与传入useFetchAll的fetchers的顺序一致
    fetchData1([
      {fetcher1_params: 1}, // fetcher1的参数
      {fetcher1_params: 1}, // fetcher2的参数
    ]);
  
    // 调用参数也是个对象，传入的key值与传入useFetchAll的fetchers key值对应
    fetchData2({
      fetcher1: {fetcher1_params: 1}, // fetcher1的参数
      fetcher2: {fetcher2_params: 1}, // fetcher2的参数
    });
  }, []);

  return (
    <Spin spinning={loading1 || loading2}>
      {JSON.stringify(fetcherArrayData1)}
      {JSON.stringify(fetcherArrayData2)}
      {JSON.stringify(fetcherObjectData2)}
      {JSON.stringify(fetcherObjectData2)}
    </Spin>
  );
};

```



