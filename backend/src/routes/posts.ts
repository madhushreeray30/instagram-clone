import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import * as PostController from '../controllers/PostController';
import * as InteractionController from '../controllers/InteractionController';

const router = Router();

/**
 * @swagger
 * /api/v1/posts:
 *   post:
 *     tags:
 *       - Posts
 *     summary: Create a new post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrls
 *             properties:
 *               caption:
 *                 type: string
 *                 maxLength: 2200
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, PostController.createPost);

/**
 * @swagger
 * /api/v1/feed:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Get home feed
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Feed retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/feed', authenticateToken, PostController.getFeed);

/**
 * @swagger
 * /api/v1/posts/{postId}:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Get post details
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post retrieved
 *       404:
 *         description: Post not found
 */
router.get('/:postId', PostController.getPost);

/**
 * @swagger
 * /api/v1/posts/{postId}:
 *   put:
 *     tags:
 *       - Posts
 *     summary: Update post caption
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
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
 *               caption:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 *       401:
 *         description: Unauthorized
 */
router.put('/:postId', authenticateToken, PostController.updatePost);

/**
 * @swagger
 * /api/v1/posts/{postId}:
 *   delete:
 *     tags:
 *       - Posts
 *     summary: Delete post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/:postId', authenticateToken, PostController.deletePost);

/**
 * @swagger
 * /api/v1/posts/{postId}/like:
 *   post:
 *     tags:
 *       - Likes
 *     summary: Like a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Post liked
 *       401:
 *         description: Unauthorized
 */
router.post('/:postId/like', authenticateToken, InteractionController.likePost);

/**
 * @swagger
 * /api/v1/posts/{postId}/like:
 *   delete:
 *     tags:
 *       - Likes
 *     summary: Unlike a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post unliked
 *       401:
 *         description: Unauthorized
 */
router.delete('/:postId/like', authenticateToken, InteractionController.unlikePost);

/**
 * @swagger
 * /api/v1/posts/{postId}/likes:
 *   get:
 *     tags:
 *       - Likes
 *     summary: Get post likes
 *     parameters:
 *       - in: path
 *         name: postId
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
 *         description: Likes list retrieved
 */
router.get('/:postId/likes', InteractionController.getLikes);

/**
 * @swagger
 * /api/v1/posts/{postId}/comments:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 300
 *               parentCommentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 *       401:
 *         description: Unauthorized
 */
router.post('/:postId/comments', authenticateToken, InteractionController.createComment);

/**
 * @swagger
 * /api/v1/posts/{postId}/comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get post comments
 *     parameters:
 *       - in: path
 *         name: postId
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
 *         description: Comments list retrieved
 */
router.get('/:postId/comments', InteractionController.getComments);

/**
 * @swagger
 * /api/v1/comments/{commentId}:
 *   put:
 *     tags:
 *       - Comments
 *     summary: Update comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 *       401:
 *         description: Unauthorized
 */
router.put('/comments/:commentId', authenticateToken, InteractionController.updateComment);

/**
 * @swagger
 * /api/v1/comments/{commentId}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/comments/:commentId', authenticateToken, InteractionController.deleteComment);

export default router;
