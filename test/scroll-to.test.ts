import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getScroll, easeInOutCubic, scrollTo, scrollIntoView } from '../app/.vitepress/src/utils/scroll-to';

describe('scroll-to', () => {
  describe('getScroll', () => {
    it('should return scroll position for window', () => {
      Object.defineProperty(window, 'scrollX', { value: 100, writable: true });
      Object.defineProperty(window, 'scrollY', { value: 200, writable: true });

      const result = getScroll(window);
      expect(result.scrollLeft).toBe(100);
      expect(result.scrollTop).toBe(200);
    });

    it('should return scroll position for document', () => {
      Object.defineProperty(document.documentElement, 'scrollLeft', { value: 50, writable: true });
      Object.defineProperty(document.documentElement, 'scrollTop', { value: 150, writable: true });

      const result = getScroll(document);
      expect(result.scrollLeft).toBe(50);
      expect(result.scrollTop).toBe(150);
    });

    it('should return scroll position for HTMLElement', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollLeft', { value: 30, writable: true });
      Object.defineProperty(el, 'scrollTop', { value: 80, writable: true });

      const result = getScroll(el);
      expect(result.scrollLeft).toBe(30);
      expect(result.scrollTop).toBe(80);
    });

    it('should return zero values for null', () => {
      const result = getScroll(null as any);
      expect(result.scrollLeft).toBe(0);
      expect(result.scrollTop).toBe(0);
    });
  });

  describe('easeInOutCubic', () => {
    it('should calculate easing for first half', () => {
      const result = easeInOutCubic(100, 0, 1000, 400);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(500);
    });

    it('should calculate easing for second half', () => {
      const result = easeInOutCubic(300, 0, 1000, 400);
      expect(result).toBeGreaterThan(500);
      expect(result).toBeLessThan(1000);
    });

    it('should return start value at beginning', () => {
      const result = easeInOutCubic(0, 100, 500, 400);
      expect(result).toBe(100);
    });

    it('should return end value at completion', () => {
      const result = easeInOutCubic(400, 100, 500, 400);
      expect(result).toBe(500);
    });

    it('should handle negative values', () => {
      const result = easeInOutCubic(200, 500, 100, 400);
      expect(result).toBeLessThan(500);
      expect(result).toBeGreaterThan(100);
    });
  });

  describe('scrollTo', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should scroll window to target position', async () => {
      const scrollToSpy = vi.fn();
      Object.defineProperty(window, 'scrollTo', { value: scrollToSpy, writable: true });
      Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true });

      const promise = scrollTo(500, { container: window, duration: 100 });

      await vi.advanceTimersByTimeAsync(150);
      await promise;

      expect(scrollToSpy).toHaveBeenCalled();
    });

    it('should scroll document to target position', async () => {
      Object.defineProperty(document.documentElement, 'scrollTop', { value: 0, writable: true });

      const promise = scrollTo(500, { container: document, duration: 100 });

      await vi.advanceTimersByTimeAsync(150);
      await promise;

      expect(document.documentElement.scrollTop).toBeGreaterThan(0);
    });

    it('should scroll HTMLElement to target position', async () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', { value: 0, writable: true });

      const promise = scrollTo(500, { container: el, duration: 100 });

      await vi.advanceTimersByTimeAsync(150);
      await promise;

      expect(el.scrollTop).toBeGreaterThan(0);
    });

    it('should use default duration', async () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', { value: 0, writable: true });

      const promise = scrollTo(500, { container: el });

      await vi.advanceTimersByTimeAsync(500);
      await promise;

      expect(el.scrollTop).toBeGreaterThan(0);
    });

    it('should cancel previous scroll', async () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', { value: 0, writable: true });

      const promise1 = scrollTo(500, { container: el, duration: 200 });

      await vi.advanceTimersByTimeAsync(50);

      const promise2 = scrollTo(300, { container: el, duration: 100 });

      const result1 = await promise1;
      await vi.advanceTimersByTimeAsync(150);
      await promise2;

      expect(result1).toBe('cancel');
    });

    it('should resolve with "done" when completed', async () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', { value: 0, writable: true });

      const promise = scrollTo(500, { container: el, duration: 100 });

      await vi.advanceTimersByTimeAsync(150);
      const result = await promise;

      expect(result).toBe('done');
    });
  });

  describe('scrollIntoView', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should scroll element into view', async () => {
      const container = document.createElement('div');
      const target = document.createElement('div');
      document.body.appendChild(container);
      container.appendChild(target);

      Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });

      vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        top: 500,
        bottom: 600,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 500,
        toJSON: () => ({}),
      });

      vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 400,
        left: 0,
        right: 500,
        width: 500,
        height: 400,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const promise = scrollIntoView(target, container, 32, 100);

      await vi.advanceTimersByTimeAsync(150);
      await promise;

      expect(container.scrollTop).toBeGreaterThan(0);

      document.body.removeChild(container);
    });

    it('should use default parameters', async () => {
      const container = document.createElement('div');
      const target = document.createElement('div');
      document.body.appendChild(container);
      container.appendChild(target);

      Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });

      vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        top: 500,
        bottom: 600,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 500,
        toJSON: () => ({}),
      });

      vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 400,
        left: 0,
        right: 500,
        width: 500,
        height: 400,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const promise = scrollIntoView(target, container);

      await vi.advanceTimersByTimeAsync(500);
      await promise;

      expect(container.scrollTop).toBeGreaterThan(0);

      document.body.removeChild(container);
    });
  });
});
