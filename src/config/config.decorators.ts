import { Inject } from '@nestjs/common';

import { ConfigToken } from './config.constants';

export const InjectConfig = () => Inject(ConfigToken);