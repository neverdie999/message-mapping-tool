const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const errorHandler = require('errorhandler');
const logger = require('morgan');
const path = require('path');
const chalk = require('chalk');
const routes = require('./routes');

/**
 * Create Express server.
 */
const app = express();

/**
 * Express configuration.
 */
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());

/**
 * App routes
 */
app.use('/', routes);

/**
 * Serve static files
 */
app.use(express.static(path.join(__dirname, 'client')));

/**
 * 404
 */
app.use((req, res, next) => {
  res.status(404).render('notFound');
});

/**
 * Error Handler.
 */
app.use(errorHandler());

const port = 3000;
app.listen(port, () => {
    console.log('%s App is running at https://localhost:%d in %s mode', chalk.green('✓'), port, app.get('env'));
    console.log('  Press CTRL-C to stop\n');
})

module.exports = app;
