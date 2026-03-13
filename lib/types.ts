export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Page {
  id: string;
  user_id: string;
  parent_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PageWithChildren extends Page {
  children: PageWithChildren[];
}
