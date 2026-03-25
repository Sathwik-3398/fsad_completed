import express from 'express';
import { addHub, getHubs, deleteHub, getHubById } from '../controllers/hubController.js';

const router = express.Router();

router.post('/', addHub);
router.get('/', getHubs);
router.get('/:id', getHubById);
router.delete('/:id', deleteHub);

export default router;
