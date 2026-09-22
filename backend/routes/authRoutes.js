import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, username, loginId } = req.body;
    const query = (email || username || loginId || '').trim();
    if (!query) {
      return res.status(400).json({ message: 'Email or Username is required' });
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({
      $or: [
        { email: query.toLowerCase() },
        { loginId: query.toUpperCase() },
        { loginId: query },
        { name: new RegExp(`^${escapedQuery}$`, 'i') }
      ]
    });
    if (!user) {
      return res.status(401).json({ message: 'User with this email or username was not found. Please check credentials or register.' });
    }

    const token = `jwt-${user.id}-${Date.now()}`;
    return res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      phone,
      mobile,
      altPhone,
      altMobile,
      role,
      designation,
      state,
      address,
      officeAddress,
      landline,
      password,
      tribe,
      aadhaar,
      dob,
      gender,
      fatherName,
      motherName,
      district,
      pincode,
      permanentAddress,
      annualIncome,
      highestQualification
    } = req.body;

    const resolvedName = (name || fullName || '').trim();
    const resolvedEmail = (email || '').toLowerCase().trim();
    const resolvedPhone = (phone || mobile || '').trim();
    const resolvedAltPhone = (altPhone || altMobile || '').trim();
    const resolvedAddress = (permanentAddress || officeAddress || address || '').trim();

    if (!resolvedEmail || !resolvedName) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existing = await User.findOne({ email: resolvedEmail });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const id = `usr-${Date.now()}`;
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const loginId = `VV-2026-${randomDigits}`;

    const newUser = await User.create({
      id,
      loginId,
      name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      altPhone: resolvedAltPhone,
      role: role || 'applicant',
      designation: designation || '',
      state: state || '',
      officeAddress: resolvedAddress,
      permanentAddress: resolvedAddress,
      landline: landline || '',
      password: password || '',
      tribe: tribe || '',
      aadhaar: aadhaar || '',
      dob: dob || '',
      gender: gender || 'Female',
      fatherName: fatherName || '',
      motherName: motherName || '',
      district: district || '',
      pincode: pincode || '',
      annualIncome: Number(annualIncome) || 0,
      highestQualification: highestQualification || '',
      createdAt: new Date().toISOString()
    });

    return res.status(201).json(newUser);
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/profile (Update user details)
router.put('/profile', async (req, res) => {
  try {
    const { id, name, email, phone, state, tribe, avatar } = req.body;
    if (!id && !email) {
      return res.status(400).json({ message: 'User ID or current email is required' });
    }

    const query = id ? { id } : { email: email.toLowerCase().trim() };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // If changing email, ensure it's not taken by another user
    if (email && email.toLowerCase().trim() !== user.email) {
      const emailTaken = await User.findOne({
        email: email.toLowerCase().trim(),
        id: { $ne: user.id }
      });
      if (emailTaken) {
        return res.status(400).json({ message: 'This email address is already in use by another account' });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (phone !== undefined) {
      user.phone = phone.trim();
    }
    if (state !== undefined) {
      user.state = state.trim();
    }
    if (tribe !== undefined) {
      user.tribe = tribe.trim();
    }
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();
    return res.json(user);
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().lean();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
