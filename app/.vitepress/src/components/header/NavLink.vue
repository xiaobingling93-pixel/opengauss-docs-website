<script setup lang="ts">
import { useData } from 'vitepress';

const { lang } = useData();
const props = defineProps({
  url: {
    type: String,
    required: true,
    default() {
      return '';
    },
  },
});

const isExternal = () => {
  return props.url.startsWith('https');
};

const emits = defineEmits(['link-click']);

const linkClick = () => {
  emits('link-click');

  window.open(`${import.meta.env.VITE_MAIN_DOMAIN_URL}/${lang.value}${props.url}`);
};
</script>

<template>
  <a v-if="isExternal()" :href="url" target="_blank" class="link" rel="noopener noreferrer">
    <slot></slot>
  </a>
  <div v-else @click="linkClick" class="link" :class="{ 'without-url': !url }">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.link {
  color: var(--o-color-info1);
  display: flex;
  align-items: center;

  @include hover {
    color: var(--o-color-primary1);
  }
}

.without-url {
  pointer-events: none;
  color: var(--o-color-info1) !important;
}
</style>
