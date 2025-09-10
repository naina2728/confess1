import { supabase } from './supabase'
import type { Confession, CreateConfessionRequest, CreateLikeRequest } from '@/types/database'

/**
 * Fetch all confessions from the database, ordered by creation date (newest first)
 */
export async function fetchConfessions(): Promise<Confession[]> {
  try {
    const { data, error } = await supabase
      .from('confessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching confessions:', error)
      throw new Error(`Failed to fetch confessions: ${error.message}`)
    }

    const confessions = data || []

    // Verify like counts are accurate by checking against actual likes
    for (const confession of confessions) {
      const { count, error: countError } = await supabase
        .from('confession_likes')
        .select('*', { count: 'exact', head: true })
        .eq('confession_id', confession.id)

      if (!countError && count !== null && count !== confession.like_count) {
        console.log(`Fixing like count for confession ${confession.id}: ${confession.like_count} -> ${count}`)
        
        // Update the like count in the database
        await supabase
          .from('confessions')
          .update({ like_count: count })
          .eq('id', confession.id)
        
        // Update the local data
        confession.like_count = count
      }
    }

    return confessions
  } catch (error) {
    console.error('Error in fetchConfessions:', error)
    throw error
  }
}

/**
 * Create a new confession in the database
 */
export async function createConfession(confession: CreateConfessionRequest): Promise<Confession> {
  try {
    // Validate text length
    if (!confession.text || confession.text.trim().length === 0) {
      throw new Error('Confession text cannot be empty')
    }

    if (confession.text.length > 500) {
      throw new Error('Confession text cannot exceed 500 characters')
    }

    // Validate author
    if (!confession.author || confession.author.trim().length === 0) {
      throw new Error('Author name is required')
    }

    const { data, error } = await supabase
      .from('confessions')
      .insert([{
        text: confession.text.trim(),
        author: confession.author.trim(),
        user_fid: confession.user_fid || null,
        is_anonymous: confession.is_anonymous ?? true
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating confession:', error)
      throw new Error(`Failed to create confession: ${error.message}`)
    }

    if (!data) {
      throw new Error('No data returned from confession creation')
    }

    return data
  } catch (error) {
    console.error('Error in createConfession:', error)
    throw error
  }
}

/**
 * Add a like to a confession
 */
export async function likeConfession(likeRequest: CreateLikeRequest): Promise<void> {
  try {
    // Validate that either user_fid or user_identifier is provided
    if (!likeRequest.user_fid && !likeRequest.user_identifier) {
      throw new Error('Either user_fid or user_identifier must be provided')
    }

    // Allow both to be provided but prioritize user_fid
    let finalUserFid = likeRequest.user_fid || null
    let finalUserIdentifier = likeRequest.user_fid ? null : (likeRequest.user_identifier || null)

    const { error } = await supabase
      .from('confession_likes')
      .insert([{
        confession_id: likeRequest.confession_id,
        user_fid: finalUserFid,
        user_identifier: finalUserIdentifier
      }])

    if (error) {
      // Check if it's a duplicate like error
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('You have already liked this confession')
      }
      console.error('Error liking confession:', error)
      throw new Error(`Failed to like confession: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in likeConfession:', error)
    throw error
  }
}

/**
 * Remove a like from a confession
 */
export async function unlikeConfession(confessionId: number, userFid?: number, userIdentifier?: string): Promise<void> {
  try {
    // Validate that either user_fid or user_identifier is provided
    if (!userFid && !userIdentifier) {
      throw new Error('Either user_fid or user_identifier must be provided')
    }

    let query = supabase
      .from('confession_likes')
      .delete()
      .eq('confession_id', confessionId)

    // Prioritize user_fid over user_identifier
    if (userFid) {
      query = query.eq('user_fid', userFid).is('user_identifier', null)
    } else if (userIdentifier) {
      query = query.eq('user_identifier', userIdentifier).is('user_fid', null)
    }

    const { error } = await query

    if (error) {
      console.error('Error unliking confession:', error)
      throw new Error(`Failed to unlike confession: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in unlikeConfession:', error)
    throw error
  }
}

/**
 * Check if a user has liked a specific confession
 */
export async function hasUserLikedConfession(confessionId: number, userFid?: number, userIdentifier?: string): Promise<boolean> {
  try {
    if (!userFid && !userIdentifier) {
      return false
    }

    let query = supabase
      .from('confession_likes')
      .select('id')
      .eq('confession_id', confessionId)

    // Prioritize user_fid over user_identifier
    if (userFid) {
      query = query.eq('user_fid', userFid).is('user_identifier', null)
    } else if (userIdentifier) {
      query = query.eq('user_identifier', userIdentifier).is('user_fid', null)
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking like status:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in hasUserLikedConfession:', error)
    return false
  }
}

/**
 * Generate a persistent user identifier for anonymous users
 * Uses localStorage to maintain consistency across sessions
 * Falls back to browser fingerprint if localStorage is not available
 */
export function generateUserIdentifier(): string {
  if (typeof window === 'undefined') {
    return 'server_side_fallback'
  }

  const STORAGE_KEY = 'spicy_confessions_user_id'
  
  // Try to get existing identifier from localStorage
  try {
    const existingId = localStorage.getItem(STORAGE_KEY)
    if (existingId) {
      return existingId
    }
  } catch (error) {
    console.warn('localStorage not available:', error)
  }
  
  // Generate new identifier based on browser fingerprint (without timestamp)
  const userAgent = window.navigator.userAgent || ''
  const screen = `${window.screen.width}x${window.screen.height}`
  const language = window.navigator.language || ''
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  
  // Create a simple hash from stable browser features
  let hash = 0
  const str = `${userAgent}-${screen}-${language}-${timezone}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  // Add some randomness for uniqueness but make it deterministic per session
  const randomSeed = Math.floor(Math.random() * 1000000)
  const identifier = `anon_${Math.abs(hash)}_${randomSeed}`
  
  // Store in localStorage for persistence
  try {
    localStorage.setItem(STORAGE_KEY, identifier)
  } catch (error) {
    console.warn('Could not save to localStorage:', error)
  }
  
  return identifier
}

/**
 * Get user identifier with priority for MiniKit FID
 * Returns either the user's FID or a persistent anonymous identifier
 */
export function getUserIdentifier(miniKitContext?: any): { userFid?: number; userIdentifier?: string } {
  // Check if user has a FID from MiniKit context
  if (miniKitContext?.user?.fid) {
    return { userFid: miniKitContext.user.fid }
  }
  
  // Fall back to anonymous identifier
  return { userIdentifier: generateUserIdentifier() }
}

/**
 * Manually recalculate like counts for all confessions
 * This is a fallback in case the database triggers aren't working
 */
export async function recalculateLikeCounts(): Promise<void> {
  try {
    // Get all confessions
    const { data: confessions, error: confessionError } = await supabase
      .from('confessions')
      .select('id')

    if (confessionError) {
      throw new Error(`Failed to fetch confessions: ${confessionError.message}`)
    }

    if (!confessions) {
      return
    }

    // Update like count for each confession
    for (const confession of confessions) {
      const { count, error: countError } = await supabase
        .from('confession_likes')
        .select('*', { count: 'exact', head: true })
        .eq('confession_id', confession.id)

      if (countError) {
        console.error(`Error counting likes for confession ${confession.id}:`, countError)
        continue
      }

      const likeCount = count || 0

      const { error: updateError } = await supabase
        .from('confessions')
        .update({ like_count: likeCount })
        .eq('id', confession.id)

      if (updateError) {
        console.error(`Error updating like count for confession ${confession.id}:`, updateError)
      }
    }
  } catch (error) {
    console.error('Error in recalculateLikeCounts:', error)
    throw error
  }
}
