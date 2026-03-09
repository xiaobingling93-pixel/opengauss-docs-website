<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch, onMounted, type CSSProperties } from 'vue';
import { useData, useRoute } from 'vitepress';
import { OScroller, OIcon, isClient } from '@opensig/opendesign';

import IconSwitch from '~icons/app/icon-switch.svg';

import type { AnchorItemT } from '@/@types/type-common';
import { useScreen } from '@/composables/useScreen';
import { scrollIntoView } from '@/utils/scroll-to';
import { useViewStore } from '@/stores/view';
import { useLocale } from '@/composables/useLocale';
import { getOffsetTop, getScrollRemainingBottom, isElementVisible } from '@/utils/element';

const route = useRoute();
const viewStore = useViewStore();
const { leLaptop, size } = useScreen();
const { hash } = useData();
const { t } = useLocale();

const anchorScrollerRef = ref();
const anchorRef = ref<HTMLElement>();
const indicatorStyle = ref<CSSProperties>({});
const activeVal = ref(hash.value);
const expanded = ref(false);
const anchorData = ref<AnchorItemT[]>([]);

// -------------------- 展开所有 anchor 数据 --------------------
const flatAnchorData = (anchorData: AnchorItemT[]) => {
  const data: AnchorItemT[] = [];
  anchorData.forEach((item) => {
    data.push(item);
    if (item.children) {
      data.push(...item.children);
    }
  });

  return data;
};
// -------------------- 更新指针位置 --------------------
const updateIndicatorPosition = async () => {
  if (!isClient) {
    return;
  }

  await nextTick();
  const el = anchorRef.value?.querySelector('.o-anchor-item-link.is-active') as HTMLElement;
  if (!el) {
    indicatorStyle.value = {};
    return;
  }

  const { offsetTop, offsetHeight } = el;
  indicatorStyle.value.top = `${offsetTop}px`;
  indicatorStyle.value.height = `${offsetHeight}px`;
  indicatorStyle.value.opacity = 1;

  const anchorScroller = anchorScrollerRef.value?.getContainerEl();
  if (!anchorScroller) {
    return;
  }

  if (!isElementVisible(el, anchorScroller, el.offsetHeight)) {
    scrollIntoView(el, anchorScroller);
  }
};

watch([size, expanded, anchorData], updateIndicatorPosition);

// -------------------- 更新 active  --------------------
const updateActive = async (hashVal: string) => {
  if (hashVal === '') {
    activeVal.value = '';
    return;
  }

  const href = decodeURIComponent(hashVal);
  if (flatAnchorData(anchorData.value).some((item) => item.href === href)) {
    activeVal.value = href;
  }

  updateIndicatorPosition();
};

// -------------------- 获取锚点数据 --------------------
const getAnchorItem = (element: HTMLElement) => {
  return {
    tag: element.tagName.toLowerCase(),
    title: element.innerText.replace(/[\u200B-\u200D\uFEFF]/g, ''),
    href: `#${element.id.replace('user-content-', '')}`,
    children: [],
  };
};

const getAnchorData = () => {
  anchorData.value = [];
  if (!isClient) {
    return;
  }

  const markdownBody = document.querySelector('.markdown-body');
  if (!markdownBody) {
    return;
  }

  let lastItem: AnchorItemT;
  let lastItemIsH2 = false;
  Array.from(markdownBody.querySelectorAll<HTMLElement>('h2, h3')).forEach((element) => {
    // h2
    if (element.tagName === 'H2') {
      lastItem = getAnchorItem(element);
      anchorData.value.push(lastItem);
      lastItemIsH2 = true;
      return;
    }

    // h3
    if (lastItemIsH2) {
      lastItem.children!.push(getAnchorItem(element));
    } else {
      anchorData.value.push(getAnchorItem(element));
    }
  });
};

watch(
  () => route.path,
  async () => {
    anchorData.value = [];
    await nextTick();
    getAnchorData();
    updateActive(hash.value);
  },
  {
    immediate: true,
  }
);

// -------------------- 滚动更新锚点 --------------------
const onScroll = () => {
  if (viewStore.isScrolling) {
    return;
  }

  const scrollContainer = document.querySelector<HTMLElement>('#app > .o-scroller > .o-scroller-container');
  if (!scrollContainer) {
    return;
  }

  const contentDom = document.querySelector('.markdown-body');
  if (!contentDom) {
    return;
  }

  const scrollRemainingBottom = getScrollRemainingBottom(scrollContainer);
  const distances: Array<{ hash: string; top: number }> = [];
  for (const item of flatAnchorData(anchorData.value)) {
    const target = contentDom.querySelector<HTMLElement>(item.href.replace('#', '#user-content-'));
    if (!target) {
      continue;
    }

    const top = getOffsetTop(target, scrollContainer);

    if (top < 110 || (scrollRemainingBottom < 100 && top >= 110)) {
      distances.push({
        hash: item.href,
        top,
      });
    }
  }

  let active = '';
  if (distances.length) {
    if (scrollRemainingBottom < 10) {
      active = distances[distances.length - 1].hash;
    }

    if (!active && scrollRemainingBottom < 110) {
      const overItems = distances.filter((item) => item.top >= 110);
      if (overItems.length) {
        const average = Math.round(110 / overItems.length);
        const item = overItems.find((_, i) => (i + 1) * average < 110 - scrollRemainingBottom);
        if (item) {
          active = item.hash;
        }
      }
    }

    if (!active) {
      const max = distances.reduce((prev, cur) => (prev.top > cur.top ? prev : cur));
      active = max.hash;
    }
  }

  updateActive(active);
};

