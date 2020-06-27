// twitterAPIから受け取ったプロフィールを整形し，WebSocketで送信
exports.twitter = (req, res) => {
  const io = req.app.get('io')
  const user = { 
    name: req.user.username,
    photo: req.user.photos[0].value.replace(/_normal/, '')
  }
  //console.log(req.query, req.user.photos[0].value.replace(/_normal/, ''));
  io.in(req.session.socketId).emit('twitter', user)
  res.end()
}

exports.accessToken = (req, res) => {
  console.log(req);
}