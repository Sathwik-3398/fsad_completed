import express from 'express';
import { placeOrder, getOrders, getOrderByDeliveryPartner, updateOrderStatus, getOrderById } from '../controllers/orderController.js';

const router = express.Router();

// Specific routes MUST come before generic routes
router.post('/', placeOrder);
router.get('/delivery-partner/:deliveryPartnerId', getOrderByDeliveryPartner);
router.put('/:id/status', updateOrderStatus);
router.get('/:id', getOrderById);
router.get('/', getOrders);

export default router;
