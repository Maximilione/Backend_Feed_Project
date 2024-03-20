/** 
*@swagger
*definitions:
*  Post:
*    type: object
*    properties:
*      date:
*        type: string
*        format: date
*        description: Date of the post
*        example: "2022-02-16T17:10:57"
*      title:
*        type: string
*        description: Title of the post
*        example: "Post 1"
*      content:
*        type: string
*        description: Content of the post
*        example: "Content 1"
*/

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: The posts managing API
 * /post:
 *   get:
 *     summary: Get all posts
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: The list of the posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 * /filtered:
 *   get:
 *     summary: Get filtered posts
 *     tags: [Post]
 *     parameters:
 *       - in: query
 *         name: title
 *         type: string
 *         description: Title of the post
 *       - in: query
 *         name: items
 *         type: number
 *         description: Number of items
 *     responses:
 *       200:   
 *         description: The list of the filtered posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: No posts found
 *       500:
 *         description: Server error
 * 
 */

import express, { Request, Response, NextFunction} from 'express';
import { checkCache } from '../client';
import { client } from '../client';
import { AbortError } from 'redis';


export const postrouter = express.Router();
export const post_url = 'https://22hbg.com/wp-json/wp/v2/posts/';

interface Post{
    title:{
        rendered:string 
    };
    date:string;
    content:string;
}


/**
 * function capable of reading data from a feed
 *
 * @return {Promise} posts
 */
export async function getPosts(): Promise<Post[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Imposta il timeout a 5 secondi

    try {
        const response= await fetch(post_url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            signal: controller.signal // Aggiungi il segnale al tuo fetch
        });
        clearTimeout(timeoutId); // Pulisci il timeout se la richiesta è completata
        const posts: Post[] = await response.json();
        return posts;
    } catch (error: any | AbortError) {
        if (error.name === 'AbortError') {
            console.error('La richiesta è stata annullata per timeout');
        } else {
            console.error(error);
        }
        throw error;
    }
}


postrouter.get('/', async (req: Request, res: Response) => {
    try {
      const posts = await getPosts(); // await to get posts
      const postout = posts.map(post => ({ 
        date: post.date, 
        title: post.title.rendered, 
        content: post.content 
    }));
      res.json(postout);
    } catch (error) {
      res.status(500).send('Errore durante il recupero dei post');
    }
});

postrouter.get('/filtered', checkCache, async (req: Request, res: Response) => {
    try {
      const { title, items } = req.query;
      const key = `post:${title || 'string'}:${items || 'string'}`;
  
      let cachedData;
      try {
        cachedData = await client.get(key);
      } catch (error) {
        console.error('Redis error', error);
        cachedData = null; // Procedi senza cache se c'è un errore
      }
  
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      } else {
        console.log('No data in cache');
        // Se non ci sono dati in cache, procedi a recuperare i post
        const posts = await getPosts();
  
        if (!title) {
          return res.json(posts);
        }
  
        let filteredPosts = posts.filter(post =>
            (post.title.rendered as string).toLowerCase().includes((title as string).toLowerCase())
        );
  
        if (!filteredPosts.length) {
          return res.status(404).send('Nessun post trovato');
        }
  
        if (items && typeof items === 'string') {
          filteredPosts = filteredPosts.slice(0, parseInt((items)));
        }
  
        // Salva i post filtrati in cache
        await client.setEx(key, 3600, JSON.stringify(filteredPosts));
  
        res.json(filteredPosts);
      }
    } catch (error) {
      console.error('Errore durante il recupero dei dati filtrati', error);
      res.status(500).send('Errore durante il recupero dei dati filtrati');
    }
  });