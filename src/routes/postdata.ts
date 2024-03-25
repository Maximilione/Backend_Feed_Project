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

postrouter.get('/posts', async (req: Request, res: Response) => {
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

postrouter.get('/posts-filtered', checkCache, async (req: Request, res: Response) => {
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
        console.log('Data retrieved from cache');
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
        try{
            await client.setEx(key, 3600, JSON.stringify(filteredPosts));
            console.log('Data saved in cache');
        }
        catch(error){
            console.error('Redis error', error);
        }  
        res.json(filteredPosts);
      }
    } catch (error) {
      console.error('Errore durante il recupero dei dati filtrati', error);
      res.status(500).send('Errore durante il recupero dei dati filtrati');
    }
  });