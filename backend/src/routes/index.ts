import { Router } from 'express';
import { OwnerController } from '../controllers/OwnerController';
import { LocationController } from '../controllers/LocationController';
import { SensorController } from '../controllers/SensorController';
import { ObservationController } from '../controllers/ObservationController';
import { AlarmController } from '../controllers/AlarmController';

const router = Router();

// Owner routes
router.get('/owners', OwnerController.getAll);
router.post('/owners', OwnerController.create);
router.post('/owners/fullnames/batch', OwnerController.getFullnamesBatch);
router.get('/owners/:ownerId/sensors', SensorController.getByOwnerId);
router.get('/owners/:id', OwnerController.getById);
router.put('/owners/:id', OwnerController.update);
router.delete('/owners/:id', OwnerController.delete);

// Location routes
router.get('/locations', LocationController.getAll);
router.get('/locations/:id', LocationController.getById);
router.post('/locations', LocationController.create);
router.post('/locations/strings/batch', LocationController.getLocationStringsBatch);
router.put('/locations/:id', LocationController.update);
router.delete('/locations/:id', LocationController.delete);

// Sensor routes
router.get('/sensors', SensorController.getAll);
router.get('/sensors/:id', SensorController.getById);
router.post('/sensors', SensorController.create);
router.put('/sensors/:id', SensorController.update);
router.delete('/sensors/:id', SensorController.delete);

// Observation routes
router.get('/observations', ObservationController.getAll);
router.get('/observations/:id', ObservationController.getById);
router.get('/sensors/:sensorId/observations', ObservationController.getBySensorId);
router.post('/observations', ObservationController.create);
router.delete('/observations/:id', ObservationController.delete);

// Alarm routes
router.get('/alarms', AlarmController.getAll);
router.get('/alarms/:id', AlarmController.getById);
router.get('/sensors/:sensorId/alarms', AlarmController.getBySensorId);
router.post('/alarms', AlarmController.create);
router.delete('/alarms/:id', AlarmController.delete);

export default router;

