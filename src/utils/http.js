import axios from 'axios-miniprogram';

const request = axios.create({
  baseURL: process.env.TARO_APP_BASE_URL,
  timeout: 10000, // 请求超时设置
  withCredentials: false, // 跨域请求是否需要携带 cookie
});

// 创建请求拦截
request.interceptors.request.use(
  (config) => {
    // config.headers["Authorization"] = localStorage.getItem("token"); // 请求头携带 token
    // 设置请求头
    config.headers["content-type"] = "application/json"; // 默认类型
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// 创建响应拦截
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    return res;
  },
  (error) => {
    // do something with response error
    return Promise.reject(error);
  }
);

export default request;
