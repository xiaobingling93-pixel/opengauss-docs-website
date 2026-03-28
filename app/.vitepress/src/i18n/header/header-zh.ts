import { markRaw } from 'vue';

import IconOutLink from '~icons/app/icon-out-link.svg';
import odd from '@/assets/category/header/odd.png';
import report from '@/assets/category/header/report.png';

const OutLink = markRaw(IconOutLink);

const TAG_TYPE = {
  HOT: 'HOT',
  NEW: 'NEW',
};

export default {
  NAV_ROUTER: [
    {
      NAME: '首页',
      ID: 'home',
    },
    {
      NAME: '下载',
      ID: 'download',
      CHILDREN: [
        {
          NAME: '获取openGauss',
          CHILDREN: [
            {
              NAME: 'openGauss 6.0.2(LTS)',
              DESCRIPTION: 'openGauss 6.0.2 LTS及后续LTS版本发布间隔周期为2年，社区提供3年支持，社区OGSP伙伴提供3年以后维护支持服务。',
              TAG: null,
              URL: '/download/?version=lts',
            },
            {
              NAME: 'openGauss 7.0.0-RC2',
              DESCRIPTION: '社区创新版本联创测试使用，发布间隔周期定为6个月，社区提供6个月维护支持',
              TAG: TAG_TYPE.NEW,
              URL: '/download/?version=rc',
            },
          ],
        },
        {
          NAME: '获取其他资源',
          CHILDREN: [
            {
              NAME: '工具中心',
              DESCRIPTION:
                '主要面向开发者和ISV，提供六大类开发工具、客户端工具、数据导入导出工具、数据复制/同步工具、监控运维接口及工具集、备份恢复接口及工具集、通用数据框架。',
              URL: '/tools/',
            },
          ],
        },
      ],
      SHORTCUT: [
        {
          NAME: '查询全部版本',
          URL: '/download/?version=all',
        },
        {
          NAME: '版本生命周期',
          URL: '/download/life-cycle/',
        },
        {
          NAME: 'openGauss 6.0.1版本安装指南',
          URL: `${import.meta.env.VITE_SERVICE_DOCS_URL}/zh/docs/6.0.0/docs/InstallationGuide/InstallationGuide.html`,
        },
        {
          NAME: '技术白皮书',
          URL: `${import.meta.env.VITE_SERVICE_DOCS_URL}/zh/docs/6.0.0/docs/TechnicalWhitePaper/Technicalwhitepaper.html`,
        },
      ],
    },
    {
      NAME: '开发',
      ID: 'development',
      CHILDREN: [
        {
          NAME: '贡献',
          CHILDREN: [
            {
              NAME: 'CLA签署',
              DESCRIPTION: '参与贡献前，需签署贡献者许可协议（CLA）',
              URL: 'https://clasign.osinfra.cn/sign/gitee_opengauss-1614047760000855378',
              ICON: OutLink,
            },
            {
              NAME: '贡献攻略',
              DESCRIPTION: '参与社区贡献的方式',
              URL: '/contribution/',
            },
          ],
        },
      ],
      SHORTCUT: [
        {
          NAME: '开发者日历',
          URL: '/',
        },
      ],
    },
    {
      NAME: '文档',
      ID: 'document',
      CHILDREN: [
        {
          NAME: '文档中心',
          CHILDREN: [
            {
              NAME: '文档中心',
              DESCRIPTION: '提供各使用场景所需的用户手册',
              TAG: TAG_TYPE.NEW,
              URL: `${import.meta.env.VITE_SERVICE_DOCS_URL}/zh/`,
            },
            {
              NAME: '新手入门',
              DESCRIPTION: '10分钟玩转社区，快速构建与成长',
              URL: `${import.meta.env.VITE_SERVICE_DOCS_URL}/zh/docs/latest/getting_started/understanding_opengauss.html`,
            },
            {
              NAME: '安装指南',
              DESCRIPTION: '指导用户完成 openGauss 数据库安装',
              URL: `${import.meta.env.VITE_SERVICE_DOCS_URL}/zh/docs/latest/installation_guide/installation_overview.html`,
            },
            {
              NAME: '常见问题',
              DESCRIPTION: '常见问题解决方法',
              URL: `${import.meta.env.VITE_SERVICE_DOCS_URL}/zh/docs/common/faq/faq.html`,
            },
            {
              NAME: '文档开发指南',
              DESCRIPTION: '参与文档开发的方式',
              URL: `${import.meta.env.VITE_SERVICE_DOCS_URL}/zh/docs/common/contribute/contribution_process.html`,
            },
          ],
        },
      ],
      SHORTCUT: [
        {
          NAME: '关于openGauss',
          URL: `${import.meta.env.VITE_SERVICE_DOCS_URL}/zh/docs/latest/about_opengauss/about_opengauss.html`,
        },
        {
          NAME: 'DataVec向量数据库',
          URL: `${import.meta.env.VITE_SERVICE_DOCS_URL}/zh/docs/latest/datavec/datavec_overview.html`,
        },
        {
          NAME: 'openGauss DataVec + Dify，快速搭建你的智能助手平台',
          URL: `${import.meta.env.VITE_SERVICE_DOCS_URL}/zh/docs/latest/datavec/opengauss_dify.html`,
        },
        {
          NAME: '数据库管理指南',
          URL: `${import.meta.env.VITE_SERVICE_DOCS_URL}/zh/docs/latest/database_administration_guide/database_concepts.html`,
        },
      ],
    },
    {
      NAME: '学习',
      ID: 'learn',
      CHILDREN: [
        {
          NAME: '视频',
          CHILDREN: [
            {
              NAME: '专题直播',
              DESCRIPTION: '众多大咖精彩课程直播',
              URL: '/video/?id=1',
            },
            {
              NAME: '轻松上手',
              DESCRIPTION: '贯穿openGauss深度学习的基本流程，包括数据处理、模型加载与保存、图模式加速等实践案例',
              URL: '/video/?id=2',
            },
            {
              NAME: '数据库基础',
              DESCRIPTION: '提供数据处理相关增强、缓存、pipeline等功能案例',
              URL: '/video/?id=3',
            },
            {
              NAME: '线下活动',
              DESCRIPTION: '参与线下交流、学习讨论',
              URL: '/video/?id=4',
            },
          ],
        },
        {
          NAME: '开发者成长',
          CHILDREN: [
            {
              NAME: '快速体验',
              DESCRIPTION: 'openGauss官方出品的迷你视频课程',
              URL: '/quick-start/',
            },
            {
              NAME: '学习进阶',
              DESCRIPTION: '开源基础软件学习培训',
              URL: '/advanced/',
            },
            {
              NAME: '大咖之声',
              DESCRIPTION: '了解 openGauss 专家演讲',
              URL: '/bigshot-voice/',
            },
            {
              NAME: '培训认证',
              DESCRIPTION: '欢迎学习HCIA-openGauss华为认证openGauss工程师在线课程',
              URL: '/training/',
            },
          ],
        },
      ],
      SHORTCUT: [
        {
          NAME: '数据库介绍',
          URL: '/video/detail/?id=6-6',
        },
        {
          NAME: '数据库基础知识',
          URL: '/video/detail/?id=6-5',
        },
        {
          NAME: 'SQL语法入门、分类',
          URL: '/video/detail/?id=6-4',
        },
        {
          NAME: 'openGauss联众创新：打造面向企业核心业务开源数据库',
          URL: '/bigshot-voice/',
        },
      ],
    },
    {
      NAME: '支持',
      ID: 'approve',
      CHILDREN: [
        {
          NAME: '认证',
          CHILDREN: [
            {
              NAME: '发行版认证',
              DESCRIPTION: '查看DBV发行版认证结果',
              URL: '/certification/',
            },
            {
              NAME: '服务商认证',
              DESCRIPTION: '查看oGSP服务商认证流程与结果',
              URL: '/ogsp/',
            },
          ],
        },
        {
          NAME: '兼容性专区',
          CHILDREN: [
            {
              NAME: '兼容性列表',
              DESCRIPTION: '查看openGauss兼容性列表',
              URL: '/compatibility/',
            },
            {
              NAME: '兼容性技术测评',
              DESCRIPTION: '帮助企业快速申请兼容性测评',
              ICON: OutLink,
              URL: 'https://gitcode.com/opengauss/compatible-certification',
            },
          ],
        },
        {
          NAME: '迁移',
          CHILDREN: [
            {
              NAME: '迁移专区',
              DESCRIPTION: '了解openGauss迁移方案，获取迁移技术支持',
              URL: '/migration/',
            },
          ],
        },
        {
          NAME: '安全中心',
          CHILDREN: [
            {
              NAME: '漏洞管理',
              DESCRIPTION: 'openGauss漏洞管理与处理流程',
              URL: '/vulnerability-management/',
            },
            {
              NAME: '安全公告',
              DESCRIPTION: 'openGauss安全公告',
              URL: '/security-advisories/',
            },
            {
              NAME: 'CVE',
              DESCRIPTION: 'openGauss CVE公告',
              URL: '/cve/',
            },
          ],
        },
        {
          NAME: 'RAG',
          CHILDREN: [
            {
              NAME: 'RAG专区',
              DESCRIPTION: '了解openGauss在RAG场景的击数生态和适配情况',
              URL: '/ai/',
            }
          ],
        },
      ],
      SHORTCUT: [
        {
          NAME: '迁移实践案例',
          URL: '/migration/case/index.html#migration-evaluate',
        },
        {
          NAME: '前往迁移互动专区',
          URL: 'https://gitcode.com/opengauss/openGauss-workbench',
        },
        {
          NAME: 'MySQL迁移',
          URL: '/member/',
        },
      ],
    },
    {
      NAME: '社区',
      ID: 'community',
      CHILDREN: [
        {
          NAME: '关于社区',
          CHILDREN: [
            {
              NAME: '贡献看板',
              DESCRIPTION: '查看openGauss社区数据',
              URL: 'https://datastat.opengauss.org/zh/overview',
            },
            {
              NAME: '社区荣誉',
              DESCRIPTION: '了解openGauss的荣誉奖项',
              URL: '/honor/',
            },
            {
              NAME: '社区组织',
              DESCRIPTION: '了解openGauss的委员会成员',
              URL: '/member/',
            },
            {
              NAME: '用户案例',
              DESCRIPTION: '了解openGauss在各行业的最佳案例',
              URL: '/user-practice/',
            },
            {
              NAME: '金融专区',
              DESCRIPTION: '基于openGauss的金融解决方案',
              URL: '/finance/',
            },
          ],
        },
        {
          NAME: '社区交流',
          CHILDREN: [
            {
              NAME: '社区论坛',
              DESCRIPTION: '参与开发者讨论openGauss',
              URL: 'https://discuss.opengauss.org/',
            },
            {
              NAME: '线上交流',
              DESCRIPTION: '订阅邮件列表，与SIG成员讨论openGauss的技术与进展',
              URL: '/online-communication/',
            },
          ],
        },
      ],
      SHORTCUT: [
        {
          NAME: '专项兴趣小组（SIG）',
          URL: '/member/',
        },
        {
          NAME: 'openGauss 社区突出贡献单位',
          URL: '/honor/',
        },
        {
          NAME: '单位会员贡献',
          URL: 'https://datastat.opengauss.org/zh/detail',
        },
      ],
    },
    {
      NAME: '动态',
      ID: 'update',
      WITH_PICTURE: true,
      CHILDREN: [
        {
          NAME: '活动',
          CHILDREN: [
            {
              NAME: '活动',
              DESCRIPTION: '了解openGauss社区全年活动',
              URL: '/events/',
            },
            {
              NAME: '峰会',
              DESCRIPTION: '查看openGauss年度大会详情',
              URL: '/summit/devday2025/',
            },
            {
              NAME: '结队计划',
              DESCRIPTION: '获取社区结队技术支持',
              URL: '/team-up/',
            },
            {
              NAME: 'Call for Meetup',
              DESCRIPTION: '开发者活动共创',
              URL: '/call-for-meetup/',
            },
          ],
        },
        {
          NAME: '资讯',
          CHILDREN: [
            {
              NAME: '新闻',
              DESCRIPTION: '查看openGauss社区动态',
              URL: '/news/',
            },
            {
              NAME: '博客',
              DESCRIPTION: '查看openGauss技术文章分享',
              URL: '/blogs/',
            },
          ],
        },
      ],
      SHORTCUT: [
        {
          NAME: 'openGauss Developer Day 2025',
          PICTURE: odd,
          DESCRIPTION: '',
          REMARK: '时间：2025/06/27 | 北京',
          TYPE: 'PICTURE',
          URL: '/summit/devday2025/',
        },
        {
          NAME: '汇聚数据库创新力量，引领智能时代新未来',
          PICTURE: report,
          DESCRIPTION: '',
          REMARK: '时间：2024/12/27 | 北京',
          TYPE: 'PICTURE',
          URL: '/summit/summit2024/',
        },
      ],
    },
  ],
  MORE: '更多',
  QUICKLINK: '快捷链接',
  CODE: '源码',
  SEARCH: {
    BROWSEHISTORY: '历史记录',
    CLEAN: '清除',
    TOPSEARCH: '热门搜索',
    CHANGE: '换一批',
    PLEACHOLDER: '搜索',
    PLEACHOLDER_EXTEND: '请输入搜索内容',
    TEXT: '搜索',
  },
  SOURCE_CODE: [
    {
      NAME: 'GitCode',
      PATH: 'https://gitcode.com/opengauss',
      ICON: OutLink,
    },

    {
      NAME: 'Github',
      PATH: 'https://github.com/opengauss-mirror',
      ICON: OutLink,
    },
  ],
};
