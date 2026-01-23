<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vitepress';

import FeedbackPrIssue from '@/components/float/FeedbackPrIssue.vue';

import { useScreen } from '@/composables/useScreen';
import useSelect from '@/composables/useSelect';

const route = useRoute();
const { size } = useScreen();
const { visible, x, y, selectionText } = useSelect('.markdown-body');

watch(
  size,
  () => {
    visible.value = false;
  },
  {
    deep: true,
  }
);

watch(route, () => {
  visible.value = false;
});
</script>

<template>
  <FeedbackPrIssue
    :visible="visible"
    trigger="none"
    position="top"
    :offset="84"
    :show-desc="false"
    :wrapper="false"
    :selection-text="selectionText"
    @click-item="visible = false"
  >
    <div
      :style="{
        '--x': x + 'px',
        '--y': y + 'px',
      }"
      class="select-feedback-placeholder"
    ></div>
  </FeedbackPrIssue>
</template>

<style lang="scss" scoped>
.select-feedback-placeholder {
  position: absolute;
  left: var(--x);
  top: var(--y);
}
</style>
