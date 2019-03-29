/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
uknow.sidebar = (function() {
  var
    configMap = {
      main_html: String() +
        '<div class="uknow-sidebar-head">' +
        '</div>' +
        '<div class="uknow-sidebar-content">' +
        '<div class="sidebarWrapper">' +
        '</div>' +
        '</div>' +
        '<div class="uknow-sidebar-footer">' +
        '</div>',
      header_logOut_html: String() +
        '<div class="uknow-sidebar-head-logOut">' +
        '<span class="loginButton">登录' +
        '</span>' +
        '<span>/</span>' +
        '<span class="registerButton">注册' +
        '</span>' +
        '</div>',
      header_logIn_html: String() +
        '<div class="uknow-sidebar-head-logIn">' +
        '<img class="head" src="./images/100.jpg" />' +
        '<p class="name"></p>' +
        '<p class="logOut">注销</p>' +
        '</div>',
      footer_logIn_html: String() +
        '<div class="addFriend">' +
        '<i class="fas fa-plus"></i>' +
        '</div>' +
        '<p class="postNewBlog">新的博客</p>',
      logOut_html: String() +
        '<p class="uknow-sidebar-sure">确定</p>' +
        '<p class="uknow-sidebar-cancel">取消</p>',
      addFriend_html: String() +
        '<div class="uknow-sidebar-addFriend">' +
        '<form id="addFriendForm">' +
        '<input type="hidden" class="session" name="session"/>' +
        '<span class="label">填写邮箱</span>' +
        '<input class="email" name="mail" />' +
        '<span class="label">备注(20字)</span>' +
        '<input class="nickname" name="nickname" />' +
        '</form>' +
        '<p class="addButton">添加</p>' +
        '</div>',
      settable_map: {
        sidebar_opened_time: true,
        sidebar_closed_time: true,
        sidebar_opened_rightRem: true,
        sidebar_closed_rightRem: true,
        set_sidebar_anchor: true,
        addFriend_verification_email: false,
        addFriend_verification_nickname: false
      },
      sidebar_opened_time: 200,
      sidebar_closed_time: 200,
      sidebar_opened_rightRem: 0,
      sidebar_closed_rightRem: -2.77,
      set_sidebar_anchor: null,
      addFriend_url: 'https://zzjnj.xyz/new-friend'
    },
    stateMap = {
      //这个地方在初始化的时候记得赋值，就不用书上的函数了
      px_per_rem: 0,
      position_type: 'closed',
      is_login: false
    },
    jqueryMap = {},
    onHoverToggle, setJqueryMap, setSidebarPosition, toggleHeader, login, unlogin;

  //begin dom methods
  setJqueryMap = function() {
    var
      $sidebar = jqueryMap.$append_target;
    jqueryMap = {
      $sidebar: $sidebar,
      $head: $sidebar.find('.uknow-sidebar-head'),
      $content: $sidebar.find('.uknow-sidebar-content'),
      $footer: $sidebar.find('.uknow-sidebar-footer'),
      $content_wrapper: $sidebar.find('.sidebarWrapper')
    };
  };
  onHoverToggle = function(event) {
    var set_sidebar_anchor = configMap.set_sidebar_anchor;
    if (stateMap.position_type === 'opened') {
      set_sidebar_anchor('closed');
    } else if (stateMap.position_type === 'closed') {
      set_sidebar_anchor('opened');
    }
    return false;
  };
  //end dom methods

  toggleHeader = function() {

    if (!stateMap.is_login) {
      unlogin();
    } else {
      login();
    }
  };

  unlogin = function() {

    if (jqueryMap.$logIn) {
      jqueryMap.$logIn.unbind();
    }

    jqueryMap.$head.html(configMap.header_logOut_html);

    jqueryMap.$footer.unbind();
    jqueryMap.$footer.html('');
    //这里的logOut指一个div
    jqueryMap.$logOut = jqueryMap.$head.find('.uknow-sidebar-head-logOut');
    jqueryMap.$loginButton = jqueryMap.$logOut.find('.loginButton');
    jqueryMap.$registerButton = jqueryMap.$logOut.find('.registerButton');
    uknow.unlogin.initModule({
      $loginButton: jqueryMap.$loginButton,
      $registerButton: jqueryMap.$registerButton
    });
  };

  login = function() {
    var $name, $logOutButton;
    //这里是判断一个div是否存在
    if (jqueryMap.$logOut) {
      jqueryMap.$logOut.unbind();
    }
    jqueryMap.$head.html(configMap.header_logIn_html);
    jqueryMap.$logIn = jqueryMap.$head.find('.uknow-sidebar-head-logIn');

    //为原先footer上的事件解绑（虽然没有）
    jqueryMap.$footer.unbind();
    jqueryMap.$footer.html(configMap.footer_logIn_html);
    jqueryMap.$addFriend = jqueryMap.$footer.find('.addFriend');

    //定义加好友的窗口
    jqueryMap.$addFriend.click(function newFriendWindow() {

      $(this).unbind();

      stateMap.addFriend_verification_email = false;
      stateMap.addFriend_verification_nickname = false;

      var $email, $addButton, $nickname, $errorZone, $form;
      jqueryMap.$newFriendWindowPlaceholder = uknow.util_b.createWindowPlaceholder('uknow-sidebar-newFriend');
      jqueryMap.newFriend_close_button = uknow.util_b.setNewWindow({
        width: 4,
        height: 2.472,
        header_text: '添加新的朋友',
        $container: jqueryMap.$newFriendWindowPlaceholder,
        $shade: $('.shade'),
        close_callback: function() {
          jqueryMap.$addFriend.click(newFriendWindow);
          jqueryMap.$newFriendWindowPlaceholder.remove();
        },
        inside_footer_html: ' '
      });

      jqueryMap.$newFriendWindowContent = jqueryMap.$newFriendWindowPlaceholder.find('.content');
      jqueryMap.$newFriendWindowContent.html(configMap.addFriend_html);
      $email = jqueryMap.$newFriendWindowContent.find('.email');
      $nickname = jqueryMap.$newFriendWindowContent.find('.nickname');
      $session = jqueryMap.$newFriendWindowContent.find('.session');
      $addButton = jqueryMap.$newFriendWindowContent.find('.addButton');
      $errorZone = jqueryMap.$newFriendWindowPlaceholder.find('.footer');
      $form = jqueryMap.$newFriendWindowContent.find('#addFriendForm');
      $email.blur(function() {
        stateMap.addFriend_verification_email = false;
        if (!/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test($(this).val())) {
          $errorZone.text('请输入正确的邮箱！');
          return false;
        } else if ($(this).val() in uknow.data.getAllFriendData()) {
          $errorZone.text('该好友已在您的好友列表中。');
          return false;
        } else if ($(this).val() == uknow.data.getData('email')) {
          $errorZone.text('请勿输入自己的邮箱。');
          return false;
        }
        $errorZone.text('');
        stateMap.addFriend_verification_email = true;
      });
      $nickname.blur(function() {
        stateMap.addFriend_verification_nickname = false;
        if ($nickname.val() && $nickname.val().length > 20) {
          $errorZone.text('备注不能超过20个字');
          return false;
        }
        $errorZone.text('');
        stateMap.addFriend_verification_nickname = true;
      });
      $addButton.click(function addButtonClick() {
        if (!stateMap.addFriend_verification_email) {
          $email.blur();
          return false;
        }
        if (!stateMap.addFriend_verification_nickname) {
          $nickname.blur();
          return false;
        }

        $errorZone.text('');
        $(this).unbind();
        $(this).css({ background: 'red' });
        $session.val(uknow.data.getData('session'));
        var bool = uknow.util_b.toSend(
          configMap.addFriend_url,
          $form,
          function(data) {
            //检验name
            data = JSON.parse(data);
            if (data.name !== '') {
              $addButton.text('添加好友成功！');
              uknow.friend.updateFriendList();
              $addButton.click(addButtonClick);
              $.gevent.publish(
                'newMessageCome'
              );
            } else {
              $addButton.text('未查找到该用户。');
              $addButton.click(addButtonClick);
            }
          },
          function(e) {
            console.log('wrong');
          }
        );
      });
      jqueryMap.$newFriendWindowPlaceholder.keypress(function() {
        if (e.which == 13) {
          $addButton.click();
        }
      });
    });

    $name = jqueryMap.$logIn.find('.name');
    $logOutButton = jqueryMap.$logIn.find('.logOut');
    $name.text(uknow.data.getData('name'));
    $logOutButton.click(function logOutWindow() {
      var $sure, $cancel;
      $(this).unbind();

      jqueryMap.$logOutWindowPlaceholder = uknow.util_b.createWindowPlaceholder('uknow-sidebar-logOutWindow');
      jqueryMap.logOut_close_button = uknow.util_b.setNewWindow({
        width: 2,
        height: 1.236,
        header_text: '确定注销吗',
        $container: jqueryMap.$logOutWindowPlaceholder,
        $shade: $('.shade'),
        close_callback: function() {
          $logOutButton.click(logOutWindow);
          jqueryMap.$logOutWindowPlaceholder.remove();
        },
        inside_footer_html: ' '
      });

      jqueryMap.$logOutWindowContent = jqueryMap.$logOutWindowPlaceholder.find('.content');
      jqueryMap.$logOutWindowContent.html(configMap.logOut_html);
      $sure = jqueryMap.$logOutWindowContent.find('.uknow-sidebar-sure');
      $cancel = jqueryMap.$logOutWindowContent.find('.uknow-sidebar-cancel');
      //注销后执行的函数
      $sure.click(function() {
        uknow.util_b.updateLoginState();
        jqueryMap.logOut_close_button.click();
        uknow.data.clearAllData();
        uknow.friend.removeFriendList();
        //相关解绑
        jqueryMap.$content_wrapper.unbind();
      });
      jqueryMap.$logOutWindowPlaceholder.keypress(function() {
        if (e.which == 13) {
          $sure.click();
        }
      });
      $cancel.click(function() { jqueryMap.logOut_close_button.click(); });
    });
  };
  //begin public methods

  changeLoginState = function() {
    stateMap.is_login = stateMap.is_login == true ? false : true;

    //应该调用的函数，应该要结合is_login判断
    toggleHeader();

    if (stateMap.is_login) {
      //如果确定是登录，则更新好友列表
      uknow.friend.updateFriendList();
      uknow.chat.initModule({ $sidebarFriendList: jqueryMap.$content_wrapper });
    }
  };

  setSidebarPosition = function(position_type, callback) {
    var animate_time, right_px
    switch (position_type) {
      case 'opened':
        animate_time = configMap.sidebar_opened_time;
        right_px = 0;
        break;
      case 'closed':
        animate_time = configMap.sidebar_closed_time;
        right_px = -(2.77 * stateMap.px_per_rem);
        break;
      default:
        return false;
    }

    jqueryMap.$sidebar.animate({ right: right_px },
      animate_time,
      function() {
        //这里定义需要打开
        if (position_type === 'closed') {
          jqueryMap.$head.removeClass('show');
          jqueryMap.$footer.removeClass('show');
        } else {
          jqueryMap.$head.addClass('show');
          jqueryMap.$footer.addClass('show');
        }
        stateMap.position_type = position_type;
        if (callback) { callback(jqueryMap.$sidebar) }
      }
    );
    return true;
  };

  configModule = function(input_map) {
    uknow.util.setConfigMap({
      input_map: input_map,
      settable_map: configMap.settable_map,
      config_map: configMap
    });
    return true;
  };

  initModule = function($append_target) {
    jqueryMap.$append_target = $append_target;
    $append_target.append(configMap.main_html);

    setJqueryMap();

    //初始根据is_login加载sidebar头部
    toggleHeader();

    uknow.friend.initModule(jqueryMap.$content_wrapper);

    stateMap.px_per_rem = uknow.util_b.getRemSize();

    jqueryMap.$sidebar.hover(onHoverToggle, onHoverToggle);
  };

  return {
    setSidebarPosition: setSidebarPosition,
    configModule: configModule,
    initModule: initModule,
    changeLoginState: changeLoginState
  };
}());