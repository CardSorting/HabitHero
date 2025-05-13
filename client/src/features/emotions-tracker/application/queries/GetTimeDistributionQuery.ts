import { ITimeTrackingRepository, TimeDistributionData } from '../../domain/repositories/ITimeTrackingRepository';

/**
 * Query object for getting time distribution data
 * Following CQRS pattern - Queries represent read operations
 */
export class GetTimeDistributionQuery {
  constructor(
    public readonly userId: number,
    public readonly fromDate: string,
    public readonly toDate: string
  ) {}
}

/**
 * Handler for the GetTimeDistributionQuery
 * Single Responsibility Principle - This class has one job
 */
export class GetTimeDistributionQueryHandler {
  constructor(private timeTrackingRepository: ITimeTrackingRepository) {}

  /**
   * Execute the query to get time distribution data
   * @param query Query parameters
   * @returns Promise resolving to time distribution data
   */
  async execute(query: GetTimeDistributionQuery): Promise<TimeDistributionData> {
    return this.timeTrackingRepository.getTimeDistribution(
      query.userId,
      query.fromDate,
      query.toDate
    );
  }
}