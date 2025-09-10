export interface Confession {
  id: number
  text: string
  author: string
  created_at: string
  updated_at: string
  user_fid?: number | null
  like_count: number
  is_anonymous: boolean
}

export interface ConfessionLike {
  id: number
  confession_id: number
  user_fid?: number | null
  user_identifier?: string | null
  created_at: string
}

export interface ConfessionWithMetadata extends Confession {
  age_seconds: number
}

export interface CreateConfessionRequest {
  text: string
  author: string
  user_fid?: number | null
  is_anonymous?: boolean
}

export interface CreateLikeRequest {
  confession_id: number
  user_fid?: number | null
  user_identifier?: string | null
}
