/**
 * API routes for DBT Flash Cards
 * Serves authentic DBT educational content from the database
 */
import { Express, Request, Response, NextFunction } from 'express';
import { pool } from './db';

type AuthRequest = Request & {
  user?: {
    id: number;
    username: string;
    role?: "client" | "therapist" | "admin";
  }
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ error: "You must be logged in to access this resource" });
  }
}

export function registerDBTFlashCardsRoutes(app: Express) {
  
  /**
   * Get all DBT flash cards or filter by category
   */
  app.get('/api/dbt-flashcards', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { category } = req.query;
      
      let query = 'SELECT * FROM dbt_flash_cards';
      const params: any[] = [];
      
      if (category) {
        query += ' WHERE category = $1';
        params.push(category);
      }
      
      query += ' ORDER BY category, skill_name';
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching DBT flash cards:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Get flash cards by specific category
   */
  app.get('/api/dbt-flashcards/category/:category', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { category } = req.params;
      
      const result = await pool.query(
        'SELECT * FROM dbt_flash_cards WHERE category = $1 ORDER BY skill_name',
        [category]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching DBT flash cards by category:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Get available DBT categories
   */
  app.get('/api/dbt-flashcards/categories', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        'SELECT category, COUNT(*) as card_count FROM dbt_flash_cards GROUP BY category ORDER BY category'
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching DBT categories:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Get user's study progress for DBT flash cards
   */
  app.get('/api/dbt-flashcards/progress', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const result = await pool.query(`
        SELECT 
          dfc.category,
          COUNT(*) as total_cards,
          COUNT(dsp.flash_card_id) as studied_cards,
          ROUND(AVG(CASE WHEN dsp.correct THEN 1 ELSE 0 END) * 100, 2) as accuracy_percentage
        FROM dbt_flash_cards dfc
        LEFT JOIN dbt_study_progress dsp ON dfc.id = dsp.flash_card_id AND dsp.user_id = $1
        GROUP BY dfc.category
        ORDER BY dfc.category
      `, [userId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching study progress:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Get a specific flash card by ID
   */
  app.get('/api/dbt-flashcards/:id', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'SELECT * FROM dbt_flash_cards WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Flash card not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching DBT flash card:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Record that a user studied a flash card (for progress tracking)
   */
  app.post('/api/dbt-flashcards/:id/study', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { correct, difficulty_rating } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Create or update study record
      await pool.query(`
        INSERT INTO dbt_study_progress (user_id, flash_card_id, studied_at, correct, difficulty_rating)
        VALUES ($1, $2, NOW(), $3, $4)
        ON CONFLICT (user_id, flash_card_id) 
        DO UPDATE SET 
          studied_at = NOW(),
          correct = $3,
          difficulty_rating = $4,
          study_count = dbt_study_progress.study_count + 1
      `, [userId, id, correct, difficulty_rating]);
      
      res.json({ message: 'Study progress recorded' });
    } catch (error) {
      console.error('Error recording study progress:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


}