/*

リスト名と所持ユーザをキーにリスト内ユーザをリクエスト

*/

const mysql = require('mysql');
const { TWITTER_CONFIG, DB_CONFIG } = require('../../config');
const jwtVerification = require('./jwtVerification');
const Twitter = require('twitter')

exports.fetchUsers = function(req, res) {
  try {
    // JWTの検証
    var decoded = jwtVerification(req.query.id_token);
    const userId = decoded.identities[0].userId.slice(8);
    
    // 必要な情報をデータベースから取り出す
    var connection = mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database
    });
    const sql = `select * from profile where id=${userId};`
    connection.query(sql, DBcallback);

    // DBから取得したTwitterへのアクセス情報から、TwitterAPIへ必要情報のリクエスト
    function DBcallback(error, result){
      if(error) throw res.end();
 
      // TwitterAPIへのリクエスト
      const client = new Twitter({
        consumer_key: `${TWITTER_CONFIG.consumerKey}`,
        consumer_secret: `${TWITTER_CONFIG.consumerSecret}`,
        access_token_key: `${result[0].token}`,
        access_token_secret: `${result[0].secret}`
      });

      const params = {slug: req.query.slug, owner_screen_name: req.query.owner_screen_name, count: 5000};
      client.get('lists/members', params, function(error, tweets, response) {
        var data = [];
        tweets.users.forEach(element => data.push([element.name, element.screen_name, element.profile_image_url_https]));
        res.send(data);
      });
    }
  } catch(err){
    console.log(err);
    res.end();
  }
}