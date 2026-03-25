import express from 'express';
import {
  addDeliveryPartner,
  getDeliveryPartners,
  updateDeliveryPartner,
  deleteDeliveryPartner,
  getDeliveryPartnerById,
  loginDeliveryPartner
} from '../controllers/deliveryPartnerController.js';

const router = express.Router();

// Specific routes BEFORE generic :id routes
router.post('/login', loginDeliveryPartner);

// Generic routes after specific ones
router.post('/', addDeliveryPartner);
router.get('/', getDeliveryPartners);
router.get('/:id', getDeliveryPartnerById);
router.put('/:id', updateDeliveryPartner);
router.delete('/:id', deleteDeliveryPartner);

export default router;
