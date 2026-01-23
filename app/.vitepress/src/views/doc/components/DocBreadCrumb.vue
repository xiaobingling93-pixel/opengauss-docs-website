<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vitepress';
import { OBreadcrumb, OBreadcrumbItem, OIcon } from '@opensig/opendesign';

import IconChevronRight from '~icons/app/icon-chevron-right.svg';

import { useLocale } from '@/composables/useLocale';
import { useSearchingStore } from '@/stores/common';
import { useNodeStore } from '@/stores/node';
import { useViewStore } from '@/stores/view';

const { locale, t } = useLocale();
const nodeStore = useNodeStore();
const searchStore = useSearchingStore();
const viewStore = useViewStore();

const noMenuLabel = ref('');

onMounted(() => {
  setTimeout(() => {
    if (viewStore.isNoMenuView) {
      noMenuLabel.value = document.querySelector('.markdown-body h1 .title')?.textContent || '';
    }
  }, 300);
});

// -------------------- 跳转 --------------------
const router = useRouter();
const goToPage = (href: string) => {
  if (href === `/${locale.value}/`) {
    window.location.href = href; // 分支容器没有/zh和/en相关资源，需要重载触发转发
  } else {
    router.go(href);
  }

  useSearchingStore().isSearching = false;
};
</script>

<template>
  <div class="breadcrumb">
    <OBreadcrumb>
      <template #separator>
        <OIcon> <IconChevronRight /> </OIcon>
      </template>
      <!-- 文档聚合页 -->
      <OBreadcrumbItem :href="`/${locale}/`" @click.prevent="goToPage(`/${locale}/`)">{{ t('home.docCenter') }}</OBreadcrumbItem>
      <!-- 手册节点 -->
      <OBreadcrumbItem v-if="nodeStore.manualNode && !searchStore.isSearching" class="manual-item">{{ nodeStore.manualNode.label }}</OBreadcrumbItem>
      <!-- 当前节点 -->
      <OBreadcrumbItem>{{
        viewStore.isNoMenuView ? noMenuLabel : searchStore.isSearching ? t('docs.searchResult') : nodeStore.pageNode?.label
      }}</OBreadcrumbItem>
    </OBreadcrumb>
  </div>
</template>

<style lang="scss" scoped>
.breadcrumb {
  height: var(--layout-header-breadcrumb-height);
  margin-bottom: var(--layout-header-breadcrumb-margin-bottom);

  .manual-item {
    --breadcrumb-color-hover: var(--breadcrumb-color);
    --breadcrumb-color-active: var(--breadcrumb-color);
    --breadcrumb-color-selected: var(--breadcrumb-color);

    :deep(.o-breadcrumb-item-label) {
      cursor: default;
    }
  }
}
</style>
