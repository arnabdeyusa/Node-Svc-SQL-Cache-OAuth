const app = require('./app/app');
require('babel-polyfill');
const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Development on port' + port);
});

module.exports = app;
