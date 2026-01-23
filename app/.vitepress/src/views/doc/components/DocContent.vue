<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, onUpdated, watch } from 'vue';
import { useRoute, useRouter } from 'vitepress';
import { useMessage } from '@opensig/opendesign';

import DocPagination from './DocPagination.vue';
import DocViewSource from './DocViewSource.vue';
import DocBug from './DocBug.vue';

import { useLocale } from '@/composables/useLocale';
import { useVersionStore } from '@/stores/version';
import { useViewStore } from '@/stores/view';

const emits = defineEmits<{
  (evt: 'update-menu-expaned'): void;
  (evt: 'change-anchor', value: string): void;
  (evt: 'page-change', type: 'prev' | 'next'): void;
  (evt: 'click-hash-link'): void;
}>();

const viewStore = useViewStore();

// -------------------- 处理跨语言、跨指南跳转 --------------------
const router = useRouter();
const versionStore = useVersionStore();

router.onBeforeRouteChange = (to) => {
  const [_1, _2, maybeLite, maybeLange, ...paths] = to.split('/');
  
  // 企业版跳轻量版
  if (maybeLite === 'docs-lite') {
    router.go(`/${maybeLange}/docs/${versionStore.prefixVersion}-lite/${paths.join('/')}`);
    return false;
  }

  // 中文跳英文页面
  if (maybeLange === 'zh' || maybeLange === 'en') {
    const [_4, _5, _6, version] = window.location.pathname.split('/');
    router.go(`/${maybeLange}/docs/${version}/${paths.join('/')}`);
    return false;
  }
  return true;
};

// -------------------- 代码块复制 --------------------
const { t } = useLocale();
const message = useMessage(null);
const route = useRoute();

const popMessage = () => {
  message.success({ content: t('docs.copySuccess') });
};

const copyDoc = () => {
  const buttonCopy = Array.from(document.querySelectorAll('.copy'));
  for (let index = 0; index < buttonCopy.length; index++) {
    buttonCopy[index].addEventListener('click', popMessage);
  }
};

watch(
  () => route.path,
  async () => {
    await nextTick();
    copyDoc();
  }
);

onMounted(() => {
  copyDoc();
});

onUpdated(() => {
  copyDoc();
});

onBeforeUnmount(() => {
  const buttonCopy = Array.from(document.querySelectorAll('.copy'));
  for (let index = 0; index < buttonCopy.length; index++) {
    buttonCopy[index].removeEventListener('click', popMessage);
  }
});
</script>

<template>
  <div class="doc-body">
    <Content class="markdown-body" />
    <DocViewSource />
    <ClientOnly>
      <DocPagination @page-change="(type) => emits('page-change', type)" />
    </ClientOnly>
  </div>
  <ClientOnly>
    <DocBug v-if="!viewStore.isNoMenuView" />
  </ClientOnly>
</template>

<style lang="scss" scoped>
.doc-body {
  position: relative;
  min-height: var(--layout-doc-content-min-height);
  padding-top: var(--layout-doc-content-padding-top);
  padding-right: var(--layout-doc-content-padding-right);
  padding-bottom: var(--layout-doc-content-padding-bottom);
  padding-left: var(--layout-doc-content-padding-left);
  border-radius: var(--o-radius-xs);
  background: var(--o-color-fill2);
  display: flex;
  flex-direction: column;
  max-width: 100%;
}
</style>
