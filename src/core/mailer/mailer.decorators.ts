import { Inject } from '@nestjs/common';

import { MAILER_TOKEN } from './mailer.constants';

export const InjectMailer = () => Inject(MAILER_TOKEN);