import { Request, Response } from 'express';
import { AlarmModel } from '../models/Alarm';
import { PostgresErrorCode } from '../constants/postgresErrors';

export class AlarmController {
  static async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const alarms = await AlarmModel.getAll();
      res.json(alarms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch alarms' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const alarm = await AlarmModel.getById(id);
      if (!alarm) {
        res.status(404).json({ error: 'Alarm not found' });
        return;
      }
      res.json(alarm);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch alarm' });
    }
  }

  static async getBySensorId(req: Request, res: Response): Promise<void> {
    try {
      const { sensorId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const alarms = await AlarmModel.getBySensorId(sensorId, limit);
      res.json(alarms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch alarms' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const alarm = await AlarmModel.create(req.body);
      res.status(201).json(alarm);
    } catch (error: any) {
      if (error.code === PostgresErrorCode.FOREIGN_KEY_VIOLATION) {
        res.status(400).json({ error: 'Invalid sensor_id' });
      } else {
        res.status(500).json({ error: 'Failed to create alarm' });
      }
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await AlarmModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Alarm not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete alarm' });
    }
  }
}

