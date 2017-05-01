let express = require('express');
let wagner = require('wagner-core');
let config = require('./config');

require('./dbschema/models')(wagner);
//require('./dependencies')(wagner);

let app = express();

//Start Session
wagner.invoke(require('./auth/setup.js'), { app: app });

//----------------------------------------------------------------------
// include api modules
//----------------------------------------------------------------------

app.use('/api/v1', require('./api-routes/user')(wagner));
app.use('/api/v1', require('./api-routes/category')(wagner));
app.use('/api/v1', require('./api-routes/product')(wagner));


//----------------------------------------------------------------------
// Server Start
//----------------------------------------------------------------------

app.listen(config.server.port);
console.log('Listening on port ' + config.server.port);