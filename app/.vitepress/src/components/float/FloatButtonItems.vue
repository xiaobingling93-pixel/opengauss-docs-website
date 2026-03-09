<script setup lang="ts">
import { ref, computed, markRaw, type PropType } from 'vue';
import { OIcon, OPopup, ODivider, OLink } from '@opensig/opendesign';

import IconSmile from '~icons/app/icon-smile.svg';
import IconHeadset from '~icons/feedback/icon-headset.svg';
import IconFAQ from '~icons/feedback/icon-faq.svg';
import IconForum from '~icons/feedback/icon-forum.svg';

import FeedbackSlider from './FeedbackSlider.vue';

import { useLocale } from '@/composables/useLocale';

import { useAppearance } from '@/stores/common';
import { useThrottleFn } from '@vueuse/core';
import FeedbackSliderDocs from './FeedbackSliderDocs.vue';

defineProps({
  source: {
    type: String as PropType<'home' | 'docs'>,
    default: 'home',
  },
});

const { t, locale } = useLocale();

const isDark = computed(() => {
  return useAppearance().theme === 'dark' ? true : false;
});

// -------------------- 文档满意度 --------------------
const feedbackRef = ref();
const showPopup = ref(false); // 显示满意度调研弹窗
const showInput = ref(false); // 显示弹窗中输入框
// 鼠标进入图标区域
const onMouseEnter = () => {
  showPopup.value = true;
};
// 鼠标离开图标区域
const onMouseLeave = () => {
  showPopup.value = false;
};
// 滑动滑块
const changeSlider = (v: boolean) => {
  showInput.value = v;
};
// 关闭弹窗
const closeFeedbackPopup = (v: boolean) => {
  showInput.value = v;
  showPopup.value = v;
};

// -------------------- 文档反馈 --------------------
const issuebackRef = ref();

const floatData = ref([
  {
    visibility: true,
    img: markRaw(IconForum as unknown as object),
    id: 'forum',
    text: computed(() => t('feedback.forum')),
    textMb: computed(() => t('feedback.forumHelp')),
    tip: computed(() => t('feedback.forumTip')),
    link: import.meta.env.VITE_SERVICE_FORUM_URL,
  },
  {
    visibility: computed(() => locale.value === 'zh'),
    img: markRaw(IconFAQ as unknown as object),
    id: 'faq',
    text: computed(() => t('feedback.faq')),
    tip: '',
    link: `/${locale.value}/docs/common/faq/faq.html`,
  },
]);
</script>

<template>
  <div class="nav-box" :class="isDark ? 'dark-nav' : ''">
    <div class="nav-item" id="feedback" @mouseenter="onMouseEnter" @mouseleave="useThrottleFn(onMouseLeave, 300)">
      <OIcon ref="feedbackRef" class="icon-smile">
        <IconSmile />
      </OIcon>

      <OPopup
        :visible="showPopup"
        position="rb"
        :target="feedbackRef"
        :auto-hide="showInput ? false : true"
        wrapper="#feedback"
        body-class="popup-feedback"
        :offset="24"
        trigger="hover"
      >
        <FeedbackSlider v-if="source === 'home'" :show="showInput" @close="closeFeedbackPopup" @input="changeSlider" />
        <FeedbackSliderDocs v-else @close="closeFeedbackPopup" @input="changeSlider" />
      </OPopup>
    </div>

    <ODivider :style="{ '--o-divider-gap': '12px' }" />

    <div class="nav-item">
      <OIcon ref="issuebackRef" id="issueback">
        <IconHeadset />
      </OIcon>

      <OPopup
        position="rb"
        :target="issuebackRef"
        wrapper="#issueback"
        :body-class="`popup-issueback ${locale === 'en' ? 'popup-issueback-en' : ''}`"
        :offset="24"
        trigger="hover"
      >
        <template v-for="item in floatData" :key="item.id">
          <OLink v-if="item.visibility" :href="item.link" target="_blank" class="popup-item">
            <OIcon><component :is="item.img"></component> </OIcon>

            <div class="text">
              <p class="text-name">
                {{ item.text }}
              </p>

              <p v-if="item.tip" class="text-tip">{{ item.tip }}</p>
            </div>
          </OLink>
        </template>
      </OPopup>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.o-icon {
  font-size: 24px;
}
.nav-box {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  background-color: var(--o-color-fill2);
  border-radius: var(--o-radius-xs);
  box-shadow: var(--o-shadow-2);
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--o-color-info1);
  cursor: pointer;

  @include hover {
    color: var(--o-color-primary1);
  }
}

:deep(.o-link-label) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

:deep(.o-popup) {
  cursor: default;

  .o-popup-wrap {
    box-shadow: none;
  }

  .popup-feedback {
    padding: 16px 30px;
    background-color: var(--o-color-fill2);
    box-shadow: var(--o-shadow-2);
    border-radius: var(--o-radius-xs);
    width: 360px;
    top: 12px;
  }

  .popup-item {
    .o-icon {
      font-size: var(--o-font_size-h1);
      color: var(--o-color-info1);
    }
  }

  .popup-issueback {
    padding: 24px;
    background-color: var(--o-color-fill2);
    border-radius: var(--o-radius-xs);
    box-shadow: var(--o-shadow-2);
    width: 224px;
    position: relative;
    display: flex;
    flex-direction: column;

    .popup-item {
      padding: 0;

      .o-link-main {
        display: flex;
        align-items: flex-start;
        color: var(--o-color-info1);
      }

      @include hover {
        & .text .text-name {
          color: var(--o-color-primary1);
        }
      }

      & ~ .popup-item {
        margin-top: 12px;
      }

      .text {
        margin-left: 8px;
        text-align: left;
        align-self: center;

        .text-name {
          font-size: var(--o-font_size-tip1);
          line-height: 22px;
          font-weight: 600;
          a {
            color: var(--o-color-info1);
          }
        }
        .text-tip {
          font-size: var(--o-font_size-tip2);
          line-height: 18px;
          color: var(--o-color-info2);
          margin-top: 4px;
        }
      }
    }
  }

  .popup-issueback-en {
    width: 260px;
  }
}
</style>
