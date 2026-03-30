import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import { ensureDirSync, removeSync } from './file.js';

/**
 * 解析 Git 仓库 URL，提取仓库信息
 * @param {string} gitUrl - 完整的 Git 仓库 URL 地址
 * @returns {object} 包含URL解析信息的对象
 */
export function getGitUrlInfo(gitUrl) {
  const url = new URL(gitUrl);
  const [owner, repo, __, branch, ...locations] = url.pathname.replace('/', '').split('/');

  return {
    url: `${url.origin}/${owner}/${repo}`,
    owner,
    repo,
    branch,
    locations,
  }
}

/**
 * 检查指定路径是否为 Git 仓库
 * @param {string} targetPath - 要检查的目标路径
 * @returns {boolean} 如果目标路径是 Git 仓库则返回 true，否则返回 false
 */
export function isGitRepo(targetPath) {
  return fs.existsSync(path.join(targetPath, '.git/config'));
}

/**
 * 拉取并切换分支
 * @param {string} url 远程仓库地址
 * @param {string} branch 分支名
 * @param {string} storagePath 存放目录
 */
export function gitCloneAndCheckout(url, branch, storagePath) {
  ensureDirSync(storagePath);
  const repo = url.split('/').slice().pop().replace('.git', '');
  const repoDir = path.join(storagePath, repo);

  // 拉取远程仓库
  if (!fs.existsSync(repoDir) || (fs.existsSync(repoDir) && !isGitRepo(repoDir))) {
    removeSync(repoDir);
    execSync(`git clone ${url} ${repoDir}`, { stdio: 'inherit' });
    console.log(`[gitCloneAndCheckout]：克隆 ${repo} 仓库成功! `);
  }

  // 切换目标分支
  execSync(`git checkout -f HEAD -- . && git clean -fd`, { stdio: 'inherit', cwd: repoDir });
  execSync(`git pull`, { stdio: 'inherit', cwd: repoDir });
  const branchList = execSync(`git branch --list ${branch}`, { cwd: repoDir }).toString().trim();
  if (!branchList) {
    console.log(`[gitCloneAndCheckout]：本地不存在分支 ${branch}，开始尝试拉取并切换远程分支`);
    execSync(`git checkout -b ${branch} --track origin/${branch}`, { stdio: 'inherit', cwd: repoDir });
    console.log(`[gitCloneAndCheckout]：拉取并切换远程分支 ${branch} 成功`);
    return;
  }

  console.log(`[gitCloneAndCheckout]：本地存在分支 ${branch}，开始切换分支`);
  try {
    execSync(`git checkout -f ${branch}`, { stdio: 'inherit', cwd: repoDir });
    console.log(`[gitCloneAndCheckout]：切换分支成功，开始拉取远程更新内容`);
    execSync(`git pull origin ${branch}`, { stdio: 'inherit', cwd: repoDir });
    console.log(`[gitCloneAndCheckout]：拉取远程内容成功`);
  } catch {
    console.log(`[gitCloneAndCheckout]：拉取远程内容成功，尝试强制拉取`);
    execSync(`git reset --hard origin/${branch}`, { stdio: 'inherit', cwd: repoDir });
    console.log(`[gitCloneAndCheckout]：拉取远程分支 ${branch} 内容成功`);
  }
}

/**
 * 切换到指定的 Git 分支
 * @param {string} repoPath - Git 仓库的本地路径
 * @param {string} branch - 要切换到的分支名称
 */
export function checkoutBranch(repoPath, branch) {
  console.log(`[checkoutBranch]：开始检出 ${branch} 分支`);
  execSync(`git checkout ${branch}`, { 
    stdio: 'inherit', 
    cwd: repoPath,
  });

  console.log(`[checkoutBranch]：成功在 ${repoPath} 检出 ${branch} 分支`);
};

/**
 * 拉取远程分支的内容
 * @param {string} repoPath - Git 仓库的本地路径
 * @param {string} branch - 要拉取的远程分支名称
 */
export function pullRemoteBranch(repoPath, branch) {
  console.log(`[pullRemoteBranch]：开始拉取 ${branch} 分支`);
  execSync(`git pull origin ${branch}`, { 
    stdio: 'inherit', 
    cwd: repoPath,
  });

  console.log(`[pullRemoteBranch]：成功拉取远程 ${branch} 分支`);
};