/**
 * Query objects for the Wellness Challenge system following CQRS pattern
 * Queries represent operations that read state but don't modify it
 */

import { 
  ChallengeFrequency, 
  ChallengeStatus, 
  ChallengeType, 
  DateString 
} from '../domain/models';

// Base Query interface
export interface Query {
  readonly type: string;
}

// Challenge Queries
export class GetChallengeByIdQuery implements Query {
  readonly type = 'GET_CHALLENGE_BY_ID';
  
  constructor(
    public readonly id: number,
  ) {}
}

export class GetChallengesForUserQuery implements Query {
  readonly type = 'GET_CHALLENGES_FOR_USER';
  
  constructor(
    public readonly userId: number,
  ) {}
}

export class GetChallengesByStatusQuery implements Query {
  readonly type = 'GET_CHALLENGES_BY_STATUS';
  
  constructor(
    public readonly userId: number,
    public readonly status: ChallengeStatus,
  ) {}
}

export class GetChallengesByTypeQuery implements Query {
  readonly type = 'GET_CHALLENGES_BY_TYPE';
  
  constructor(
    public readonly userId: number,
    public readonly challengeType: ChallengeType,
  ) {}
}

export class GetChallengesByFrequencyQuery implements Query {
  readonly type = 'GET_CHALLENGES_BY_FREQUENCY';
  
  constructor(
    public readonly userId: number,
    public readonly frequency: ChallengeFrequency,
  ) {}
}

export class GetChallengesByDateRangeQuery implements Query {
  readonly type = 'GET_CHALLENGES_BY_DATE_RANGE';
  
  constructor(
    public readonly userId: number,
    public readonly startDate: DateString,
    public readonly endDate: DateString,
  ) {}
}

export class GetChallengeWithDetailsQuery implements Query {
  readonly type = 'GET_CHALLENGE_WITH_DETAILS';
  
  constructor(
    public readonly id: number,
  ) {}
}

export class GetChallengeSummaryQuery implements Query {
  readonly type = 'GET_CHALLENGE_SUMMARY';
  
  constructor(
    public readonly userId: number,
  ) {}
}

export class GetChallengeStreakQuery implements Query {
  readonly type = 'GET_CHALLENGE_STREAK';
  
  constructor(
    public readonly challengeId: number,
  ) {}
}

// Challenge Goal Queries
export class GetChallengeGoalByIdQuery implements Query {
  readonly type = 'GET_CHALLENGE_GOAL_BY_ID';
  
  constructor(
    public readonly id: number,
  ) {}
}

export class GetGoalsForChallengeQuery implements Query {
  readonly type = 'GET_GOALS_FOR_CHALLENGE';
  
  constructor(
    public readonly challengeId: number,
  ) {}
}

// Challenge Progress Queries
export class GetChallengeProgressByIdQuery implements Query {
  readonly type = 'GET_CHALLENGE_PROGRESS_BY_ID';
  
  constructor(
    public readonly id: number,
  ) {}
}

export class GetProgressForChallengeQuery implements Query {
  readonly type = 'GET_PROGRESS_FOR_CHALLENGE';
  
  constructor(
    public readonly challengeId: number,
  ) {}
}

export class GetProgressForDateQuery implements Query {
  readonly type = 'GET_PROGRESS_FOR_DATE';
  
  constructor(
    public readonly challengeId: number,
    public readonly date: DateString,
  ) {}
}

export class GetProgressForDateRangeQuery implements Query {
  readonly type = 'GET_PROGRESS_FOR_DATE_RANGE';
  
  constructor(
    public readonly challengeId: number,
    public readonly startDate: DateString,
    public readonly endDate: DateString,
  ) {}
}

// Emotion Category Queries
export class GetAllEmotionCategoriesQuery implements Query {
  readonly type = 'GET_ALL_EMOTION_CATEGORIES';
  
  constructor() {}
}

export class GetEmotionCategoryByIdQuery implements Query {
  readonly type = 'GET_EMOTION_CATEGORY_BY_ID';
  
  constructor(
    public readonly id: number,
  ) {}
}

// Emotion Queries
export class GetAllEmotionsQuery implements Query {
  readonly type = 'GET_ALL_EMOTIONS';
  
  constructor() {}
}

export class GetEmotionByIdQuery implements Query {
  readonly type = 'GET_EMOTION_BY_ID';
  
  constructor(
    public readonly id: number,
  ) {}
}

export class GetEmotionsByCategoryQuery implements Query {
  readonly type = 'GET_EMOTIONS_BY_CATEGORY';
  
  constructor(
    public readonly categoryId: number,
  ) {}
}

export class GetEmotionsWithCategoriesQuery implements Query {
  readonly type = 'GET_EMOTIONS_WITH_CATEGORIES';
  
  constructor() {}
}

// User Emotion Queries
export class GetUserEmotionsQuery implements Query {
  readonly type = 'GET_USER_EMOTIONS';
  
  constructor(
    public readonly userId: number,
  ) {}
}

export class GetUserEmotionByIdQuery implements Query {
  readonly type = 'GET_USER_EMOTION_BY_ID';
  
  constructor(
    public readonly id: number,
  ) {}
}

export class GetUserEmotionsByCategoryQuery implements Query {
  readonly type = 'GET_USER_EMOTIONS_BY_CATEGORY';
  
  constructor(
    public readonly userId: number,
    public readonly categoryId: number,
  ) {}
}

export class GetUserEmotionsWithCategoriesQuery implements Query {
  readonly type = 'GET_USER_EMOTIONS_WITH_CATEGORIES';
  
  constructor(
    public readonly userId: number,
  ) {}
}