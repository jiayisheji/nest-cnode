import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export const DatabaseConnectionName = 'DatabaseConnection';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      connectionName: DatabaseConnectionName,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        return {
          uri: configService.get<string>('database.uri'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
          connectionFactory: (connection: Connection) => {
            logger.log('Mongoose successfully connection readied');
            // Register global plugin
            // mongoose plugins see https://plugins.mongoosejs.io/
            // connection.plugin(require('mongoose-plugin'))
            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
