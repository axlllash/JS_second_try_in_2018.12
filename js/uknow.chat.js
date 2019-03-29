uknow.chat = (function() {
  'use strict';
  var
    configMap = {
      chatWindow_html: String() +
        '<div class="uknow-chat">' +
        '<div class="friendListWrapper">' +
        '<ul class="friendList">' +
        '</ul>' +
        '</div>' +
        '<div class="mainContent">' +
        '<div class="messageWrapper">' +
        '</div>' +
        '<form id="messageForm">' +
        '<input type="hidden" class="session" name="session" />' +
        '<input type="hidden" class="to" name="to"/>' +
        '<textarea name="message" class="message">' +
        '</textarea>' +
        '<p class="button">提交</p>' +
        '</form>' +
        '</div>',
      webSocket_url: 'zzjnj.xyz/get-message',
      send_message_url: 'https://zzjnj.xyz/send-message',
    },
    jqueryMap = {},
    stateMap = {
      is_login: false,
      now_chat_with: null,
      email: uknow.data.getData('email'),
    },
    createMessage, createFriendListItem, updateChatWindow,
    changeLoginState, addMessage, changeLoginState,
    initModule;
  //start dom methods

  //end dom methods
  //start public methods

  createMessage = function(date, message, from) {
    var temp_html;

    if (from != stateMap.email) {
      temp_html = String() +
        '<div class="uknow-chat-from-friend">' +
        '<p class="date">' + date + '</p>' +
        '<p class="messageContent">' + message + '</p>' +
        '</div>'
    } else {
      temp_html = String() +
        '<div class="uknow-chat-from-me">' +
        '<p class="date">' + date + '</p>' +
        '<p class="messageContent">' + message + '</p>' +
        '</div>'
    }
    return '<div class="message">' +
      temp_html +
      '</div>' +
      '<br/>';
  };

  //清空聊天区的任务另写一个函数完成
  addMessage = function($wrapper) {
    var
      array = uknow.data.getMessageData(stateMap.now_chat_with),
      temp_html = '',
      i;

    for (i = 0; i < array.length; i++) {
      temp_html += createMessage(array[i][1], array[i][2], array[i][0]);
    }

    $wrapper.html($wrapper.html() + temp_html);

    $wrapper.animate(scrollTop: $wrapper.prop('scrollHeight') - $wrapper.height(), 150);

  }

  createFriendListItem = function(name, nickname, email) {
    var temp_html;
    temp_html = nickname ? nickname + '(' + name + ')' : name;
    return '<li class="friendListItem" data-email="' + email + '">' +
      temp_html +
      '</li>';
  };

  updateChatWindow = function(event) {

    var
      sorted_friendName_array, $chatWindowContent, $footer,
      $friendList_placeholder,
      temp_html = '',
      i, new_message_from_who_array, $send_message_form,
      first_chat_with, now_time, $message_wrapper,
      changeNowChatWith, $header_text, $header,
      $button, $session, $to, $textarea, $parent;

    //判断是否为开始聊天的按钮
    if (!$(event.target).hasClass('chatButton')) {
      return false;
    }

    if (!stateMap.is_login) {
      return false;
    }

    //如果是再检测窗口是否已存在，不存在则创建一个
    if (!jqueryMap.$chatWindow || jqueryMap.$chatWindow.parent().length) {

      //清空消息容量的映射
      uknow.data.initMessageLengthMap();

      //开始获取邮箱
      $parent = $(event.target).parent();
      //清除其下的未读消息div
      uknow.util_b.clearUnreadNumber($parent);

      stateMap.now_chat_with = $parent.attr('data-email');
      first_chat_with = uknow.data.getFriendData(stateMap.now_chat_with);

      //清除未读消息数量
      uknow.data.storeUnreadMessageLength(stateMap.now_chat_with, 0);

      //这里开始获得初始化窗口所需要的数据
      sorted_friendName_array = uknow.util_b.sortEmailByName();

      jqueryMap.$chatWindowPlaceholder = uknow.util_b.createWindowPlaceholder('uknow-chat-window');
      jqueryMap.chatWinodw_close_button = uknow.util_b.setNewWindow({
        header_text: '与' + (first_chat_with.nickname ? first_chat_with.nickname +
          '(' + first_chat_with.name + ')' : first_chat_with.name) + '聊天中',
        $container: jqueryMap.$chatWindowPlaceholder,
        close_callback: function() {
          stateMap.now_chat_with = null;
          jqueryMap.$chatWindowPlaceholder.remove();
        },
        footer_height: 0,
        inside_footer_html: ' '
      });

      $header = jqueryMap.$chatWindowPlaceholder.find('.header');
      $chatWindowContent = jqueryMap.$chatWindowPlaceholder.find('.content');
      $footer = jqueryMap.$chatWindowPlaceholder.find('.footer');

      $chatWindowContent.html(configMap.chatWindow_html);

      //查找更细节的部件
      $friendList_placeholder = jqueryMap.$chatWindowPlaceholder.find('.friendList');
      $message_wrapper = jqueryMap.$chatWindowPlaceholder.find('.messageWrapper');

      $send_message_form = jqueryMap.$chatWindowPlaceholder.find('#messageForm');
      $button = $send_message_form.find('.button');
      $session = $send_message_form.find('.session');
      $to = $send_message_form.find('.to');
      $textarea = $send_message_form.find('.message');
      //查找头部标题
      $header_text = jqueryMap.$chatWindowPlaceholder.find('.header>span');

      //给chatWindow的好友栏添加点击事件
      $friendList_placeholder.click(function friendListClick(e) {
        var
          email;

        //判断是否为friendListItem
        if (!$(e.target).hasClass('friendListItem')) {
          return false;
        }

        email = $(e.target).attr('data-email');

        //给friendItem下的未读数量清零
        uknow.util_b.clearUnreadNumber($(e.target));
        //清除主界面下未读消息数量
        uknow.util_b.clearUnreadNumber($("[data-email='" + email + "'].uknow-friend-wrapper"));

        if (email === stateMap.now_chat_with) {
          return false;
        }

        changeNowChatWith(email);

      });

      //给消息窗口添加消息
      $.gevent.subscribe(
        $message_wrapper,
        'newMessageCome',
        function() {
          addMessage($message_wrapper);
        }
      );

      //给提交按钮添加事件处理程序
      $button.click(function submit() {
        //暂时解绑
        $(this).unbind();

        if (!$textarea.val()) {
          $button.click(submit);
          return false;
        }

        //只要不为空，就算通过
        $session.val(uknow.data.getData('session'));
        $to.val(stateMap.now_chat_with);

        uknow.util_b.toSend(
          configMap.send_message_url,
          $send_message_form,
          function(data) {
            data = JSON.parse(data);
            for (var i in data) {
              if (data.hasOwnProperty(i)) {
                uknow.data.storeData(String(i), String(data[i]), now_time, $textarea.val());
              }
            }
            if (uknow.data.getData('code') == 0) {
              uknow.data.storeMessageData(stateMap.now_chat_with, stateMap.email, uknow.data.getData('time'), $textarea.val());
              $textarea.val('');
              $button.click(submit);
              //更新消息框
              addMessage($message_wrapper);
            } else if (uknow.data.getData('code') !== 0) {
              console.log('something wrong');
              $button.click(submit);
            }
          },
          function(e) {
            console.log('wrong');
          }
        );
      });

      jqueryMap.$newFriendWindowPlaceholder.keypress(function() {
        if (e.ctrlKey && e.which == 13) {
          $button.click();
        }
      });

      //对于聊天框，还需要挂载更新添加好友和排序的两个自定义事件
      $.gevent.subscribe(
        $friendList_placeholder,
        'newMessageCome',
        function() {
          var
            i, $item, num;
          //这里可以从data里面获取有新消息的好友email，然后在frendList中找到这个好友，重新排序好友
          new_message_from_who_array = uknow.data.returnNewMessageFromWhoArray();
          for (i = 0; i < new_message_from_who_array.length; i++) {
            //先把新加入的元素插上
            $item = $friendList_placeholder.find("[data-email='" + new_message_from_who_array[i] + "'].friendListItem");
            $friendList_placeholder.prepend($item);
            num = uknow.data.getUnreadMessageLength(new_message_from_who_array[i]);
            uknow.util_b.createUnreadNumber($item, num);
          }
        }
      );

      $.gevent.subscribe(
        //第二次获取sorted_friendName_array，因为新加入了好友
        $friendList_placeholder,
        'newFriendAdd',
        function() {
          var
            temp_html;
          //再一次获得数据
          sorted_friendName_array = uknow.util_b.sortEmailByName();
          //再次填充
          for (i in sorted_friendName_array) {
            temp_html += createFriendListItem(sorted_friendName_array[i].name, sorted_friendName_array[i].nickname, i);
          }
          $friendList_placeholder.html(temp_html);
          //friendList组件和content组件都需要设一个正在聊天好友的data，一般情况下是相等的，但当更新整个列表的时候，friendList的data也需要更新
        }
      );

      //开始填充好友数据
      for (i in sorted_friendName_array) {
        temp_html += createFriendListItem(
          sorted_friendName_array[i].name,
          sorted_friendName_array[i].nickname,
          sorted_friendName_array[i].email
        );
      }

      $friendList_placeholder.html(temp_html);

      //更新消息,这个地方要注意可能当前用户的确无人发消息给他
      addMessage($message_wrapper);

    }

    //这里开始切换聊天框里的具体部件
    //先开始获得相关信息
    /*var
      $target = $(event.target),
      $email = $target.parent().attr('data-email'),
      $name = $target.parent().attr('data-name');
    */

    //后面定义内部函数
    changeNowChatWith = function(email) {
      var
        friendData = uknow.data.getFriendData(email);
      //先清空已显示消息的数量，用以控制下次返回消息的数量
      uknow.data.updateMessageLengthMap(stateMap.now_chat_with, 0);
      stateMap.now_chat_with = email;
      //清空消息栏
      $message_wrapper.html('');
      //更新消息栏
      addMessage($message_wrapper);
      //因为一旦更改，未读消息的数量应该清零
      uknow.data.storeUnreadMessageLength(stateMap.now_chat_with, 0);
      $header_text.text('与' + (friendData.nickname ? friendData.nickname +
        '(' + friendData.name + ')' : friendData.name) + '聊天中');
    };

  }

  changeLoginState = function() {
    stateMap.is_login = stateMap.is_login == true ? false : true;
  }

  initModule = function(inputMap) {
    var
      uri = window.location.protocol === 'https:' ? 'wss:' : 'ws:',
      i, j;

    //挂载接受消息的地方
    jqueryMap.$sidebarFriendList = inputMap.$sidebarFriendList;
    jqueryMap.$sidebarFriendList.click(updateChatWindow);

    //订阅newMessage事件
    $.gevent.subscribe(
      jqueryMap.$sidebarFriendList,
      'newMessageCome',
      function() {
        var
          i, $item, new_message_from_who_array,
          new_message_from_who_array, message_array, message_array_length, num;
        //这里可以从data里面获取有新消息的好友email，然后在frendList中找到这个好友，重新排序好友
        new_message_from_who_array = uknow.data.returnNewMessageFromWhoArray();
        for (i = 0; i < new_message_from_who_array.length; i++) {
          //先把新加入的元素插上
          $item = $("[data-email='" + new_message_from_who_array[i] + "'].uknow-friend-wrapper");
          jqueryMap.$sidebarFriendList.prepend($item);
          //插入最新的消息
          message_array = uknow.data.returnMessageData(new_message_from_who_array[i]);
          message_array_length = message_array.length;
          $item.find('.partRecord').text(message_array[message_array_length - 1][2]);
          num = uknow.data.getUnreadMessageLength(new_message_from_who_array[i]);
          uknow.util_b.createUnreadNumber($item, num);
        }
      }
    );

    //开始接受消息
    uri += '//' + configMap.webSocket_url;

    stateMap.ws = new WebSocket(uri)

    stateMap.ws.onopen = function() {
      stateMap.ws.send(uknow.data.getData('session'));
    }

    stateMap.ws.onmessage = function(evt) {
      var
        data = evt.data,
        info;
      if (data === 'ping') {
        stateMap.ws.send('pong');
      } else {
        data = JSON.parse(data),
          info = JSON.parse(data.info);
        console.log(data);
        if (data.code != 0) {
          return false;
        }

        //先清除保存存新消息的数组
        uknow.data.clearNewMessageFromWhoArray();

        if ($.isEmptyObject(info)) {
          console.log('第一次为空');
          return false;
        }

        for (i in info) {
          for (j = 0; j < info[i].length; j = j + 2) {
            uknow.data.storeMessageData(i, i, info[i][j], info[i][j + 1])
          }
          //只要发送者不是stateMap.now_chat_with,就存储相关未读的信息
          if (i !== stateMap.now_chat_with) {
            uknow.data.storeUnreadMessageLength(i, uknow.data.getUnreadMessageLength(i) + j / 2);
            uknow.data.storeNewMessageFromWhoArray(i);
          }
        }
        //发布newMessage事件
        $.gevent.publish(
          'newMessageCome'
        );
      }
    }


  };
  //end public methods

  return {
    initModule: initModule,
    changeLoginState: changeLoginState
  }
}());