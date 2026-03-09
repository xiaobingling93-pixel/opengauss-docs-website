<script setup lang="ts">
import { ref } from 'vue';
import { OTag, OIcon } from '@opensig/opendesign';

import NavLink from './NavLink.vue';
import { type PropType } from 'vue';

defineProps({
  navContent: {
    type: Array as PropType<any[]>,
    default() {
      return [];
    },
  },
  isMobile: {
    type: Boolean,
    default() {
      return false;
    },
  },
});

const emits = defineEmits(['link-click']);

const linkClick = () => {
  emits('link-click');
};

const showDesc = ref(false);
const descMouseenter = (e: MouseEvent) => {
  if (!e || !e.target) return;
  const target = e.target as HTMLElement;
  showDesc.value = target.clientHeight < target.scrollHeight;
};
</script>

<template>
  <div v-if="isMobile" class="container-mobile">
    <div v-for="subItem in navContent" :key="subItem.NAME" class="content-container-mobile">
      <NavLink :url="subItem.URL" class="content-subtitle" @link-click="linkClick">
        <span class="content-subtitle-text">{{ subItem.NAME }}</span>
        <OIcon v-if="subItem.ICON">
          <component :is="subItem.ICON" class="icon" />
        </OIcon>
        <OTag v-if="subItem.TAG" color="danger" class="content-tag">{{ subItem.TAG }}</OTag>
      </NavLink>
      <div class="desc-container">
        <p class="item-desc">{{ subItem.DESCRIPTION }}</p>
      </div>
    </div>
  </div>

  <div v-else class="content-container">
    <div v-for="subItem in navContent" :key="subItem.NAME" class="content-item">
      <div class="item-title">
        <NavLink :url="subItem.URL" class="item-name" @link-click="linkClick">
          {{ subItem.NAME }}
          <OIcon v-if="subItem.ICON">
            <component :is="subItem.ICON" class="icon" />
          </OIcon>
          <OTag v-if="subItem.TAG" color="danger" size="small" class="content-tag">{{ subItem.TAG }}</OTag>
        </NavLink>
      </div>
      <div class="desc-container">
        <p class="item-desc" :title="showDesc ? subItem.DESCRIPTION : null" @mouseenter="descMouseenter($event)">
          {{ subItem.DESCRIPTION }}
        </p>
      </div>
      <div v-if="subItem.CHILDREN" class="system-container">
        <NavLink v-for="system in subItem.CHILDREN" :key="system.URL" :url="system.URL" class="system" @link-click="linkClick">
          {{ system.NAME }}
          <OIcon v-if="system.ICON">
            <component :is="system.ICON" class="icon" />
          </OIcon>
        </NavLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.link {
  color: var(--o-color-info1);
  cursor: pointer;

  @include hover {
    color: var(--o-color-primary1);
  }
}

.icon {
  font-size: var(--o-icon_size-xs);
  margin-left: var(--o-gap-2);
}

.content-container {
  display: flex;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;

  .content-item {
    margin-top: 24px;

    &:nth-of-type(1) {
      margin-top: 0;
    }

    @include respond-to('laptop') {
      margin-top: 16px;
    }

    @include respond-to('pad_h') {
      margin-top: 12px;
    }
  }

  .item-title {
    margin-bottom: var(--o-gap-1);
    display: flex;
    align-items: center;

    .item-name {
      font-weight: 500;
      white-space: nowrap;
      @include text1;
      @include text-truncate(1);
    }
    .content-tag {
      margin-left: var(--o-gap-2);
    }
  }
  .desc-container {
    overflow: hidden;
    position: relative;
    white-space: normal;

    .item-desc {
      color: var(--o-color-info2);
      margin: 0;
      white-space: normal;
      @include tip2;
      @include text-truncate(6);
      word-break: normal;
    }
  }

  .system-container {
    display: flex;
    flex-wrap: wrap;
    padding-top: var(--o-gap-3);

    .system {
      font-weight: 500;
      margin: 0;
      display: flex;
      align-items: center;

      @include tip1;

      &:not(:last-child) {
        margin-right: var(--o-gap-5);

        @media screen and (max-width: 1780px) {
          margin-right: var(--o-gap-4);
        }
      }
    }
  }
}

.container-mobile .content-container-mobile:last-child {
  margin-bottom: 12px;
}

.content-container-mobile {
  margin-right: var(--o-gap-1);
  margin-top: var(--o-gap-3);

  .content-subtitle {
    display: flex;
    font-weight: 500;
    color: var(--o-color-info1);
    @include text2;

    .content-subtitle-text {
      flex: 1;
      @include text-truncate(1);
    }
  }

  .content-tag {
    margin-left: var(--o-gap-2);
  }

  .desc-container {
    overflow: hidden;
    position: relative;

    .item-desc {
      color: var(--o-color-info2);
      margin-top: var(--o-gap-1);
      text-align: left;
      word-break: normal;
      @include text1;
      @include text-truncate(6);
      word-break: break-word;
    }
  }

  .system-container {
    display: flex;
    flex-wrap: wrap;
    column-gap: var(--o-gap-5);
    row-gap: var(--o-gap-1);

    .system {
      font-weight: 500;
      margin: 0;
      display: flex;
      align-items: center;
      color: var(--o-color-primary1);
      @include text1;
    }
  }
}
</style>
