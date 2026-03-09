import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getCurrentLocale } from '../app/.vitepress/src/utils/locale';

describe('locale', () => {
  describe('getCurrentLocale', () => {
    const originalLocation = window.location;
    const originalNavigator = window.navigator;

    beforeEach(() => {
      delete (window as any).location;
      delete (window as any).navigator;
      localStorage.clear();
    });

    afterEach(() => {
      window.location = originalLocation;
      window.navigator = originalNavigator;
    });

    it('should return "zh" when pathname starts with /zh/', () => {
      window.location = { pathname: '/zh/docs/index.html' } as any;
      expect(getCurrentLocale()).toBe('zh');
    });

    it('should return "en" when pathname starts with /en/', () => {
      window.location = { pathname: '/en/docs/index.html' } as any;
      expect(getCurrentLocale()).toBe('en');
    });

    it('should return "zh" when localStorage has "zh"', () => {
      window.location = { pathname: '/docs/index.html' } as any;
      localStorage.setItem('locale', 'zh');
      expect(getCurrentLocale()).toBe('zh');
    });

    it('should return "en" when localStorage has "en"', () => {
      window.location = { pathname: '/docs/index.html' } as any;
      localStorage.setItem('locale', 'en');
      expect(getCurrentLocale()).toBe('en');
    });

    it('should return "en" when localStorage has other value', () => {
      window.location = { pathname: '/docs/index.html' } as any;
      localStorage.setItem('locale', 'fr');
      expect(getCurrentLocale()).toBe('en');
    });

    it('should return "zh" when navigator.language starts with "zh"', () => {
      window.location = { pathname: '/docs/index.html' } as any;
      window.navigator = { language: 'zh-CN' } as any;
      expect(getCurrentLocale()).toBe('zh');
    });

    it('should return "zh" when navigator.language is "ZH-CN" (case insensitive)', () => {
      window.location = { pathname: '/docs/index.html' } as any;
      window.navigator = { language: 'ZH-CN' } as any;
      expect(getCurrentLocale()).toBe('zh');
    });

    it('should return "en" when navigator.language does not start with "zh"', () => {
      window.location = { pathname: '/docs/index.html' } as any;
      window.navigator = { language: 'en-US' } as any;
      expect(getCurrentLocale()).toBe('en');
    });
  });
});
