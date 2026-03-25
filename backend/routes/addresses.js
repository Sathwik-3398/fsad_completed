import express from 'express';
import { addSavedAddress, getSavedAddresses, removeSavedAddress, setDefaultAddress } from '../controllers/addressController.js';

const router = express.Router();

router.post('/', addSavedAddress);
router.get('/', getSavedAddresses);
router.delete('/:id', removeSavedAddress);
router.put('/:id/default', setDefaultAddress);

export default router;
