import express from 'express';
import { addComplaint, getComplaints, updateComplaintStatus } from '../controllers/complaintController.js';

const router = express.Router();

router.post('/', addComplaint);
router.get('/', getComplaints);
router.put('/:id/status', updateComplaintStatus);

export default router;
