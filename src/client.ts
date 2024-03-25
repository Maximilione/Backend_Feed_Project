/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the post
 *           example: "Post 1"
 *         items:
 *           type: number
 *           description: The number of items in the post
 *           example: 10
 *       required:
 *         - title
 *         - items
 *       example:
 *         title: "Post 1"
 *         items: 10
 * 
 *     PostList:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Post'
 *       example:
 *         - title: "Post 1"
 *           items: 10
 *         - title: "Post 2"
 *           items: 5
 *         - title: "Post 3"
 *           items: 15
 *         - title: "Post 4"
 *           items: 20
 * 
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: The error message
 *           example: "Post not found"
 *       required:
 *         - message
 *       example:
 *         message: "Post not found"
 * 
 */

import express, { Request, Response, NextFunction} from 'express';
import * as redis from 'redis';
export const client = redis.createClient({// create redis client
    url: 'redis://localhost:6379',
});

client.connect().catch(console.error);// connect

client.on('connect', function() {
    console.log('Connesso a Redis');
  });
  
client.on('error', (err) => {
    console.log('Error ' + err);
  });
  
/**
 * Checks the cache for a given request and sends the cached data if available,
 * otherwise calls the next middleware.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @return {Promise<void>} A promise that resolves when the cache check is complete.
 */
export async function checkCache(req: Request, res: Response, next: NextFunction) {
    const { title, items } = req.query;
    const key = `post:${title || 'all'}:${items || 'all'}`;

    try {
        const data = await client.get(key);
        if (data !== null) {
        res.send(JSON.parse(data));
    } else {
        next();
    }
} catch (err) {
    console.error('Redis error:', err);
    next(err); // Passa l'errore al middleware di gestione degli errori
}
}