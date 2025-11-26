import { pgPool } from '../config/database';
import { Alarm } from '../types';

export class AlarmModel {
  static async getAll(): Promise<Alarm[]> {
    const result = await pgPool.query('SELECT * FROM alarm ORDER BY timestamp DESC');
    return result.rows;
  }

  static async getById(id: string): Promise<Alarm | null> {
    const result = await pgPool.query('SELECT * FROM alarm WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getBySensorId(sensorId: string, limit?: number): Promise<Alarm[]> {
    const query = limit
      ? 'SELECT * FROM alarm WHERE sensor_id = $1 ORDER BY timestamp DESC LIMIT $2'
      : 'SELECT * FROM alarm WHERE sensor_id = $1 ORDER BY timestamp DESC';
    const params = limit ? [sensorId, limit] : [sensorId];
    const result = await pgPool.query(query, params);
    return result.rows;
  }

  static async create(alarm: Omit<Alarm, 'id'>): Promise<Alarm> {
    const id = `alarm_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const result = await pgPool.query(
      'INSERT INTO alarm (id, sensor_id, alarm_value, timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, alarm.sensor_id, alarm.alarm_value, alarm.timestamp]
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pgPool.query('DELETE FROM alarm WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

