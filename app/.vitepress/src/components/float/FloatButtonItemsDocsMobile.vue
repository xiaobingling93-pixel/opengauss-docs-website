<script setup lang="ts">
import { ref, markRaw, computed } from 'vue';
import { OIcon, OPopup, OLink } from '@opensig/opendesign';

import IconSmile from '~icons/app/icon-smile.svg';
import IconQuestion from '~icons/feedback/icon-question.svg';
import IconFAQ from '~icons/feedback/icon-faq.svg';
import IconForum from '~icons/feedback/icon-forum.svg';

import FeedbackDocsMobileDialog from './FeedbackDocsMobileDialog.vue';

import { useLocale } from '@/composables/useLocale';

const { t, locale } = useLocale();
const showDocsFeedbackDlg = ref(false);

// -------------------- 文档反馈 --------------------
const issuebackRef = ref();

const floatData = ref([
  {
    visibility: true,
    img: markRaw(IconSmile as unknown as object),
    id: 'mark',
    text: computed(() => t('feedback.wantSubmitMark')),
    onClick() {
      showDocsFeedbackDlg.value = true;
    },
  },
  {
    visibility: true,
    img: markRaw(IconForum as unknown as object),
    id: 'forum',
    text: computed(() => t('feedback.forum')),
    link: import.meta.env.VITE_SERVICE_FORUM_URL,
  },
  {
    visibility: computed(() => locale.value === 'zh'),
    img: markRaw(IconFAQ as unknown as object),
    id: 'faq',
    text: computed(() => t('feedback.faq')),
    link: `/${locale.value}/docs/common/faq/faq.html`,
  },
]);
</script>

<template>
  <div class="float-btn-items-docs-mobile">
    <OIcon ref="issuebackRef" id="issueback">
      <IconQuestion class="icon" />
    </OIcon>

    <OPopup position="rb" :target="issuebackRef" wrapper="#issueback" body-class="popup-issueback" :offset="24" trigger="click">
      <template v-for="item in floatData" :key="item.id">
        <OLink v-if="item.visibility" :href="item?.link" target="_blank" @click="item.onClick?.()">
          <template #icon>
            <OIcon class="icon">
              <component :is="item.img"></component>
            </OIcon>
          </template>
          {{ item.text }}
        </OLink>
      </template>
    </OPopup>
  </div>

  <FeedbackDocsMobileDialog v-model:visible="showDocsFeedbackDlg" />
</template>

<style lang="scss" scoped>
.float-btn-items-docs-mobile {
  width: 48px;
  height: 48px;
  padding: 12px;
  background-color: var(--o-color-fill2);
  border-radius: var(--o-radius-xs);
  box-shadow: var(--o-shadow-2);

  .icon {
    font-size: 24px;
  }

  :deep(.o-popup) {
    cursor: default;

    .o-popup-wrap {
      box-shadow: none;
    }

    .popup-issueback {
      display: flex;
      flex-direction: column;
      padding: 16px;
      min-width: 124px;
      font-size: 14px;
      line-height: 22px;
      background-color: var(--o-color-fill2);
      border-radius: var(--o-radius-xs);
      box-shadow: var(--o-shadow-2);
    }

    .o-link {
      color: var(--o-color-info1);
    }

    .o-link:not(:last-child) {
      margin-bottom: 12px;
    }
  }
}
</style>
