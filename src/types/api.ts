// This matches your Django StandardResponseMixin perfectly
export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  country: string;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  institution: {
    id: string;
    name: string;
    code?: string;
    country?: string;
    website?: string | null;
  } | string | null;
  is_active?: boolean;
  topics?: string[];
  theses_count?: number;
  created_at: string;
  updated_at: string;
  thesesCount?: number;
  totalViews?: number;
  topThesis?: {
    id: string;
    title: string;
    author: string;
    views: number;
  };
}

export interface ThesisCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  slug?: string;
  visits?: number;
  thesesCount?: number;
  featuredTopic?: string;
}

export interface Thesis {
  id: string;
  title: string;
  abstract: string;
  author_name: string;
  supervisor_name: string;
  publication_date: string;
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "revision_requested"
    | "approved"
    | "published"
    | "rejected";
  created_at: string;

  // Your backend ListSerializer returns these as nested objects!
  institution: { id: string; name: string } | null;
  department: { id: string; name: string } | null;
  category: { id: string; name: string } | null;

  tags: string[]; // Your backend exposes keywords_list as 'tags'
  fileUrl: string | null;
  year?: number | null;
  language?: string;
  page_count?: number | null;
  view_count?: number;
  download_count?: number;
  citation_count?: number;
  relatedWorks?: Array<{
    id: string;
    title: string;
    author_name: string;
    abstract: string;
    keywords: string[];
    submissionDate: string | null;
  }>;
}
