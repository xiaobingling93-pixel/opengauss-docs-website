import { computed, ref } from 'vue';
import { useData } from 'vitepress';
import { defineStore } from 'pinia';

export const useViewStore = defineStore('view', () => {
  const { page, frontmatter } = useData();

  // sider宽度
  const siderWidth = ref(272);

  // 容器是否在滚动
  const isScrolling = ref(false);

  // 是否为主页页面
  const isHomeView = computed(() => {
    return page.value.filePath === 'zh/index.md' || page.value.filePath === 'en/index.md';
  });

  // 是否为通用文章页面
  const isCustomView = computed(() => {
    return frontmatter.value.layout === 'page';
  });

  // 页面是否加载完成
  const isPageLoaded = ref(isHomeView.value || isCustomView.value);

  // 页面是否为无菜单页面
  const isNoMenuView = ref(false);

  return {
    isPageLoaded,
    siderWidth,
    isScrolling,
    isHomeView,
    isCustomView,
    isNoMenuView,
  };
});
