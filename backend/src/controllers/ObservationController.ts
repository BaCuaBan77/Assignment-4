import { Request, Response } from 'express';
import { ObservationModel } from '../models/Observation';
import { PostgresErrorCode } from '../constants/postgresErrors';

export class ObservationController {
  static async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const observations = await ObservationModel.getAll();
      res.json(observations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch observations' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const observation = await ObservationModel.getById(id);
      if (!observation) {
        res.status(404).json({ error: 'Observation not found' });
        return;
      }
      res.json(observation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch observation' });
    }
  }

  static async getBySensorId(req: Request, res: Response): Promise<void> {
    try {
      const { sensorId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const observations = await ObservationModel.getBySensorId(sensorId, limit);
      res.json(observations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch observations' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const observation = await ObservationModel.create(req.body);
      res.status(201).json(observation);
    } catch (error: any) {
      if (error.code === PostgresErrorCode.FOREIGN_KEY_VIOLATION) {
        res.status(400).json({ error: 'Invalid sensor_id' });
      } else {
        res.status(500).json({ error: 'Failed to create observation' });
      }
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await ObservationModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Observation not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete observation' });
    }
  }
}

