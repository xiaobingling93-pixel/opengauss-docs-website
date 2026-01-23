<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useData, useRouter, useRoute } from 'vitepress';
import i18nConfig from '@/i18n';
import { isArray, OIcon } from '@opensig/opendesign';

import HeaderTheme from './ItemTheme.vue';
import HeaderLanguage from './ItemLang.vue';
import HeaderLogin from './ItemUser.vue';
import NavContent from './NavContent.vue';
import HeaderSearch from './ItemSearch.vue';
import NavLink from './NavLink.vue';

import IconOutLink from '~icons/app/icon-out-link.svg';
import type { NavItemT, SourceCodeItemT } from '@/@types/type-nav';

import { useLocale } from '@/composables/useLocale';

const { lang } = useData();
const { t } = useLocale();
const router = useRouter();
const route = useRoute();
const i18n = computed(() => i18nConfig.global.messages.value[lang.value as 'zh' | 'en']);
const headerData = computed(() => i18n.value.header.NAV_ROUTER);
const codeData = computed(() => i18n.value.header.SOURCE_CODE);

const props = defineProps({
  langOptions: {
    type: Array,
    default() {
      return [];
    },
  },
  menuShow: {
    type: Boolean,
    default() {
      return false;
    },
  },
});

const navActive = ref('');
const navInfo = ref({} as NavItemT);
const sourceCode = ref({} as SourceCodeItemT[]);

const handleNavClick = (item: NavItemT | null) => {
  if (!item) {
    navActive.value = 'SOURCE_CODE';
    sourceCode.value = codeData.value;
  } else {
    if (item.ID === 'home') {
      window.location.href = `${import.meta.env.VITE_MAIN_DOMAIN_URL}/${lang.value}/`;
      navInfo.value = {} as NavItemT;
      navActive.value = item.ID;
      emit('link-click');
    } else {
      navActive.value = item.ID;
      navInfo.value = item;
    }
  }
};

watch(
  () => props.menuShow,
  (val: boolean) => {
    if (val) {
      if (route.path === `/${lang.value}/`) {
        navActive.value = 'home';
        navInfo.value = {} as NavItemT;
        return;
      }

      navInfo.value =
        headerData.value.find((item: NavItemT) => {
          return item.CHILDREN?.some((subItem) => {
            return subItem.CHILDREN?.some((child) => {
              return child.URL && `/${lang.value}${child.URL}`.includes(route.path);
            });
          });
        }) || headerData.value[0];

      navActive.value = navInfo.value.ID;
    }
  }
);

watch(
  () => headerData.value || codeData.value,
  () => {
    if (navActive.value === 'SOURCE_CODE') {
      navInfo.value = {} as NavItemT;
      sourceCode.value = codeData.value;
      return;
    } else {
      sourceCode.value = [];
      navInfo.value = headerData.value.find((item: NavItemT) => item.ID === navActive.value);
    }
  },
  {
    deep: true,
  }
);

const emit = defineEmits(['link-click', 'close-menu']);
const linkClick = () => {
  emit('link-click');
};

const closeMenu = () => {
  if (navActive.value !== 'home') return;

  emit('close-menu');
};
</script>

<template>
  <div class="header-content" :class="lang">
    <div class="header-nav" :class="{ active: menuShow }">
      <nav class="o-nav" :class="`o-nav-${lang}`">
        <ul class="o-nav-list">
          <li
            v-for="(item, index) in headerData"
            :key="item.ID"
            :class="{
              active: navActive === item.ID,
            }"
          >
            <span @click="handleNavClick(item)">{{ item.NAME }}</span>
          </li>
        </ul>

        <div class="header-tool">
          <div
            class="header-tool-code"
            @click="handleNavClick(null)"
            :class="{
              active: navActive === 'SOURCE_CODE',
            }"
          >
            {{ t('header.CODE') }}
          </div>

          <div class="header-tool-bottom">
            <HeaderLanguage :show="langOptions" />
            <HeaderTheme />
          </div>
        </div>
      </nav>

      <div class="nav-aside" :class="{ 'nav-aside-home': navActive === 'home' }" @click="closeMenu">
        <ul v-if="navActive !== 'SOURCE_CODE' && isArray(navInfo?.CHILDREN)" class="nav-aside-wrapper">
          <li v-for="item in navInfo.CHILDREN" :value="item.NAME" :title="item.NAME" :key="item.NAME" class="nav-aside-content">
            <p class="content-title">{{ item.NAME }}</p>

            <NavContent :nav-content="item?.CHILDREN" @link-click="linkClick" :is-mobile="true" />
          </li>
        </ul>
        <div v-else class="nav-aside-wrapper">
          <NavLink v-for="item in sourceCode" :url="item.PATH" :key="item.NAME" class="source-code-item">
            <span>{{ item.NAME }}</span>
            <OIcon v-if="item.ICON">
              <IconOutLink class="icon" />
            </OIcon>
          </NavLink>
        </div>
      </div>
    </div>
  </div>
  <!-- 搜索 -->
  <HeaderSearch />
  <HeaderLogin />
