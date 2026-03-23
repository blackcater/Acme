import type { Command } from './types'
import { CommandLoader } from './loader'

export class CommandRunner {
  private _loader: CommandLoader
  private _commands: Map<string, Command> = new Map()

  constructor() {
    this._loader = new CommandLoader()
  }

  /**
   * 加载 Commands
   */
  async loadCommands(commandsPath: string): Promise<Command[]> {
    const commands = await this._loader.loadCommands(commandsPath)
    for (const command of commands) {
      this._commands.set(command.name, command)
    }
    return commands
  }

  /**
   * 执行 Command
   */
  async execute(name: string, args: string[] = []): Promise<string> {
    const command = this._commands.get(name)
    if (!command) {
      throw new Error(`Command not found: ${name}`)
    }
    return command.handler(args)
  }

  /**
   * 获取 Command
   */
  getCommand(name: string): Command | undefined {
    return this._commands.get(name)
  }

  /**
   * 列出所有 Commands
   */
  listCommands(): Command[] {
    return Array.from(this._commands.values())
  }
}
