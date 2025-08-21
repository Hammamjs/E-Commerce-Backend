import { User } from '../model/User.js';
import { Connect } from '../config/index.js';
import { log } from '../utils/logSatuts.js';

const { info, success } = log;
const updateRole = async () => {
  Connect();
  success('Connected');
  info('Try to update user role');
  await User.findOneAndUpdate({ role: 'Admin' }, { $set: { role: 'ADMIN' } });
  success('Users updated 😊');
  info('Bye');
  process.exit(1);
};

updateRole();
