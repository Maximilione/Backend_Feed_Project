import express, { Request, Response, NextFunction} from 'express';
const app = express();
import swaggerjsdoc from 'swagger-jsdoc';
import swaggerui from 'swagger-ui-express';
import { postrouter } from './routes/postdata';

app.use(express.static('public'));
app.use(express.json());

app.use('/post', postrouter);// use postrouter module

const options={
    swaggerDefinition:{
        info:{
            title: 'Backend Test PostFEED',
            version: '1.0.2',
            description: 'The web-service read and shows data from a feed'
        },
        host: 'localhost:3000',
        basePath: '/'
    },
    apis: ['./routes/postdata.js']
}

const spacs = swaggerjsdoc(options)
app.use(
    '/api-docs',
    swaggerui.serve,
    swaggerui.setup(spacs)
)
app.listen(3000); // listen on port 3000