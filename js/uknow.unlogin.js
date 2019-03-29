/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
uknow.unlogin = (function() {
  'use strict';
  var
    configMap = {
      register_first_content_html: String() +
        '<div class="uknow-unlogin-register-first">' +
        '<form id="registerFirst">' +
        '<span class="label">请输入邮箱</span>' +
        '<input type="text" class="email" name="mail" />' +
        '</form>' +
        '<p class="nextButton">点击发送邮箱</p>' +
        '</div>',
      register_second_content_html: String() +
        '<div class="uknow-unlogin-register-second">' +
        '<form id="registerSecond">' +
        '<input type="hidden" class="email" name="mail"/>' +
        '<input type="hidden" class="vcode" name="vcode"/>' +
        '<span class="label">邮箱验证码</span>' +
        '<input type="text" class="icode" name="icode" /><br/>' +
        '<span class="label">昵称</span>' +
        '<input type="text" class="name" name="name" /><br/>' +
        '<span class="label">密码</span>' +
        '<input type="password" class="password1" name="password" /><br/>' +
        '<span class="label remove">再次输入密码</span>' +
        '<input type="password" class="password2" name="password2" /><br/>' +
        '</form>' +
        '<p class="submit">提交</p>' +
        '<p class="returnButton"></p>' +
        '</div>',
      login_content_html: String() +
        '<div class="uknow-unlogin-login">' +
        '<form id="login">' +
        '<span class="label">邮箱</span>' +
        '<input type="text" class="email" name="mail" />' +
        '<span class="label">密码</span>' +
        '<input type="password" class="password" name="password" />' +
        '</form>' +
        '<p class="submit">登录</p>' +
        '</div>',
      register_url: 'https://zzjnj.xyz/sign-up',
      login_url: 'https://zzjnj.xyz/sign-in',
      freezing_time: 10
    },
    jqueryMap = {},
    stateMap = {
      register_first_verification: false,
      register_second_verification_icode: false,
      register_second_verification_name: false,
      register_second_verification_password1: false,
      register_second_verification_password2: false,
      login_verification_email: false,
      login_verification_password: false,
      freezing_time: configMap.freezing_time,
      data: {}
    },
    setJqueryMap, init, initRegisterFirstWindowEvent,
    initRegisterSecondWindowEvent, initLoginWindowEvent, initModule;

  //begin dom methods
  setJqueryMap = function() {
    var input_map = stateMap.input_map;
    jqueryMap.$loginButton = input_map.$loginButton;
    jqueryMap.$registerButton = input_map.$registerButton;
  };
  //初始化按钮
  init = function() {
    var
      $loginButton = jqueryMap.$loginButton,
      $registerButton = jqueryMap.$registerButton;

    //注册按钮的编写
    $registerButton.click(function registerButtonClick() {
      $(this).unbind();

      jqueryMap.$registerWindowPlaceholder = uknow.util_b.createWindowPlaceholder('uknow-unlogin-registerWindow');
      jqueryMap.register_close_button = uknow.util_b.setNewWindow({
        header_text: '注册',
        $container: jqueryMap.$registerWindowPlaceholder,
        $shade: $('.shade'),
        close_callback: function() {
          $registerButton.click(registerButtonClick);
          jqueryMap.$registerWindowPlaceholder.remove();
        },
        inside_footer_html: ' '
      });
      jqueryMap.$registerWindowContent = jqueryMap.$registerWindowPlaceholder.find('.content');
      //只要默认是未登录状态，则第一个页面必定是发送邮箱的页面
      initRegisterFirstWindowEvent();
    });

    //登录按钮的编写
    $loginButton.click(function loginButtonClick() {
      $(this).unbind();

      jqueryMap.$loginWindowPlaceholder = uknow.util_b.createWindowPlaceholder('uknow-unlogin-loginWindow');
      jqueryMap.login_close_button = uknow.util_b.setNewWindow({
        header_text: '登录',
        $container: jqueryMap.$loginWindowPlaceholder,
        $shade: $('.shade'),
        close_callback: function() {
          $loginButton.click(loginButtonClick);
          jqueryMap.$loginWindowPlaceholder.remove();
        },
        inside_footer_html: ' '
      });

      jqueryMap.$loginWindowContent = jqueryMap.$loginWindowPlaceholder.find('.content');

      initLoginWindowEvent();
    });
  }

  initRegisterFirstWindowEvent = function() {
    stateMap.register_first_verification = false;
    //var之前都是清理工作
    stateMap.freezing_time = configMap.freezing_time;

    if (stateMap.data) {
      for (var i in stateMap.data) {
        if (stateMap.data.hasOwnProperty(i)) {
          uknow.data.storeData(String(i), '');
        }
      }
    }

    jqueryMap.$registerWindowContent.html(configMap.register_first_content_html)

    var
      $placeholder = jqueryMap.$registerWindowPlaceholder,
      $form = $placeholder.find('#registerFirst'),
      $email = $placeholder.find('.email'),
      $button = $placeholder.find('.nextButton'),
      $errorZone = $placeholder.find('.footer');

    $email.blur(function() {
      stateMap.register_first_verification = false;
      if (!/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test($(this).val())) {
        $errorZone.text('请输入正确的邮箱！');
        return false;
      }
      $errorZone.text('');
      stateMap.register_first_verification = true;
    });
    $button.click(function buttonClick() {
      if (!stateMap.register_first_verification) {
        $email.blur();
        return false;
      }
      //清除错误信息
      $errorZone.text('');
      $(this).unbind();
      $(this).css({ background: 'red' });
      stateMap.data.email = $email.val();
      var bool = uknow.util_b.toSend(
        configMap.register_url,
        $form,
        function(data) {
          data = JSON.parse(data);
          //存入获得的所有数据
          stateMap['data'] = data;
          for (var i in data) {
            if (data.hasOwnProperty(i)) {
              uknow.data.storeData(String(i), String(data[i]));
            }
          }
          //检验code
          if (uknow.data.getData('code') == 0) {
            //这里要存储邮箱给下一个页面用
            uknow.data.storeData('email', $email.val());
            initRegisterSecondWindowEvent();
          } else if (uknow.data.getData('code') !== 0) {
            $errorZone.text(uknow.data.codeMap[uknow.data.getData('code')]);
            $button.click(buttonClick);
          }
        },
        function(e) {
          console.log('wrong');
        }
      );
    });

    function Submit1(e) {
      if (e.which == 13) {
        $button.click();
      }
    }

    $placeholder.unbind('keypress', Submit2);

    $placeholder.keypress(Submit1);
  };

  initRegisterSecondWindowEvent = function() {
    stateMap.register_second_verification_icode = false;
    stateMap.register_second_verification_name = false;
    stateMap.register_second_verification_password1 = false;
    stateMap.register_second_verification_password2 = false;

    jqueryMap.$registerWindowContent.unbind();

    jqueryMap.$registerWindowContent.html(configMap.register_second_content_html);

    var
      $placeholder = jqueryMap.$registerWindowPlaceholder,
      $form = $placeholder.find('#registerSecond'),
      $email = $placeholder.find('.email'),
      $vcode = $placeholder.find('.vcode'),
      $icode = $placeholder.find('.icode'),
      $name = $placeholder.find('.name'),
      $password1 = $placeholder.find('.password1'),
      $password2 = $placeholder.find('.password2'),
      $returnButton = $placeholder.find('.returnButton'),
      $submit = $placeholder.find('.submit'),
      $errorZone = $placeholder.find('.footer');

    $email.val(uknow.data.getData('email'));
    $vcode.val(uknow.data.getData('vcode'));

    $icode.blur(function() {
      stateMap.register_second_verification_icode = false;
      if ($(this).val() === '') {
        $errorZone.text('请输入邮箱的验证码！');
        return false;
      }
      //清除错误信息
      $errorZone.text('');
      stateMap.register_second_verification_icode = true;
    });

    $name.blur(function() {
      stateMap.register_second_verification_name = false;
      if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test($(this).val())) {
        $errorZone.text('请输入合法的昵称！');
        return false;
      }
      //清除错误信息
      $errorZone.text('');
      stateMap.register_second_verification_name = true;
    });

    $password1.blur(function() {
      stateMap.register_second_verification_password1 = false;
      if (!/^[a-zA-Z0-9!@#$%^&*]+$/.test($(this).val())) {
        $errorZone.text('密码暂不支持中文及特殊字符。');
        return false;
      }
      //清除错误信息
      $errorZone.text('');
      stateMap.register_second_verification_password1 = true;
    });

    $password2.blur(function() {
      stateMap.register_second_verification_password2 = false;
      if ($password1.val() != $password2.val()) {
        $errorZone.text('两次密码不一致。');
        return false;
      }
      //清除错误信息
      $errorZone.text('');
      stateMap.register_second_verification_password2 = true;
    });

    //定时器
    setTimeout(function letsGo() {
      if (stateMap.freezing_time > 0) {
        stateMap.freezing_time--;
        $returnButton.text(stateMap.freezing_time + 's后可以重新发送邮件。');
        setTimeout(letsGo, 1000);
      } else {
        $returnButton.css({ background: 'red' });
        $returnButton.text('重新发送邮件');
        $returnButton.click(function() {
          $placeholder.unbind();
          $errorZone.text('');
          initRegisterFirstWindowEvent();
        });
      }
    }, 1);

    $submit.click(function buttonClick() {

      if (!stateMap.register_second_verification_icode) {
        $icode.blur();
        return false;
      } else if (!stateMap.register_second_verification_name) {
        $name.blur();
        return false;
      } else if (!stateMap.register_second_verification_password1) {
        $password1.blur();
        return false;
      } else if (!stateMap.register_second_verification_password2) {
        $password2.blur();
        return false;
      }

      $(this).unbind();
      //这里要去除第二个password,去除name即可阻止传入form序列化后的数据（和jquery的serializeArray的特点有关）
      $password2.removeAttr('name');
      $icode.val($icode.val().toUpperCase());
      $(this).css({ background: 'red' });
      uknow.util_b.toSend(
        configMap.register_url,
        $form,
        function(data) {
          data = JSON.parse(data);
          for (var i in data) {
            if (data.hasOwnProperty(i)) {
              uknow.data.storeData(String(i), String(data[i]));
            }
          }
          if (uknow.data.getData('code') == 0) {
            jqueryMap.register_close_button.click();
          } else if (uknow.data.getData('code') !== 0) {
            $errorZone.text(uknow.data.codeMap[uknow.data.getData('code')]);
            $submit.click(buttonClick);
          }
        },
        function(e) {
          console.log('wrong');
        }
      );
    });

    function Submit2(e) {
      if (e.which == 13) {
        $submit.click();
      }
    }

    $placeholder.unbind('keypress', Submit1);

    $placeholder.keypress(Submit2);
  };

  initLoginWindowEvent = function() {

    stateMap.login_verification_email = false;
    stateMap.login_verification_password = false;

    jqueryMap.$loginWindowContent.unbind();

    jqueryMap.$loginWindowContent.html(configMap.login_content_html);

    var
      $placeholder = jqueryMap.$loginWindowPlaceholder,
      $email = $placeholder.find('.email'),
      $password = $placeholder.find('.password'),
      $form = $placeholder.find('#login'),
      $errorZone = $placeholder.find('.footer'),
      $submit = $placeholder.find('.submit');

    $email.blur(function() {
      stateMap.login_verification_email = false;
      if (!/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test($(this).val())) {
        $errorZone.text('请输入正确的邮箱！');
        return false;
      }
      //清除错误信息
      $errorZone.text('');
      stateMap.login_verification_email = true;
    });

    $password.blur(function() {
      stateMap.login_verification_password = false;
      if (!/^[a-zA-Z0-9!@#$%^&*]+$/.test($(this).val())) {
        $errorZone.text('密码暂不支持中文及特殊字符。');
        return false;
      }
      //清除错误信息
      $errorZone.text('');
      stateMap.login_verification_password = true;
    });

    $submit.click(function buttonClick() {

      if (!stateMap.login_verification_email) {
        $email.blur();
        return false;
      } else if (!stateMap.login_verification_password) {
        $submit.blur();
        return false;
      }

      $(this).unbind();

      $(this).css({ background: 'red' });

      uknow.util_b.toSend(
        configMap.login_url,
        $form,
        function(data) {
          data = JSON.parse(data);
          //存储用户的email
          uknow.data.storeData('email', $email.val());
          for (var i in data) {
            if (data.hasOwnProperty(i)) {
              uknow.data.storeData(String(i), String(data[i]));
            }
          }
          if (uknow.data.getData('code') == 0) {
            jqueryMap.login_close_button.click();

            //更新各个插件的is_login值
            uknow.util_b.updateLoginState();

          } else if (uknow.data.getData('code') !== 0) {
            $errorZone.text(uknow.data.codeMap[uknow.data.getData('code')]);
            $submit.click(buttonClick);
          }
        },
        function(e) {
          console.log('wrong');
        }
      );
    });

    function Submit(e) {
      if (e.which == 13) {
        $submit.click();
      }
    }

    $placeholder.keypress(Submit1);
  };
  //end dom methods

  //begin public methods
  initModule = function(input_map) {
    stateMap.input_map = input_map;

    setJqueryMap();

    init();

  };

  return {
    initModule: initModule,
    //实验性API
    initRegisterSecondWindowEvent: initRegisterSecondWindowEvent
  };
}());