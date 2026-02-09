import * as fs from 'fs';
import * as path from 'path';

import { VITEPRESS_VERSIONS_CONFIG, HUGO_VERSIONS_CONFIG } from './config/version.js';
import { checkoutBranch, isGitRepo, pullRemoteBranch } from './utils/git.js';
import { copyDirectorySync, removeSync, renameSync, ensureDirSync } from './utils/file.js';

// ============================================ 脚本执行逻辑 ============================================
const REPO_PATH = path.join(process.cwd(), '../../'); // repo 路径
const DOCS_VITEPRESS_PATH = path.join(REPO_PATH, 'docs'); // docs 仓库路径 （vitepress 构建所需）
const DOCS_HUGO_PATH = path.join(REPO_PATH, 'docs'); // docs 仓库路径 （hugo 构建所需）

(() => {
  const [branch, source] = process.argv.slice(2);
  if (!branch) {
    console.error('请提供分支名称');
    process.exit(1);
  }

  // 重新创建 build 目录
  const buildPath = path.join(process.cwd(), `../../../build/${branch}`);
  removeSync(buildPath);
  ensureDirSync(buildPath);

  // 处理内容
  if (Object.keys(VITEPRESS_VERSIONS_CONFIG).includes(branch)) {
    normalizeVitepressDocsContent(buildPath, branch, source);
  } else {
    normalizeHugoDocsContent(buildPath, branch);
  }
})();

// ============================================ 文档内容处理函数 ============================================
/**
 * 按 vitepress 文档方式处理
 * @param {string} buildPath build 目录
 * @param {string} branch 分支
 * @param {string} source 启动来源
 */
function normalizeVitepressDocsContent(buildPath, branch, source) {
  // 判断文档仓库是否存在
  if (!isGitRepo(DOCS_VITEPRESS_PATH )) {
    throw new Error(`docs 文档仓库不存在： ${DOCS_VITEPRESS_PATH }`);
  }

  const branchName = VITEPRESS_VERSIONS_CONFIG[branch];

  // 复制website-vitepress内容到build目录
  copyDirectorySync(path.join(REPO_PATH, 'website-vitepress'), buildPath, true);

  const nginxPortalConfPath = path.join(buildPath, 'deploy/nginx/nginx.portal.conf');
  if (branchName == `common`) {
    // 如果是公共分支，删掉nginx.conf并将nginx.portal.conf重命名为nginx.conf
    const nginxConfPath = path.join(buildPath, 'deploy/nginx/nginx.conf');
    removeSync(nginxConfPath);
    renameSync(nginxPortalConfPath, nginxConfPath);
  } else {
    // 如果是非公共分支，删除对应的nginx.portal.conf与中英文目录
    removeSync(nginxPortalConfPath);
    removeSync(`${buildPath}/app/zh/`);
    removeSync(`${buildPath}/app/en/`);
  }

  // 替换 vitepress 配置中的资源路径前缀
  let vpConf = fs.readFileSync(`${buildPath}/app/.vitepress/config.ts`, 'utf8');
  if (vpConf) {
    vpConf = vpConf.replace(/assetsDir:\s*'[^']*'/, `assetsDir: '/assets/${branchName}/'`);
    fs.writeFileSync(`${buildPath}/app/.vitepress/config.ts`, vpConf, 'utf8');
  }

  // 替换 package.json 中的要构建的版本
  let packageJson = fs.readFileSync(`${buildPath}/package.json`, 'utf8');
  if (packageJson) {
    packageJson = packageJson.replaceAll('$VERSION', branchName);
    fs.writeFileSync(`${buildPath}/package.json`, packageJson, 'utf8');
  }

  // 检出文档内容分支
  checkoutBranch(DOCS_VITEPRESS_PATH, branch);
  pullRemoteBranch(DOCS_VITEPRESS_PATH, branch);

  // 只有存在 zh 内容并且是新版本内容才进行复制
  if (fs.existsSync(`${DOCS_VITEPRESS_PATH}/docs/zh/_toc.yaml`) || branchName === 'common') {
    copyDirectorySync(`${DOCS_VITEPRESS_PATH}/docs/zh/`, `${buildPath}/app/zh/docs/${branchName}/`, true);
  }

  if (fs.existsSync(`${DOCS_VITEPRESS_PATH}/docs-lite/zh/_toc.yaml`) && branchName !== 'common') {
    copyDirectorySync(`${DOCS_VITEPRESS_PATH}/docs-lite/zh/`, `${buildPath}/app/zh/docs/${branchName}-lite/`, true);
  }

  // 只有存在 en 内容并且是新版本内容才进行复制
  if (fs.existsSync(`${DOCS_VITEPRESS_PATH}/docs/en/_toc.yaml`) || branchName === 'common') {
    copyDirectorySync(`${DOCS_VITEPRESS_PATH}/docs/en/`, `${buildPath}/app/en/docs/${branchName}/`, true);
  }

  if (fs.existsSync(`${DOCS_VITEPRESS_PATH}/docs-lite/en/_toc.yaml`) && branchName !== 'common') {
    copyDirectorySync(`${DOCS_VITEPRESS_PATH}/docs-lite/en/`, `${buildPath}/app/en/docs/${branchName}-lite/`, true);
  }

  // 复制 dsl 配置
  if (branchName !== 'common') {
    checkoutBranch(DOCS_VITEPRESS_PATH, 'common');
    pullRemoteBranch(DOCS_VITEPRESS_PATH, 'common');
  }

  if (fs.existsSync(`${DOCS_VITEPRESS_PATH}/dsl/`)) {
    copyDirectorySync(`${DOCS_VITEPRESS_PATH}/dsl/`, `${buildPath}/app/.vitepress/public/dsl/`, true);
    
    if (source === 'test') {
      if (fs.existsSync(`${buildPath}/app/.vitepress/public/dsl/zh/home_test.json`)) {
        removeSync(`${buildPath}/app/.vitepress/public/dsl/zh/home.json`);
        renameSync(`${buildPath}/app/.vitepress/public/dsl/zh/home_test.json`, `${buildPath}/app/.vitepress/public/dsl/zh/home.json`);
        removeSync(`${buildPath}/app/.vitepress/public/dsl/zh/home_test.json`);
      }

      if (fs.existsSync(`${buildPath}/app/.vitepress/public/dsl/en/home_test.json`)) {
        removeSync(`${buildPath}/app/.vitepress/public/dsl/en/home.json`);
        renameSync(`${buildPath}/app/.vitepress/public/dsl/en/home_test.json`, `${buildPath}/app/.vitepress/public/dsl/en/home.json`);
        removeSync(`${buildPath}/app/.vitepress/public/dsl/en/home_test.json`);
      }
    }

    console.log(`已将 dsl 复制到 public 目录下`);
  }
};

