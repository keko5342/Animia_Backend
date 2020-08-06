const mysql = require('mysql');
const { TWITTER_CONFIG, DB_CONFIG } = require('../config');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jwk = require('../jwks');
const Twitter = require('twitter')

// [0]=idToken, [1]=accessToken
const pems = [jwkToPem(jwk.keys[0]), jwkToPem(jwk.keys[1])];

exports.fetchUsers = function(req, res) {
  // ユーザの認証
  jwt.verify(req.query.id_token, pems[0], function(err, decodedToken){
    if(err) res.send("error");
    const userId = decodedToken.identities[0].userId.slice(8);

    // 必要な情報をデータベースから取り出す
    var connection = mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database
    });

    const sql = `select * from profile where id=${userId};`
    connection.query(sql,
      function(error, result, fields) {
        if(error) throw res.end();
        console.log("Users");

        // TwitterAPIへのリクエスト
        const client = new Twitter({
          consumer_key: `${TWITTER_CONFIG.consumerKey}`,
          consumer_secret: `${TWITTER_CONFIG.consumerSecret}`,
          access_token_key: `${result[0].token}`,
          access_token_secret: `${result[0].secret}`
        });

        const params = {slug: req.query.slug, owner_screen_name: req.query.owner_screen_name};
        console.log(params)
        client.get('lists/members', params, function(error, tweets, response) {
          var data = [];
          tweets.users.forEach(element => data.push([element.name, element.screen_name]));
          console.log(data);
          res.send(data);
        });
      }
    )
  });
}