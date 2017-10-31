'use strict';

const conversation = require('../message');
const cloudant = require('../../util/db');
const db = cloudant.db['context'];

let postMessage = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  console.log(req.body.user_key)
  //{ user_key: 'DBpb8t6y66U2', type: 'text', content: 'Hello' }
  let user_key = req.body.user_key;
  let type = req.body.type;
  let content = {
  	'text' : req.body.content
  };
  
  //user_key를 사용하여 db에 저장된 context가 있는지 확인합니다.
  db.get(user_key).then(doc => {

  	//저장된 context가 있는 경우 이를 사용하여 conversation api를 호출합니다.
    conversation.getConversationResponse(content, Object.assign(doc.session.context, {
      'user_key' : user_key
    })).then(data => {
      // context를 업데이트 합니다.

      doc.session.context = Object.assign(data.context, {
            'channel' : 'kakao',
            'timezone' : "Asia/Seoul"
          })  ;

      db.insert(doc);

      return res.json({
        "message" : {
          "text" : getOutputText(data)
        }
      });
    }).catch(function(err){
      return res.json({
          "message" : {
            "text" : JSON.stringify(err.message)
          }
      });
    });
  }).catch(function(err) {
    console.log(3, err)
    // 처음 대화인 경우 context가 없습니다. 이러한 경우 context 없이 conversation api를 호출합니다.
    conversation.getConversationResponse(content, {}).then(data => {
      // context를 저장합니다.
      db.insert({
        '_id' : user_key,
        //'user_key' : user_key,
        'session': {
          'context': Object.assign(data.context, {
            'channel' : 'kakao',
            'timezone' : "Asia/Seoul"
          })
        },
      });
          
      return res.json({
          "message" : {
            "text" : getOutputText(data)
          }
      });   
    }).catch(function(err){
      return res.json({
          "message" : {
            "text" : JSON.stringify(err.message)
          }
      });
    });
    
  });
};

let getOutputText = data => {
  let output = data.output;
  if(output.text && Array.isArray(output.text)){
    return output.text.join('\n');
  }
  else if(output.text && output.text.values && Array.isArray(output.text.values)){
    return output.text.values.join('\n')
  }
  else if(output.text){
    return output.text;
  }
  else return "";
}

module.exports = {
    'initialize': function(app, options) {
        app.post('/api/kakao/message', postMessage);
    }
};