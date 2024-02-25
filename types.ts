export interface Article {
  title: string;
  topic: string;
  author: string;
  body: string;
  votes?: number;
  article_img_url: string;
  comment_count?: number;
}

export interface ArticleWithId extends Article {
  article_id: number;
  created_at: Date;
}

export interface Comment {
  author: string;
  body: string;
  votes: number;
}

export interface CommentWithId extends Comment {
  comment_id: number;
  article_id: number;
  created_at: Date;
}

export interface Topic {
  slug: string;
  description: string;
}

export interface User {
  username: string;
  name: string;
  avatar_url: string;
}

export interface Body {
  topics?: Topic[];
  topic?: Topic;
  articles?: ArticleWithId[];
  article?: ArticleWithId;
  users?: User[];
  msg?: String;
  total_count: number;
  comments: CommentWithId[];
}
