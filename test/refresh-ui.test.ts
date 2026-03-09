import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { refreshSelectedMenuItemPosition } from '../app/.vitepress/src/utils/refresh-ui';

// Mock dependencies
vi.mock('../app/.vitepress/src/utils/element', () => ({
  isElementVisible: vi.fn(),
}));

vi.mock('../app/.vitepress/src/utils/scroll-to', () => ({
  scrollIntoView: vi.fn(),
}));

import { isElementVisible } from '../app/.vitepress/src/utils/element';
import { scrollIntoView } from '../app/.vitepress/src/utils/scroll-to';

describe('refresh-ui', () => {
  describe('refreshSelectedMenuItemPosition', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should scroll element into view when not visible', async () => {
      const dom = document.createElement('div');
      const parent = document.createElement('div');
      const subMenuTitle = document.createElement('div');
      subMenuTitle.className = 'o-sub-menu-title';
      dom.appendChild(subMenuTitle);

      Object.defineProperty(subMenuTitle, 'offsetHeight', { value: 50, writable: true });

      vi.mocked(isElementVisible).mockReturnValue(false);

      refreshSelectedMenuItemPosition(dom, parent);

      await vi.advanceTimersByTimeAsync(350);

      expect(isElementVisible).toHaveBeenCalledWith(subMenuTitle, parent, 50);
      expect(scrollIntoView).toHaveBeenCalledWith(subMenuTitle, parent, 150);
    });

    it('should not scroll when element is visible', async () => {
      const dom = document.createElement('div');
      const parent = document.createElement('div');
      const subMenuTitle = document.createElement('div');
      subMenuTitle.className = 'o-sub-menu-title';
      dom.appendChild(subMenuTitle);

      Object.defineProperty(subMenuTitle, 'offsetHeight', { value: 50, writable: true });

      vi.mocked(isElementVisible).mockReturnValue(true);

      refreshSelectedMenuItemPosition(dom, parent);

      await vi.advanceTimersByTimeAsync(350);

      expect(isElementVisible).toHaveBeenCalledWith(subMenuTitle, parent, 50);
      expect(scrollIntoView).not.toHaveBeenCalled();
    });

    it('should use dom element when no sub-menu-title found', async () => {
      const dom = document.createElement('div');
      const parent = document.createElement('div');

      Object.defineProperty(dom, 'offsetHeight', { value: 40, writable: true });

      vi.mocked(isElementVisible).mockReturnValue(false);

      refreshSelectedMenuItemPosition(dom, parent);

      await vi.advanceTimersByTimeAsync(350);

      expect(isElementVisible).toHaveBeenCalledWith(dom, parent, 40);
      expect(scrollIntoView).toHaveBeenCalledWith(dom, parent, 120);
    });

    it('should debounce multiple calls', async () => {
      const dom = document.createElement('div');
      const parent = document.createElement('div');

      Object.defineProperty(dom, 'offsetHeight', { value: 40, writable: true });

      vi.mocked(isElementVisible).mockReturnValue(false);

      refreshSelectedMenuItemPosition(dom, parent);
      refreshSelectedMenuItemPosition(dom, parent);
      refreshSelectedMenuItemPosition(dom, parent);

      await vi.advanceTimersByTimeAsync(350);

      expect(isElementVisible).toHaveBeenCalledTimes(1);
    });

    it('should handle null parent gracefully', async () => {
      const dom = document.createElement('div');

      refreshSelectedMenuItemPosition(dom, null as any);

      await vi.advanceTimersByTimeAsync(350);

      expect(isElementVisible).not.toHaveBeenCalled();
      expect(scrollIntoView).not.toHaveBeenCalled();
    });

    it('should handle null element gracefully', async () => {
      const dom = document.createElement('div');
      const parent = document.createElement('div');

      refreshSelectedMenuItemPosition(dom, parent);

      await vi.advanceTimersByTimeAsync(350);

      expect(isElementVisible).toHaveBeenCalled();
    });

    it('should clear previous timer on new call', async () => {
      const dom = document.createElement('div');
      const parent = document.createElement('div');

      Object.defineProperty(dom, 'offsetHeight', { value: 40, writable: true });

      vi.mocked(isElementVisible).mockReturnValue(false);

      refreshSelectedMenuItemPosition(dom, parent);
      await vi.advanceTimersByTimeAsync(200);

      refreshSelectedMenuItemPosition(dom, parent);
      await vi.advanceTimersByTimeAsync(350);

      expect(isElementVisible).toHaveBeenCalledTimes(1);
    });
  });
});
