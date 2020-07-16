/*

SP:Auth0に登録されたTwitterログインの認証データから，Twitterのトークンやプロフィールを取得する．
  1.登録済みのAPIからAuth0管理APIへのアクセストークンを取得
  2.取得したアクセストークンとユーザのIDを用いてTwitterプロフィールを取得

*/

var request = require("request");

exports.tokenFetcher = (req, res) => {
  // Auth0管理APIからアクセストークンを取得するためのリクエスト内容
  var options = { method: 'POST',
    url: 'https://animia.us.auth0.com/oauth/token',
    headers: { 'content-type': 'application/json' },
    body: '{"client_id":"XrvZKvvzSV6G4J26toPpYuBr5Z1WGHWK","client_secret":"nYEeXsAB0qjnU-FB5AutXQOTIPWdjYZOqHu_50_v4nVCqvi-UG7na2MSHWCiURrO","audience":"https://animia.us.auth0.com/api/v2/","grant_type":"client_credentials"}'
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    access_token = JSON.parse(body).access_token;

    // Twitterプロフィールを取得するためのリクエスト内容
    var options = {
      method: 'GET',
      url: `https://animia.us.auth0.com/api/v2/users/twitter|1565946018`,
      headers: { authorization: `Bearer ${access_token}` }
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
    
      // 取得が成功した場合，DBに保存する
      res = JSON.parse(body);
      twitter_access_token = res.identities[0].access_token;
      twitter_access_token_secret = res.identities[0].access_token_secret;
      twitter_user_id = res.identities[0].user_id;
      twitter_name = res.name;
      twitter_screen_name = res.screen_name;
      twitter_picture = res.picture;

      console.log("token /", twitter_access_token,
                  "\nsecret /", twitter_access_token_secret,
                  "\nid /", twitter_user_id,
                  "\nname /", twitter_name,
                  "\nscreen_name /", twitter_screen_name,
                  "\npicture /", twitter_picture);
    });
  });

  res.send("updated token");
}
