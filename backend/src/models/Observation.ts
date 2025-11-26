import { pgPool, redisClient } from '../config/database';
import { Observation } from '../types';
import { SensorModel } from './Sensor';
import { AlarmModel } from './Alarm';

export class ObservationModel {
  static async getAll(): Promise<Observation[]> {
    const result = await pgPool.query('SELECT * FROM observation ORDER BY timestamp DESC');
    return result.rows;
  }

  static async getById(id: string): Promise<Observation | null> {
    const result = await pgPool.query('SELECT * FROM observation WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getBySensorId(sensorId: string, limit?: number): Promise<Observation[]> {
    const query = limit
      ? 'SELECT * FROM observation WHERE sensor_id = $1 ORDER BY timestamp DESC LIMIT $2'
      : 'SELECT * FROM observation WHERE sensor_id = $1 ORDER BY timestamp DESC';
    const params = limit ? [sensorId, limit] : [sensorId];
    const result = await pgPool.query(query, params);
    return result.rows;
  }

  static async create(observation: Omit<Observation, 'id'>): Promise<Observation> {
    const id = `obs_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const result = await pgPool.query(
      'INSERT INTO observation (id, sensor_id, value, timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, observation.sensor_id, observation.value, observation.timestamp]
    );

    // Update Redis cache with latest value
    await SensorModel.updateLatestValue(observation.sensor_id, observation.value);

    // Update max and min values in Redis
    const maxValue = await redisClient.get(`${observation.sensor_id}/max_value`);
    const minValue = await redisClient.get(`${observation.sensor_id}/min_value`);

    if (!maxValue || parseFloat(maxValue) < observation.value) {
      await SensorModel.updateMaxValue(observation.sensor_id, observation.value);
    }

    if (!minValue || parseFloat(minValue) > observation.value) {
      await SensorModel.updateMinValue(observation.sensor_id, observation.value);
    }

    // Check if threshold is exceeded and create alarm
    const sensor = await SensorModel.getById(observation.sensor_id);
    if (sensor && observation.value > sensor.threshold) {
      await AlarmModel.create({
        sensor_id: observation.sensor_id,
        alarm_value: observation.value,
        timestamp: observation.timestamp,
      });
    }

    return result.rows[0];
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pgPool.query('DELETE FROM observation WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

