import { Query } from "./Query";

/**
 * Interface for all Query Handlers in CQRS
 */
export interface QueryHandler<T extends Query, R> {
  /**
   * Execute the query and return a result
   */
  execute(query: T): Promise<R>;
}