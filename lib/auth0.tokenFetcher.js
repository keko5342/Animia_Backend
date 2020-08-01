/*

SP:Auth0に登録されたTwitterログインの認証データから，Twitterのトークンやプロフィールを取得する．
  1.Cognitoから取得したTokenから、UserIdを取得
  2.登録済みのAPIからAuth0管理APIへのアクセストークンを取得
  3.取得したアクセストークンとユーザのIDを用いてTwitterプロフィールを取得

AWS Cognito UserPool/Auth0/mysql/express/OAuth2.0/JWT

*/
var request = require("request");
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jwk = require('../jwks');

const { DB_CONFIG, AUTH0_CONFIG } = require('../config');

// [0]=idToken, [1]=accessToken
var pems = [jwkToPem(jwk.keys[0]), jwkToPem(jwk.keys[1])];

exports.tokenFetcher = function(req, res) {
  // 1.Cognitoから取得したTokenから、UserIdを取得
  //console.log(req.body.message);
  //console.log(req.query);
  jwt.verify(req.query.id_token, pems[0], function(err, decodedToken){
    if(err) res.end();
    const userId = decodedToken.identities[0].userId.slice(8);
    //console.log("sunncess", decodedToken);
    //console.log("userId", userId)

    // userIdを使ってTwitterプロフィールを取得
    if(userId){
      var mysql = require('mysql');
      var connection = mysql.createConnection({
        host: DB_CONFIG.host,
        user: DB_CONFIG.user,
        password: DB_CONFIG.password,
        database: DB_CONFIG.database
      });

      //console.log(`{"client_id":${AUTH0_CONFIG.clientId},"client_secret":${AUTH0_CONFIG.clientSecret},"audience":"https://${AUTH0_CONFIG.domain}/api/v2/","grant_type":"client_credentials"}`);
      // Auth0管理APIからアクセストークンを取得するためのリクエスト内容
      var options = { method: 'POST',
        url: `https://${AUTH0_CONFIG.domain}/oauth/token`,
        headers: { 'content-type': 'application/json' },
        body: `{"client_id":"${AUTH0_CONFIG.clientId}","client_secret":"${AUTH0_CONFIG.clientSecret}","audience":"https://${AUTH0_CONFIG.domain}/api/v2/","grant_type":"client_credentials"}`
      };

      // 2.登録済みのAPIからAuth0管理APIへのアクセストークンを取得
      request(options, function (error, response, body) {
        if (error) throw new Error(error);

        access_token = JSON.parse(body).access_token;

        // Twitterプロフィールを取得するためのリクエスト内容
        var options = {
          method: 'GET',
          url: `https://${AUTH0_CONFIG.domain}/api/v2/users/twitter|${userId}`,
          headers: { authorization: `Bearer ${access_token}` }
        };

        // 3.取得したアクセストークンとユーザのIDを用いてTwitterプロフィールを取得
        request(options, function (error, response, body) {
          if (error) throw new Error(error);
        
          // 取得が成功した場合，DBに保存する
          res = JSON.parse(body);
          twitter_user_id = res.identities[0].user_id;
          twitter_screen_name = res.screen_name;
          twitter_name = res.name;
          twitter_access_token = res.identities[0].access_token;
          twitter_access_token_secret = res.identities[0].access_token_secret;
          twitter_picture = res.picture;

          const sql = "insert into profile values(?, ?, ?, ?, ?, ?)"
          connection.query(sql, 
            [twitter_user_id, twitter_name, twitter_screen_name, twitter_access_token, twitter_access_token_secret, twitter_picture], 
            function (error, results, fields) {
              //if(error) throw error;
            }
          )

          console.log("id /", twitter_user_id,
                      "\nname /", twitter_name,
                      "\nscreen_name /", twitter_screen_name,
                      "\ntoken /", twitter_access_token,
                      "\nsecret /", twitter_access_token_secret,
                      "\npicture /", twitter_picture);
          //res.json({id: twitter_user_id});
        });
      });
    }else{
      console.log("userIDの取得に失敗");
    }
    res.end();
  })
};