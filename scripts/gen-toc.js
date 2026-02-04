import fs from 'fs-extra';
import path from 'path';
import url from 'url';
import yaml from 'js-yaml';

import { VITEPRESS_VERSIONS_CONFIG } from './config/version.js';
import { getGitUrlInfo } from './utils/git.js';

// ============================================ 脚本执行逻辑 ============================================
const BUILD_PATH = path.resolve();
const VERSIONS = process.argv.slice(2);

const globalErrors = [];
const globalIds = new Set();
const globalHandledYaml = new Map();

(async () => {
  const outputZhPath = path.join(BUILD_PATH, './app/.vitepress/public/toc/toc.json');
  const outputEnPath = path.join(BUILD_PATH, './app/.vitepress/public/toc/toc-en.json');
  const outputZhToc = [];
  const outputEnToc = [];

  for (const item of VERSIONS) {
    const version = VITEPRESS_VERSIONS_CONFIG[item] || item;
    const tocZh = buildVersionToc(version, 'zh');
    if (tocZh.length > 0) {
      outputZhToc.push(...tocZh);
    }

    const tocZhLite = buildVersionToc(`${version}-lite`, 'zh');
    if (tocZhLite.length > 0) {
      outputZhToc.push(...tocZhLite);
    }

    const tocEn = buildVersionToc(version, 'en');
    if (tocEn.length > 0) {
      outputEnToc.push(...tocEn);
    }

    const tocEnLite = buildVersionToc(`${version}-lite`, 'en');
    if (tocEnLite.length > 0) {
      outputEnToc.push(...tocEnLite);
    }
  }

  fs.outputFileSync(outputZhPath, JSON.stringify(outputZhToc));
  fs.outputFileSync(outputEnPath, JSON.stringify(outputEnToc));

  // 打印错误
  if (globalErrors.length > 0) {
    console.log('[Exceptions - 异常]：');
    globalErrors.forEach((item) => {
      console.log('-------------------------------------------------------');
      console.log(`[调用函数]：${item.functionName}`);
      console.log(`[错误信息]：${item.message}`);
      console.log(`[本地资源]：${item.filePath.replace(BUILD_PATH, '').replaceAll('\\', '/')}`);
      if (item.upstream) {
        console.log(`[远程地址]：${item.upstream}`);
      }

      if (item.toc && (item.toc.label || item.toc.href)) {
        console.log(`[toc]：${item.toc.label ? `label: ${item.toc.label}` : ''} ${item.toc.href ? `href: ${item.toc.href}` : ''}`);
      }
      
      if (item.err) {
        console.log('[原始错误]：');
        console.log(item.err);
      }
    });
  }
})();

// ============================================ 处理版本 toc 相关函数 ============================================
/**
 * 构建版本分支的 toc
 * @param {string} buildPath 构建目录
 * @param {string} version 版本
 */
function buildVersionToc(version, lang) {
  try {
    const toc = [];

    // 构建全量的
    const tocFilePath = path.join(BUILD_PATH, `./app/${lang}/docs/${version}/_toc.yaml`);
    if (fs.existsSync(tocFilePath)) {
      const tocLang = parseTocYaml(tocFilePath);
      if (tocLang) {
        tocLang.id = `docs-${lang}-${version}`;
        tocLang.type = 'docs-version-root';
        toc.push(tocLang);
      }

      globalIds.clear();
    }

    // 扫描获取未加入全量 _toc.yaml 的指南
    const versionDir = path.join(BUILD_PATH, `./app/${lang}/docs/${version}/`);
    if (fs.existsSync(versionDir)) {
      for (const dirname of fs.readdirSync(versionDir)) {
        const tocPath = path.join(versionDir, dirname, '_toc.yaml');
        if (!fs.existsSync(tocPath)) {
          continue;
        }

        if (!globalHandledYaml.has(tocPath)) {
          const singleToc = parseTocYaml(tocPath);
          if (singleToc) {
            singleToc.id = `docs-${lang}-${version}-${dirname}`;
            singleToc.type = 'docs-single-manual-root';
            toc.push(singleToc);
          }
          globalIds.clear();
        }
      }
    }

    return toc;
  } catch (err) {
    globalErrors.push({
      functionName: 'buildVersionToc',
      message: err.message,
      filePath: '',
      err,
    });
  }

  return [];
}

// ============================================ 合并 toc 相关函数 ============================================
/**
 * 获取 href
 * @param {string} href 链接
 * @param {string} label 名称
 */
function getDocsUrl(href, label) {
  const tempHref = href.replace(path.resolve(BUILD_PATH, 'app'), '').replace(/\\/g, '/').replace('.md', '.html');
  if (!globalIds.has(tempHref)) {
    return tempHref;
  }

  if (!globalIds.has(`${tempHref}?label=${label}`)) {
    return `${tempHref}?label=${label}`;
  }

  let i = 1;
  while (globalIds.has(`${tempHref}?label=${label}-${i}`)) {
    i++;
  }

  return `${tempHref}?label=${label}-${i}`;
}

/**
 * 获取 id
 * @param {object} toc 菜单项
 */
