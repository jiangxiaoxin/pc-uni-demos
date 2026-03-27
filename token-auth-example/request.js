/**
 * 双 Token 认证前端封装
 * 使用 Axios 拦截器实现自动刷新和请求队列管理
 */

import axios from 'axios';

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
});

// ========== Token 管理 ==========
const tokenStorage = {
  getAccessToken() {
    return localStorage.getItem('accessToken');
  },
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// ========== 刷新状态管理 ==========
let isRefreshing = false; // 是否正在刷新 token
let refreshSubscribers = []; // 等待刷新完成的请求队列

/**
 * 将请求加入队列，等待刷新完成
 */
function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

/**
 * 刷新完成后，通知队列中的所有请求
 */
function notifySubscribers(newToken) {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = []; // 清空队列
}

/**
 * 刷新失败，拒绝队列中的所有请求
 */
function rejectSubscribers(error) {
  refreshSubscribers.forEach(callback => callback(null, error));
  refreshSubscribers = []; // 清空队列
}

/**
 * 执行刷新 Token 请求
 */
async function doRefreshToken() {
  const refreshToken = tokenStorage.getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('没有 Refresh Token');
  }

  try {
    const response = await axios.post('http://localhost:3001/api/refresh', {
      refreshToken
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    
    // 保存新 token
    tokenStorage.setTokens(accessToken, newRefreshToken);
    
    console.log('✅ Token 刷新成功');
    return accessToken;
  } catch (error) {
    // 刷新失败，清除 token
    tokenStorage.clearTokens();
    
    // 提示错误
    const message = error.response?.data?.message || '登录已过期，请重新登录';
    console.error('❌ Token 刷新失败:', message);
    alert(message); // 实际项目中可以使用更优雅的提示方式
    
    // 可以在这里触发跳转到登录页
    // window.location.href = '/login';
    
    throw error;
  }
}

// ========== 请求拦截器 ==========
request.interceptors.request.use(
  (config) => {
    // 添加 Access Token 到请求头
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========== 响应拦截器 ==========
request.interceptors.response.use(
  // 响应成功
  (response) => {
    return response.data;
  },
  
  // 响应失败
  async (error) => {
    const originalRequest = error.config;
    
    // 如果没有配置信息，直接抛出错误
    if (!originalRequest) {
      return Promise.reject(error);
    }
    
    // 判断是否是 Token 过期（401001 是后端定义的特殊错误码）
    const isTokenExpired = error.response?.status === 401 && 
                           error.response?.data?.code === 401001;
    
    // 如果不是 Token 过期，直接抛出错误
    if (!isTokenExpired) {
      return Promise.reject(error);
    }
    
    // ========== Token 过期处理 ==========
    
    // 标记这个请求已经处理过刷新，避免无限循环
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // 情况1：正在刷新中，将请求加入队列等待
    if (isRefreshing) {
      console.log('⏳ 等待 Token 刷新完成:', originalRequest.url);
      
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((newToken, error) => {
          if (error) {
            // 刷新失败，拒绝这个请求
            reject(error);
          } else {
            // 刷新成功，重试请求
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(request(originalRequest));
          }
        });
      });
    }
    
    // 情况2：开始刷新 Token
    isRefreshing = true;
    originalRequest._retry = true;
    
    try {
      console.log('🔄 开始刷新 Token...');
      const newToken = await doRefreshToken();
      
      // 刷新成功，通知队列中的所有请求
      notifySubscribers(newToken);
      isRefreshing = false;
      
      // 重试当前请求
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      return request(originalRequest);
      
    } catch (refreshError) {
      // 刷新失败，拒绝队列中的所有请求
      rejectSubscribers(refreshError);
      isRefreshing = false;
      
      return Promise.reject(refreshError);
    }
  }
);

// ========== API 封装 ==========

export const authAPI = {
  // 登录
  async login(username, password) {
    const response = await request.post('/api/login', { username, password });
    if (response.code === 200) {
      const { accessToken, refreshToken } = response.data;
      tokenStorage.setTokens(accessToken, refreshToken);
    }
    return response;
  },
  
  // 退出登录
  async logout() {
    const refreshToken = tokenStorage.getRefreshToken();
    const response = await request.post('/api/logout', { refreshToken });
    tokenStorage.clearTokens();
    return response;
  }
};

export const userAPI = {
  // 获取用户信息
  getInfo() {
    return request.get('/api/user/info');
  }
};

export const dataAPI = {
  // 获取列表
  getList() {
    return request.get('/api/data/list');
  },
  
  // 提交数据
  submit(content) {
    return request.post('/api/data/submit', { content });
  }
};

// 导出请求实例和 token 管理
export { request, tokenStorage };
export default request;
