import { pgPool, redisClient } from '../config/database';
import { Location } from '../types';

export class LocationModel {
  static async getAll(): Promise<Location[]> {
    const result = await pgPool.query('SELECT * FROM location ORDER BY id');
    return result.rows;
  }

  static async getById(id: string): Promise<Location | null> {
    const result = await pgPool.query('SELECT * FROM location WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(location: Omit<Location, 'id'>): Promise<Location> {
    const id = `location_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const result = await pgPool.query(
      'INSERT INTO location (id, longitude, latitude, country, city) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, location.longitude, location.latitude, location.country, location.city]
    );
    
    // Cache location string in Redis
    const locationString = `${location.city}, ${location.country}`;
    await redisClient.set(`${id}/location`, locationString);
    
    return result.rows[0];
  }

  static async update(id: string, location: Partial<Omit<Location, 'id'>>): Promise<Location | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (location.longitude !== undefined) {
      fields.push(`longitude = $${paramCount++}`);
      values.push(location.longitude);
    }
    if (location.latitude !== undefined) {
      fields.push(`latitude = $${paramCount++}`);
      values.push(location.latitude);
    }
    if (location.country !== undefined) {
      fields.push(`country = $${paramCount++}`);
      values.push(location.country);
    }
    if (location.city !== undefined) {
      fields.push(`city = $${paramCount++}`);
      values.push(location.city);
    }

    if (fields.length === 0) {
      return await this.getById(id);
    }

    values.push(id);
    const result = await pgPool.query(
      `UPDATE location SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows[0]) {
      // Update cached location if city or country changed
      if (location.city || location.country) {
        const updated = result.rows[0];
        const locationString = `${updated.city}, ${updated.country}`;
        await redisClient.set(`${id}/location`, locationString);
      }
    }

    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pgPool.query('DELETE FROM location WHERE id = $1', [id]);
    
    // Remove from Redis cache
    await redisClient.del(`${id}/location`);
    
    return (result.rowCount ?? 0) > 0;
  }

  static async getLocationString(id: string): Promise<string | null> {
    // Try Redis first
    const cached = await redisClient.get(`${id}/location`);
    if (cached) {
      return cached;
    }

    // Fallback to PostgreSQL
    const location = await this.getById(id);
    if (location) {
      const locationString = `${location.city}, ${location.country}`;
      await redisClient.set(`${id}/location`, locationString);
      return locationString;
    }

    return null;
  }

  static async getLocationStringsBatch(ids: string[]): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    
    if (ids.length === 0) {
      return result;
    }

    // Fetch from Redis in parallel
    const redisPromises = ids.map(async (id) => {
      const cached = await redisClient.get(`${id}/location`);
      return { id, locationString: cached };
    });

    const redisResults = await Promise.all(redisPromises);
    
    // Find IDs that weren't in cache
    const missingIds: string[] = [];
    redisResults.forEach(({ id, locationString }) => {
      if (locationString) {
        result.set(id, locationString);
      } else {
        missingIds.push(id);
      }
    });

    // Fetch missing ones from PostgreSQL in batch
    if (missingIds.length > 0) {
      const placeholders = missingIds.map((_, i) => `$${i + 1}`).join(', ');
      const query = `SELECT id, city, country FROM location WHERE id IN (${placeholders})`;
      const dbResult = await pgPool.query(query, missingIds);

      // Cache and add to result
      for (const location of dbResult.rows) {
        const locationString = `${location.city}, ${location.country}`;
        await redisClient.set(`${location.id}/location`, locationString);
        result.set(location.id, locationString);
      }
    }

    return result;
  }
}

