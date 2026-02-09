import { MINDSPORE_LINK, KUNPENG_LINK, BBSCSDN_LINK, EULER_EN_LINK, OPENUBMC_URL, OPENFUYAO_URL } from '@/config/urls';

export default {
  FOOTER_NAVS: [
    {
      NAME: '关于openGauss',
      LINKS: [
        {
          NAME: '社区组织',
          URL: '/zh/member/',
        },
        {
          NAME: '社区荣誉',
          URL: '/zh/honor/',
        },
        {
          NAME: '贡献看板',
          URL: 'https://datastat.opengauss.org/zh/overview',
        },
      ],
    },
    {
      NAME: '新闻与资讯',
      LINKS: [
        {
          NAME: '新闻',
          URL: '/zh/news/',
        },
        {
          NAME: '博客',
          URL: '/zh/blogs/',
        },
        {
          NAME: '技术白皮书',
          URL: 'https://docs.opengauss.org/zh/docs/6.0.0/docs/TechnicalWhitePaper/Technicalwhitepaper.html',
        },
      ],
    },
    {
      NAME: '获取与下载',
      LINKS: [
        {
          NAME: '获取软件包',
          URL: '/zh/download/',
        },
        {
          NAME: '工具中心',
          URL: '/zh/tools/',
        },
        {
          NAME: '全部版本',
          URL: '/zh/download/?version=all',
        },
      ],
    },
    {
      NAME: '支持与服务',
      LINKS: [
        {
          NAME: '文档中心',
          URL: 'https://docs.opengauss.org/zh/',
        },
        {
          NAME: '常见问题',
          URL: '/zh/faq/',
        },
        {
          NAME: '安全公告',
          URL: '/zh/security-advisories/',
        },
      ],
    },
    {
      NAME: '互动与交流',
      LINKS: [
        {
          NAME: '线上交流',
          URL: '/zh/online-communication/',
        },
        {
          NAME: '活动',
          URL: '/zh/events/',
        },
        {
          NAME: '社区论坛',
          URL: 'https://discuss.opengauss.org/',
        },
      ],
    },
    {
      NAME: '贡献与成长',
      LINKS: [
        {
          NAME: '贡献攻略',
          URL: '/zh/contribution/',
        },
        {
          NAME: '视频',
          URL: '/zh/video/',
        },
      ],
    },
  ],
  FRIENDLY_LINKS: [
    {
      NAME: 'openEuler',
      URL: `${EULER_EN_LINK}/zh/`,
    },
    {
      NAME: '昇思MindSpore',
      URL: `${MINDSPORE_LINK}en/`,
    },
    {
      NAME: 'openUBMC',
      URL: OPENUBMC_URL,
    },
    {
      NAME: 'openFuyao',
      URL: OPENFUYAO_URL,
    },
    {
      NAME: '鲲鹏社区',
      URL: `${KUNPENG_LINK}en/`,
    },
    {
      NAME: 'Gauss 松鼠会',
      URL: `${BBSCSDN_LINK}forums/gaussdb`,
    },
  ],
  OPTIONS: [
    {
      NAME: `品牌`,
      URL: `/zh/brand/`,
      TARGET: `_blank`,
    },
    {
      NAME: `隐私声明`,
      URL: `/zh/privacy/`,
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
      URL: `/zh/about-us/`,
      TARGET: `_blank`,
    },
  ],
  COPY_RIGHT: `版权所有 ©  openGauss {year} 保留一切权利`,
  OFFICIAL_ACCOUNT: 'openGauss公众号',
  LINK_TITLE: '友情链接',
};
