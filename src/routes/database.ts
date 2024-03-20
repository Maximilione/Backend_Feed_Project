import express from 'express';
import fetch from 'node-fetch';
import { post_url } from '../routes/postdata';
import { getPosts } from '../routes/postdata';
const dbrouter = express.Router();
/*

dbrouter.get('/sync-db', async (req, res) => {
    try {
        const posts : any = await getPosts(); // await to get posts
        const postout = posts.map(post => {// return a post array
            const { date, title, content } = post;
            return { date, title, content };
        });
        res.json(postout);
    } catch (error) {
        res.status(500).send('Errore durante il caricamento dei post');
    }
})

dbrouter.get('/posts-db', async (req, res) => {
    try {
        const posts : any = await getPosts(); // await to get posts
        const postout = posts.map(post => {// return a post array
            const { date, title, content } = post;
            return { date, title, content };
        });
        res.json(postout);
    } catch (error) {
        res.status(500).send('Errore durante il recupero dei post');
    }
})

*/
module.exports = dbrouter;// return router module