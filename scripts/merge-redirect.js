import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';

import { VITEPRESS_VERSIONS_CONFIG } from './config/version.js';
import { getGitUrlInfo } from './utils/git.js';

const BUILD_PATH = path.resolve();
const TOC_ZH_PATH = path.join(BUILD_PATH, './app/.vitepress/public/toc/toc.json');
const TOC_EN_PATH = path.join(BUILD_PATH, './app/.vitepress/public/toc/toc-en.json');
const CACHE_PATH = path.join(BUILD_PATH, '.cache');
const NGINX_PATH = path.join(BUILD_PATH, './deploy/nginx/nginx.conf');

const reversedRedirectMap = {};
const outputRedirectMap = {};

function getRepoReversedRedirect(repoName) {
  try {
    if (reversedRedirectMap[repoName]) {
      return reversedRedirectMap[repoName];
    }

    const yamlPath = path.join(CACHE_PATH, `_redirect-${repoName}.yaml`);
    if (!fs.existsSync(yamlPath)) {
      return;
    }

    reversedRedirectMap[repoName] = {};
    const obj = yaml.load(fs.readFileSync(yamlPath, 'utf-8'));
    Object.keys(obj).forEach((key) => {
      reversedRedirectMap[repoName][obj[key]] = key;
    });

    return reversedRedirectMap[repoName];
  } catch (err) {
    console.log(`getRepoReversedRedirect 异常: ${err?.message}`);
  }
}

function processSelfRedirect() {
  const versions = process.argv.slice(2);
  if (versions.length === 0) {
    return;
  }

  versions.forEach((version) => {
    const branchName = VITEPRESS_VERSIONS_CONFIG[version];
    const yamlPath = path.join(CACHE_PATH, `_redirect-${branchName}.yaml`);
    if (!fs.existsSync(yamlPath)) {
      return;
    }

    try {
      const obj = yaml.load(fs.readFileSync(yamlPath, 'utf-8'));
      Object.keys(obj).forEach((key) => {
        if (key.trim() === obj[key].trim()) {
          return;
        }

        const [_1, _2, oldLang, ...oldPath] = key.trim().split('/');
        const [_3, _4, newLang, ...newPath] = obj[key].trim().split('/');
        const oldHref = `/${oldLang}/docs/${branchName}/${oldPath.join('/')}`.replace('.md', '.html');
        const newHref = `/${newLang}/docs/${branchName}/${newPath.join('/')}`.replace('.md', '.html');
        outputRedirectMap[oldHref] = newHref;
      });
    } catch (err) {
      console.log(`processSelfRedirect 异常: ${err?.message}`);
    }
  });
}

function processToc(toc) {
  if (Array.isArray(toc.sections)) {
    toc.sections.forEach(processToc);
  }

  if (toc.type !== 'page' || !toc.href || !toc.upstream) {
    return;
  }

  const { repo, locations } = getGitUrlInfo(toc.upstream);

  const repoRedirectMap = getRepoReversedRedirect(repo);
  if (!repoRedirectMap) {
    return;
  }

  const localPath = `/${locations.join('/')}`;
  if (!repoRedirectMap[localPath]) {
    return;
  }

  const hrefArr = toc.href.split('/');
  const newPathArr = [...locations];
  newPathArr[newPathArr.length - 1] = newPathArr[newPathArr.length - 1].replace('.md', '.html');
  while (hrefArr[hrefArr.length - 1] && newPathArr[newPathArr.length - 1] && hrefArr[hrefArr.length - 1] === newPathArr[newPathArr.length - 1]) {
    hrefArr.pop();
    newPathArr.pop();
  }

  const newPathPrefix = `/${newPathArr.join('/')}`;
  const oldHref = `${hrefArr.join('/')}${repoRedirectMap[localPath].replace(newPathPrefix, '')}`.replace('.md', '.html').trim();
  if (oldHref === toc.href.trim()) {
    return;
  }

  outputRedirectMap[oldHref] = toc.href.trim();
}

// 增加旧版本转发
function replaceCommonNginxRedirect(obj) {
  try {
    const rewrites = [];
    Object.keys(obj).forEach((key) => {
      const oldUrl = key.replace(/([.*+?^${}()|[\]\\])/g, '\\$1').replace(/ /g, '\\s');
      rewrites.push(`rewrite ^${oldUrl}$ ${obj[key]} permanent;`);
    });

    const nginxContent = fs.readFileSync(NGINX_PATH, 'utf8').replace('#[rewrite_template]', rewrites.join('\n      '));
    fs.writeFileSync(NGINX_PATH, nginxContent, 'utf8');
    console.log(nginxContent);
    console.log(`替换nginx转发成功`);
  } catch (err) {
    console.log(`替换nginx转发内容失败，错误原因：${err?.message}`);
  }
}

function main() {
  processSelfRedirect();

  try {
    const tocZh = JSON.parse(fs.readFileSync(TOC_ZH_PATH, 'utf-8') || '[]');
    tocZh.forEach(processToc);
  } catch (err) {
    console.log(`转换redirect异常 - zh: ${err?.message}`);
  }

  try {
    const tocEn = JSON.parse(fs.readFileSync(TOC_EN_PATH, 'utf-8') || '[]');
    tocEn.forEach(processToc);
  } catch (err) {
    console.log(`转换redirect异常 - en: ${err?.message}`);
  }

  console.log('_redirect.yaml 文件转换完成');
  console.log(JSON.stringify(outputRedirectMap, null, 2));
  replaceCommonNginxRedirect(outputRedirectMap);
}

main();
