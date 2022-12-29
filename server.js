const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION!  shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection succeful !'));

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHADLED REJECTION!  Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

