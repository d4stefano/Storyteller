import { Router } from 'express';
import IndexController from '../controllers';

const router = Router();
const indexController = new IndexController();

export function setRoutes(app: Router) {
    app.post('/api/story', indexController.getStory.bind(indexController));
}