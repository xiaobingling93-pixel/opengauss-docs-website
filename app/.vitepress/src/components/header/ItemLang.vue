<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vitepress';
import { OIcon, ODropdown, ODropdownItem } from '@opensig/opendesign';

import IconLocale from '~icons/app/icon-locale.svg';

import { useScreen } from '@/composables/useScreen';
import { useLocale } from '@/composables/useLocale';
import { isPageExist } from '@/api/api-common';

const router = useRouter();
const { locale } = useLocale();
const { lePadV } = useScreen();

interface LangType {
  id: string;
  label: string;
}

const langList = ref<LangType[]>([
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'English' },
]);

async function changeLanguage(newlang: string) {
  if (locale.value === newlang) {
    return;
  }
  
  const { pathname, search } = window.location;
  const newHref = pathname.replace(`/${locale.value}/`, `/${newlang}/`);
  if (await isPageExist(newHref)) {
    router.go(newHref + search);
  } else {
    window.location.href = `/${newlang}/`;
  }
}

const getLang = (lang: string, simple?: boolean) => {
  return lePadV.value ? (lang === 'zh' ? '中文' : 'EN') : lang === 'zh' ? (simple ? '中' : '简体中文') : simple ? 'EN' : 'English';
};
</script>

<template>
  <div v-if="!lePadV" :class="[langList.length <= 1 ? 'hide-lang' : 'header-lang', 'lang-box']">
    <ODropdown trigger="hover" options-wrapper=".lang-box" optionPosition="top" option-wrap-class="dropdown">
      <div class="info-wrap">
        <OIcon class="icon">
          <IconLocale />
          <div :class="['locale-tag', { 'is-en': locale === 'en' }]">{{ getLang(locale, true) }}</div>
        </OIcon>
      </div>

      <template #dropdown>
        <ODropdownItem v-for="item in langList" @click="changeLanguage(item.id)" :key="item.id" :class="['list', { 'is-active': locale === item.id }]">
          {{ getLang(item.id) }}
        </ODropdownItem>
      </template>
    </ODropdown>
  </div>

  <div v-else :class="langList.length <= 1 ? 'hide-lang' : 'mobile-change-language'">
    <span v-for="item in langList" :key="item.id" :class="{ active: locale === item.id }" @click.stop="changeLanguage(item.id)">
      {{ getLang(item.id) }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.hide-lang {
  display: none;
}

.header-lang {
  height: 100%;
  display: flex;
  align-items: center;

  .info-wrap {
    height: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;

    .icon {
      font-size: var(--o-icon_size_control-m);
      position: relative;
      color: var(--o-color-info1);

      &:hover {
        color: var(--o-color-primary1);
      }
    }

    .locale-tag {
      position: absolute;
      font-size: 10px;
      height: 12px;
      width: 12px;
      background-color: var(--o-color-fill2);

      display: flex;
      justify-content: center;
      align-items: center;
      left: 12px;
      top: 11px;

      &.is-en {
        width: 16px;
      }
    }
  }
  .list {
    cursor: pointer;
    border-radius: var(--o-radius_control-xs);
    padding: var(--o-gap-2) var(--o-gap-4);
    width: 136px;
  }
}

.o-dropdown {
  height: 100%;
}
.o-dropdown-item {
  background: var(--o-color-fill2);
  cursor: pointer;
  border-radius: var(--o-radius_control-xs);
  padding: var(--o-gap-1);
  min-width: 144px;
  height: 40px;
  color: var(--o-color-info1);

  @include hover {
    background: var(--o-color-control2-light);
  }

  &.is-active {
    color: var(--o-color-primary1);
    background: var(--o-color-control3-light);
  }
}
:deep(.dropdown) {
  --dropdown-list-radius: var(--o-radius-s);
}

.mobile-change-language {
  display: flex;
  align-items: center;
  margin-top: 12px;
  span {
    color: var(--o-color-info1);
    text-align: center;
    @include text1;
    cursor: pointer;
    &.active {
      color: var(--o-color-primary1);
      font-weight: 500;
    }
    &:not(:last-child) {
      margin-right: var(--o-gap-3);
      @include respond-to('phone') {
        margin-right: var(--o-gap-2);
      }

      &:after {
        content: '|';
        margin-left: var(--o-gap-3);
        color: var(--o-color-info1);

        @include respond-to('phone') {
          margin-left: var(--o-gap-2);
        }
      }
    }
  }
}
</style>
