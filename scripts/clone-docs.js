import path from 'path';

import { VITEPRESS_VERSIONS_CONFIG } from './config/version.js';
import { parseNamedArgs } from './utils/common.js';
import { gitCloneAndCheckout } from './utils/git.js';
import { copyDirectorySync, removeSync } from './utils/file.js';

// ============================================ 脚本执行逻辑 ============================================
const ARGS = parseNamedArgs(); // 具名参数
const REPO = ARGS.repo || 'https://gitcode.com/opengauss/docs.git'; // 文档远程仓库地址
const BRANCH = ARGS.branch || ''; // 文档分支
const BUILD_PATH = ARGS.build || path.resolve().replace(/\\/g, '/');
const CACHE_PATH = ARGS.cache || path.join(BUILD_PATH, '.cache').replace(/\\/g, '/'); // 缓存路径

const branches = BRANCH.split(',');
if (!branches.length) {
  console.error('请指定分支（多个分支用英文逗号,分隔） --branch=<branch1,branch2,...>');
  process.exit(1);
}

syncDsl();
for (const branch of branches) {
  syncDocs(branch);
}

// ============================================ 同步文档函数 =============================================
/**
 * 同步 dsl 内容
 */
function syncDsl() {
  gitCloneAndCheckout(REPO, 'common', CACHE_PATH);
  copyDirectorySync(`${CACHE_PATH}/docs/dsl`, `${BUILD_PATH}/app/.vitepress/public/dsl/`, true);
}

/**
 * 同步文档内容到对应的目录
 * @param {string} branch - 分支
 */
function syncDocs(branch) {
  const version = VITEPRESS_VERSIONS_CONFIG[branch];
  gitCloneAndCheckout(REPO, branch, CACHE_PATH);
  copyDirectorySync(path.join(CACHE_PATH, `docs/docs/zh/`), path.join(BUILD_PATH, `app/zh/docs/${version}/`), true);
  copyDirectorySync(path.join(CACHE_PATH, `docs/docs/en/`), path.join(BUILD_PATH, `app/en/docs/${version}/`), true);
  if (version !== 'common') {
    copyDirectorySync(path.join(CACHE_PATH, `docs/docs-lite/zh/`), path.join(BUILD_PATH, `app/zh/docs/${version}-lite/`), true);
    copyDirectorySync(path.join(CACHE_PATH, `docs/docs-lite/en/`), path.join(BUILD_PATH, `app/en/docs/${version}-lite/`), true);
  }
}
