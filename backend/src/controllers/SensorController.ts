import { Request, Response } from 'express';
import { SensorModel } from '../models/Sensor';
import { PostgresErrorCode } from '../constants/postgresErrors';

export class SensorController {
  static async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const sensors = await SensorModel.getAll();
      res.json(sensors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sensors' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const withDetails = req.query.details === 'true';
      
      if (withDetails) {
        const sensor = await SensorModel.getByIdWithDetails(id);
        if (!sensor) {
          res.status(404).json({ error: 'Sensor not found' });
          return;
        }
        res.json(sensor);
        return;
      }
      
      const sensor = await SensorModel.getById(id);
      if (!sensor) {
        res.status(404).json({ error: 'Sensor not found' });
        return;
      }
      res.json(sensor);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sensor' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const sensor = await SensorModel.create(req.body);
      res.status(201).json(sensor);
    } catch (error: any) {
      if (error.code === PostgresErrorCode.FOREIGN_KEY_VIOLATION) {
        res.status(400).json({ error: 'Invalid owner_id or location_id' });
      } else {
        res.status(500).json({ error: 'Failed to create sensor' });
      }
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const sensor = await SensorModel.update(id, req.body);
      if (!sensor) {
        res.status(404).json({ error: 'Sensor not found' });
        return;
      }
      res.json(sensor);
    } catch (error: any) {
      if (error.code === PostgresErrorCode.FOREIGN_KEY_VIOLATION) {
        res.status(400).json({ error: 'Invalid owner_id or location_id' });
      } else {
        res.status(500).json({ error: 'Failed to update sensor' });
      }
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await SensorModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Sensor not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete sensor' });
    }
  }

  static async getByOwnerId(req: Request, res: Response): Promise<void> {
    try {
      const { ownerId } = req.params;
      const sensors = await SensorModel.getByOwnerId(ownerId);
      res.json(sensors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sensors' });
    }
  }
}

