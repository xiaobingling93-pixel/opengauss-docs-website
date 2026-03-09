<script setup lang="ts">
import { ref, computed, shallowRef, watch } from 'vue';
import { useDebounceFn, useElementSize } from '@vueuse/core';
import { useData } from 'vitepress';
import { OIcon } from '@opensig/opendesign';

import i18nConfig from '@/i18n';
import { useAppearance } from '@/stores/common';

import { OScroller, ODropdownItem, ODropdown } from '@opensig/opendesign';
import NavContent from './NavContent.vue';
import NavLink from './NavLink.vue';

import { type NavItemT } from '@/@types/type-nav';

const appearanceStore = useAppearance();
const { lang } = useData();
const i18n = computed(() => i18nConfig.global.messages.value[lang.value as 'zh' | 'en']);

// 导航数据
const navData = computed(() => i18n.value.header.NAV_ROUTER);

// nav 鼠标滑过事件
const isShow = ref(false);
const navActive = ref('');
const subNavContent = ref<any>([]);
const navShortcut = ref<any>([]);
const isPicture = ref(false);
const isClickDropdown = ref(false);

const toggleDebounced = useDebounceFn(function (item: NavItemT | null) {
  if (item === null) {
    navActive.value = '';
    isShow.value = false;
    isPicture.value = false;
  } else if (item.ID === 'more') {
    if (navActive.value) {
      isShow.value = false;
    }

    navActive.value = 'more';
  } else {
    if (item.ID === 'home') {
      navActive.value = item.ID;
      subNavContent.value = [];
      navShortcut.value = [];
      isShow.value = false;
      return;
    }

    navActive.value = item.ID;
    isShow.value = true;
    subNavContent.value = item.CHILDREN ?? [];
    navShortcut.value = item.SHORTCUT ?? [];
    isPicture.value = item.WITH_PICTURE ?? false;
  }
}, 100);

const mroeSelectId = ref('');
const handleDropdownClick = (item: NavItemT) => {
  mroeSelectId.value = item.ID;
  isClickDropdown.value = true;
  isShow.value = true;
  subNavContent.value = item.CHILDREN ?? [];
  navShortcut.value = item.SHORTCUT ?? [];
  isPicture.value = item.WITH_PICTURE ?? false;
};

const clickNav = (item: string) => {
  if (item === 'home') {
    window.location.href = `${import.meta.env.VITE_MAIN_DOMAIN_URL}/${lang.value}/`;
  }
};

const linkClick = () => {
  isShow.value = false;

  setTimeout(() => {
    navActive.value = '';
  }, 150);
};

// ------------------------ 计算 nav 宽度 ------------------------
const visiableNavs = shallowRef<NavItemT[]>([]);
const hiddenNavs = shallowRef<any>([]);
const navHiddenRef = ref<HTMLElement>();
const navContainerHiddenRef = ref<HTMLElement>();

const { width: navContainerWidth } = useElementSize(navContainerHiddenRef);

