// types.ts
export interface ReviewDeadline {
    start: string;
    end: string;
  }
  
  export interface BaseTheme {
    title: string;
    description: string;
    submission_deadline: string;
    voting_deadline: string;
    review_deadline: ReviewDeadline[];
    number_of_groups: number;
    auto_assign_group: boolean;
  }
  
  export interface Theme extends BaseTheme {
    theme_id: number;
  }