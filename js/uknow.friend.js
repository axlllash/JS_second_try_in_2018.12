/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
uknow.friend = (function() {
  var
    configMap = {
      friend_list_item_html: String() +
        '<div class="uknow-friend-wrapper">' +
        '<img class="head" src="./images/100.jpg"/>' +
        '<p class="name"></p>' +
        '<p class="partRecord"></p>' +
        '<p class="chatButton">发起聊天</p>' +
        '</div>',
      friend_url: 'https://zzjnj.xyz/friend'
    },
    stateMap = {
      is_login: false
    },
    jqueryMap = {},
    initModule, createListItem, updateFriendList,
    removeFriendList;

  //begin dom methods
  //end dom methods
  //begin public methods
  createListItem = function(name, nickname, partRecord, email) {
    var name_html = !!nickname ? '<p class="name" title="' + nickname + '(' + name + ')">' + nickname + '(' + name + ')' + '</p>' :
      '<p class="name" title="' + name + '">' + name + '</p>';
    partRecord = partRecord ? partRecord : '';
    jqueryMap.$container.append(String() +
      '<div data-email="' + email + '" data-name="' + name + '" class="uknow-friend-wrapper">' +
      '<img class="head" src="./images/100.jpg"/>' +
      name_html +
      '<p class="partRecord">' + partRecord + '</p>' +
      '<p class="chatButton">发起聊天</p>' +
      '</div>'
    );
  };

  updateFriendList = function() {
    var
      $form = $('<form></form>'),
      $input = $('<input name="session" />'),
      friend_data = uknow.data.getAllFriendData(),
      sorted_array, i, m;
    $input.val(uknow.data.getData('session'));
    $form.append($input);
    var bool = uknow.util_b.toSend(
      configMap.friend_url,
      $form,
      function(data) {
        data = JSON.parse(data);
        for (i in data) {
          if (!(i in friend_data)) {
            uknow.data.addFriendData(i, data[i][0], data[i][1]);
          }
        }
        sorted_array = uknow.util_b.sortEmailByName();

        //更新之前先清空
        jqueryMap.$container.html('');

        for (m = 0; m < sorted_array.length; m++) {
          createListItem(sorted_array[m].name, sorted_array[m].nickname, null, sorted_array[m].email);
        }
      },
      function(e) {
        console.log('wrong');
      }
    );
  };

  //这里得写一个添加新好友，以免出现顺序问题
  addNewFriend=function(){

  };

  removeFriendList = function() {
    jqueryMap.$container.html('');
  };

  initModule = function($container) {
    jqueryMap.$container = $container;
  };
  //end public methods

  return {
    initModule: initModule,
    createListItem: createListItem,
    updateFriendList: updateFriendList,
    removeFriendList: removeFriendList
  }
}());