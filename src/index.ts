import express, { Request, Response, NextFunction} from 'express';
const app = express();
import swaggerjsdoc from 'swagger-jsdoc';
import swaggerui from 'swagger-ui-express';
import { postrouter } from './routes/postdata';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

app.use(express.static('public'));
app.use(express.json());

const swaggerDocument = YAML.load('./src/swagger.yaml');// load swagger.yaml file


app.use('/', postrouter);// use postrouter module

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));// use swaggerui module




app.listen(3000); // listen on port 3000