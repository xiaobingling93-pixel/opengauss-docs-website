import { GAUSS_EMAIL } from '@/config/urls';

export default {
  USER_CENTER: `个人中心`,
  LOGOUT: `退出登录`,
  NOTIFICATIONS: '消息中心',
  FOOTER: {
    MAIL: GAUSS_EMAIL,
    COPY_RIGHT: `版权所有 ©  openGauss {year} 保留一切权利`,
    RIGHT_LIST: [
      {
        NAME: `品牌`,
        URL: `/zh/brand/`,
        TARGET: `_blank`,
      },
      {
        NAME: `隐私声明`,
        URL: `/zh/privacyPolicy/`,
        TARGET: `_blank`,
      },
      {
        NAME: `法律声明`,
        URL: `/zh/legal/`,
        TARGET: `_blank`,
      },
      {
        NAME: `关于cookies`,
        URL: `/zh/cookies/`,
        TARGET: `_blank`,
      },
      {
        NAME: `关于我们`,
        URL: `/zh/aboutUs/`,
        TARGET: `_blank`,
      },
    ],
    QR_CODE: `扫码关注公众号`,
  },

  docCenter: '文档中心',
  returnHome: '返回首页',
  empty: '暂无数据',
};
