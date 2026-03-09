<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue';
import { isClient, OIcon } from '@opensig/opendesign';
import { ElSwitch } from 'element-plus';
import { useAppearance } from '@/stores/common';

import IconSun from '~icons/app/icon-sun.svg';
import IconHeaderMoon from '~icons/app/icon-header-moon.svg';
import { getCustomCookie, setCustomCookie } from '@/utils/cookie';


// 风格切换
const APPEARANCE_KEY = 'openGauss-theme-appearance';

const commonStore = useAppearance();

const isLight = computed(() => (commonStore.theme === 'light' ? true : false));

const changeTheme = () => {
  const theme = commonStore.theme === 'dark' ? 'light' : 'dark';
  commonStore.theme = theme;
  setCustomCookie(APPEARANCE_KEY, theme, 180, import.meta.env.VITE_COOKIE_DOMAIN);
};

const changeThemeMobile = () => {
  setCustomCookie(APPEARANCE_KEY, commonStore.theme, 180, import.meta.env.VITE_COOKIE_DOMAIN);
};

onMounted(() => {
  let theme;
  if (!getCustomCookie(APPEARANCE_KEY)) {
    const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefereDark ? 'dark' : 'light';
  } else {
    theme = getCustomCookie(APPEARANCE_KEY);
  }
  commonStore.theme = theme === 'dark' ? 'dark' : 'light';
});

watch(
  () => {
    return commonStore.theme;
  },
  (val) => {
    if (isClient) {
      const documentElement = document.documentElement;
      if (val === 'dark') {
        documentElement.setAttribute('data-o-theme', 'dark');
        documentElement.classList.add('dark');
      } else {
        documentElement.removeAttribute('data-o-theme');
        documentElement.classList.remove('dark');
      }
    }
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div class="theme-box">
    <div class="theme-box-pc" @click="changeTheme">
      <OIcon class="icon">
        <IconHeaderMoon v-if="isLight" />
        <IconSun v-else />
      </OIcon>
    </div>
    <div class="theme-box-mobile">
      <ElSwitch
        v-model="commonStore.theme"
        active-value="dark"
        inactive-value="light"
        inline-prompt
        active-color="#7d32ea"
        :active-icon="IconSun"
        :inactive-icon="IconHeaderMoon"
        @click="changeThemeMobile"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.theme-box {
  .theme-box-pc {
    cursor: pointer;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;

    .icon {
      font-size: 24px;
      color: var(--o-color-info1);

      @include hover {
        color: var(--o-color-primary1);
      }
    }

    @include respond-to('<=pad_v') {
      display: none;
    }
  }

  .theme-box-mobile {
    margin-top: 24px;
    display: none;
    @include respond-to('<=pad_v') {
      display: flex;
      :deep(.o-switch) {
        background: none;
        display: flex;
        align-items: center;
      }
    }
  }
}

@include in-dark {
  .icon {
    color: var(--o-color-info1);
  }
}

:deep(.el-switch .el-switch__core .el-switch__inner) {
  .el-icon {
    font-size: 20px;
    color: var(--o-color-info1);
  }
}
</style>
