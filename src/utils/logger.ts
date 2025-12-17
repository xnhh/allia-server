import chalk from "chalk"
import boxen from "boxen"
import consola from "consola"

// 配置 consola
const logger = consola.withTag("allia")

// 导出美化后的日志方法
export const log = {
  // 信息日志
  info: (message: string, ...args: unknown[]) => {
    logger.info(chalk.blue("ℹ"), message, ...args)
  },

  // 成功日志
  success: (message: string, ...args: unknown[]) => {
    logger.success(chalk.green("✓"), message, ...args)
  },

  // 警告日志
  warn: (message: string, ...args: unknown[]) => {
    logger.warn(chalk.yellow("⚠"), message, ...args)
  },

  // 错误日志
  error: (message: string, ...args: unknown[]) => {
    logger.error(chalk.red("✗"), message, ...args)
  },

  // 调试日志
  debug: (message: string, ...args: unknown[]) => {
    logger.debug(chalk.gray("→"), message, ...args)
  },

  // 带标签的日志
  tagged: (tag: string, message: string, ...args: unknown[]) => {
    const tagColor = chalk.cyan(`[${tag}]`)
    logger.log(tagColor, message, ...args)
  },

  // 启动横幅
  banner: (title: string, content: string[]) => {
    const box = boxen(
      [chalk.bold.cyan(title), "", ...content.map((line) => chalk.gray(line))].join("\n"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
        titleAlignment: "center",
      }
    )
    console.log(box)
  },

  // 分隔线
  separator: (char = "─", length = 50) => {
    console.log(chalk.gray(char.repeat(length)))
  },
}

export default log
