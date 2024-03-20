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