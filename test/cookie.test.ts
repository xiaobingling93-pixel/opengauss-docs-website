import { describe, it, expect, vi, beforeEach } from 'vitest';
import Cookies from 'js-cookie';
import { getCustomCookie, setCustomCookie, removeCustomCookie } from '../app/.vitepress/src/utils/cookie';

vi.mock('js-cookie');

describe('cookie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { hostname: 'test.com' },
      writable: true,
    });
  });

  describe('getCustomCookie', () => {
    it('should call Cookies.get with the correct key', () => {
      vi.mocked(Cookies.get).mockReturnValue('test-value');
      const result = getCustomCookie('test-key');
      expect(Cookies.get).toHaveBeenCalledWith('test-key');
      expect(result).toBe('test-value');
    });

    it('should return undefined when cookie does not exist', () => {
      vi.mocked(Cookies.get).mockReturnValue(undefined);
      const result = getCustomCookie('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('setCustomCookie', () => {
    it('should call Cookies.set with default parameters', () => {
      setCustomCookie('test-key', 'test-value');
      expect(Cookies.set).toHaveBeenCalledWith('test-key', 'test-value', {
        expires: 180,
        path: '/',
        domain: 'test.com',
      });
    });

    it('should call Cookies.set with custom day parameter', () => {
      setCustomCookie('test-key', 'test-value', 30);
      expect(Cookies.set).toHaveBeenCalledWith('test-key', 'test-value', {
        expires: 30,
        path: '/',
        domain: 'test.com',
      });
    });

    it('should call Cookies.set with custom domain parameter', () => {
      setCustomCookie('test-key', 'test-value', 180, 'custom.com');
      expect(Cookies.set).toHaveBeenCalledWith('test-key', 'test-value', {
        expires: 180,
        path: '/',
        domain: 'custom.com',
      });
    });

    it('should call Cookies.set with all custom parameters', () => {
      setCustomCookie('test-key', 'test-value', 90, 'example.com');
      expect(Cookies.set).toHaveBeenCalledWith('test-key', 'test-value', {
        expires: 90,
        path: '/',
        domain: 'example.com',
      });
    });
  });

  describe('removeCustomCookie', () => {
    it('should call Cookies.remove with default domain', () => {
      removeCustomCookie('test-key');
      expect(Cookies.remove).toHaveBeenCalledWith('test-key', {
        path: '/',
        domain: 'test.com',
      });
    });

    it('should call Cookies.remove with custom domain', () => {
      removeCustomCookie('test-key', 'custom.com');
      expect(Cookies.remove).toHaveBeenCalledWith('test-key', {
        path: '/',
        domain: 'custom.com',
      });
    });
  });
});
