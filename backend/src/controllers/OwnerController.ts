import { Request, Response } from 'express';
import { OwnerModel } from '../models/Owner';
import { PostgresErrorCode } from '../constants/postgresErrors';

export class OwnerController {
  static async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const owners = await OwnerModel.getAll();
      res.json(owners);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch owners' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const owner = await OwnerModel.getById(id);
      if (!owner) {
        res.status(404).json({ error: 'Owner not found' });
        return;
      }
      res.json(owner);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch owner' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const owner = await OwnerModel.create(req.body);
      res.status(201).json(owner);
    } catch (error: any) {
      if (error.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        res.status(409).json({ error: 'Email address already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create owner' });
      }
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const owner = await OwnerModel.update(id, req.body);
      if (!owner) {
        res.status(404).json({ error: 'Owner not found' });
        return;
      }
      res.json(owner);
    } catch (error: any) {
      if (error.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        res.status(409).json({ error: 'Email address already exists' });
      } else {
        res.status(500).json({ error: 'Failed to update owner' });
      }
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await OwnerModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Owner not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete owner' });
    }
  }

  static async getFullnamesBatch(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        res.status(400).json({ error: 'ids must be an array' });
        return;
      }

      const fullnamesMap = await OwnerModel.getFullnamesBatch(ids);
      // Convert Map to object for JSON response
      const result: Record<string, string> = {};
      fullnamesMap.forEach((fullname, id) => {
        result[id] = fullname;
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch owner fullnames' });
    }
  }
}

