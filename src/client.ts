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
export const client = redis.createClient({
    url: 'redis://localhost:6379',
});

client.connect().catch(console.error);

client.on('connect', function() {
    console.log('Connesso a Redis');
  });
  
client.on('error', (err) => {
    console.log('Error ' + err);
  });
  
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