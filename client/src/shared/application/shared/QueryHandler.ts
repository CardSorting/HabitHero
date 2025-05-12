/**
 * Base interface for all query handlers in the CQRS pattern
 */
import { Query } from "./Query";

export interface QueryHandler<TQuery extends Query, TResponse> {
  execute(query: TQuery): Promise<TResponse>;
}