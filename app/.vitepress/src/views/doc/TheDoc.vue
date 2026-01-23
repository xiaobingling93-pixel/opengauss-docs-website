<script setup lang="ts">
import { computed, watch } from 'vue';

import DocBreadCrumb from './components/DocBreadCrumb.vue';
import DocSearchResult from './components/DocSearchResult.vue';
import DocContent from './components/DocContent.vue';
import DocFooter from './components/DocFooter.vue';
import DocSider from './components/DocSider.vue';
import DocAnchor from './components/DocAnchor.vue';
import DocFloat from './components/DocFloat.vue';

import { useSearchingStore } from '@/stores/common';
import { useScreen } from '@/composables/useScreen';
import { useViewStore } from '@/stores/view';
import { useNodeStore } from '@/stores/node';

const { isPhone, lePad } = useScreen();
const searchStore = useSearchingStore();
const viewStore = useViewStore();
const nodeStore = useNodeStore();

const docSiderWidth = computed(() => {
  return lePad.value ? `272px` : `${viewStore.siderWidth}px`;
});

watch(
  () => nodeStore.currentNode,
  (val) => {
    viewStore.isNoMenuView = !val;
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div class="ly-container">
    <!-- 文档左侧内容 -->
    <DocSider />

    <!-- 文档右侧内容 -->
    <div class="ly-doc">
      <ClientOnly>
        <DocBreadCrumb v-if="!isPhone" />
      </ClientOnly>
      <DocSearchResult v-if="searchStore.isSearching" />
      <DocContent v-else />
      <DocFooter />
    </div>

    <ClientOnly>
      <!-- 锚点 -->
      <DocAnchor v-if="!searchStore.isSearching && !isPhone" />
      <!-- 悬浮组件 -->
      <DocFloat />
    </ClientOnly>
  </div>
</template>

<style lang="scss">
.ly-container {
  --layout-doc-content-max-width: 1262px;
  --layout-doc-content-padding-top: 32px;
  --layout-doc-content-padding-right: 70px;
  --layout-doc-content-padding-bottom: 32px;
  --layout-doc-content-padding-left: 32px;

  // 菜单左间距
  --layout-doc-menu-offset-left: max(calc(64px + (var(--vw100) - 1920px) / 2), 64px);
  // 菜单宽度
  --layout-doc-menu-width: v-bind(docSiderWidth);
  // 菜单文档间距
  --layout-doc-menu-gap: 32px;

  // 锚点宽度
  --layout-doc-anchor-width: 194px;
  // 锚点顶部间距
  --layout-doc-anchor-top: 160px;
  // 锚点文档间距
  --layout-doc-anchor-gap: 32px;
  // 锚点右间距
  --layout-doc-anchor-offset-right: max(calc(64px + (var(--vw100) - 1920px) / 2), 64px);

  // 文档左间距
  --layout-doc-offset-left: calc(var(--layout-doc-menu-width) + var(--layout-doc-menu-offset-left) + var(--layout-doc-menu-gap));
  // 文档右间距
  --layout-doc-offset-right: calc(var(--layout-doc-anchor-width) + var(--layout-doc-anchor-offset-right) + var(--layout-doc-anchor-gap));

  // 文档内容最小高度
  --layout-doc-content-min-height: calc(
    100vh - var(--layout-header-height) - var(--layout-doc-padding-top) - var(--layout-doc-padding-bottom) - var(--layout-header-breadcrumb-height) - var(
        --layout-header-breadcrumb-margin-bottom
      ) - var(--layout-doc-content-padding-top)
  );

  @include respond-to('<=laptop') {
    --layout-doc-content-max-width: 992px;
    --layout-doc-content-padding-top: 24px;
    --layout-doc-content-padding-right: 40px;
    --layout-doc-content-padding-bottom: 24px;
    --layout-doc-content-padding-left: 40px;
    --layout-doc-menu-offset-left: max(calc(40px + (var(--vw100) - 1920px) / 2), 40px);
    --layout-doc-menu-gap: 24px;
    --layout-doc-anchor-width: 218px;
    --layout-doc-anchor-top: 154px;
    --layout-doc-offset-right: 112px;
  }

  @include respond-to('<=pad') {
    --layout-doc-content-max-width: 1076px;
    --layout-doc-content-padding-top: 12px;
    --layout-doc-content-padding-right: 40px;
    --layout-doc-content-padding-bottom: 12px;
    --layout-doc-content-padding-left: 40px;
    --layout-doc-menu-offset-left: max(calc(2px + (var(--vw100) - 1920px) / 2), 32px);
    --layout-doc-menu-gap: 32px;
    --layout-doc-offset-left: var(--layout-doc-menu-gap);
    --layout-doc-offset-right: 92px;
    --layout-doc-width: min(1200px, calc(var(--vw100) - var(--layout-doc-menu-offset-left) - var(--layout-doc-offset-right)));
  }
  @include respond-to('phone') {
    --layout-doc-content-padding-top: 12px;
    --layout-doc-content-padding-right: 12px;
    --layout-doc-content-padding-bottom: 12px;
    --layout-doc-content-padding-left: 12px;
    --layout-doc-menu-offset-left: max(calc(24px + (var(--vw100) - 1920px) / 2), 24px);
    --layout-doc-menu-gap: 24px;
    --layout-doc-offset-left: var(--layout-doc-menu-gap);
    --layout-doc-offset-right: var(--layout-doc-menu-gap);
    --layout-doc-width: min(1200px, calc(var(--vw100) - var(--layout-doc-menu-offset-left) * 2));
  }
}
</style>

<style lang="scss" scoped>
.ly-doc {
  flex: 1;
  padding-top: var(--layout-doc-padding-top);
  padding-bottom: var(--layout-doc-padding-bottom);
  margin-left: var(--layout-doc-offset-left);
  margin-right: var(--layout-doc-offset-right);
  max-width: var(--layout-doc-content-max-width);

  @include respond-to('phone') {
    padding-top: calc(var(--layout-doc-padding-top) + 40px);
  }
}

.ly-doc-no-menu {
  max-width: var(--layout-doc-content-max-width);
  margin: 0 auto;
}
</style>
