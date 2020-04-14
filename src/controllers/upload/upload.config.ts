import { HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage, FileFilterCallback } from 'multer';
import { v4 as uuid } from 'uuid';
import { Request } from 'express';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Multer configuration
export const multerConfig = {
    dest: process.env.UPLOAD_LOCATION,
    dirs: ['user', 'topic'],
    assets: '/assets/upload'
};



// Multer upload options
export default {
    // 启用文件大小限制
    limits: {
        // 默认1M
        // fileSize: 10M,
    },
    // 检查允许上传的文件类型
    fileFilter: (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            // 允许存储文件
            callback(null, true);
        } else {
            // 拒绝文件
            callback(new HttpException(`不支持 ${extname(file.originalname)} 格式文件上传`, HttpStatus.BAD_REQUEST));
        }
    },
    // 存储属性
    storage: diskStorage({
        // 目标存储路径详细信息
        destination: (req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => {
            let uploadPath = multerConfig.dest + multerConfig.assets;
            // 创建文件夹，如果不存
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath);
            }
            // 动态修改存储路径
            // 需要强调传递存储路径参数，
            // 比如dir=user 用户头像
            // 比如dir=topic 帖子图片
            const dir = (req.query.dir || '').trim();
            if (!dir) {
                callback(new HttpException(`没有指定 dir 参数`, HttpStatus.BAD_REQUEST), dir)
            }
            if (!multerConfig.dirs.includes(dir)) {
                callback(new HttpException(`dir=${dir} 不合法`, HttpStatus.BAD_REQUEST), dir)
            }
            // 拼接到指定目录
            uploadPath = join(uploadPath, dir);
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath);
            }
            callback(null, uploadPath);
        },
        // 文件修改详细信息
        filename: (req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
            // 调用回调函数，传递使用原始扩展名生成的随机名称
            callback(null, `${uuid()}${extname(file.originalname)}`)
        }
    })
}