function getId(toc) {
  if (toc.href && !globalIds.has(toc.href)) {
    globalIds.add(toc.href);
    return toc.href;
  }

  if (toc.path && !globalIds.has(toc.path)) {
    globalIds.add(toc.path);
    return toc.path;
  }

  if (toc.label) {
    if (!globalIds.has(toc.label)) {
      globalIds.add(toc.label);
      return toc.label;
    } else {
      let i = 1;
      while (globalIds.has(`${toc.label}-${i}`)) {
        i++;
      }
      return `${toc.label}-${i}`;
    }
  }

  return String(Math.random());
}

/**
 * 通过 _toc.yaml 构建 toc
 * @param {string} tocFilePath toc文件路径
 * @param {string} upstream 远程地址
 */
function parseTocYaml(tocFilePath, upstream) {
  // 已处理过直接返回
  if (globalHandledYaml.get(tocFilePath)) {
    return globalHandledYaml.get(tocFilePath);
  }

  try {
    // 检查文件是否存在
    if (!fs.existsSync(tocFilePath)) {
      throw new Error('文件不存在');
    }

    const toc = yaml.load(fs.readFileSync(tocFilePath, 'utf-8'));
    globalHandledYaml.set(tocFilePath, toc);
    return parseToc(toc, tocFilePath, upstream);
  } catch (err) {
    globalErrors.push({
      functionName: 'parseTocYaml',
      message: err.message,
      upstream,
      filePath: tocFilePath,
      err,
    });
  }

  return null;
}

/**
 * 获取转换过后的 toc
 * @param {object} toc toc对象
 * @param {string} tocFilePath toc文件路径
 * @param {string} upstream 远程地址
 */
function parseToc(toc, tocFilePath, upstream) {
  if (toc.id) {
    return toc;
  }

  try {
    toc = parseHref(toc, tocFilePath, upstream);
    if (toc && !toc.id) {
      toc = parseId(toc);
      toc = parseLabel(toc, tocFilePath, upstream);
      toc = parseSections(toc, tocFilePath, upstream);
    }

    if (toc.type !== 'page' && toc.type !== 'anchor') {
      delete toc.href;
    }

    return toc;
  } catch (err) {
    globalErrors.push({
      functionName: 'parseToc',
      message: err.message,
      toc: JSON.stringify(toc),
      upstream,
      filePath: tocFilePath,
      err,
    });
  }

  return null;
}

/**
 * 处理 id
 * @param {object} toc toc对象
 */
function parseId(toc) {
  if (!toc.id) {
    toc.id = getId(toc);
  }

  return toc;
}

/**
 * 处理 label
 * @param {object} toc toc对象
 * @param {string} tocFilePath toc文件路径
 * @param {string} upstream 远程地址
 */
function parseLabel(toc, tocFilePath, upstream) {
  if (!toc.label) {
    globalErrors.push({
      functionName: 'parseLabel',
      message: 'label 字段为空',
      toc: JSON.stringify(toc),
      upstream,
      filePath: tocFilePath,
    });
  }

  return toc;
}

/**
 * 处理 href
 * @param {object} toc toc对象
 * @param {string} tocFilePath toc文件路径
 * @param {string} upstream 远程地址
 */
function parseHref(toc, tocFilePath, upstream) {
  const currentDir = path.dirname(tocFilePath);

  // 情况1：href 为字符串
  if (typeof toc.href === 'string') {
    // _toc.yaml 继续转换
    if (toc.href.endsWith('_toc.yaml')) {
      return parseTocYaml(path.join(currentDir, toc.href), upstream);
    }

    // md 文件
    if (!toc.href.startsWith('http') && toc.href.endsWith('.md')) {
      // 如果存在 upstream，代表该 toc 的祖/父节点是远程 toc 节点，需要还原出 git 地址
      if (upstream) {
        toc.upstream = url.resolve(upstream, toc.href).replace(/\\/g, '/');
      }

      const mdPath = path.resolve(currentDir, toc.href);
      toc.href = getDocsUrl(mdPath, toc.label || '');
      toc.type = 'page';
    }

    return toc;
  }

  // 情况2：href 为 upstream 对象
  if (typeof toc.href === 'object' && typeof toc.href.upstream === 'string') {
    const { repo, locations } = getGitUrlInfo(toc.href.upstream);
    const yamlUpstream = toc.href.upstream.replace('_toc.yaml', '');
    const yamlPath = toc.href.path ? path.join(currentDir, toc.href.path, '_toc.yaml') : path.join(currentDir, repo, ...locations.slice(2));
    return parseTocYaml(yamlPath, yamlUpstream);
  }

  // 情况3：没有 href
  toc.href = getDocsUrl(currentDir, toc.label || '');
  toc.type = 'menu';
  return toc;
}

/**
 * 处理 sections
 * @param {object} toc toc对象
 * @param {string} tocFilePath toc文件路径
 * @param {string} upstream 远程地址
 */
function parseSections(toc, tocFilePath, upstream) {
  if (Array.isArray(toc.sections)) {
    const handledSections = [];
    toc.sections.forEach((item) => {
      let section = parseToc(item, tocFilePath, upstream);
      if (section) {
        handledSections.push(section);
      }
    });

    toc.sections = handledSections;
  }

  return toc;
}