watch(
  navContainerWidth,
  () => {
    if (!navHiddenRef.value?.children?.length) {
      return;
    }

    let i = 0;
    let width = 0;
    for (; i < navHiddenRef.value.children.length; i++) {
      width += navHiddenRef.value.children[i].clientWidth;

      if (width >= navContainerWidth.value || width + 72 >= navContainerWidth.value) {
        break;
      }
    }

    visiableNavs.value = navData.value.slice(0, i) as NavItemT[];
    hiddenNavs.value = navData.value.slice(i);

    if (hiddenNavs.value.length > 0) {
      visiableNavs.value.push({ ID: 'more', NAME: i18n.value.header.MORE });
    }
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div class="header-content" ref="navContainerHiddenRef">
    <nav class="o-nav">
      <ul class="o-nav-list">
        <li
          v-for="item in visiableNavs"
          :key="item.ID"
          :id="'tour_headerNav_' + item.ID"
          class="o-nav-list-item"
          :class="{
            active: navActive === item.ID,
          }"
          @mouseenter="toggleDebounced(item)"
          @mouseleave="toggleDebounced(null)"
        >
          <template v-if="item.ID !== 'more'">
            <span class="nav-item" @click="clickNav(item.ID)">
              {{ item.NAME }}
            </span>
          </template>

          <ODropdown
            v-if="hiddenNavs.length && item.ID === 'more'"
            trigger="hover"
            options-wrapper=".header-content"
            optionPosition="top"
            option-wrap-class="dropdown"
            @mouseenter="toggleDebounced(item)"
          >
            <span id="tour_headerNav_more" class="nav-item">
              {{ i18n.header.MORE }}
            </span>

            <template #dropdown>
              <ODropdownItem v-for="item in hiddenNavs" :key="item.NAME" @click="handleDropdownClick(item)">
                {{ item.NAME }}
              </ODropdownItem>
            </template>
          </ODropdown>

          <transition name="transition">
            <div
              v-if="isShow"
              :class="[
                'nav-dropdown',
                navActive === 'more' ? mroeSelectId : navActive,
                appearanceStore.theme,
                `${navActive}-${lang}`,
                mroeSelectId ? `${mroeSelectId}-${lang}` : '',
              ]"
            >
              <div class="nav-drop-content">
                <OScroller class="nav-scroller" show-type="always" size="small" disabled-y>
                  <div class="nav-sub-content">
                    <div v-if="subNavContent?.length" class="content-left">
                      <div class="item-sub" v-for="(sub, s) in subNavContent" :key="s">
                        <span class="content-title">
                          {{ sub.NAME }}
                        </span>

                        <NavContent :nav-content="sub?.CHILDREN" @link-click="linkClick" />
                      </div>
                    </div>

                    <div class="split-line" v-if="navShortcut?.length"></div>

                    <div class="content-right" v-if="navShortcut?.length">
                      <span class="content-title">{{ i18n.header.QUICKLINK }}</span>
                      <div v-if="!isPicture">
                        <div v-for="shortcut in navShortcut" :key="shortcut.NAME" class="shortcut">
                          <NavLink :url="shortcut.URL" @link-click="linkClick" class="shortcut-link">
                            <span>{{ shortcut.NAME }}</span>
                            <OIcon v-if="shortcut.ICON">
                              <component :is="shortcut.ICON" class="icon" />
                            </OIcon>
                          </NavLink>
                        </div>
                      </div>
                      <div v-else>
                        <NavLink v-for="shortcut in navShortcut" :url="shortcut.URL" :key="shortcut.NAME" class="review" @link-click="linkClick">
                          <img :src="shortcut.PICTURE" class="review-picture" />
                          <div class="review-content">
                            <p class="review-title">
                              {{ shortcut.NAME }}
                            </p>
                            <div class="review-property">
                              <span>{{ shortcut.REMARK }}</span>
                            </div>
                          </div>
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </OScroller>
              </div>
            </div>
          </transition>
        </li>
      </ul>
    </nav>

    <nav v-if="navData.length" class="o-nav o-nav-hidden">
      <ul class="o-nav-list" ref="navHiddenRef">
        <li v-for="item in navData" :key="item.ID" class="o-nav-list-item">
          <span class="nav-item">
            {{ item.NAME }}
          </span>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.o-nav-list-item {
  position: relative;
}

.header-content {
  flex: 1;
  height: 100%;
  margin-right: 64px;
  position: relative;
}

