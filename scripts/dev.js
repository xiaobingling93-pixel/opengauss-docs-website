import { execSync } from 'child_process';

import { parseNamedArgs } from './utils/common.js';

const ARGS = parseNamedArgs();
const BRANCH = ARGS.branch || ''; // 文档分支

const branches = BRANCH ? ARGS.branch.split(',') : Object.keys(VITEPRESS_VERSIONS_CONFIG)
if (!branches.length) {
  console.error('请指定分支（多个分支用英文逗号,分隔） --branch=<branch1,branch2,...>');
  process.exit(1);
}

console.log(`即将拉取文档分支：${branches.join('、')}`);
execSync(`pnpm dev:clone --branch=${branches.join(',')}`, { stdio: 'inherit' });
execSync(`pnpm dev:toc ${branches.join(' ')}`, { stdio: 'inherit' });
execSync(`pnpm dev:app`, { stdio: 'inherit' });
