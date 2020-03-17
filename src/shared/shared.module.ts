import { Module } from '@nestjs/common';
import { ServicesModule } from './services/services.module';
@Module({
    imports: [ServicesModule],
    exports: [ServicesModule],
})
export class SharedModule { }