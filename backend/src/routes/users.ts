import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as UserController from '../controllers/UserController';

const router = Router();

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       404:
 *         description: User not found
 */
router.get('/:userId', UserController.getUserProfile);

/**
 * @swagger
 * /api/v1/users/username/{username}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by username
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved
 *       404:
 *         description: User not found
 */
router.get('/username/:username', UserController.getUserByUsername);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               bio:
 *                 type: string
 *               website:
 *                 type: string
 *               phone:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */
router.put('/:userId', authenticateToken, UserController.updateProfile);

/**
 * @swagger
 * /api/v1/users/{userId}/followers:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user followers
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Followers list retrieved
 */
router.get('/:userId/followers', UserController.getFollowers);

/**
 * @swagger
 * /api/v1/users/{userId}/following:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get users that user is following
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Following list retrieved
 */
router.get('/:userId/following', UserController.getFollowing);

/**
 * @swagger
 * /api/v1/users/{userId}/follow:
 *   post:
 *     tags:
 *       - Users
 *     summary: Follow a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: User followed
 *       401:
 *         description: Unauthorized
 */
router.post('/:userId/follow', authenticateToken, UserController.followUser);

/**
 * @swagger
 * /api/v1/users/{userId}/follow:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Unfollow a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unfollowed
 *       401:
 *         description: Unauthorized
 */
router.delete('/:userId/follow', authenticateToken, UserController.unfollowUser);

export default router;
