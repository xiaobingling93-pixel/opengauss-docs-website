<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useData } from 'vitepress';
import { ElDialog, ElSwitch } from 'element-plus';
import { setCustomCookie, removeCustomCookie, getCustomCookie } from '@/utils/cookie';
import { useCookieStore, COOKIE_AGREED_STATUS, COOKIE_KEY } from '@/stores/common';
import { useScreen } from '@/composables/useScreen';
import i18nConfig from '@/i18n';

import IconClose from '~icons/app/icon-close.svg';
import { isBoolean, OButton, OIcon } from '@opensig/opendesign';

const { lePadV } = useScreen();
const { lang } = useData();
const i18n = computed(() => i18nConfig.global.messages.value[lang.value as 'zh' | 'en']);
const isZh = computed(() => (lang.value === 'zh' ? true : false));
const aboutUrl = computed(() => {
  return `${import.meta.env.VITE_MAIN_DOMAIN_URL}/${lang.value === 'zh' ? 'zh' : 'en'}/cookies`;
});

const cookieStore = useCookieStore();
const COOKIE_DOMAIN = import.meta.env.VITE_COOKIE_DOMAIN;

const route = useRoute();

// 是否允许分析cookie
const analysisAllowed = ref(false);

// 显示/隐藏cookie提示
const toggleNoticeVisible = (val: boolean) => {
  if (isBoolean(val)) {
    cookieStore.isNoticeVisible = val;
  } else {
    cookieStore.isNoticeVisible = !cookieStore.isNoticeVisible;
  }
};

// 弹出框是否显示
const isDlgVisible = ref(false);

// 显示/隐藏弹出框
const toggleDlgVisible = (val: boolean) => {
  if (isBoolean(val)) {
    isDlgVisible.value = val;
  } else {
    isDlgVisible.value = !isDlgVisible.value;
  }
};

// 是否未签署
const isNotSigned = () => {
  return (getCustomCookie(COOKIE_KEY) ?? '0') === COOKIE_AGREED_STATUS.NOT_SIGNED;
};

// 是否全部同意
const isAllAgreed = () => {
  return getCustomCookie(COOKIE_KEY) === COOKIE_AGREED_STATUS.ALL_AGREED;
};

onMounted(() => {
  // 未签署，展示cookie notice
  if (isNotSigned()) {
    toggleNoticeVisible(true);
  }
});

// 用户同意所有cookie
const acceptAll = () => {
  analysisAllowed.value = true;
  cookieStore.status = COOKIE_AGREED_STATUS.ALL_AGREED;
  removeCustomCookie(COOKIE_KEY);
  setCustomCookie(COOKIE_KEY, COOKIE_AGREED_STATUS.ALL_AGREED, 180, COOKIE_DOMAIN);
  toggleNoticeVisible(false);
};

// 用户拒绝所有cookie，即仅同意必要cookie
const rejectAll = () => {
  analysisAllowed.value = false;
  cookieStore.status = COOKIE_AGREED_STATUS.NECCESSARY_AGREED;
  removeCustomCookie(COOKIE_KEY);
  setCustomCookie(COOKIE_KEY, COOKIE_AGREED_STATUS.NECCESSARY_AGREED, 180, COOKIE_DOMAIN);
  toggleNoticeVisible(false);
};

const handleSave = () => {
  if (analysisAllowed.value) {
    acceptAll();
  } else {
    rejectAll();
  }

  toggleDlgVisible(false);
};

const handleAllowAll = () => {
  acceptAll();
  toggleDlgVisible(false);
};

const onDlgChange = () => {
  if (!isAllAgreed()) {
    setTimeout(() => {
      analysisAllowed.value = false;
    }, 800);
  }
  toggleDlgVisible(false);
};

watch(
  () => route.path,
  () => {
    if (isNotSigned()) {
      toggleNoticeVisible(true);
    }
  }
);
</script>

