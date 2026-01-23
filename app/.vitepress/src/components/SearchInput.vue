<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import axios, { type Canceler } from 'axios';
import { OInput, OIcon, OPopup, ODropdownItem, OScroller } from '@opensig/opendesign';

import IconSearch from '~icons/app/icon-search.svg';

import { useSearchingStore } from '@/stores/common';
import { useScreen } from '@/composables/useScreen';
import { useLocale } from '@/composables/useLocale';

import type { SearchRecommendT } from '@/@types/type-search';
import { getSearchRecommend } from '@/api/api-search';
import { onClickOutside, useElementSize } from '@vueuse/core';

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['switchVisible']);

const { t, locale } = useLocale();
const { size } = useScreen();
// 搜索状态库
const searchStore = useSearchingStore();
// 本次搜索值
const searchValue = ref('');

// -------------------- 回车搜索文档 --------------------
const enterSearchDoc = () => {
  clearTimeout(timer);
  const input = searchValue.value.trim();
  if (!input) {
    return;
  }

  if (lastRecommendCanceler) {
    lastRecommendCanceler('cancel');
  }
  showSearchWord.value = false;
  if (searchStore.lastSearchValue !== input) {
    searchStore.setIsSearching(true);
    searchStore.setKeyword(input);
    searchStore.setIsLoading(true);
    searchStore.setCurrentPage(1);
    searchStore.setLastSearchValue(input);
  }
  if (size.width < 1200) {
    emit('switchVisible');
  }
};

const clearSearchDoc = () => {
  showSearchWord.value = false;
  recommendData.value = [];
  searchStore.clearSearch();
};

// ----------------- 联想搜索 -------------------------
let timer: number | NodeJS.Timeout | undefined;
let lastRecommendCanceler: Canceler | null;
const recommendData = ref<SearchRecommendT[]>([]);
const showSearchWord = ref(false);

const queryGetSearchRecommend = async (val: string) => {
  if (lastRecommendCanceler) {
    lastRecommendCanceler('cancel');
  }

  const cancelToken = new axios.CancelToken((canceler) => {
    lastRecommendCanceler = canceler;
  });

  try {
    const res = await getSearchRecommend(
      {
        query: val,
        lang: locale.value,
      },
      cancelToken
    );
    lastRecommendCanceler = null;
    res.obj.word.forEach((e: SearchRecommendT) => {
      e.keyHtml = e.key.replace(val, `<span class="found">${val}</span>`);
    });

    if (searchValue.value.trim() === val) {
      recommendData.value = res.obj.word;
      showSearchWord.value = recommendData.value.length > 0;
    }
  } catch {
    // nothing
  }
};

const searchRecommendDebounce = (val: string) => {
  clearTimeout(timer);
  timer = setTimeout(() => queryGetSearchRecommend(val), 300);
};

onUnmounted(() => {
  clearTimeout(timer);
  timer = undefined;
});

const onInputValueInput = () => {
  if (searchValue.value.trim()) {
    searchRecommendDebounce(searchValue.value.trim());
  } else {
    recommendData.value = [];
    showSearchWord.value = false;
  }
};

const onClickWordItem = (item: SearchRecommendT) => {
  searchValue.value = item.key;
  enterSearchDoc();
};

const inputRef = ref();
const scrollerRef = ref();
onClickOutside(
  inputRef,
  () => {
    recommendData.value = [];
    showSearchWord.value = false;
  },
  {
    ignore: [scrollerRef],
  }
);

watch(searchValue, () => {
  if (!searchValue.value.trim()) {
    clearSearchDoc();
  }
});

const inputContainerRef = ref<HTMLElement>();
const { width } = useElementSize(inputContainerRef);
const inputWidth = computed(() => {
  return width.value ? `${width.value - 8}px` : '100%';
});
</script>

<template>
  <div ref="inputContainerRef" class="doc-search">
    <OInput
      ref="inputRef"
      :style="{ width: '100%' }"
      v-model="searchValue"
      size="large"
      :disabled="disabled"
      :placeholder="t('docs.innerInputTip')"
      @keyup.enter="enterSearchDoc"
      @clear="clearSearchDoc"
      clearable
      @input="onInputValueInput"
    >
      <template #prefix>
        <OIcon :style="{ fontSize: '24px' }">
          <IconSearch />
        </OIcon>
      </template>
    </OInput>

    <OPopup :wrapper="inputContainerRef?.parentElement" :target="inputRef" :visible="showSearchWord" trigger="none" position="bottom">
      <OScroller ref="scrollerRef" class="search-scroller" show-type="hover" size="small" disabled-x>
        <ODropdownItem
          v-for="item in recommendData"
          v-dompurify-html="item.keyHtml"
          :key="item.key"
          :style="{
            '--dropdown-item-color-hover': 'var(--o-color-info2)',
            '--dropdown-item-padding': '8px 12px',
            display: 'block',
            width: inputWidth,
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap',
          }"
          @click="onClickWordItem(item)"
        />
      </OScroller>
    </OPopup>
  </div>
</template>

<style lang="scss" scoped>
.doc-search {
  position: relative;
  z-index: 99;
  .o-input {
    transition: width var(--o-easing-standard-in) var(--o-duration-m2);
  }

  margin-bottom: 24px;
  height: 40px;

  @include respond-to('<=laptop') {
    margin-bottom: 16px;

    .o-icon {
      font-size: 16px;
    }
  }
}

.search-panel {
  width: 100%;
  background-color: var(--o-color-fill2);
  padding: 12px 16px;
  box-shadow: var(--o-shadow-1);
  border-radius: var(--o-radius-s);
  z-index: 99;
  margin-top: 4px;
  color: var(--o-color-info1);
}

.panel-item {
  @include tip1;
  padding-left: 8px;
  padding-right: 8px;
  border-radius: var(--o-radius-s);
  height: 32px;
  line-height: 32px;
  cursor: pointer;
  opacity: 0.8;
  display: flex;
  align-items: center;
  :deep(span) {
    color: var(--o-color-link1);
  }
  @include hover {
    background-color: var(--o-color-fill3);
  }
}

.scroll {
  transition: height var(--o-easing-standard-in) var(--o-duration-m2);
  max-height: 300px;
}

:deep(.search-empty) {
  --result-image-width: 120px;
  --result-image-height: 105px;
  @include respond-to('<=laptop') {
    --result-image-width: 80px;
    --result-image-height: 70px;
  }
}

.search-scroller {
  max-height: 304px;
  padding: 4px;
  border-radius: var(--o-radius-xs);
  background-color: var(--o-color-fill2);

  :deep(.found) {
    color: var(--o-color-primary1);
  }
}
</style>
