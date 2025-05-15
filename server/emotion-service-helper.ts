/**
 * Helper functions for emotion routes
 */
import { Request } from 'express';

/**
 * Get user ID from request, prioritizing query parameter if present
 * This allows therapists to query client emotion data
 */
export function getUserIdFromRequest(req: Request): number {
  if (req.query.userId) {
    console.log(`Using userId from query parameter: ${req.query.userId}`);
    return parseInt(req.query.userId as string);
  }
  
  console.log(`Using authenticated user ID: ${req.user!.id}`);
  return req.user!.id;
}