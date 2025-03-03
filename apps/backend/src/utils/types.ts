import { PrismaClient, rating_enum, status_enum } from '@prisma/client';

export interface ThemeCreateRequestBody {
  title: string;
  description: string;
  submission_deadline: string;
  voting_deadline: string;
  review_deadline: ReviewDeadline[]; // Assuming JSON string
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
  review_deadline?: ReviewDeadline[]; // Assuming JSON string
  auto_assign_group?: boolean;
  team_lead_acceptance?: boolean | null;
  number_of_groups?: number;
  created_by?: number;
}

export interface ReviewDeadline {
  start: string;
  end: string;
}

// User
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

// Votes
export interface VoteRequestBody {
  idea_id: number;
  voted_by: number;
}

// Reviews
export interface ReviewRequestBody {
  reviewer_id: number;
  reviewee_id: number;
  group_id: number;
  rating: number; // Client sends a number (e.g., 1, 2, 3, 4, 5)
  feedback: string;
}

// Mapping for numeric ratings to enum values
export const ratingEnumMap: { [key: number]: rating_enum } = {
  1: rating_enum.ONE,
  2: rating_enum.TWO,
  3: rating_enum.THREE,
  4: rating_enum.FOUR,
  5: rating_enum.FIVE,
};

// Group Members
export interface AddMemberRequestBody {
  group_id: number;
  user_id: number;
}

// Groups
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

// Ideas
export interface IdeaRequestBody {
  theme_id: number;
  submitted_by: number;
  idea_name: string;
  description: string;
  status?: status_enum; // Use the Prisma enum type
}

// Notifications
export interface NotificationRequestBody {
  recipient_role: string;
  message: string;
  created_by: number;
}