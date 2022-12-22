const app = require('./src/app');
//const config = require('./src/config');

const port = process.env.PORT || 5000;
app.set('port', port);


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
  