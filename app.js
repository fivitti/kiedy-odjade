var host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 8080;
  
var cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    originWhitelist: ["https://figiel.xyz", "https://fivitti.github.io"], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2'],
    corsMaxAge: 600,
    setResponseHeaders: {
        'cache-control': 'max-age=30',
    }
}).listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});
