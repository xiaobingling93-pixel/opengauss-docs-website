import type { App } from 'vue';
import { createPinia } from 'pinia';
import VueDOMPurifyHTML from 'vue-dompurify-html';

import Layout from '@/App.vue';
import NotFound from '@/NotFound.vue';

import '@/assets/style/base.scss';
import '@/assets/style/grid.scss';
import 'element-plus/theme-chalk/src/index.scss';
import '@opensig/opendesign/es/index.scss';
import '@/assets/style/theme/default-light.token.css';
import '@/assets/style/theme/dark.token.css';
import '@/assets/style/markdown.scss';
import '@/assets/style/theme/index.scss';
import '@/assets/style/global.scss';
import '@/assets/style/element-plus/index.scss';

import MarkdownTitle from '@/components/markdown/MarkdownTitle.vue';
import MarkdownImage from '@/components/markdown/MarkdownImage.vue';
import { installer } from '@/shared/analytics';
import { removeCustomCookie } from '@/utils/cookie';
import { BAIDU_HM } from '@/config/urls';
import { request } from '@/shared/axios';

export default {
  Layout,
  NotFound,
  enhanceApp({ app }: { app: App }) {
    app.use(createPinia());
    app.use(VueDOMPurifyHTML, {
      default: {
        ADD_ATTR: ['target'],
      },
    });

    // 注册组件
    app.component('MarkdownTitle', MarkdownTitle);
    app.component('MarkdownImage', MarkdownImage);

    app.use(installer, {
      appKey: 'openGauss',
      service: 'docs',
      request(data) {
        request.post('/api-dsapi/query/track/opengauss', data, { showError: false });
      },
      onEnable() {
        // 百度埋点
        const s = document.createElement('script');
        s.src = BAIDU_HM;
        s.classList.add('analytics-script');
        const head = document.getElementsByTagName('HEAD')[0];
        head.appendChild(s);
      },
      onDisable() {
        const scripts = document.querySelectorAll('script.analytics-script');
        scripts.forEach((script) => {
          script.remove();
        });

        const hm = /^hm/i;
        document.cookie
          .split(';')
          .map((c) => c.trim())
          .forEach((c) => {
            const key = decodeURIComponent(c.split('=')[0]);
            if (hm.test(key)) {
              removeCustomCookie(key);
            }
          });
        [sessionStorage, localStorage].forEach((storage) => {
          const keys = [];
          for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i)!;
            if (hm.test(key)) {
              keys.push(key);
            }
          }
          keys.forEach((key) => storage.removeItem(key));
        });
      },
    });
  },
};
