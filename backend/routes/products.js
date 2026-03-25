import express from 'express';
import { addProduct, getProducts, deleteProduct, getProductById } from '../controllers/productController.js';

const router = express.Router();

router.post('/', addProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.delete('/:id', deleteProduct);

export default router;
