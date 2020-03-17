import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import expressSetup from './express';
import nestSetup from './nest';

export default (app: INestApplication) => {
    expressSetup(app as NestExpressApplication);
    nestSetup(app);
};