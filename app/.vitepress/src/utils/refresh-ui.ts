import { isElementVisible } from './element';
import { scrollIntoView } from './scroll-to';

export const refreshSelectedMenuItemPosition = (() => {
  let timer: NodeJS.Timeout;

  return (dom: HTMLElement, parent: HTMLElement) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const el = dom.querySelector<HTMLElement>(':scope > .o-sub-menu-title') || dom;
      if (parent && el && !isElementVisible(el, parent, el.offsetHeight)) {
        scrollIntoView(el, parent, el.offsetHeight * 3);
      }
    }, 350);
  };
})();