/**
 * 按 hugo 文档方式处理
 * @param {string} buildPath build 目录
 * @param {string} branch 分支
 */
function normalizeHugoDocsContent(buildPath, branch) {
  // 判断文档仓库是否存在
  if (!isGitRepo(DOCS_HUGO_PATH)) {
    throw new Error(`docs (hugo) 文档仓库不存在：${DOCS_HUGO_PATH}`);
  }

  const version = HUGO_VERSIONS_CONFIG[branch];

  // 复制website-hugo内容到build目录
  copyDirectorySync(path.join(REPO_PATH, 'website-hugo'), buildPath, true);

  // 替换 config.toml 中的资源路径前缀
  let hugoConf = fs.readFileSync(`${buildPath}/config.toml`, 'utf8');
  if (hugoConf) {
    hugoConf = hugoConf.replace(/resourceURL\s*=\s*(["'])(.*?)\1/, `resourceURL = "/docs/${version}/"`);
    fs.writeFileSync(`${buildPath}/config.toml`, hugoConf, 'utf8');
  }

  // 检出文档内容分支
  checkoutBranch(DOCS_HUGO_PATH, branch);
  pullRemoteBranch(DOCS_HUGO_PATH, branch);

  // 复制文档内容
  copyDirectorySync(`${DOCS_HUGO_PATH}/content/zh/`, `${buildPath}/content/zh/docs/${version}/`, true);
  copyDirectorySync(`${DOCS_HUGO_PATH}/content/en/`, `${buildPath}/content/en/docs/${version}/`, true);
  copyDirectorySync(`${DOCS_HUGO_PATH}/content/docs-lite/zh/`, `${buildPath}/content/zh/docs/${version}-lite/`, true);
  copyDirectorySync(`${DOCS_HUGO_PATH}/content/docs-lite/en/`, `${buildPath}/content/en/docs/${version}-lite/`, true);
};
