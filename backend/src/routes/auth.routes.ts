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

      // trim the password
      const trimmedPassword = password.trim();

      // check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // hash password
      const hashedPassword = await hashPassword(trimmedPassword);

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

// login/sign in
router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    // trim the password
    const trimmedPassword = password.trim();

    // find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Email not registered' });
    }

    // compare passwords
    const isMatch = await comparePassword(trimmedPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // generate JWT token
    const token = generateToken(user.id);

    // store token in HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 604800000, // 7 days
    });

    res.json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out successfully' });
});

export default router;
