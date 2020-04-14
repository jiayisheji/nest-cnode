import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';

@Module({
    imports: [
    ],
    providers: [
    ],
    controllers: [UploadController],
})
export class UploadModule { }
