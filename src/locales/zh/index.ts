import 'dayjs/locale/zh-cn';
import zod from 'zod-i18n-map/locales/zh-CN/zod.json';

import account from './account.json';
import admin from './admin.json';
import adminDashboard from './adminDashboard.json';
import app from './app.json';
import appHome from './appHome.json';
import auth from './auth.json';
import common from './common.json';
import components from './components.json';
import emails from './emails.json';
import management from './management.json';
import n8nShowcase from './n8nShowcase.json';
import repositories from './repositories.json';
import users from './users.json';
import workflows from './workflows.json';

export default {
  account,
  admin,
  adminDashboard,
  app,
  appHome,
  auth,
  common,
  components,
  emails,
  management,
  repositories,
  users,
  workflows,
  n8nShowcase,
  zod,
} as const;
