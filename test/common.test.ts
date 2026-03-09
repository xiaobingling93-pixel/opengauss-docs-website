import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TreeNodeT } from '../app/.vitepress/src/@types/type-tree';
import {
  windowOpen,
  getUrlParams,
  scrollToTop,
  getSearchUrlParams,
  getYearByOffset,
  getDomId,
  getSourceUrl,
} from '../app/.vitepress/src/utils/common';

describe('common', () => {
  describe('windowOpen', () => {
    it('should open window and set opener to null', () => {
      const mockOpener = { opener: {} };
      const openSpy = vi.spyOn(window, 'open').mockReturnValue(mockOpener as any);

      windowOpen('https://example.com', '_blank');

      expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', undefined);
      expect(mockOpener.opener).toBeNull();

      openSpy.mockRestore();
    });

    it('should handle null return from window.open', () => {
      const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

      expect(() => windowOpen('https://example.com')).not.toThrow();

      openSpy.mockRestore();
    });

    it('should pass all parameters to window.open', () => {
      const mockOpener = { opener: {} };
      const openSpy = vi.spyOn(window, 'open').mockReturnValue(mockOpener as any);

      windowOpen('https://example.com', '_blank', 'width=500,height=500');

      expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'width=500,height=500');

      openSpy.mockRestore();
    });
  });

  describe('getUrlParams', () => {
    it('should parse URL parameters', () => {
      const result = getUrlParams('https://example.com?foo=bar&baz=qux');
      expect(result).toEqual({ foo: 'bar', baz: 'qux' });
    });

    it('should handle single parameter', () => {
      const result = getUrlParams('https://example.com?key=value');
      expect(result).toEqual({ key: 'value' });
    });

    it('should return undefined for URL without parameters', () => {
      const result = getUrlParams('https://example.com');
      expect(result).toBeUndefined();
    });

    it('should handle empty parameter values', () => {
      const result = getUrlParams('https://example.com?key=');
      expect(result).toEqual({ key: '' });
    });

    it('should handle multiple question marks', () => {
      const result = getUrlParams('https://example.com?key=value?extra');
      expect(result).toEqual({ key: 'value' });
    });
  });

  describe('scrollToTop', () => {
    it('should scroll to top with smooth behavior', () => {
      const mockScrollTo = vi.fn();
      const mockElement = { scrollTo: mockScrollTo };
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as any);

      scrollToTop(0, true);

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('should scroll to specified position', () => {
      const mockScrollTo = vi.fn();
      const mockElement = { scrollTo: mockScrollTo };
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as any);

      scrollToTop(100, false);

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 100,
        behavior: 'instant',
      });
    });

    it('should handle missing element gracefully', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);

      expect(() => scrollToTop()).not.toThrow();
    });

    it('should use default parameters', () => {
      const mockScrollTo = vi.fn();
      const mockElement = { scrollTo: mockScrollTo };
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as any);

      scrollToTop();

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });
  });

  describe('getSearchUrlParams', () => {
    it('should parse search parameters', () => {
      const params = getSearchUrlParams('https://example.com?foo=bar&baz=qux');
      expect(params.get('foo')).toBe('bar');
      expect(params.get('baz')).toBe('qux');
    });

    it('should handle empty search', () => {
      const params = getSearchUrlParams('https://example.com');
      expect(params.toString()).toBe('');
    });

    it('should handle encoded parameters', () => {
      const params = getSearchUrlParams('https://example.com?name=John%20Doe');
      expect(params.get('name')).toBe('John Doe');
    });
  });

  describe('getYearByOffset', () => {
    it('should return year with default offset (UTC+8)', () => {
      const year = getYearByOffset();
      expect(year).toBeGreaterThan(2020);
      expect(year).toBeLessThan(2100);
    });

    it('should return year with custom offset', () => {
      const year = getYearByOffset(0);
      expect(year).toBeGreaterThan(2020);
      expect(year).toBeLessThan(2100);
    });

    it('should handle negative offset', () => {
      const year = getYearByOffset(-5);
      expect(year).toBeGreaterThan(2020);
      expect(year).toBeLessThan(2100);
    });

    it('should handle large positive offset', () => {
      const year = getYearByOffset(12);
      expect(year).toBeGreaterThan(2020);
      expect(year).toBeLessThan(2100);
    });
  });

  describe('getDomId', () => {
    it('should convert string to valid DOM id', () => {
      const result = getDomId('Hello World');
      expect(result).toBe('hello-world');
    });

    it('should remove special characters', () => {
      const result = getDomId('Hello@World!');
      expect(result).toBe('helloworld');
    });

    it('should handle Chinese characters', () => {
      const result = getDomId('你好世界');
      expect(result).toBe('你好世界');
    });

    it('should handle mixed content', () => {
      const result = getDomId('Test 123 ABC');
      expect(result).toBe('test-123-abc');
    });

    it('should handle empty string', () => {
      const result = getDomId('');
      expect(result).toBe('');
    });

    it('should handle only special characters', () => {
      const result = getDomId('!@#$%');
      expect(result).toBe('');
    });

    it('should handle multiple spaces', () => {
      const result = getDomId('Hello   World');
      expect(result).toBe('hello---world');
    });
  });

  describe('getSourceUrl', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      delete (window as any).location;
      window.location = { pathname: '' } as any;
    });

    afterEach(() => {
      window.location = originalLocation;
    });

    it('should return empty string for null node', () => {
      const result = getSourceUrl(null);
      expect(result).toBe('');
    });

    it('should return upstream if present', () => {
      const node: TreeNodeT = {
        id: '1',
        label: 'Node',
        depth: 1,
        href: '/test',
        parent: null,
        description: null,
        type: 'page',
        isManual: false,
        upstream: 'https://upstream.example.com',
        children: [],
      };

      const result = getSourceUrl(node);
      expect(result).toBe('https://upstream.example.com');
    });

    it('should generate URL for .html path', () => {
      window.location = { pathname: '/zh/docs/latest/test.html' } as any;

      const node: TreeNodeT = {
        id: '1',
        label: 'Node',
        depth: 1,
        href: '/test',
        parent: null,
        description: null,
        type: 'page',
        isManual: false,
        upstream: '',
        children: [],
      };

      const result = getSourceUrl(node);
      expect(result).toContain('gitcode.com');
      expect(result).toContain('/zh/');
      expect(result).toContain('.md');
    });

    it('should generate URL for path ending with /', () => {
      window.location = { pathname: '/zh/docs/latest/test/' } as any;

      const node: TreeNodeT = {
        id: '1',
        label: 'Node',
        depth: 1,
        href: '/test',
        parent: null,
        description: null,
        type: 'page',
        isManual: false,
        upstream: '',
        children: [],
      };

      const result = getSourceUrl(node);
      expect(result).toContain('index.md');
    });

    it('should generate URL for path without extension', () => {
      window.location = { pathname: '/zh/docs/latest/test' } as any;

      const node: TreeNodeT = {
        id: '1',
        label: 'Node',
        depth: 1,
        href: '/test',
        parent: null,
        description: null,
        type: 'page',
        isManual: false,
        upstream: '',
        children: [],
      };

      const result = getSourceUrl(node);
      expect(result).toContain('test.md');
    });

    it('should handle common branch', () => {
      window.location = { pathname: '/zh/docs/common/test.html' } as any;

      const node: TreeNodeT = {
        id: '1',
        label: 'Node',
        depth: 1,
        href: '/test',
        parent: null,
        description: null,
        type: 'page',
        isManual: false,
        upstream: '',
        children: [],
      };

      const result = getSourceUrl(node);
      expect(result).toContain('/common/');
    });

    it('should handle latest branch', () => {
      window.location = { pathname: '/zh/docs/latest/test.html' } as any;

      const node: TreeNodeT = {
        id: '1',
        label: 'Node',
        depth: 1,
        href: '/test',
        parent: null,
        description: null,
        type: 'page',
        isManual: false,
        upstream: '',
        children: [],
      };

      const result = getSourceUrl(node);
      expect(result).toContain('/master/');
    });

    it('should handle lite branch', () => {
      window.location = { pathname: '/zh/docs/5.0.0-lite/test.html' } as any;

      const node: TreeNodeT = {
        id: '1',
        label: 'Node',
        depth: 1,
        href: '/test',
        parent: null,
        description: null,
        type: 'page',
        isManual: false,
        upstream: '',
        children: [],
      };

      const result = getSourceUrl(node);
      expect(result).toContain('/5.0.0-lite/');
      expect(result).toContain('docs-lite');
    });

    it('should handle version branch', () => {
      window.location = { pathname: '/zh/docs/5.0.0/test.html' } as any;

      const node: TreeNodeT = {
        id: '1',
        label: 'Node',
        depth: 1,
        href: '/test',
        parent: null,
        description: null,
        type: 'page',
        isManual: false,
        upstream: '',
        children: [],
      };

      const result = getSourceUrl(node);
      expect(result).toContain('/5.0.0/');
    });

    it('should handle English locale', () => {
      window.location = { pathname: '/en/docs/latest/test.html' } as any;

      const node: TreeNodeT = {
        id: '1',
        label: 'Node',
        depth: 1,
        href: '/test',
        parent: null,
        description: null,
        type: 'page',
        isManual: false,
        upstream: '',
        children: [],
      };

      const result = getSourceUrl(node);
      expect(result).toContain('/en/');
    });
  });
});
