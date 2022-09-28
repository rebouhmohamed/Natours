const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
