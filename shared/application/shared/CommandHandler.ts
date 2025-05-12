import { Command } from "./Command";

/**
 * Interface for all Command Handlers in CQRS
 */
export interface CommandHandler<T extends Command, R = void> {
  /**
   * Execute the command and return a result
   */
  execute(command: T): Promise<R>;
}