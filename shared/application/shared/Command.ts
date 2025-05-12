/**
 * Base interface for all Commands in CQRS
 */
export interface Command {
  readonly type: string;
}