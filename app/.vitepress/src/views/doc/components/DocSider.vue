<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vitepress';
import { ORadioGroup, ORadio, OIcon, useMessage } from '@opensig/opendesign';

import SearchInput from '@/components/SearchInput.vue';
import DocVersion from './DocVersion.vue';
import DocVersionMobile from './DocVersionMobile.vue';
import DocMenu from './DocMenu.vue';
import DocSiderResizeBar from './DocSiderResizeBar.vue';

import IconExpand from '~icons/app/icon-expand.svg';

import { versions } from '@/config/version';
import { findNode } from '@/utils/tree';
import { useScreen } from '@/composables/useScreen';
import { useLocale } from '@/composables/useLocale';
import { useNodeStore } from '@/stores/node';
import { useSearchingStore } from '@/stores/common';
import { useViewStore } from '@/stores/view';
import { useVersionStore } from '@/stores/version';

const { locale, t } = useLocale();
const { lePad, isPhone } = useScreen();
const message = useMessage(null);
const nodeStore = useNodeStore();
const router = useRouter();
const searchStore = useSearchingStore();
const viewStore = useViewStore();
const versionStore = useVersionStore();

const isSidebarHidden = ref(true);
const switchMenu = () => {
  isSidebarHidden.value = !isSidebarHidden.value;
};

// -------------------- 文档类型 --------------------
const docType = ref(versionStore.isLite ? 'lite' : '');

watch(
  () => versionStore.isLite,
  () => {
    docType.value = versionStore.isLite ? 'lite' : '';
  }
);

const onChangeDocType = (val: string) => {
  const { pathname, search } = window.location;
  const arr = pathname.split('/');
  arr[3] = val === '' ? versionStore.prefixVersion : `${versionStore.prefixVersion}-lite`;
  if (pathname.endsWith('/')) {
    arr.push('index.html');
  }

  const startNode = findNode(nodeStore.root, 'id', nodeStore.versionNodes!.id.replace(versionStore.version, arr[3]));
  if (!startNode) {
    message.info({
      content: '暂无对应版本的文档内容',
    });

    docType.value = versionStore.isLite ? 'lite' : '';
    return;
  }

  const href = arr.join('/');
  const searchHref = `${href}${search}`;
  const node = findNode(startNode, 'href', searchHref) || findNode(startNode, 'href', href);
  if (node) {
    router.go(node.href);
    return;
  }

  const item = versions[locale.value].find((item) => item.value === versionStore.prefixVersion);
  if (item) {
    router.go(val === '' ? item.link!.enterprise : item.link!.lite);
  } else {
    message.info({
      content: '暂无对应版本的文档内容',
    });

    docType.value = versionStore.isLite ? 'lite' : '';
  }
};

// -------------------- 菜单 --------------------
const menuVal = ref('');
const menuExpandedKeys = ref<string[]>([]);

const menuItems = computed(() => {
  if (viewStore.isNoMenuView) {
    const id = `docs-${locale.value}-${versionStore.version}`;
    const item = nodeStore.root.children.find((item) => item.id === id);
    if (item) {
      return item.children;
    }
  }

  return nodeStore.versionNodes?.type === 'docs-single-manual-root' ? [nodeStore.versionNodes] : nodeStore.versionNodes?.children;
});

const updateExpandedKeys = () => {
  if (!nodeStore.pageNode) {
    return;
  }

  const set = new Set([...menuExpandedKeys.value, ...nodeStore.prevNodes.map((item) => item.id)]);
  if (nodeStore.currentNode && nodeStore.currentNode === nodeStore.pageNode) {
    set.add(nodeStore.pageNode.id);
  }

  menuExpandedKeys.value = Array.from(set);
};

const onMenuChange = (val: string) => {
  if (nodeStore.pageNode?.href !== val) {
    router.go(val);
  } else {
    if (searchStore.isSearching) {
      searchStore.clearSearch();
    }
  }
};

