import { defineStore } from 'pinia';

// 语言
export const useLangStore = defineStore('lang', {
  state: () => {
    return {
      lang: '',
    };
  },
  actions: {
    setLangStore(val: string) {
      this.lang = val;
    },
  },
});

export const useAppearance = defineStore('appearance', {
  state: () => ({
    theme: 'light' as 'light' | 'dark',
    iconMenuShow: true,
  }),
});

/**
 * 搜索状态
 */
export const useSearchingStore = defineStore('isSearching', {
  state: () => {
    return {
      isSearching: false,
      keyword: '',
      lastSearchValue: '',
      isLoading: false,
      currentPage: 1,
    };
  },
  actions: {
    setIsSearching(value: boolean) {
      this.isSearching = value;
    },
    setKeyword(value: string) {
      this.keyword = value;
    },
    setLastSearchValue(value: string) {
      this.lastSearchValue = value;
    },
    setIsLoading(value: boolean) {
      this.isLoading = value;
    },
    setCurrentPage(value: number) {
      this.currentPage = value;
    },
    clearSearch() {
      this.isLoading = false;
      this.isSearching = false;
      this.lastSearchValue = '';
    },
  },
});

// cookie状态
export const COOKIE_AGREED_STATUS = {
  NOT_SIGNED: '0', // 未签署
  ALL_AGREED: '1', // 同意所有cookie
  NECCESSARY_AGREED: '2', // 仅同意必要cookie
  NOT_SHOW_BUT_AGREED: '3', // 不再显示但已同意
};

// cookie key
export const COOKIE_KEY = 'agreed-cookiepolicy';
export const COOKIE_KEY_ZH = 'agreed-cookiepolicy-zh';
export const COOKIE_KEY_EN = 'agreed-cookiepolicy-en';

/**
 * cookie版本
 */
export const useCookieStore = defineStore('cookie', {
  state: () => ({
    status: '0',
    isNoticeVisible: false,
  }),
});
