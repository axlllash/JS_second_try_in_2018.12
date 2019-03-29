/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
uknow.data = (function() {
  var
    configMap = {
      code: {
        0: '正常',
        1: '未知错误',
        2: '登录的邮箱或密码错误',
        3: '邮箱错误',
        4: '注册通道关闭',
        5: '注册的密码格式错误',
        6: '验证错误',
        7: '注册的名称格式错误',
        8: '登录失败次数超过限制（3次）',
        9: '邮箱已注册',
        10: '会话无效，建议刷新页面',
        11: '验证码错误',
        12: '邮件发送错误',
        13: 'ping消息'
      }
    },
    personalData = {},
    friendData = {},
    messageData = {},
    messageLengthMap = {},
    unreadMessage = {},
    unreadMessageFromWhoArray = [],
    newMessageFromWhoArray = [],
    getData, storeData, showAllData,
    addFriendData, clearAllData, getFriendData,
    getAllFriendData, getMessageData, storeUnreadMessageFromWhoArray,
    returnUnreadMessageFromWhoArray, storeNewMessageFromWhoArray, returnNewMessageFromWhoArray,
    returnMessageData, clearNewMessageFromWhoArray;
  //begin public method

  getData = function(string) {
    return personalData[string] ? personalData[string] : null;
  };

  storeData = function(objectString, string) {
    personalData[objectString] = string;
  };

  showAllData = function() {
    for (var i in personalData) {
      if (personalData.hasOwnProperty(i)) {
        console.log(i, personalData[i]);
      }
    }
    for (var n in friendData) {
      if (personalData.hasOwnProperty(i)) {
        console.log(i, friendData[i]);
      }
    }
    for (var m in messageData) {
      if (personalData.hasOwnProperty(i)) {
        console.log(i, messageData[i]);
      }
    }
  };

  addFriendData = function(email, name, nickname) {
    friendData[email] = { 'name': name, 'nickname': nickname, 'email': email };
  }

  getFriendData = function(email) {
    return friendData[email];
  }

  getAllFriendData = function() {
    return friendData;
  }

  clearAllData = function() {
    for (var i in personalData) {
      if (personalData.hasOwnProperty(i)) {
        delete personalData[i];
      }
    }
    for (var n in friendData) {
      if (friendData.hasOwnProperty(n)) {
        delete friendData[n];
      }
    }
    for (var m in messageData) {
      if (messageData.hasOwnProperty(m)) {
        delete messageData[m];
      }
    }
  };

  //既可以初始化，也可以全体清零
  initMessageLengthMap = function() {
    var friend_data = getAllFriendData();
    for (var i in friend_data) {
      if (friend_data.hasOwnProperty(i)) {
        messageLengthMap[i] = 0;
      }
    }
  }

  //既可以用于部分消息清零,也可以给新添加的好友初始化
  updateMessageLengthMap = function(email, length) {
    messageLengthMap[email] = length;
  }

  getMessageData = function(email) {
    //下面这串代码是给新加入的好友准备的
    var temp_length = messageLengthMap[email] ? messageLengthMap[email] : 0,
      dataArray=messageData[email]?messageData[email]:[],
      array=[];
      if(dataArray.length!=0){
        array = dataArray.slice(messageLengthMap[email], messageData[email].length);
      }
    //更新过时的消息映射里消息的数量
    updateMessageLengthMap(email, dataArray.length);

    return array;
  }

  returnMessageData = function(email) {
    return messageData[email];
  }

  storeMessageData = function(friend_email, from, date, content) {
    messageData[friend_email] = messageData[friend_email] ? messageData[friend_email] : [];
    messageData[friend_email].push([from, date, content]);
  };

  storeUnreadMessageLength = function(email, length) {
    unreadMessage[email] = length;
  };

  getUnreadMessageLength = function(email) {

    return unreadMessage[email]?unreadMessage[email]:0;
  };

  /*
  storeUnreadMessageFromWhoArray = function(email) {
    UnreadMessageFromWhoArray.push(email);
  };

  returnUnreadMessageFromWhoArray = function() {
    return UnreadMessageFromWhoArray;
  };
  */
  //这里还要存新来的消息
  storeNewMessageFromWhoArray = function(email) {
    newMessageFromWhoArray.push(email);
  };

  returnNewMessageFromWhoArray = function() {
    return newMessageFromWhoArray;
  };

  clearNewMessageFromWhoArray = function() {
    newMessageFromWhoArray = [];
  }
  return {
    getData: getData,
    storeData: storeData,
    showAllData: showAllData,
    codeMap: configMap.code,
    clearAllData: clearAllData,
    addFriendData: addFriendData,
    getFriendData: getFriendData,
    getAllFriendData: getAllFriendData,
    storeMessageData: storeMessageData,
    initMessageLengthMap: initMessageLengthMap,
    getMessageData: getMessageData,
    storeUnreadMessageLength: storeUnreadMessageLength,
    getUnreadMessageLength: getUnreadMessageLength,
    /*
    storeUnreadMessageFromWhoArray: storeUnreadMessageFromWhoArray,
    returnUnreadMessageFromWhoArray: returnUnreadMessageFromWhoArray,
    */
    storeNewMessageFromWhoArray: storeNewMessageFromWhoArray,
    returnNewMessageFromWhoArray: returnNewMessageFromWhoArray,
    returnMessageData: returnMessageData,
    clearNewMessageFromWhoArray: clearNewMessageFromWhoArray,
    updateMessageLengthMap:updateMessageLengthMap
  }
}());