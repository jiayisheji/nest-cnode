import { registerAs } from '@nestjs/config';

export default registerAs('admins', (): { [key: string]: boolean } => {
  return {
    admin_user: true,
  };
});
