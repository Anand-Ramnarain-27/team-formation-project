export interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at?: string | null;
}

export interface Student {
  [x: string]: any;
  user_id: number;
  name: string;
  email: string;
  group_id?: number;
  group_name?: string;
  metrics: StudentMetrics;
}

export interface StudentWithDetails extends User {
  currentGroup?: {
    group_name: string;
    theme_id: number;
  };
  averageRating?: number;
}

export interface StudentMetrics {
  ideas_submitted: number;
  votes_given: number;
  reviews_given: number;
  average_rating_received: number;
  participation_rate: string;
}

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
  team_lead_acceptance?: boolean | null;
  created_by?: number;
  color_index?: number;
}

export interface Group {
  group_id: number;
  theme_id: number;
  group_name: string;
  team_lead: number;
  created_at: string;
  updated_at?: string | null;

  theme_title?: string;
  team_lead_details?: User;
  members?: User[];
  average_rating?: number;
}

export interface GroupMember {
  group_member_id: number;
  group_id: number;
  user_id: number;
  user: User;
}

export interface GroupDialogProps {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
  themes: Theme[];
  users: User[];
}

export interface Idea {
  idea_id: number;
  theme_id: number;
  submitted_by: number;
  idea_name: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;

  submitter_name?: string;
  votingActive?: boolean;
  votes_count?: number;
  theme_title?: string;
  vote_count?: number;
  className?: string;
  onVote?: () => void; 
  isVoted?: boolean; 
  remainingVotes?: number;
}

export interface IdeaSubmission {
  idea_name: string;
  description: string;
}

export interface Vote {
  vote_id: number;
  idea_id: number;
  voted_by: number;
  created_at: string;
}

export interface Review {
  review_id?: number;
  reviewer_id: number;
  reviewee_id: number;
  group_id: number;
  rating: '1' | '2' | '3' | '4' | '5';
  feedback: string;
  created_at: string;
  group_name?: string;
}

export interface AnalyticsReport {
  report_id: number;
  theme_id: number;
  total_students: number;
  total_reports: number;
  average_rating: number;
  participation_stats: ParticipationStats;
}

export interface ParticipationStats {
  ideas_submitted: number;
  votes_cast: number;
  reviews_completed: number;
  totalIdeas: number;
  totalVotes: number;
  totalReviews: number;
  averageRating: number;
}

export interface Notification {
  notification_id: number;
  recipient_role: string;
  message: string;
  created_at: string;
  created_by?: number;
  creator?: User;
  status?: 'info' | 'warning' | 'success' | undefined;
}

export interface LoadingStateProps {
  message?: string;
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export interface GroupDialogProp {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
  themes: Theme[];
  users: User[];
  onSave: (formData: GroupFormData) => void;
}

export interface GroupFormData {
  group_name: string;
  theme_id: string;
  team_lead: string;
}

export interface MemberManagementDialogProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
  availableUsers: User[];
  onAddMember: (user: User) => void;
  onRemoveMember: (userId: number) => void;
}

export interface Question {
  question_id?: number;
  theme_id?: number;
  question_text: string;
  created_at?: string;
  updated_at?: string;
}

export interface ThemeWithQuestions extends Theme {
  questions: Question[];
}

export interface BaseThemeWithQuestions extends BaseTheme {
  questions: Question[];
}

export interface AdminAnalyticsReport {
  report_id: number;
  theme_id: number;
  total_students: number;
  total_reports: number;
  average_rating: number;
  participation_stats: {
    ideas_submitted: number;
    votes_cast: number;
    reviews_completed: number;
    totalIdeas: number;
    totalVotes: number;
    totalReviews: number;
    averageRating: number;
  };
}

export interface StudentProfileData {
  student: User;
  ideas: Idea[];
  groups: Group[];
  reviews: Review[];
  participationStats: ParticipationStats;
}