<template>
  <div v-if="cookieStore.isNoticeVisible" class="cookie-notice">
    <div class="cookie-notice-content">
      <div class="cookie-notice-wrap">
        <div class="cookie-notice-left">
          <p class="cookie-title">{{ i18n.cookie.title }}</p>
          <p class="cookie-desc">
            {{ i18n.cookie.desc }}
            <a :href="aboutUrl" target="_blank"> {{ i18n.cookie.link }} </a>{{ isZh ? '。' : '.' }}
          </p>
        </div>
        <div class="cookie-notice-right">
          <OButton round="pill" variant="outline" color="primary" @click="acceptAll">{{ i18n.cookie.acceptAll }}</OButton>
          <OButton round="pill" variant="outline" color="primary" @click="rejectAll">{{ i18n.cookie.rejectAll }}</OButton>
          <OButton round="pill" variant="outline" color="primary" @click="toggleDlgVisible(true)">
            {{ i18n.cookie.manage }}
          </OButton>
        </div>

        <OIcon class="cookie-notice-close" @click="toggleNoticeVisible(false)">
          <IconClose />
        </OIcon>
      </div>
    </div>
    <client-only>
      <ElDialog
        v-model="isDlgVisible"
        :width="lePadV ? '90%' : '50%'"
        class="cookie-dlg"
        :title="i18n.cookie.manage"
        destroy-on-close
        :before-close="onDlgChange"
      >
        <div class="cookie-dlg-content">
          <div class="content-item">
            <div class="item-header">
              <span class="item-title">{{ i18n.cookie.necessaryCookie }}</span>
              <span class="item-extra">{{ i18n.cookie.necessaryCookieTip }}</span>
            </div>
            <div class="item-detail">
              {{ i18n.cookie.necessaryCookieDetail }}
            </div>
          </div>
          <div class="content-item">
            <div class="item-header">
              <span class="item-title">{{ i18n.cookie.analyticalCookie }}</span>
              <span class="item-extra">
                <ElSwitch v-model="analysisAllowed"></ElSwitch>
              </span>
            </div>
            <div class="item-detail">
              {{ i18n.cookie.analyticalCookieDetail }}
            </div>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <OButton round="pill" variant="outline" color="primary" @click="handleSave" style="margin-right: 16px;">{{ i18n.cookie.saveSetting }}</OButton>
            <OButton round="pill" variant="outline" color="primary" @click="handleAllowAll">
              {{ i18n.cookie.acceptAll }}
            </OButton>
          </span>
        </template>
      </ElDialog>
    </client-only>
  </div>
</template>

<style lang="scss" scoped>
.cookie-notice {
  position: fixed;
  bottom: 0;
  z-index: 999;
  width: 100%;
  .o-button {
    --o-button-font-size-mini: 14px;
  }
  .o-button + .o-button {
    margin-left: 16px;

    @media (max-width: 840px) {
      margin-left: 0;
      margin-top: 12px;
    }
  }
}

.cookie-notice-content {
  background-color: rgba(var(--o-mixedgray-1), 0.9);
  backdrop-filter: blur(5px);
  box-shadow: var(--o-shadow-1);
}

.cookie-notice-wrap {
  padding: 24px 44px;
  max-width: 1504px;
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 0 auto;
  @media (max-width: 840px) {
    padding-top: 16px;
    padding-bottom: 16px;
    padding-left: 24px;
    padding-right: 24px;
    flex-direction: column;
    align-items: center;
  }
}

.cookie-notice-left {
  width: 60%;

  @media (max-width: 1100px) {
    width: 58%;
  }

  @media (max-width: 840px) {
    width: 100%;
  }

  .cookie-title {
    font-size: 16px;
    line-height: 28px;
    color: var(--o-color-info1);
    font-weight: 500;
    @media (max-width: 840px) {
      font-size: 16px;
      line-height: 24px;
      text-align: center;
    }
  }

  .cookie-desc {
    font-size: 12px;
    line-height: 18px;
    color: var(--o-color-info2);
    margin-top: 8px;
  }
}

.cookie-notice-right {
  display: flex;
  align-items: center;
  margin-top: 12px;

  @media (max-width: 840px) {
    width: 100%;
  }

  @media (max-width: 840px) {
    flex-direction: column;
    align-items: center;
  }

  .o-btn:not(:first-child) {
    margin-left: 16px;
  }
  
  @media (max-width: 840px) {
    .o-btn {
      align-self: stretch;
      &:not(:first-child) {
        margin-top: 12px;
        margin-left: 0;
      }
    }
  }
}

.cookie-notice-close {
  position: absolute;
  top: 12px;
  right: 24px;
  transform-origin: center;
  cursor: pointer;
  color: var(--o-color-info1);
  font-size: 20px;
  &:hover {
    color: var(--o-color-primary1);
  }
  @media (max-width: 840px) {
    right: var(--layout-content-padding);
    font-size: 14px;
  }
  @include x-svg-hover;
}

.cookie-dlg {
  .cookie-dlg-content {
    .content-item + .content-item {
      margin-top: 24px;
    }

    .content-item {
      .item-header {
        display: flex;
        align-items: center;
        .item-title {
          font-size: 18px;
          line-height: 32px;
          color: var(--o-color-info1);
          font-weight: 500;
        }

        .item-extra {
          font-size: 14px;
          line-height: 22px;
          color: var(--o-color-info3);
          margin-left: 24px;
        }
      }

      .item-detail {
        font-size: 16px;
        line-height: 28px;
        color: var(--o-color-info2);
        margin-top: 12px;
        @media (max-width: 840px) {
          font-size: 14px;
          line-height: 21px;
          margin-top: 8px;
        }
      }
    }
  }
}
:deep(.el-dialog) {
  .el-dialog__header {
    text-align: center;
  }
  .el-dialog__title {
    font-size: 32px;
    @media (max-width: 840px) {
      font-size: 22px;
    }
  }
  .el-dialog__footer {
    text-align: center;
    @media (max-width: 840px) {
      .o-button {
        margin: 0 8px;
      }
    }
  }
}
</style>