watch(
  () => nodeStore.currentNode,
  () => {
    menuVal.value = nodeStore?.currentNode?.id || '';
    updateExpandedKeys();
    isSidebarHidden.value = true;
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <template v-if="isPhone">
    <div class="doc-sidebar-top-mb">
      <div class="sidebar-top">
        <div class="menu-opener-mb" :class="{ 'menu-opener-mb-active': !isSidebarHidden }">
          <OIcon class="icon-expand" @click="switchMenu"><IconExpand /></OIcon>
          <p class="manual-name">{{ nodeStore.manualNode?.label }}</p>
        </div>
        <DocVersionMobile version="latest" />
      </div>
    </div>
    <div class="doc-sidebar-mb" :class="{ 'is-closed': isSidebarHidden }">
      <div class="doc-sidebar-header" v-if="versionStore.version !== 'common'">
        <ORadioGroup v-model="docType" :disabled="viewStore.isNoMenuView" @change="onChangeDocType">
          <ORadio value="">{{ t('docs.enterprise') }}</ORadio>
          <ORadio value="lite">{{ t('docs.lite') }}</ORadio>
        </ORadioGroup>
      </div>
      <SearchInput :disabled="viewStore.isNoMenuView" />
      <ClientOnly>
        <DocMenu v-model="menuVal" v-model:expanded="menuExpandedKeys" :items="menuItems" @change="onMenuChange" @loaded="viewStore.isPageLoaded = true" />
      </ClientOnly>
    </div>
  </template>

  <div v-else class="doc-sidebar" :class="{ 'is-closed': lePad && isSidebarHidden }">
    <div class="doc-sidebar-header">
      <DocVersion version="latest" />
      <ORadioGroup v-if="versionStore.version !== 'common'" v-model="docType" :disabled="viewStore.isNoMenuView" @change="onChangeDocType">
        <ORadio value="">{{ t('docs.enterprise') }}</ORadio>
        <ORadio value="lite">{{ t('docs.lite') }}</ORadio>
      </ORadioGroup>
    </div>
    <SearchInput :disabled="viewStore.isNoMenuView" />
    <ClientOnly>
      <DocMenu
        v-model="menuVal"
        v-model:expanded="menuExpandedKeys"
        :items="menuItems"
        :menu-width="`${viewStore.siderWidth}px`"
        @change="onMenuChange"
        @loaded="viewStore.isPageLoaded = true"
      />
    </ClientOnly>

    <div class="doc-sider-opener" @click="switchMenu">
      <div class="opener-thumb"></div>
    </div>

    <DocSiderResizeBar />
  </div>

  <div class="aside-mask" @click="switchMenu"></div>
</template>

<style lang="scss" scoped>
.doc-sidebar {
  position: fixed;
  top: var(--layout-header-height);
  z-index: 35;
  bottom: 0;
  left: 0;
  padding-left: var(--layout-doc-menu-offset-left);
  padding-top: var(--layout-doc-padding-top);
  padding-bottom: var(--layout-doc-padding-top);

  @include respond-to('<=pad') {
    bottom: 0;
    background-color: var(--o-color-fill2);
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 24px;
    padding-bottom: 24px;
  }

  :deep(.doc-menu-wrapper) {
    height: calc(100% - 150px);

    @include respond-to('<=pad') {
      height: calc(100% - 132px);

      .o-scroller {
        padding-right: 24px;
      }
    }
  }
}

.doc-sidebar-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;

  @include respond-to('<=laptop') {
    margin-bottom: 16px;
  }
}

.doc-sider-opener {
  --thumb-height: 32px;
  --thumb-width: 3px;
  --padding-h: 16px;
  --padding-l: 6px;
  --padding-r: 6px;
  --height: calc(var(--padding-h) * 2 + var(--thumb-height));
  background-color: var(--o-color-fill2);
  cursor: pointer;
  font-size: 24px;
  padding: var(--padding-h);
  padding-left: var(--padding-l);
  padding-right: var(--padding-r);
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(100%, -50%);
  transition:
    background-color 0.2s linear,
    border-radius 0.5s linear;
  z-index: 5;
  border-radius: 0 var(--o-radius-s) var(--o-radius-s) 0;
  margin-right: 1px;

  @include hover {
    :deep(.opener-thumb) {
      background-color: var(--o-color-primary1);
    }
  }

  @include respond-to('>pad') {
    display: none;
  }

  @include respond-to('phone') {
    display: none;
  }
}

.opener-thumb {
  background-color: var(--o-color-info3);
  border-radius: 100px;
  height: var(--thumb-height);
  width: var(--thumb-width);
}

.doc-sidebar.is-closed {
  transform: translate(-100%);
  .menu-opener {
    border-radius: 0 var(--o-radius-s) var(--o-radius-s) 0;
    box-shadow: var(--o-shadow-2);

    @include hover {
      :deep(.opener-thumb) {
        background-color: var(--o-color-primary1);
      }
    }
  }
  & + .aside-mask {
    opacity: 0;
    pointer-events: none;
  }
}

.doc-sidebar.is-closed + .aside-mask {
  opacity: 0;
}

.doc-sidebar-top-mb {
  width: 100%;
  position: fixed;
  z-index: 35;
  top: var(--layout-header-height);
  left: 0;
  box-shadow: var(--o-shadow-1);
}

.sidebar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: var(--o-color-fill2);
  box-shadow: var(--o-shadow-2);
}

.menu-opener-mb {
  display: flex;
  align-items: center;
  color: var(--o-color-info1);

  .icon-expand {
    font-size: 24px;
  }
}

.menu-opener-mb-active {
  .o-icon {
    transform: rotate(-180deg);
  }
}

.doc-sidebar-mb {
  width: 320px;
  height: calc(100% - var(--layout-header-height) - 48px);
  background-color: var(--o-color-fill2);
  padding: 16px 24px;
  position: fixed;
  z-index: 35;
  top: calc(var(--layout-header-height) + 48px);
  left: 0;

  :deep(.doc-menu-wrapper) {
    height: calc(100% - 86px);
  }
}

.doc-sidebar-mb.is-closed {
  transform: translate(-100%);
  & + .aside-mask {
    opacity: 0;
    pointer-events: none;
  }
}

.doc-sidebar-mb.is-closed + .aside-mask {
  opacity: 0;
}

.aside-mask {
  background-color: var(--o-color-mask1);
  bottom: 0;
  content: '';
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: fixed;
  right: 0;
  top: 0;
  transition: var(--all-transition);
  z-index: 34;

  @include respond-to('<=pad') {
    opacity: 1;
    pointer-events: auto;
  }
}

.manual-name {
  margin-left: 8px;
  @include h1;
}
</style>
