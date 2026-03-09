import { describe, it, expect } from 'vitest';
import type { TocItemT, TreeNodeT } from '../app/.vitepress/src/@types/type-tree';
import { createTree, findNode, findPrevNode, getPrevNodes, getFirstNotEmptyHref } from '../app/.vitepress/src/utils/tree';

describe('tree', () => {
  describe('createTree', () => {
    it('should create a tree from flat data', () => {
      const data: TocItemT[] = [
        {
          id: '1',
          label: 'Node 1',
          href: '/node1',
          type: 'page',
        },
      ];

      const tree = createTree(data);

      expect(tree.id).toBe('');
      expect(tree.label).toBe('');
      expect(tree.depth).toBe(0);
      expect(tree.children).toHaveLength(1);
      expect(tree.children[0].id).toBe('1');
      expect(tree.children[0].label).toBe('Node 1');
      expect(tree.children[0].depth).toBe(1);
    });

    it('should create nested tree structure', () => {
      const data: TocItemT[] = [
        {
          id: '1',
          label: 'Parent',
          href: '/parent',
          type: 'folder',
          sections: [
            {
              id: '1-1',
              label: 'Child',
              href: '/parent/child',
              type: 'page',
            },
          ],
        },
      ];

      const tree = createTree(data);

      expect(tree.children).toHaveLength(1);
      expect(tree.children[0].children).toHaveLength(1);
      expect(tree.children[0].children[0].id).toBe('1-1');
      expect(tree.children[0].children[0].depth).toBe(2);
      expect(tree.children[0].children[0].parent?.id).toBe('1');
    });

    it('should handle all optional fields', () => {
      const data: TocItemT[] = [
        {
          id: '1',
          label: 'Node',
          href: '/node',
          description: 'Test description',
          type: 'page',
          isManual: true,
          upstream: 'https://example.com',
        },
      ];

      const tree = createTree(data);
      const node = tree.children[0];

      expect(node.description).toBe('Test description');
      expect(node.isManual).toBe(true);
      expect(node.upstream).toBe('https://example.com');
    });

    it('should set default values for missing optional fields', () => {
      const data: TocItemT[] = [
        {
          id: '1',
          label: 'Node',
          type: 'page',
        },
      ];

      const tree = createTree(data);
      const node = tree.children[0];

      expect(node.description).toBe('');
      expect(node.isManual).toBe(false);
      expect(node.upstream).toBe('');
    });

    it('should handle empty sections array', () => {
      const data: TocItemT[] = [
        {
          id: '1',
          label: 'Node',
          type: 'folder',
          sections: [],
        },
      ];

      const tree = createTree(data);

      expect(tree.children[0].children).toHaveLength(0);
    });

    it('should handle deeply nested structure', () => {
      const data: TocItemT[] = [
        {
          id: '1',
          label: 'Level 1',
          type: 'folder',
          sections: [
            {
              id: '2',
              label: 'Level 2',
              type: 'folder',
              sections: [
                {
                  id: '3',
                  label: 'Level 3',
                  type: 'page',
                  href: '/level3',
                },
              ],
            },
          ],
        },
      ];

      const tree = createTree(data);

      expect(tree.children[0].depth).toBe(1);
      expect(tree.children[0].children[0].depth).toBe(2);
      expect(tree.children[0].children[0].children[0].depth).toBe(3);
    });
  });

  describe('findNode', () => {
    let tree: TreeNodeT;

    beforeEach(() => {
      const data: TocItemT[] = [
        {
          id: '1',
          label: 'Parent',
          type: 'folder',
          sections: [
            {
              id: '1-1',
              label: 'Child 1',
              type: 'page',
              href: '/child1',
            },
            {
              id: '1-2',
              label: 'Child 2',
              type: 'page',
              href: '/child2',
            },
          ],
        },
        {
          id: '2',
          label: 'Another Parent',
          type: 'page',
          href: '/another',
        },
      ];

      tree = createTree(data);
    });

    it('should find node by id', () => {
      const node = findNode(tree, 'id', '1-1');
      expect(node).not.toBeNull();
      expect(node?.label).toBe('Child 1');
    });

    it('should find node by label', () => {
      const node = findNode(tree, 'label', 'Child 2');
      expect(node).not.toBeNull();
      expect(node?.id).toBe('1-2');
    });

    it('should find node by href', () => {
      const node = findNode(tree, 'href', '/another');
      expect(node).not.toBeNull();
      expect(node?.id).toBe('2');
    });

    it('should return null when node not found', () => {
      const node = findNode(tree, 'id', 'non-existent');
      expect(node).toBeNull();
    });

    it('should find root node', () => {
      const node = findNode(tree, 'id', '');
      expect(node).not.toBeNull();
      expect(node?.depth).toBe(0);
    });
  });

  describe('findPrevNode', () => {
    let tree: TreeNodeT;

    beforeEach(() => {
      const data: TocItemT[] = [
        {
          id: '1',
          label: 'Parent',
          type: 'folder',
          sections: [
            {
              id: '1-1',
              label: 'Child',
              type: 'folder',
              sections: [
                {
                  id: '1-1-1',
                  label: 'Grandchild',
                  type: 'page',
                  href: '/grandchild',
                },
              ],
            },
          ],
        },
      ];

      tree = createTree(data);
    });

    it('should find parent node by id', () => {
      const grandchild = findNode(tree, 'id', '1-1-1');
      const parent = findPrevNode(grandchild!, 'id', '1');
      expect(parent).not.toBeNull();
      expect(parent?.label).toBe('Parent');
    });

    it('should find immediate parent', () => {
      const grandchild = findNode(tree, 'id', '1-1-1');
      const parent = findPrevNode(grandchild!, 'id', '1-1');
      expect(parent).not.toBeNull();
      expect(parent?.label).toBe('Child');
    });

    it('should return null when parent not found', () => {
      const grandchild = findNode(tree, 'id', '1-1-1');
      const parent = findPrevNode(grandchild!, 'id', 'non-existent');
      expect(parent).toBeNull();
    });

    it('should return node itself if it matches', () => {
      const child = findNode(tree, 'id', '1-1');
      const result = findPrevNode(child!, 'id', '1-1');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('1-1');
    });

    it('should return null when starting from root', () => {
      const result = findPrevNode(tree, 'id', 'non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getPrevNodes', () => {
    let tree: TreeNodeT;

    beforeEach(() => {
      const data: TocItemT[] = [
        {
          id: '1',
          label: 'Level 1',
          type: 'folder',
          sections: [
            {
              id: '2',
              label: 'Level 2',
              type: 'folder',
              sections: [
                {
                  id: '3',
                  label: 'Level 3',
                  type: 'page',
                  href: '/level3',
                },
              ],
            },
          ],
        },
      ];

      tree = createTree(data);
    });

    it('should return all parent nodes', () => {
      const node = findNode(tree, 'id', '3');
      const prevNodes = getPrevNodes(node!);
      expect(prevNodes).toHaveLength(3);
      expect(prevNodes[0].id).toBe('2');
      expect(prevNodes[1].id).toBe('1');
      expect(prevNodes[2].id).toBe('');
    });

    it('should stop at specified depth', () => {
      const node = findNode(tree, 'id', '3');
      const prevNodes = getPrevNodes(node!, 1);
      expect(prevNodes).toHaveLength(2);
      expect(prevNodes[0].id).toBe('2');
      expect(prevNodes[1].id).toBe('1');
    });

    it('should return empty array for root node', () => {
      const prevNodes = getPrevNodes(tree);
      expect(prevNodes).toHaveLength(0);
    });

    it('should return empty array when node depth equals stopDepth', () => {
      const node = findNode(tree, 'id', '1');
      const prevNodes = getPrevNodes(node!, 1);
      expect(prevNodes).toHaveLength(0);
    });

    it('should return empty array for negative stopDepth', () => {
      const node = findNode(tree, 'id', '3');
      const prevNodes = getPrevNodes(node!, -1);
      expect(prevNodes).toHaveLength(0);
    });
  });

  describe('getFirstNotEmptyHref', () => {
    it('should return node href if it contains .html', () => {
      const node: TreeNodeT = {
        id: '1',
        label: 'Node',
        depth: 1,
        href: '/page.html',
        parent: null,
        description: null,
        type: 'page',
        isManual: false,
        upstream: '',
        children: [],
      };

      expect(getFirstNotEmptyHref(node)).toBe('/page.html');
    });

    it('should return node href if it starts with http', () => {
      const node: TreeNodeT = {
        id: '1',
        label: 'Node',
        depth: 1,
        href: 'https://example.com',
        parent: null,
        description: null,
        type: 'page',
        isManual: false,
        upstream: '',
        children: [],
      };

      expect(getFirstNotEmptyHref(node)).toBe('https://example.com');
    });

    it('should search children when node href is empty', () => {
      const node: TreeNodeT = {
        id: '1',
        label: 'Parent',
        depth: 1,
        href: '',
        parent: null,
        description: null,
        type: 'folder',
        isManual: false,
        upstream: '',
        children: [
          {
            id: '1-1',
            label: 'Child',
            depth: 2,
            href: '/child.html',
            parent: null,
            description: null,
            type: 'page',
            isManual: false,
            upstream: '',
            children: [],
          },
        ],
      };

      expect(getFirstNotEmptyHref(node)).toBe('/child.html');
    });

    it('should search deeply nested children', () => {
      const node: TreeNodeT = {
        id: '1',
        label: 'Parent',
        depth: 1,
        href: '',
        parent: null,
        description: null,
        type: 'folder',
        isManual: false,
        upstream: '',
        children: [
          {
            id: '1-1',
            label: 'Child',
            depth: 2,
            href: '',
            parent: null,
            description: null,
            type: 'folder',
            isManual: false,
            upstream: '',
            children: [
              {
                id: '1-1-1',
                label: 'Grandchild',
                depth: 3,
                href: '/grandchild.html',
                parent: null,
                description: null,
                type: 'page',
                isManual: false,
                upstream: '',
                children: [],
              },
            ],
          },
        ],
      };

      expect(getFirstNotEmptyHref(node)).toBe('/grandchild.html');
    });

    it('should return empty string when no valid href found', () => {
      const node: TreeNodeT = {
        id: '1',
        label: 'Parent',
        depth: 1,
        href: '',
        parent: null,
        description: null,
        type: 'folder',
        isManual: false,
        upstream: '',
        children: [
          {
            id: '1-1',
            label: 'Child',
            depth: 2,
            href: '/invalid',
            parent: null,
            description: null,
            type: 'page',
            isManual: false,
            upstream: '',
            children: [],
          },
        ],
      };

      expect(getFirstNotEmptyHref(node)).toBe('');
    });

    it('should skip invalid hrefs and find valid one', () => {
      const node: TreeNodeT = {
        id: '1',
        label: 'Parent',
        depth: 1,
        href: '',
        parent: null,
        description: null,
        type: 'folder',
        isManual: false,
        upstream: '',
        children: [
          {
            id: '1-1',
            label: 'Child 1',
            depth: 2,
            href: '/invalid',
            parent: null,
            description: null,
            type: 'page',
            isManual: false,
            upstream: '',
            children: [],
          },
          {
            id: '1-2',
            label: 'Child 2',
            depth: 2,
            href: '/valid.html',
            parent: null,
            description: null,
            type: 'page',
            isManual: false,
            upstream: '',
            children: [],
          },
        ],
      };

      expect(getFirstNotEmptyHref(node)).toBe('/valid.html');
    });
  });
});
