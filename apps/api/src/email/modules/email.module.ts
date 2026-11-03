import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Environment } from '../../config/environment';
import { TransactionalEmailProvider } from '../types/transactionalEmailProvider.type';
import { MemoryEmailProvider } from '../providers/memoryEmail.provider';
import { ResendEmailProvider } from '../providers/resendEmail.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TransactionalEmailProvider,
      inject: [ConfigService],
      useFactory: (
        config: ConfigService<Environment, true>,
      ): TransactionalEmailProvider => {
        const provider = config.getOrThrow('EMAIL_PROVIDER', {
          infer: true,
        });

        if (provider === 'memory') {
          return new MemoryEmailProvider();
        }

        return new ResendEmailProvider(
          config.getOrThrow('RESEND_API_KEY', {
            infer: true,
          }),
          config.getOrThrow('EMAIL_FROM', {
            infer: true,
          }),
        );
      },
    },
  ],
  exports: [TransactionalEmailProvider],
})
export class EmailModule {}
