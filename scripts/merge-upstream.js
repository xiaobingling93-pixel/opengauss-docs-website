import fs from 'fs';
import path from 'path';

import { VITEPRESS_VERSIONS_CONFIG } from './config/version.js';
import { getGitUrlInfo, isGitRepo, checkoutBranch } from './utils/git.js';
import { copyDirectorySync } from './utils/file.js';

const REPO_PATH = path.join(process.cwd(), '../../');
const relativeRepo = new Set();

const copyRepoFromDiskCache = async (upstream, dir, storagePath) => {
  try {
    const { repo, branch, locations } = getGitUrlInfo(upstream);
    const cachePath = path.join(REPO_PATH, repo);
    if (!isGitRepo(cachePath)) {
      console.log(`不存在 ${repo} 仓库缓存，跳过~`);
    }

    relativeRepo.add(cachePath.replace(/\\/g, '/'));
    await checkoutBranch(cachePath, branch);
    const sourceDir = path.join(cachePath, ...locations.slice(0, -1));
    const destDir = storagePath ? path.join(dir, storagePath) : path.join(dir, repo, ...locations.slice(2, -1));
    copyDirectorySync(sourceDir, destDir);
    console.log('复制完成');
  } catch (err) {
    console.error(`copyRepoFromDiskCache error: ${err?.message}, upstream: ${upstream}`);
    process.exit(1);
  }
};

const scanYaml = async (yamlPath, dir) => {
  const lines = fs.readFileSync(yamlPath, 'utf-8').split('\n');
  let i = 0;
  while (i < lines.length) {
    if (lines[i].includes('upstream:')) {
      const upstream = lines[i].replace('upstream:', '').trim();
      let storagePath = '';

      if (i + 1 < lines.length && lines[i + 1].includes('path:')) {
        storagePath = lines[i + 1].replace('path:', '').trim();
      }

      await copyRepoFromDiskCache(upstream, dir, storagePath);
    }
    i++;
  }
};

const mergeUpstream = async (targetPath) => {
  if (fs.existsSync(targetPath)) {
    for (const item of fs.readdirSync(targetPath)) {
      const completePath = path.join(targetPath, item);
      if (fs.statSync(completePath).isDirectory()) {
        await mergeUpstream(completePath);
      } else if (item.endsWith('.yaml')) {
        await scanYaml(completePath, targetPath);
      }
    }
  }
};

const copyRedirectYaml = async (buildPath) => {
  for (const repoPath of relativeRepo) {
    if (!fs.existsSync(`${repoPath}/docs/_redirect.yaml`) && !fs.existsSync(`${repoPath}/doc/_redirect.yaml`)) {
      continue;
    }

    if (!fs.existsSync(`${buildPath}/.cache/`)) {
      fs.mkdirSync(`${buildPath}/.cache/`, {
        recursive: true,
      });
    }

    if (fs.existsSync(`${repoPath}/docs/_redirect.yaml`)) {
      fs.copyFileSync(`${repoPath}/docs/_redirect.yaml`, `${buildPath}/.cache/_redirect-${repoPath.split('/').pop()}.yaml`);
    } else {
      fs.copyFileSync(`${repoPath}/doc/_redirect.yaml`, `${buildPath}/.cache/_redirect-${repoPath.split('/').pop()}.yaml`);
    }
  }
};

const merge = async (branch) => {
  const buildPath = path.join(process.cwd(), `../../../build/${branch}`);

  await mergeUpstream(`${buildPath}/app/zh/`);
  await mergeUpstream(`${buildPath}/app/en/`);
  copyRedirectYaml(buildPath);
};

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('请提供分支名称');
  process.exit(1);
} else {
  if (Object.keys(VITEPRESS_VERSIONS_CONFIG).includes(args[0])) {
    merge(args[0]);
  } else {
    console.error('非新版本内容，跳过处理~');
  }
}
