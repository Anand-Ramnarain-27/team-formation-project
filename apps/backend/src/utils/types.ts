import { PrismaClient, rating_enum, status_enum } from '@prisma/client';

export interface ThemeCreateRequestBody {
  title: string;
  description: string;
  submission_deadline: string;
  voting_deadline: string;
  review_deadline: ReviewDeadline[]; 
  auto_assign_group: boolean;
  team_lead_acceptance?: boolean | null;
  number_of_groups: number;
  created_by: number;
}

export interface ThemeUpdateRequestBody {
  title?: string;
  description?: string;
  submission_deadline?: Date;
  voting_deadline?: Date;
  review_deadline?: ReviewDeadline[]; 
  auto_assign_group?: boolean;
  team_lead_acceptance?: boolean | null;
  number_of_groups?: number;
  created_by?: number;
}

export interface ReviewDeadline {
  start: string;
  end: string;
}

export interface UserUpdateRequestBody {
  name?: string;
  email?: string;
  role?: string;
  auth_provider?: string;
}

export interface UserCreateRequestBody {
  name: string;
  email: string;
  role: string;
  auth_provider?: string;
}

export interface VoteRequestBody {
  idea_id: number;
  voted_by: number;
}

export interface ReviewRequestBody {
  reviewer_id: number;
  reviewee_id: number;
  group_id: number;
  rating: number; 
  feedback: string;
}

export const ratingEnumMap: { [key: number]: rating_enum } = {
  1: rating_enum.RATING_1,
  2: rating_enum.RATING_2,
  3: rating_enum.RATING_3,
  4: rating_enum.RATING_4,
  5: rating_enum.RATING_5
};

export interface AddMemberRequestBody {
  group_id: number;
  user_id: number;
}

export interface GroupCreateRequestBody {
  theme_id: number;
  group_name: string;
  team_lead: number;
}

export interface GroupUpdateRequestBody {
  theme_id?: number;
  group_name?: string;
  team_lead?: number;
}

export interface IdeaRequestBody {
  theme_id: number;
  submitted_by: number;
  idea_name: string;
  description: string;
  status?: status_enum; 
}

export interface NotificationRequestBody {
  recipient_role: string;
  message: string;
  created_by: number;
}

export interface AutoAssignRequestBody {
  theme_id: number;
}
