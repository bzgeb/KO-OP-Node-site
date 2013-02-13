/**
 * Module dependencies.
 */
var configs = require('./configs')
  , express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , MailChimpAPI = require('mailchimp').MailChimpAPI;

var mc_api_key = process.env.MC_API_KEY;
var mc_newsletter_id = process.env.MC_NEWSLETTER_ID;

try { 
    var api = new MailChimpAPI(mc_api_key, { version : '1.3', secure : false });
} catch (error) {
    console.log(error.message);
}
/**
 * App.
 */

var app = express.createServer();

/**
 * App configuration.
 */

app.configure(function () {
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.set('views', __dirname);
  //app.set('view engine', 'jade');
  // make a custom html template
  app.register('.html', {
    compile: function(str, options){
      return function(locals){
        return str;
      };
    }
  });
});

/**
 * App routes.
 */

app.get('/', function (req, res) {
  res.render('index.html', { layout: false });
});

app.post('/mailing_list/subscribe', function (req, res) {
  var email = req.body.email;

  api.listSubscribe({ id: mc_newsletter_id, 
                      email_address: email,
                      merge_vars: {EMAIL: email,
                                  FNAME: '',
                                  LNAME: '',
                                  GROUPINGS: [{id: 8953, groups: ""}]}},
    function(error, data) {
      if (error) {
        console.log(error.message);
        res.send("<p>Subscription failed.  Please make sure your email address is valid.</p>");
      }
      else {
        console.log(JSON.stringify(data)); // Do something with your data! 
        res.send("<p>You are subscribed.  Please check your email for a confirmation email.</p>");
      }
    });
});

/**
 * App listen.
 */

var port = process.env.PORT || 3000;
app.listen(port, function () {
  var addr = app.address();
  console.log('   app listening on http://' + addr.address + ':' + addr.port);
});