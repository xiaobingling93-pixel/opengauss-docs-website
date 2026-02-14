<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch, type PropType, type Ref } from 'vue';
import { isArray, OMenuItem, OSubMenu, OIcon, OIconChevronDown } from '@opensig/opendesign';

import type { TreeNodeT } from '@/@types/type-tree';
import { refreshSelectedMenuItemPosition } from '@/utils/refresh-ui';

const props = defineProps({
  node: {
    type: Object as PropType<TreeNodeT>,
    required: true,
  },
});

const menuVal = inject<Ref<string>>('menuValue')!;
const getMenuScrollerEl = inject<() => HTMLElement>('getMenuScrollerEl')!;

const itemRef = ref();
const showOffset = computed(() => {
  return isArray(props.node.parent?.children) && props.node.parent.children.some((child) => child.children.length > 0);
});

watch(
  () => menuVal.value,
  () => scrollToItem()
);

const scrollToItem = () => {
  if (menuVal.value !== props.node.id || !itemRef.value?.$el) {
    return;
  }

  const scroller = getMenuScrollerEl();
  if (!scroller) {
    return;
  }

  refreshSelectedMenuItemPosition(itemRef.value.$el, scroller);
};

// -------------------- 阻止点击子内容导致菜单收缩 --------------------
const stopPropagation = (ev: MouseEvent) => ev.stopPropagation();

onMounted(() => {
  if (isArray(props.node.children) && props.node.children.length > 0 && itemRef.value?.$el) {
    const el = itemRef.value.$el.querySelector('.o-sub-menu-children') as HTMLElement;
    if (el) {
      el.addEventListener('click', stopPropagation);
    }
  }

  if (menuVal.value === props.node.id) {
    setTimeout(scrollToItem, 800);
  }
});

onBeforeUnmount(() => {
  if (isArray(props.node.children) && props.node.children.length > 0 && itemRef.value?.$el) {
    const el = itemRef.value.$el.querySelector('.o-sub-menu-children') as HTMLElement;
    if (el) {
      el.removeEventListener('click', stopPropagation);
    }
  }
});
</script>

<template>
  <OSubMenu
    v-if="isArray(node.children) && node.children.length > 0"
    ref="itemRef"
    class="doc-sub-menu"
    :class="{ 'doc-sub-menu-page': node.children.length && node.children.every((item) => item.type === 'page') }"
    :value="node.id"
    :title="node.label"
    :selectable="node.type === 'page'"
  >
    <template #title>
      <div class="menu-item-title">
        <OIcon class="icon-chevron-down">
          <OIconChevronDown />
        </OIcon>
        <a v-if="node.href" class="menu-item-title-text" :href="node.href" @click.prevent>{{ node.label }}</a>
        <span v-else class="menu-item-title-text">{{ node.label }}</span>
      </div>
    </template>
    <DocMenuItem v-for="item in node.children" :key="item.id" :node="item" />
  </OSubMenu>
  <OMenuItem v-else ref="itemRef" :id="node.id" class="doc-menu-item" :class="{ 'doc-menu-offset-item': showOffset }" :value="node.id" :title="node.label">
    <div class="menu-item-title">
      <a v-if="node.href" class="menu-item-title-text" :href="node.href" @click.prevent>{{ node.label }}</a>
      <span v-else class="menu-item-title-text">{{ node.label }}</span>
    </div>
  </OMenuItem>
</template>

<style lang="scss" scoped>
.doc-sub-menu {
  --sub-menu-bg-color-selected: transparent;
  --sub-menu-color: var(--o-color-info2);

  :deep(.o-sub-menu-title-arrow) {
    display: none;
  }

  :deep(.o-sub-menu-title) {
    padding-left: 4px !important;
    padding-right: 4px;
    padding-top: 8px;
    padding-bottom: 8px;
  }

  :deep(.o-sub-menu-title-content) {
    display: inline-flex;
    width: 100%;
    @include text1;
  }

  :deep(.o-sub-menu-title-arrow) {
    right: 4px;
  }

  :deep(.o-sub-menu-children) {
    position: relative;
    padding-left: 16px;

    &::before {
      content: '';
      position: absolute;
      left: 16px;
      top: 2px;
      bottom: 0;
      border-left: 1px solid var(--o-color-control4);
    }

    > li {
      padding-left: 16px;
    }

    > .o-menu-item {
      margin-left: 48px;
    }
  }

  :deep(.doc-menu-item:not(:first-child)) {
    &::before {
      content: '';
      position: absolute;
      left: -16px;
      top: -2px;
      bottom: 0;
      border-left: 1px solid var(--o-color-control4);
    }
  }

  :deep(.doc-menu-item) {
    &::before {
      content: '';
      position: absolute;
      left: -16px;
      top: 0;
      bottom: 0;
      border-left: 1px solid var(--o-color-control4);
    }
  }
}

.hidden {
  opacity: 0;
}

.menu-item-title {
  display: inline-flex;
  align-items: center;
  width: 100%;
}

.icon-chevron-down {
  margin-right: 8px;
  transition: transform var(--o-duration-m2) var(--o-easing-standard);
  font-size: 24px;
}

.o-sub-menu-expanded > .o-sub-menu-title > .o-sub-menu-title-content > .menu-item-title > .icon-chevron-down {
  transform: rotate(180deg);
}

.doc-menu-item {
  padding-left: 4px !important;
  padding-right: 4px;
  padding-top: 8px;
  padding-bottom: 8px;
  --menu-item-color: var(--o-color-info2);
  --menu-item-bg-color-selected: var(--o-color-control4-light);

  :deep(.o-menu-item-content) {
    display: inline-flex;
    width: 100%;
    @include text1;
  }
}

.o-menu-item + .o-sub-menu,
.o-sub-menu,
.o-menu-item {
  margin-top: 2px;
}

.o-sub-menu-selected > :deep(.o-sub-menu-title) {
  background-color: var(--o-color-control4-light);
}

.doc-sub-menu :deep(.doc-menu-item) {
  position: relative;
  margin-left: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.o-sub-menu-associated-selected .o-menu-item-selected::after {
  content: '';
  position: absolute;
  left: -16px;
  top: 3px;
  bottom: 3px;
  border-left: 2px solid var(--o-color-primary1) !important;
}

.menu-item-title-text {
  width: 100%;
  color: inherit;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @include hover {
    color: inherit;
  }
}

.o-menu > .doc-menu-offset-item {
  margin-left: 38px !important;
}
</style>
