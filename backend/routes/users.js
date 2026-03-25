import express from 'express';
import { register, login, getUser, updateWallet, getAllUsers } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/:id', getUser);
router.put('/:id/wallet', updateWallet);
router.get('/', getAllUsers);

export default router;
