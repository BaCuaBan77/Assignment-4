import { pgPool, redisClient } from '../config/database';
import { Sensor, SensorWithDetails } from '../types';
import { OwnerModel } from './Owner';
import { LocationModel } from './Location';

export class SensorModel {
  static async getAll(): Promise<Sensor[]> {
    const result = await pgPool.query('SELECT * FROM sensor ORDER BY id');
    return result.rows;
  }

  static async getByOwnerId(ownerId: string): Promise<Sensor[]> {
    const result = await pgPool.query('SELECT * FROM sensor WHERE owner_id = $1 ORDER BY name', [ownerId]);
    return result.rows;
  }

  static async getById(id: string): Promise<Sensor | null> {
    const result = await pgPool.query('SELECT * FROM sensor WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getByIdWithDetails(id: string): Promise<SensorWithDetails | null> {
    const sensor = await this.getById(id);
    if (!sensor) return null;

    // Get cached data from Redis
    const sensorHash = await redisClient.hGetAll(`sensors:${id}`);
    const maxValue = await redisClient.get(`${id}/max_value`);
    const minValue = await redisClient.get(`${id}/min_value`);
    const ownerName = await OwnerModel.getFullname(sensor.owner_id);
    const locationString = await LocationModel.getLocationString(sensor.location_id);

    return {
      ...sensor,
      latest_value: sensorHash.latest_value ? parseFloat(sensorHash.latest_value) : undefined,
      max_value: maxValue ? parseFloat(maxValue) : undefined,
      min_value: minValue ? parseFloat(minValue) : undefined,
      owner_name: ownerName || undefined,
      location: locationString || undefined,
    };
  }

  static async create(sensor: Omit<Sensor, 'id'>): Promise<Sensor> {
    const id = `sensor_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const result = await pgPool.query(
      'INSERT INTO sensor (id, name, sensor_type, unit, threshold, owner_id, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, sensor.name, sensor.sensor_type, sensor.unit, sensor.threshold, sensor.owner_id, sensor.location_id]
    );
    
    // Initialize Redis hash for sensor
    await redisClient.hSet(`sensors:${id}`, {
      name: sensor.name,
      sensor_type: sensor.sensor_type,
      unit: sensor.unit,
    });
    
    return result.rows[0];
  }

  static async update(id: string, sensor: Partial<Omit<Sensor, 'id'>>): Promise<Sensor | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (sensor.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(sensor.name);
    }
    if (sensor.sensor_type !== undefined) {
      fields.push(`sensor_type = $${paramCount++}`);
      values.push(sensor.sensor_type);
    }
    if (sensor.unit !== undefined) {
      fields.push(`unit = $${paramCount++}`);
      values.push(sensor.unit);
    }
    if (sensor.threshold !== undefined) {
      fields.push(`threshold = $${paramCount++}`);
      values.push(sensor.threshold);
    }
    if (sensor.owner_id !== undefined) {
      fields.push(`owner_id = $${paramCount++}`);
      values.push(sensor.owner_id);
    }
    if (sensor.location_id !== undefined) {
      fields.push(`location_id = $${paramCount++}`);
      values.push(sensor.location_id);
    }

    if (fields.length === 0) {
      return await this.getById(id);
    }

    values.push(id);
    const result = await pgPool.query(
      `UPDATE sensor SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows[0]) {
      // Update Redis hash if name, sensor_type, or unit changed
      const updated = result.rows[0];
      if (sensor.name || sensor.sensor_type || sensor.unit) {
        await redisClient.hSet(`sensors:${id}`, {
          name: updated.name,
          sensor_type: updated.sensor_type,
          unit: updated.unit,
        });
      }
    }

    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pgPool.query('DELETE FROM sensor WHERE id = $1', [id]);
    
    // Remove from Redis cache
    await redisClient.del(`sensors:${id}`);
    await redisClient.del(`${id}/max_value`);
    await redisClient.del(`${id}/min_value`);
    
    return (result.rowCount ?? 0) > 0;
  }

  static async updateLatestValue(id: string, value: number): Promise<void> {
    await redisClient.hSet(`sensors:${id}`, 'latest_value', value.toString());
  }

  static async updateMaxValue(id: string, value: number): Promise<void> {
    await redisClient.set(`${id}/max_value`, value.toString());
  }

  static async updateMinValue(id: string, value: number): Promise<void> {
    await redisClient.set(`${id}/min_value`, value.toString());
  }
}