onMounted(() => {
  const scrollContainer = document.querySelector<HTMLElement>('#app > .o-scroller > .o-scroller-container');
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', onScroll);
  }
});

onBeforeUnmount(() => {
  const scrollContainer = document.querySelector<HTMLElement>('#app > .o-scroller > .o-scroller-container');
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', onScroll);
  }
});

// -------------------- 监听hash改变 --------------------
const scrollIntoTarget = async (hashVal: string) => {
  if (viewStore.isScrolling) {
    return;
  }

  viewStore.isScrolling = true;
  if (hashVal) {
    const contentDom = document.querySelector('.markdown-body');
    if (contentDom) {
      const hash = decodeURIComponent(hashVal).slice(1);
      const target =
        contentDom.querySelector<HTMLElement>(`#user-content-${hash}`) ||
        contentDom.querySelector<HTMLElement>(`#${hash}`) ||
        contentDom.querySelector<HTMLElement>(`[name='${hash}']`);
      const scrollContainer = document.querySelector<HTMLElement>('#app > .o-scroller > .o-scroller-container');
      if (target && scrollContainer) {
        await scrollIntoView(target, scrollContainer);
      }
    }
  }

  viewStore.isScrolling = false;
};

onMounted(() => {
  setTimeout(async () => {
    await scrollIntoTarget(activeVal.value);
    if (!flatAnchorData(anchorData.value).some((item) => item.href === activeVal.value)) {
      onScroll();
    }
  }, 300);
});

watch(
  () => hash.value,
  async (newHash) => {
    updateActive(newHash);
    await scrollIntoTarget(newHash);
    if (!flatAnchorData(anchorData.value).some((item) => item.href === activeVal.value)) {
      onScroll();
    }
  }
);
</script>

<template>
  <div v-if="anchorData.length > 0" class="doc-anchor" :class="{ unexpanded: leLaptop && !expanded }">
    <div class="anchor-wrapper" :class="{ unexpanded: leLaptop && !expanded }">
      <div class="anchor-title">{{ t('docs.anchorTip') }}</div>
      <OScroller ref="anchorScrollerRef" class="anchor-scroller" show-type="hover" size="small" disabled-x auto-update-on-scroll-size>
        <div ref="anchorRef" class="o-anchor">
          <div class="o-anchor-line">
            <div v-show="activeVal" class="o-anchor-indicator" :style="indicatorStyle"></div>
          </div>
          <div class="o-anchor-items">
            <template v-for="item in anchorData" :key="item.href">
              <div class="o-anchor-item anchor-item" :title="item.title">
                <a :href="item.href" target="_self" class="o-anchor-item-link anchor-item-link" :class="{ 'is-active': activeVal === item.href }">{{
                  item.title
                }}</a>
              </div>
              <div v-for="subItem in item.children" :key="subItem.href" class="o-anchor-item anchor-item" :title="subItem.title">
                <a
                  :href="subItem.href"
                  target="_self"
                  class="o-anchor-item-link anchor-item-link anchor-item-child-link"
                  :class="{ 'is-active': activeVal === subItem.href }"
                  >{{ subItem.title }}</a
                >
              </div>
            </template>
          </div>
        </div>
      </OScroller>
    </div>

    <div class="anchor-opener" :class="{ unexpanded: leLaptop && !expanded }" @click="expanded = !expanded">
      <OIcon>
        <IconSwitch></IconSwitch>
      </OIcon>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.doc-anchor {
  position: fixed;
  top: var(--layout-doc-anchor-top);
  right: var(--layout-doc-anchor-offset-right);
  width: var(--layout-doc-anchor-width);
  z-index: 9;

  @include respond-to('pad-laptop') {
    right: 0;
  }

  @include respond-to('phone') {
    display: none;
  }
}

.anchor-wrapper {
  @include respond-to('pad-laptop') {
    padding: 16px 12px;
    background-color: var(--o-color-fill2);
    border-radius: var(--o-radius-xs);
    box-shadow: var(--o-shadow-2);
  }
}

.anchor-wrapper.unexpanded {
  display: none;
}

.anchor-title {
  margin-bottom: 12px;
  font-weight: 500;
  @include tip1;
}

.anchor-scroller {
  max-height: calc(100vh - 700px);
  padding-right: 24px;

  @include respond-to('pad-laptop') {
    max-height: calc(100vh - 750px);
    padding-right: 6px;
  }
}

.anchor-item {
  @include respond-to('pad-laptop') {
    width: 182px;
  }
}

.anchor-item-link {
  display: block;
  width: 162px;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: nowrap;
  
  @include respond-to('pad-laptop') {
    width: 182px;
  }
}

.anchor-item-child-link {
  padding-left: 24px;
}

.anchor-opener {
  z-index: 9;
  display: none;
  position: absolute;
  right: 0;
  top: 0;
  padding: 12px;
  font-size: 24px;
  cursor: pointer;

  @include respond-to('pad-laptop') {
    display: block;
  }
}

.anchor-opener.unexpanded {
  position: fixed;
  right: 0;
  top: var(--layout-doc-anchor-top);
  background-color: var(--o-color-fill2);
  border-radius: 0 100px 100px 0;
  box-shadow: var(--o-shadow-2);
  transform: scaleX(-1);
}
</style>
