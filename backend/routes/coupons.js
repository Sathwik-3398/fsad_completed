import express from 'express';
import { addCoupon, getCoupons, validateCoupon, incrementCouponUsage, deleteCoupon } from '../controllers/couponController.js';

const router = express.Router();

router.post('/', addCoupon);
router.get('/', getCoupons);
router.post('/validate', validateCoupon);
router.put('/:id/usage', incrementCouponUsage);
router.delete('/:id', deleteCoupon);

export default router;
