import type { TocItemT, TreeNodeT, TreeT } from '@/@types/type-tree';

/**
 * 将 toc 转换成树
 * @param {TocItemT[]} data 数据
 * @returns {TreeT} 树
 */
export const createTree = (() => {
  const buildTree = (parent: TreeNodeT, data: TocItemT[]) => {
    data.forEach((item) => {
      const node: TreeNodeT = {
        parent,
        id: item.id,
        label: item.label,
        depth: parent.depth + 1,
        href: item.href,
        description: item.description || '',
        type: item.type,
        isManual: item.isManual || false,
        upstream: item.upstream || '',
        children: [],
      };

      parent.children.push(node);
      if (Array.isArray(item.sections) && item.sections.length > 0) {
        buildTree(node, item.sections);
      }
    });
  };

  return (data: TocItemT[]): TreeT => {
    const root = {
      id: '',
      label: '',
      depth: 0,
      href: '/',
      description: null,
      parent: null,
      type: 'root',
      isManual: false,
      upstream: '',
      path: '',
      children: [],
    };

    buildTree(root, data);
    return root;
  };
})();

/**
 * 从当前节点往下查找第一个符合的节点
 * @param {TreeNodeT} node 起始查找节点
 * @param {string} key key
 * @param {any} val value
 * @returns {(TreeNodeT|null)} 查找到节点则返回该节点，未找到返回 null
 */
export function findNode(node: TreeNodeT, key: keyof TreeNodeT, value: any): TreeNodeT | null {
  if (node[key] === value) {
    return node;
  }

  if (Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      const found = findNode(node.children[i], key, value);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * 从当前节点往上查找第一个符合的节点
 * @param {TreeNodeT} node 起始查找节点
 * @param {string} key key
 * @param {any} val value
 * @returns {(TreeNodeT|null)} 查找到节点则返回该节点，未找到返回 null
 */
export function findPrevNode(node: TreeNodeT, key: keyof TreeNodeT, value: any): TreeNodeT | null {
  let temp: TreeNodeT | null = node;

  while (temp && temp[key] !== value) {
    temp = temp.parent;
  }

  return temp || null;
}

/**
 * 获取前驱节点（不包含目标节点）
 * @param {TreeNodeT} node 节点
 * @param {number} stopDepth 停止深度，到达此深度后不再往上收集。默认为0，即根节点。
 * @returns {TreeNodeT[]} 返回前驱节点
 */
export function getPrevNodes(node: TreeNodeT, stopDepth = 0) {
  if (!node || stopDepth < 0 || node.depth <= stopDepth) {
    return [];
  }

  const nodes = [];
  let prev = node.parent;
  while (prev && prev.depth >= stopDepth) {
    nodes.push(prev);
    prev = prev.parent;
  }

  return nodes;
}

/**
 * 获取 node 的第一个非空 href
 * @param {TreeNodeT} node 节点
 * @returns {(string|null)} 返回 href
 */
export function getFirstNotEmptyHref(node: TreeNodeT): string {
  if (node.href && (node.href.includes('.html') || node.href.startsWith('http'))) {
    return node.href;
  }

  for (let i = 0; i < node.children.length; i++) {
    const href = getFirstNotEmptyHref(node.children[i]);
    if (href) {
      return href;
    }
  }

  return '';
}
