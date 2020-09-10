/*

SP:Auth0に登録されたTwitterログインの認証データから，Twitterのトークンやプロフィールを取得する．
  1.Cognitoから取得したTokenから、UserIdを取得
  2.Auth0管理APIへのアクセストークンを取得
  3.取得したアクセストークンとユーザのIDを用いてTwitterプロフィールを取得

AWS Cognito UserPool/Auth0/mysql/express/OAuth2.0/JWT

*/
var request = require("request");
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jwk = require('../../certs/jwks');

const { DB_CONFIG, AUTH0_CONFIG } = require('../../config');
const nodemon = require("nodemon");

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
          twitterResponse = JSON.parse(body);
          twitter_user_id = twitterResponse.identities[0].user_id;
          twitter_screen_name = twitterResponse.screen_name;
          twitter_name = twitterResponse.name;
          twitter_access_token = twitterResponse.identities[0].access_token;
          twitter_access_token_secret = twitterResponse.identities[0].access_token_secret;
          twitter_picture = twitterResponse.picture;

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

          var now = new Date();
          var time = now.getTime();
          time += 3600 * 1000;
          now.setTime(time);
          res.cookie('idToken', req.query.id_token, {
            //expires: now.toUTCString(),
            maxAge: 3000000,
            sameSite: 'none',
            secure: true,
            path: '/',
            domain: 'animia.net',
            hostonly: false
          })
          res.end();
        });
      });
    }else{
      console.log("userIDの取得に失敗");
      res.end();
    }
  })
};