</template>

<style lang="scss" scoped>
@mixin nav-item {
  display: flex;
  align-items: center;
  justify-content: left;
  color: var(--o-color-info1);
  font-weight: 500;
  padding: 12px 32px;

  @include respond-to('phone') {
    padding: 12px 24px;
  }

  &.active {
    color: var(--o-color-primary1);
    background: var(--o-color-fill2);
  }
}

.header-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  height: 100%;
}

.header-nav {
  width: 100vw;
  display: flex;
  position: fixed;
  left: 0;
  overflow: hidden;
  top: 48px;
  height: calc(100vh - 48px);
  transform: translateX(-130%);
  transition-duration: 0.333s;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.5, 0, 0.84, 0.25);

  &.active {
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
  }
}

.o-nav {
  height: 100%;
  width: fit-content;
  max-width: 40%;
  position: relative;
  background: var(--o-color-fill1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .o-nav-list {
    padding: 0;
    margin: 0;
    height: auto;
    @include text2;

    > li {
      @include nav-item;
      position: relative;
      text-align: left;
      width: 100%;

      span {
        white-space: break-spaces;
      }
    }
  }
}

.nav-aside {
  flex: 1;
  min-width: 0;
  width: 0;
  background-color: var(--o-color-fill2);
  padding: 16px 12px;

  .nav-aside-wrapper {
    overflow-y: auto;
    width: 100%;
    max-width: 100%;
    height: 100%;

    .nav-aside-content {
      & + .nav-aside-content {
        position: relative;
        padding-top: var(--o-gap-3);

        &::before {
          content: '';
          position: absolute;
          top: 0;
          width: 100%;
          height: 1px;
          background-color: rgba(var(--o-mixedgray-14), 0.1);
        }
      }

      :deep(.o-collapse-item-body) {
        margin-bottom: 0;
      }

      .group + .group {
        margin-top: var(--o-gap-3);
      }

      .content-title {
        @include text1;
        color: var(--o-color-info3);
        font-weight: 500;
      }

      .content-title-url {
        @include text2;
        color: var(--o-color-primary1);
        margin: var(--o-gap-4) 0;

        .icon {
          height: 16px;
          width: 16px;
          margin-left: var(--o-gap-2);
        }
      }
    }

    .source-code-item {
      height: 40px;
      display: flex;
      align-items: center;
      color: var(--o-color-primary1);

      & + .source-code-item {
        border-top: 1px solid var(--o-color-control4);
      }

      .icon {
        margin-left: var(--o-gap-2);
      }
    }

    &::-webkit-scrollbar-track {
      border-radius: 4px;
      background-color: var(--e-color-bg2);
    }

    &::-webkit-scrollbar {
      width: 6px;
      background-color: var(--e-color-bg2);
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background: var(--e-color-division1);
    }
  }
}

.nav-aside-home {
  background-color: rgba(0, 0, 0, 0.4);
}

.header-tool {
  .header-tool-code {
    height: 48px;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 32px;
    @include h4;
    @include respond-to('phone') {
      padding: 0 24px;
    }
    &.active {
      color: var(--o-color-primary1);
      background: var(--o-color-fill2);
    }
  }

  .header-tool-bottom {
    padding: 0 32px 32px;

    @include respond-to('phone') {
      padding: 0 24px 32px;
    }
  }
}
</style>
