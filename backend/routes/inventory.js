import express from 'express';
import { addStock, getHubInventory, updateStock, deductStock, increaseStock, decreaseStock, deleteInventory } from '../controllers/inventoryController.js';

const router = express.Router();

// Specific routes MUST come before generic routes
router.post('/increase', increaseStock);
router.post('/decrease', decreaseStock);
router.post('/deduct', deductStock);
router.delete('/:id', deleteInventory);
router.put('/:id', updateStock);

// Generic routes come last
router.post('/', addStock);
router.get('/', getHubInventory);

export default router;