.o-nav {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.o-nav-hidden {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  visibility: hidden;
}

.o-nav-list {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  white-space: nowrap;

  > li {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 100%;
    color: var(--o-color-info1);
    transition: all var(--o-duration-s) var(--o-easing-standard);
    padding-left: 16px;
    padding-right: 16px;
    flex-shrink: 0;
    cursor: pointer;
    @include text1;

    @include respond-to('laptop') {
      padding-left: 12px;
      padding-right: 12px;
    }

    @include respond-to('pad_h') {
      padding-left: 8px;
      padding-right: 8px;
    }

    .nav-item {
      position: relative;
      display: flex;
      align-items: center;
      height: 100%;
    }

    & .nav-item::after {
      content: '';
      position: absolute;
      opacity: 0;
      bottom: 0;
      width: 100%;
      height: 1px;
      border-radius: 1px;
      background: var(--o-color-primary1);
      transition: all var(--o-duration-s) var(--o-easing-standard);
    }

    &.active {
      color: var(--o-color-primary1);
      z-index: 99;
      font-weight: 500;

      & .nav-item::after {
        content: '';
        opacity: 1;
      }

      @include respond-to('<=pad') {
        bottom: 1px;
      }
    }
  }
}

.nav-dropdown {
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  background: var(--o-color-fill2);
  z-index: 90;
  color: var(--o-color-info1);
  display: flex;
  font-weight: normal;
  cursor: default;
  overflow: hidden;
  min-height: 351px;
  justify-content: center;
  transform-origin: top;

  &.light {
    box-shadow: 0 3px 6px rgba(#001255, 0.08);
  }

  @include respond-to('laptop') {
    min-height: 311px;
    top: 64px;
  }
  @include respond-to('pad_h') {
    min-height: 287px;
    top: 56px;
  }

  @include respond-to('>pad_v') {
    &.dark {
      &:after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 1px;
        background-color: var(--o-color-control4);
      }
    }
  }

  .nav-drop-content {
    max-width: 1488px;
    width: calc(100vw - 2 * var(--layout-content-padding));
    display: flex;
  }

  .nav-sub-content {
    height: 100%;
    display: flex;
    flex: 1;
    position: relative;

    .content-left {
      padding: 32px 24px 24px 0;
      display: flex;
      width: calc(100% - 348px);

      @include respond-to('laptop') {
        padding: var(--o-gap-5) var(--o-gap-5) var(--o-gap-5) 0;
        width: calc(100% - 261px);
      }

      @include respond-to('pad_h') {
        width: calc(100% - 261px);
      }

      @include respond-to('<=pad') {
        padding: var(--o-gap-4) 0;
        width: 100%;
      }

      .icon {
        height: 16px;
        width: 16px;
        padding-left: 6px;
      }
    }

    .content-right {
      flex: 1;
      padding-top: var(--o-gap-6);
      padding-bottom: var(--o-gap-6);
      padding-left: var(--o-gap-4);

      @include respond-to('laptop') {
        padding: var(--o-gap-5) 0 var(--o-gap-5) var(--o-gap-4);
      }

      @include respond-to('<=pad') {
        display: none;
      }

      .content-title {
        margin-bottom: var(--o-gap-4);
      }

      .shortcut {
        width: 100%;
        min-height: 42px;
        background: var(--o-color-fill1);
        border-radius: var(--o-radius_control-xs);
        padding: 10px 24px;
        display: flex;
        align-items: center;
        gap: var(--o-gap-3);
        cursor: pointer;
        @include tip1;

        @include respond-to('laptop') {
          width: 245px;
          @include text1;
        }

        @include respond-to('pad_h') {
          width: 245px;
          @include text1;
        }

        & + .shortcut {
          margin-top: var(--o-gap-2);
        }

        .shortcut-link {
          display: flex;
          align-items: center;
          color: var(--o-color-link1);
          word-break: normal;
          white-space: normal;
          @include hover {
            color: var(--o-color-primary2);
          }

          span {
            @include text-truncate(1);
          }

          .icon {
            height: 16px;
            width: 16px;
            margin-left: var(--o-gap-2);
          }
        }
      }

      .review {
        width: 100%;
        display: flex;
        align-items: unset;
        position: relative;

        @include respond-to('laptop') {
          width: 245px;
        }

        @include respond-to('pad_h') {
          width: 245px;
          &:not(:last-child) {
            &:after {
              content: '';
              position: absolute;
              left: 0;
              right: 0;
              bottom: -8px;
              height: 1px;
              background: var(--o-color-control4);
            }
          }
        }

        & + .review {
          margin-top: var(--o-gap-3);
        }

        .review-picture {
          width: 120px;
          height: auto;
          display: block;
          object-fit: contain;
          border-radius: var(--o-radius-xs);

          @include respond-to('<=laptop') {
            display: none;
          }
        }

        .review-content {
          margin-left: var(--o-gap-2);
          flex: 1;
          max-width: 212px;
          height: 68px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          white-space: normal;

          @include respond-to('<=laptop') {
            margin-left: unset;
            height: auto;
          }

          .review-title {
            max-height: 48px;
            color: var(--o-color-info1);
            font-weight: 500;
            cursor: pointer;
            @include text1;
            @include text-truncate(2);
            word-break: normal;

            @include hover {
              color: var(--o-color-primary1);
            }

            @include respond-to('pad_v-laptop') {
              max-height: 44px;
            }
          }

          .review-property {
            color: var(--o-color-info3);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            @include tip2;
          }
        }
      }
    }

    .split-line {
      background: var(--o-color-control4);
      width: 1px;
      min-height: 320px;
      flex-shrink: 0;

      @include respond-to('laptop') {
        min-height: 300px;
      }

      @include respond-to('<=pad') {
        display: none;
      }
    }

    .content-title {
      display: block;
      color: var(--o-color-info3);
      margin-bottom: var(--o-gap-3);
      @include tip1;

      @include respond-to('laptop') {
        @include text1;
      }

      @include respond-to('<=pad') {
        margin-bottom: var(--o-gap-2);
      }
    }

    .o-divider {
      --o-divider-gap: var(--o-gap-4);

      @include respond-to('laptop') {
        --o-divider-gap: var(--o-gap-3);
      }
    }
  }

  &.download {
    .item-sub {
      margin-left: 24px;
      flex: 1;

      .content-container {
        :deep(.content-item) {
          width: calc(50% - 12px);
          margin-left: 24px;

          &:nth-child(2n + 1) {
            margin-left: 0;
          }

          &:nth-of-type(2) {
            margin-top: 0;
          }
        }
      }

      &:nth-of-type(1) {
        margin-left: 0;
      }

      @include respond-to('laptop') {
        margin-left: 16px;

        .content-container {
          :deep(.content-item) {
            width: calc(50% - 8px);
            margin-left: 16px;
          }
        }
      }

      @include respond-to('pad_h') {
        margin-left: 12px;

        .content-container {
          :deep(.content-item) {
            width: calc(50% - 6px);
            margin-left: 12px;
          }
        }
      }
    }
  }

  &.development {
    .item-sub {
      flex: 1;

      .content-container {
        :deep(.content-item) {
          width: calc((100% - 72px) / 4);
          margin-left: 24px;
          margin-top: 0;

          &:nth-of-type(1) {
            margin-left: 0;
          }
        }
      }

      @include respond-to('laptop') {
        .content-container {
          :deep(.content-item) {
            width: calc((100% - 48px) / 4);
            margin-left: 16px;
          }
        }
      }

      @include respond-to('pad_h') {
        .content-container {
          :deep(.content-item) {
            width: calc((100% - 36px) / 4);
            margin-left: 12px;
          }
        }
      }
    }
  }

  &.document {
    .item-sub {
      flex: 1;
      .content-container {
        :deep(.content-item) {
          margin-left: 24px;
          width: calc((100% - 72px) / 4);
          margin-top: 0;

          &:nth-of-type(4n + 1) {
            margin-left: 0;
          }

          &:nth-of-type(n + 5) {
            margin-top: 24px;
          }
        }
      }

      @include respond-to('laptop') {
        .content-container {
          :deep(.content-item) {
            width: calc((100% - 48px) / 4);
            margin-left: 16px;

            &:nth-of-type(n + 5) {
              margin-top: 16px;
            }
          }
        }
      }

      @include respond-to('pad_h') {
        .content-container {
          :deep(.content-item) {
            width: calc((100% - 36px) / 4);
            margin-left: 12px;

            &:nth-of-type(n + 5) {
              margin-top: 12px;
            }
          }
        }
      }
    }
  }

  &.learn {
    .item-sub {
      margin-left: 24px;
      flex: 1;

      .content-container {
        :deep(.content-item) {
          width: calc(50% - 12px);
          margin-left: 24px;

          &:nth-child(2n + 1) {
            margin-left: 0;
          }

          &:nth-of-type(2) {
            margin-top: 0;
          }
        }
      }

      &:nth-of-type(1) {
        margin-left: 0;
      }

      @include respond-to('laptop') {
        margin-left: 24px;

        .content-container {
          :deep(.content-item) {
            width: calc(50% - 8px);
            margin-left: 16px;
          }
        }
      }

      @include respond-to('pad_h') {
        margin-left: 16px;

        .content-container {
          :deep(.content-item) {
            width: calc(50% - 6px);
            margin-left: 12px;
          }
        }
      }
    }
  }

  &.learn-en {
    .item-sub {
      .content-container {
        :deep(.content-item) {
          width: calc((100% - 72px) / 4);
          margin-left: 24px;
          margin-top: 0;

          &:nth-child(2n + 1):not(:nth-child(1)) {
            margin-left: 24px;
          }

          @include respond-to('laptop') {
            width: calc((100% - 48px) / 4);
            margin-left: 16px;
            &:nth-child(2n + 1):not(:nth-child(1)) {
              margin-left: 16px;
            }
          }

          @include respond-to('pad_h') {
            width: calc((100% - 36px) / 4);
            margin-left: 12px;
            &:nth-child(2n + 1):not(:nth-child(1)) {
              margin-left: 12px;
            }
          }
        }
      }
    }
  }

  &.approve {
    .item-sub {
      margin-left: 24px;
      flex: 1;

      .content-container {
        :deep(.content-item) {
          width: 100%;
        }
      }

      &:nth-of-type(1) {
        margin-left: 0;
      }

      @include respond-to('laptop') {
        margin-left: 16px;
      }

      @include respond-to('pad_h') {
        margin-left: 12px;
      }
    }
  }

  &.approve-en {
    .item-sub {
      .content-container {
        :deep(.content-item) {
          margin-top: 0;
          margin-left: 24px;
          width: calc(50% - 12px);

          &:nth-child(2n + 1) {
            margin-left: 0;
          }
          &:nth-child(n + 3) {
            margin-top: 24px;
          }
          @include respond-to('laptop') {
            margin-left: 16px;
            width: calc(50% - 8px);
            &:nth-child(n + 3) {
              margin-top: 16px;
            }
          }
          @include respond-to('pad_h') {
            margin-left: 12px;
            width: calc(50% - 6px);
            &:nth-child(n + 3) {
              margin-top: 12px;
            }
          }
        }
      }
    }
  }

  &.community {
    .item-sub {
      margin-left: 24px;
      flex: 1;

      .content-container {
        :deep(.content-item) {
          width: calc(50% - 12px);
          margin-left: 24px;

          &:nth-child(2n + 1) {
            margin-left: 0;
          }

          &:nth-of-type(2) {
            margin-top: 0;
          }
        }
      }

      &:nth-of-type(1) {
        margin-left: 0;
      }

      @include respond-to('laptop') {
        margin-left: 16px;

        .content-container {
          :deep(.content-item) {
            width: calc(50% - 8px);
            margin-left: 16px;
          }
        }
      }

      @include respond-to('pad_h') {
        margin-left: 12px;

        .content-container {
          :deep(.content-item) {
            width: calc(50% - 6px);
            margin-left: 12px;
          }
        }
      }
    }
  }

  &.update {
    .item-sub {
      margin-left: 24px;
      flex: 1;

      .content-container {
        :deep(.content-item) {
          width: calc(50% - 12px);
          margin-left: 24px;

          &:nth-child(2n + 1) {
            margin-left: 0;
          }

          &:nth-of-type(2) {
            margin-top: 0;
          }
        }
      }

      &:nth-of-type(1) {
        margin-left: 0;
      }

      @include respond-to('laptop') {
        margin-left: 16px;

        .content-container {
          :deep(.content-item) {
            width: calc(50% - 8px);
            margin-left: 16px;
          }
        }
      }

      @include respond-to('pad_h') {
        margin-left: 12px;

        .content-container {
          :deep(.content-item) {
            width: calc(50% - 6px);
            margin-left: 12px;
          }
        }
      }
    }
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

  &.active {
    color: var(--o-color-primary1);
    background: var(--o-color-control3-light);
  }
}

:deep(.dropdown) {
  --dropdown-list-radius: var(--o-radius-s);
}

html[lang='en'] {
  .nav-item {
    @media (min-width: 841px) and (max-width: 1000px) {
      padding: var(--o-gap-2) !important;
    }
  }
}

.transition-enter-active,
.transition-leave-active {
  transition: opacity var(--o-duration-m3);
}

.transition-enter-from,
.transition-leave-to {
  opacity: 0;
}

.nav-scroller {
  :deep(.o-scrollbar) {
    --scrollbar-height: 100%;
  }

  height: 100%;
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  white-space: nowrap;

  @include respond-to('<=pad_v') {
    --scroller-padding: 0 var(--layout-content-padding);
  }
}
</style>
