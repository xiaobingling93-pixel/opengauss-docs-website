import { describe, it, expect, beforeEach } from 'vitest';
import { getOffsetTop, isDocument, isElementVisible, getScrollRemainingBottom, isOverlap } from '../app/.vitepress/src/utils/element';

describe('element', () => {
  describe('getOffsetTop', () => {
    it('should return offset top relative to window', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);

      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        bottom: 200,
        left: 0,
        right: 0,
        width: 0,
        height: 100,
        x: 0,
        y: 100,
        toJSON: () => ({}),
      });

      const result = getOffsetTop(el, window);
      expect(result).toBe(100 - document.documentElement.clientTop);

      document.body.removeChild(el);
    });

    it('should return offset top relative to container', () => {
      const container = document.createElement('div');
      const el = document.createElement('div');
      document.body.appendChild(container);
      container.appendChild(el);

      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 150,
        bottom: 250,
        left: 0,
        right: 0,
        width: 0,
        height: 100,
        x: 0,
        y: 150,
        toJSON: () => ({}),
      });

      vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        bottom: 500,
        left: 0,
        right: 0,
        width: 0,
        height: 450,
        x: 0,
        y: 50,
        toJSON: () => ({}),
      });

      const result = getOffsetTop(el, container);
      expect(result).toBe(100);

      document.body.removeChild(container);
    });
  });

  describe('isDocument', () => {
    it('should return true for Document instance', () => {
      expect(isDocument(document)).toBe(true);
    });

    it('should return true for HTMLDocument', () => {
      const doc = document.implementation.createHTMLDocument('test');
      expect(isDocument(doc)).toBe(true);
    });

    it('should return false for non-document values', () => {
      expect(isDocument(window)).toBe(false);
      expect(isDocument(document.body)).toBe(false);
      expect(isDocument(null)).toBe(false);
      expect(isDocument(undefined)).toBe(false);
      expect(isDocument({})).toBe(false);
      expect(isDocument('document')).toBe(false);
    });
  });

  describe('isElementVisible', () => {
    it('should return true when element is fully visible', () => {
      const parent = document.createElement('div');
      const el = document.createElement('div');
      document.body.appendChild(parent);
      parent.appendChild(el);

      vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 500,
        left: 0,
        right: 500,
        width: 500,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        bottom: 200,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 100,
        toJSON: () => ({}),
      });

      expect(isElementVisible(el, parent, 50)).toBe(true);

      document.body.removeChild(parent);
    });

    it('should return false when element is not visible enough', () => {
      const parent = document.createElement('div');
      const el = document.createElement('div');
      document.body.appendChild(parent);
      parent.appendChild(el);

      vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 100,
        left: 0,
        right: 500,
        width: 500,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 90,
        bottom: 200,
        left: 0,
        right: 100,
        width: 100,
        height: 110,
        x: 0,
        y: 90,
        toJSON: () => ({}),
      });

      expect(isElementVisible(el, parent, 50)).toBe(false);

      document.body.removeChild(parent);
    });

    it('should return true when visible height equals min', () => {
      const parent = document.createElement('div');
      const el = document.createElement('div');
      document.body.appendChild(parent);
      parent.appendChild(el);

      vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 100,
        left: 0,
        right: 500,
        width: 500,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        bottom: 100,
        left: 0,
        right: 100,
        width: 100,
        height: 50,
        x: 0,
        y: 50,
        toJSON: () => ({}),
      });

      expect(isElementVisible(el, parent, 50)).toBe(true);

      document.body.removeChild(parent);
    });
  });

  describe('getScrollRemainingBottom', () => {
    it('should return remaining scroll distance', () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'scrollTop', { value: 100, writable: true });
      Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true });
      Object.defineProperty(container, 'clientHeight', { value: 500, writable: true });

      const result = getScrollRemainingBottom(container);
      expect(result).toBe(400);
    });

    it('should return 0 when scrolled to bottom', () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'scrollTop', { value: 500, writable: true });
      Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true });
      Object.defineProperty(container, 'clientHeight', { value: 500, writable: true });

      const result = getScrollRemainingBottom(container);
      expect(result).toBe(0);
    });

    it('should return 0 when distance is negative', () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'scrollTop', { value: 600, writable: true });
      Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true });
      Object.defineProperty(container, 'clientHeight', { value: 500, writable: true });

      const result = getScrollRemainingBottom(container);
      expect(result).toBe(0);
    });
  });

  describe('isOverlap', () => {
    it('should return false in non-browser environment', () => {
      const a = document.createElement('div');
      const b = document.createElement('div');

      const originalDocument = global.document;
      (global as any).document = undefined;

      expect(isOverlap(a, b)).toBe(false);

      (global as any).document = originalDocument;
    });

    it('should return true when elements overlap', () => {
      const a = document.createElement('div');
      const b = document.createElement('div');

      vi.spyOn(a, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      vi.spyOn(b, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        bottom: 150,
        left: 50,
        right: 150,
        width: 100,
        height: 100,
        x: 50,
        y: 50,
        toJSON: () => ({}),
      });

      expect(isOverlap(a, b)).toBe(true);
    });

    it('should return false when elements do not overlap horizontally', () => {
      const a = document.createElement('div');
      const b = document.createElement('div');

      vi.spyOn(a, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      vi.spyOn(b, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 100,
        left: 200,
        right: 300,
        width: 100,
        height: 100,
        x: 200,
        y: 0,
        toJSON: () => ({}),
      });

      expect(isOverlap(a, b)).toBe(false);
    });

    it('should return false when elements do not overlap vertically', () => {
      const a = document.createElement('div');
      const b = document.createElement('div');

      vi.spyOn(a, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      vi.spyOn(b, 'getBoundingClientRect').mockReturnValue({
        top: 200,
        bottom: 300,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 200,
        toJSON: () => ({}),
      });

      expect(isOverlap(a, b)).toBe(false);
    });

    it('should return false when elements touch but do not overlap', () => {
      const a = document.createElement('div');
      const b = document.createElement('div');

      vi.spyOn(a, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      vi.spyOn(b, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 100,
        left: 100,
        right: 200,
        width: 100,
        height: 100,
        x: 100,
        y: 0,
        toJSON: () => ({}),
      });

      expect(isOverlap(a, b)).toBe(false);
    });
  });
});
