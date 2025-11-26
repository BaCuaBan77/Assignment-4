import { pgPool, redisClient } from '../config/database';
import { Owner } from '../types';

export class OwnerModel {
  static async getAll(): Promise<Owner[]> {
    const result = await pgPool.query('SELECT * FROM owner ORDER BY id');
    return result.rows;
  }

  static async getById(id: string): Promise<Owner | null> {
    const result = await pgPool.query('SELECT * FROM owner WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(owner: Omit<Owner, 'id'>): Promise<Owner> {
    const id = `owner_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const result = await pgPool.query(
      'INSERT INTO owner (id, first_name, last_name, email_address, dob) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, owner.first_name, owner.last_name, owner.email_address, owner.dob]
    );
    
    // Cache fullname in Redis
    const fullname = `${owner.first_name} ${owner.last_name}`;
    await redisClient.set(`${id}/fullname`, fullname);
    
    return result.rows[0];
  }

  static async update(id: string, owner: Partial<Omit<Owner, 'id'>>): Promise<Owner | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (owner.first_name !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(owner.first_name);
    }
    if (owner.last_name !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(owner.last_name);
    }
    if (owner.email_address !== undefined) {
      fields.push(`email_address = $${paramCount++}`);
      values.push(owner.email_address);
    }
    if (owner.dob !== undefined) {
      fields.push(`dob = $${paramCount++}`);
      values.push(owner.dob);
    }

    if (fields.length === 0) {
      return await this.getById(id);
    }

    values.push(id);
    const result = await pgPool.query(
      `UPDATE owner SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows[0]) {
      // Update cached fullname if name changed
      if (owner.first_name || owner.last_name) {
        const updated = result.rows[0];
        const fullname = `${updated.first_name} ${updated.last_name}`;
        await redisClient.set(`${id}/fullname`, fullname);
      }
    }

    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pgPool.query('DELETE FROM owner WHERE id = $1', [id]);
    
    // Remove from Redis cache
    await redisClient.del(`${id}/fullname`);
    
    return (result.rowCount ?? 0) > 0;
  }

  static async getFullname(id: string): Promise<string | null> {
    // Try Redis first
    const cached = await redisClient.get(`${id}/fullname`);
    if (cached) {
      return cached;
    }

    // Fallback to PostgreSQL
    const owner = await this.getById(id);
    if (owner) {
      const fullname = `${owner.first_name} ${owner.last_name}`;
      await redisClient.set(`${id}/fullname`, fullname);
      return fullname;
    }

    return null;
  }

  static async getFullnamesBatch(ids: string[]): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    
    if (ids.length === 0) {
      return result;
    }

    // Fetch from Redis in parallel
    const redisPromises = ids.map(async (id) => {
      const cached = await redisClient.get(`${id}/fullname`);
      return { id, fullname: cached };
    });

    const redisResults = await Promise.all(redisPromises);
    
    // Find IDs that weren't in cache
    const missingIds: string[] = [];
    redisResults.forEach(({ id, fullname }) => {
      if (fullname) {
        result.set(id, fullname);
      } else {
        missingIds.push(id);
      }
    });

    // Fetch missing ones from PostgreSQL in batch
    if (missingIds.length > 0) {
      const placeholders = missingIds.map((_, i) => `$${i + 1}`).join(', ');
      const query = `SELECT id, first_name, last_name FROM owner WHERE id IN (${placeholders})`;
      const dbResult = await pgPool.query(query, missingIds);

      // Cache and add to result
      for (const owner of dbResult.rows) {
        const fullname = `${owner.first_name} ${owner.last_name}`;
        await redisClient.set(`${owner.id}/fullname`, fullname);
        result.set(owner.id, fullname);
      }
    }

    return result;
  }
}

