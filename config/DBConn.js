import { connect } from 'mongoose';

const Connect = async () => {
  await connect(process.env.DB_URI);
};

export default Connect;
