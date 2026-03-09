import Cookies from 'js-cookie';

import { useLoginStore, useUserInfoStore } from '@/stores/user';
import { getUserIdToken, getUserInfo } from '@/api/api-user';

// 登录状态
export enum LOGIN_STATUS {
  FAILED = -1, // 登录失败
  NOT = 0, // 未登录
  DOING = 1, // 登录中
  DONE = 2, // 登录成功
}

export type LoginStatusT = typeof LOGIN_STATUS.FAILED | LOGIN_STATUS.NOT | LOGIN_STATUS.DOING | LOGIN_STATUS.DONE;

export const LOGIN_KEYS = {
  CSRF_TOKEN: import.meta.env.VITE_XSRF_COOKIE_NAME,
};

// 清除用户认证凭据
export function clearUserAuth() {
  // 清除内存中用户信息
  useUserInfoStore().$reset();
  useLoginStore().setLoginStatus(LOGIN_STATUS.NOT);
  // 清除cookie
  Cookies.remove(LOGIN_KEYS.CSRF_TOKEN, { path: '/', domain: import.meta.env.VITE_COOKIE_DOMAIN });
}

// 退出
export async function doLogout() {
  try {
    const idTokenRes = await getUserIdToken();
    if (idTokenRes.code === 200) {
      clearUserAuth();
      window.location.href = location.href;
    }
  } catch {
    /* empty */
  }
}

// authing认证登录
export async function doLogin() {
  location.href = `${import.meta.env.VITE_LOGIN_URL}/login?redirect_uri=${encodeURIComponent(location.href)}&lang=${location.pathname.includes('/zh/') ? 'zh' : 'en'}`;
}

// 尝试登录
export async function requestUserInfo() {
  const userInfoStore = useUserInfoStore();
  const loginStore = useLoginStore();
  if (!Cookies.get(LOGIN_KEYS.CSRF_TOKEN)) {
    clearUserAuth();
    loginStore.setLoginStateChecked(true);
    return;
  }

  try {
    loginStore.setLoginStatus(LOGIN_STATUS.DOING);
    const res = await getUserInfo();
    if (res.data.username) {
      userInfoStore.$patch(res.data);
      loginStore.setLoginStatus(LOGIN_STATUS.DONE);
    } else {
      clearUserAuth();
      loginStore.setLoginStatus(LOGIN_STATUS.FAILED);
    }
  } catch {
    loginStore.setLoginStatus(LOGIN_STATUS.FAILED);
  } finally {
    loginStore.setLoginStateChecked(true);
  }
}
