/**
 * 文档开发环境启动脚本
 * ====================================================================================================
 *
 * 功能概述：
 * - 提供交互式界面选择要构建的文档版本
 * - 简化开发环境的搭建过程：自动执行文档克隆、目录生成和开发服务器启动流程
 *
 * 使用方式：
 *   在项目根目录下执行：
 *   pnpm dev 或 node scripts/dev.js
 *
 * 示例：
 *   pnpm dev
 *   node scripts/dev.js
 *
 * 工作流程：
 * 1. 显示必需构建的文档版本（common分支和其他基础版本）
 * 2. 提供交互式选择界面，让用户选择额外要构建的文档版本
 * 3. 根据用户选择执行以下操作：
 *    a. 克隆选定版本的文档内容
 *    b. 生成文档目录结构
 *    c. 启动本地开发服务器
 *
 * 交互式选项说明：
 * - 跳过: 仅构建必需的文档版本，不额外构建其他版本
 * - 所有版本: 构建所有可用的文档版本（谨慎选择，耗时较长）
 * - 特定版本: 选择一个额外的文档版本进行构建
 *
 * 注意事项：
 * - 构建过程可能需要较长时间，取决于选择的版本数量
 * - 构建完成后会自动启动开发服务器
 * ====================================================================================================
 */

import { execSync } from 'child_process';
import { select } from '@inquirer/prompts';

import { VITEPRESS_VERSIONS_CONFIG } from './config/version.js';

(async () => {
  try {
    const allBranches = Object.keys(VITEPRESS_VERSIONS_CONFIG);
    console.log(`构建必需的文档版本：`);
    console.log(`- ${VITEPRESS_VERSIONS_CONFIG[allBranches[0]]}`); // common分支
    console.log(`- ${VITEPRESS_VERSIONS_CONFIG[allBranches[1]]}`);
    console.log(``);

    const selectedBranches = await select({
      message: `请选择要额外构建的文档版本：`,
      choices: [
        { name: '- 跳过', value: 'pass' },
        { name: '- 所有版本 (请谨慎选择)', value: 'all' },
        ...allBranches.slice(2).map((item) => ({ name: `- ${VITEPRESS_VERSIONS_CONFIG[item]}`, value: item })),
      ],
    });

    let branches;
    if (selectedBranches === 'all') {
      branches = allBranches;
    } else if (selectedBranches === 'pass') {
      branches = allBranches.slice(0, 2);
    } else {
      branches = [...allBranches.slice(0, 2), selectedBranches];
    }

    console.log(`即将拉取文档分支：${branches.join('、')}`);
    execSync(`pnpm dev:clone --branch=${branches.join(',')}`, { stdio: 'inherit' });
    execSync(`pnpm dev:toc ${branches.join(' ')}`, { stdio: 'inherit' });
    execSync(`pnpm dev:app`, { stdio: 'inherit' });
  } catch {
    // do nothingy
  }
})();
