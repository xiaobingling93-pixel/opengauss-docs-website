<script setup lang="ts">
import { useRoute, useRouter } from 'vitepress';
import { OPlusConfigProvider, OCookieNotice } from '@opendesign-plus/components';
import { OScroller, OConfigProvider } from '@opensig/opendesign';
import zhCN from '@opensig/opendesign/es/locale/lang/zh-cn';
import enUS from '@opensig/opendesign/es/locale/lang/en-us';

import AppHeader from '@/components/header/AppHeader.vue';
import TheDoc from '@/views/doc/TheDoc.vue';

import { scrollToTop } from '@/utils/common';
import { useLocale } from '@/composables/useLocale';
import { useViewStore } from '@/stores/view';
import { nextTick, ref, watch } from 'vue';

const { isZh, locale } = useLocale();
const viewStore = useViewStore();

const router = useRouter();
router.onAfterRouteChange = () => {
  scrollToTop(0, false);
};

const COOKIE_DOMAIN = import.meta.env.VITE_COOKIE_DOMAIN;
const HOME_URL = 'https://opengauss.org';
const cookieNoticeVisible = ref(false);
const cookieRef = ref();
const route = useRoute();
watch(
  () => route.path,
  async () => {
    await nextTick();
    cookieRef.value?.check();
  }
);
</script>

<template>
  <OConfigProvider :locale="isZh ? zhCN : enUS">
    <ClientOnly>
      <AppHeader class="ly-header" :class="{ 'ly-header-hidden': !viewStore.isPageLoaded }" />
    </ClientOnly>
    <OScroller show-type="hover" disabled-x auto-update-on-scroll-size>
      <main class="ly-main" :class="{ 'ly-main-hidden': !viewStore.isPageLoaded }">
        <Content v-if="viewStore.isHomeView || viewStore.isCustomView" />
        <TheDoc v-else />
      </main>
    </OScroller>
    <OPlusConfigProvider :locale="locale">
      <OCookieNotice
        ref="cookieRef"
        community="openGauss"
        v-model:visible="cookieNoticeVisible"
        :detail-url="`${HOME_URL}/${locale}/cookies/`"
        :cookie-domain="COOKIE_DOMAIN"
      />
    </OPlusConfigProvider>
  </OConfigProvider>
</template>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--o-color-fill1);
  color: var(--o-color-info1);

  --vw100: 100vw;

  --layout-header-height: 72px;
  --layout-header-zIndex: 101;
  --layout-header-max-width: 1568px;
  --layout-header-padding: 40px;
  --layout-header-breadcrumb-height: 24px;
  --layout-header-breadcrumb-margin-bottom: 24px;

  --layout-content-max-width: 1568px;
  --layout-content-padding: 40px;

  --layout-doc-padding-top: 32px;
  --layout-doc-padding-bottom: 24px;

  --layout-footer-height: 474px;
  --layout-screen-height: 100vh;
  --layout-content-min-height: calc(var(--layout-screen-height) - var(--layout-header-height));

  @include respond-to('<=laptop') {
    --layout-header-height: 64px;
    --layout-header-max-width: 100%;
    --layout-header-padding: 97px;
    --layout-header-breadcrumb-height: 18px;
    --layout-content-max-width: 100%;
    --layout-content-padding: 97px;
    --layout-footer-height: 438px;
  }

  @include respond-to('<=pad') {
    --layout-header-height: 56px;
    --layout-header-padding: 32px;
    --layout-content-padding: 32px;
    --layout-footer-height: 434px;
  }

  @include respond-to('<=pad_v') {
    --layout-header-height: 48px;
  }

  @include respond-to('phone') {
    --layout-header-padding: 24px;
    --layout-content-padding: 24px;
  }
}
</style>

<style lang="scss" scoped>
.o-scroller {
  height: var(--layout-content-min-height);
  background-color: var(--o-color-fill1);
}

.ly-header,
.ly-main {
  transition: opacity var(--o-duration-m2) var(--o-easing-standard-in);
}

.ly-header-hidden {
  opacity: 0;
}

.ly-main {
  background-color: var(--o-color-fill1);
}

.ly-main-hidden {
  opacity: 0;
}
</style>
