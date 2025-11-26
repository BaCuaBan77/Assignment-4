import { Request, Response } from 'express';
import { LocationModel } from '../models/Location';

export class LocationController {
  static async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const locations = await LocationModel.getAll();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const location = await LocationModel.getById(id);
      if (!location) {
        res.status(404).json({ error: 'Location not found' });
        return;
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch location' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const location = await LocationModel.create(req.body);
      res.status(201).json(location);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create location' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const location = await LocationModel.update(id, req.body);
      if (!location) {
        res.status(404).json({ error: 'Location not found' });
        return;
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update location' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await LocationModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Location not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete location' });
    }
  }

  static async getLocationStringsBatch(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        res.status(400).json({ error: 'ids must be an array' });
        return;
      }

      const locationStringsMap = await LocationModel.getLocationStringsBatch(ids);
      // Convert Map to object for JSON response
      const result: Record<string, string> = {};
      locationStringsMap.forEach((locationString, id) => {
        result[id] = locationString;
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch location strings' });
    }
  }
}

