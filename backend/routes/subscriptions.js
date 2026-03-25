import express from 'express';
import { addSubscription, getSubscriptions, updateSubscriptionStatus, deleteSubscription, markSubscriptionDelivered } from '../controllers/subscriptionController.js';

const router = express.Router();

router.post('/', addSubscription);
router.get('/', getSubscriptions);
router.put('/:id/status', updateSubscriptionStatus);
router.delete('/:id', deleteSubscription);
router.post('/mark-delivered', markSubscriptionDelivered);

export default router;
