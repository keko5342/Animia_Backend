/*

画像が5枚以上 or 1週間以内の画像付きツイートが無くなるまで、ユーザ名をキーに繰り返しリクエスト

*/

const mysql = require('mysql');
const { TWITTER_CONFIG, DB_CONFIG } = require('../../config');
const jwtVerification = require('./jwtVerification');
const Twitter = require('twitter');

exports.fetchSearch = function(req, res) {
  try {
    // JWTの検証
    var decoded = jwtVerification(req.query.id_token);
    const userId = decoded.identities[0].userId.slice(8);

    // DB情報
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
      if(error) res.end();

      // TwitterAPIへのリクエスト
      const client = new Twitter({
        consumer_key: `${TWITTER_CONFIG.consumerKey}`,
        consumer_secret: `${TWITTER_CONFIG.consumerSecret}`,
        access_token_key: `${result[0].token}`,
        access_token_secret: `${result[0].secret}`
      });

      // リクエストで返す情報
      var url = [], count = 0;
      requester(client, url, count, req.query.q)
 
      function requester(client, url, count, slug, nextParams){
        // ページング処理
        const params = (nextParams) ? nextParams : {q: slug+ " filter:images exclude:retweets", count: 100};
      
        // tweetをリクエスト
        client.get('search/tweets', params, async function(error, tweets, response) {
          // リクエスト内容から画像urlを抽出
          var data = [];
          tweets.statuses.forEach(element => data.push([element.extended_entities]))
          if(data.length > 0){
            data.forEach(element => {
              if(element[0].media.length == 1){
                url.push(element[0].media[0].media_url_https)
              }else if(element[0].media.length > 1){
                element[0].media.forEach(innerElement => url.push(innerElement.media_url_https))
              }}
            )
          }
      
          // 必要数取得できていなければ次のページをリクエスト
          count+=1;
          var nextResult = String(tweets.search_metadata.next_results)
          if(nextResult==='undefined'){
            res.send(url);
          }else{
            nextResult = nextResult.slice(1)
            nextResult = JSON.parse('{"' + decodeURI(nextResult).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"').replace(/\s/g,'') + '"}')
            if(count < 2 && url.length < 5){
              await requester(client, url, count, slug, nextResult)
            }else{
              res.send(url);
            }
          }
        });
      }
    }
  } catch(err){
    console.log(err);
    res.end()
  }
}