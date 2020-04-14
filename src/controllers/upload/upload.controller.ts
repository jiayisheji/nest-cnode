import { Controller, Post, Logger, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import multerOptions, { multerConfig } from './upload.config';
import { sep } from 'path';

interface FileDto {
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    destination: string,
    filename: string,
    path: string,
    size: number
}

@Controller()
export class UploadController {
    private readonly logger = new Logger(UploadController.name, true);
    /** 注册提交 */
    @Post('/upload')
    @UseInterceptors(FileInterceptor('file', multerOptions))
    async upload(@UploadedFile() file: FileDto) {
        this.logger.log(file);
        const assets = multerConfig.assets;
        const filename = file.path.split(sep).join('/').split(assets);
        return {
            success: true,
            url: assets + filename[1],
        };
    }
}
