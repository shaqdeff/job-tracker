import express from 'express';
import { body } from 'express-validator';
import User from '../models/user.model';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

const router = express.Router();

// register/sign up
router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/[0-9]/)
      .matches(/[!@#$%^&*]/)
      .withMessage('Password must be 8+ chars with a number & symbol'),
  ],
  async (req: any, res: any) => {
    try {
      const { firstName, lastName, email, phone, password } = req.body;

      // check if user already exists
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // hash password
      const hashedPassword = await hashPassword(password);

      // create user
      const newUser = new User({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
      });
      await newUser.save();

      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// login
router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    const token = generateToken(user.id);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
