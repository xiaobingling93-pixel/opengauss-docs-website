<script setup lang="ts">
import { onMounted, provide, readonly, ref, type PropType } from 'vue';
import { useVModel } from '@vueuse/core';
import { OMenu, OScroller } from '@opensig/opendesign';

import type { TreeNodeT } from '@/@types/type-tree';
import DocMenuItem from './DocMenuItem.vue';

const props = defineProps({
  // 绑定值
  modelValue: {
    type: String,
    default: '',
  },
  // 菜单项
  items: {
    type: Array as PropType<TreeNodeT[]>,
    default: () => [],
  },
  // 展开项
  expanded: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  // 菜单宽度
  menuWidth: {
    type: String,
    default: '272px',
  },
});

const emits = defineEmits<{
  (evt: 'update:modelValue', value: string): void;
  (evt: 'update:expanded', value: string): void;
  (evt: 'change', value: string): void;
  (evt: 'loaded'): void;
}>();

const menuValue = useVModel(props, 'modelValue', emits);
const expanded = useVModel(props, 'expanded', emits);
const menuScrollerRef = ref();

provide('menuValue', readonly(menuValue));
provide('getMenuScrollerEl', () => menuScrollerRef.value?.getContainerEl());

onMounted(() => { 
  setTimeout(() => {
    emits('loaded');
  });
});
</script>

<template>
  <div class="doc-menu-wrapper">
    <OScroller ref="menuScrollerRef" show-type="hover" size="small" disabled-x auto-update-on-scroll-size>
      <OMenu v-model="menuValue" v-model:expanded="expanded" class="doc-menu" @change="(val: string) => emits('change', val)">
        <template v-for="node in items" :key="node.id">
          <div class="doc-menu-title-item">{{ node.label }}</div>
          <DocMenuItem v-for="child in node.children" :key="child.id" :node="child" />
        </template>
      </OMenu>
    </OScroller>
  </div>
</template>

<style lang="scss" scoped>
.o-scroller {
  height: 100%;
}

.doc-menu {
  --menu-width: v-bind(menuWidth);
  --menu-padding-v: 8px;
  --menu-padding-h: 8px;
  --menu-secondary-padding-v: 8px;
  --menu-secondary-padding-h: 8px;
  --menu-selected-gap-v: 0px;
}

.doc-menu-title-item {
  --menu-item-level-indent: 0;
  padding: 7px 7px 7px 4px;
  font-weight: 500;
  color: var(--o-color-info2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @include text2;
}
</style>
