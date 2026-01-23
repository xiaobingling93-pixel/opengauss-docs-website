<script setup lang="ts">
import { ref, type PropType } from 'vue';
import { OPopup, ODropdownItem, OLink, OIcon, type PopupTriggerT } from '@opensig/opendesign';

import IconOutLink from '~icons/app/icon-outlink.svg';

import { useLocale } from '@/composables/useLocale';
import { getSourceUrl } from '@/utils/common';
import { useNodeStore } from '@/stores/node';
import { GITCODE_LINK } from '@/config/urls';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  position: {
    type: String,
    default: 'right',
  },
  offset: {
    type: Number,
    default: 12,
  },
  trigger: {
    type: String as PropType<PopupTriggerT>,
    default: 'hover',
  },
  showDesc: {
    type: Boolean,
    default: true,
  },
  wrapper: {
    type: Boolean,
    default: true,
  },
  selectionText: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['click-item']);

const { t } = useLocale();
const nodeStore = useNodeStore();

const feedbackWrapperRef = ref<HTMLElement>();
const submitFeedback = (feedbackType: 'pr' | 'issue') => {
  emits('click-item');
  
  if (feedbackType === 'pr') {
    const url = `${getSourceUrl(nodeStore.pageNode).replace('blob', 'edit')}${props.selectionText ? `?search=${props.selectionText}` : ''}`;
    if (url) {
      window.open(url, '_blank', 'noopener noreferrer');
      return;
    }
  }

  if (feedbackType === 'issue') {
    window.open(
      `${GITCODE_LINK}opengauss/docs/issues/create?labels=docs&title=${nodeStore.pageNode?.label || ''}&description=${nodeStore.pageNode?.label || ''}`,
      '_blank',
      'noopener noreferrer'
    );
    return;
  }
};
</script>

<template>
  <OPopup
    :visible="visible"
    :wrapper="wrapper ? feedbackWrapperRef : undefined"
    :position="position"
    :trigger="trigger"
    :offset="offset"
    :style="{
      '--popup-padding': '5px 4px',
    }"
    body-class="popup-feedback-pr-issue"
  >
    <template #target>
      <div v-if="wrapper" ref="feedbackWrapperRef" class="feedback-pr-issue">
        <slot></slot>
      </div>
      <slot v-else></slot>
    </template>

    <ODropdownItem @click="submitFeedback('pr')">
      <OLink color="primary">
        <span>{{ t('feedback.pr') }}&nbsp;</span>
        <OIcon>
          <IconOutLink />
        </OIcon>
      </OLink>
      <div v-if="showDesc" class="item-desc">{{ t('feedback.prTip') }}</div>
    </ODropdownItem>
    <ODropdownItem @click="submitFeedback('issue')">
      <OLink color="primary">
        <span>{{ t('feedback.issue') }}&nbsp;</span>
        <OIcon>
          <IconOutLink />
        </OIcon>
      </OLink>
      <div v-if="showDesc" class="item-desc">{{ t('feedback.issueTip') }}</div>
    </ODropdownItem>
  </OPopup>
</template>

<style lang="scss">
.popup-feedback-pr-issue {
  padding: 5px 4px;
  background-color: var(--o-color-fill2);
  border-radius: var(--o-radius-xs);
  
  .o-dropdown-item {
    justify-content: flex-start;
    padding: 7px 12px;
    display: block;
    @include text1;

    .o-icon {
      @include text1;
    }

    .o-link {
      display: block;
      .o-link-main {
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.feedback-pr-issue {
  :deep(.popup-feedback-pr-issue) {
    background-color: var(--o-color-fill2);
    border-radius: var(--o-radius-xs);
    width: 260px;
  }

  :deep(.o-dropdown-item) {
    justify-content: flex-start;
    padding: 7px 12px;
    display: block;
    @include text1;

    .o-icon {
      @include text1;
    }

    .o-link {
      display: block;
      .o-link-main {
        display: flex;
        align-items: center;
      }
    }

    .item-desc {
      color: var(--o-color-info3);
      margin-top: 8px;
      max-width: 236px;
      @include tip1;
    }
  }
}
</style>
