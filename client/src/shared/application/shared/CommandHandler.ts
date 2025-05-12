/**
 * Base interface for all command handlers in the CQRS pattern
 */
import { Command } from "./Command";

export interface CommandHandler<TCommand extends Command, TResponse> {
  execute(command: TCommand): Promise<TResponse>;
}