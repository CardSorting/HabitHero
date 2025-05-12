/**
 * Base interface for all Queries in CQRS
 */
export interface Query {
  readonly type: string;
}