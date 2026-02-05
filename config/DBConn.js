import { connect } from 'mongoose';

let retry = 1;
const maximumTries = 5;

// add some delay before try to connect
const delay = () =>
  setTimeout(() => console.log('Intitializing Connection ...'), 500);

const Connect = async () => {
  try {
    await connect(process.env.DB_URI);
  } catch (err) {
    if (retry <= maximumTries) {
      console.log('Database connection failed');
      console.log(`Try to connect : ${retry}/${maximumTries}`);
      delay();
      retry++;
      Connect();
    } else
      console.error('Too many attempts please check internet connection 😔 ');
  }
};

export default Connect;
