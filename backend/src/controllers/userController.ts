import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const addContact = async (req: AuthRequest, res: Response) => {
  try {
    const { contactId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { contacts: contactId } },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add contact' });
  }
};

export const removeContact = async (req: AuthRequest, res: Response) => {
  try {
    const { contactId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { contacts: contactId } },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove contact' });
  }
};

export const getContacts = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).populate('contacts', '-password');
    res.json(user?.contacts || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get contacts' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    if (!['online', 'offline', 'away'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { 'profile.status': status },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};
