/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
uknow.util_b = (function() {
  'use strict';
  var
    configMap = {},
    getRemSize, setNewWindow, dragWindow,
    createWindowPlaceholder, toSend, updateLoginState,
    sortEmailByName, createUnreadNumber, clearUnreadNumber;

  getRemSize = function() {
    return Number(
      $('html').css('fontSize').match(/\d*\.?\d*/)[0]
    );
  };
  //是否有遮罩层，长度，宽度，并且自带默认宽高，且都可以拖动
  //这里需要在uknow.chat.js中新创建一个容器，以免覆盖
  //$container, $shadow, class_string, width, height, left, top
  setNewWindow = function(input_map) {
    var
      $container = input_map.$container,
      $shade = input_map.$shade,
      inside_content_html = input_map.inside_content_html ? input_map.inside_content_html : '未定义',
      inside_footer_html = input_map.inside_footer_html ? input_map.inside_footer_html : '未定义',

      header_text = input_map.header_text ? input_map.header_text : '未定义',
      class_string = input_map.class_string,
      close_callback = input_map.close_callback,
      px_per_rem = getRemSize(),
      jqueryMap = {},
      content_html = String() +
      '<div class="uknow-util_b-window" style="display:none">' +
      '<div class="header">' +
      '<span>' + header_text + '</span>' +
      '<i class="fas fa-times"></i>' +
      '</div>' +
      '<div class="content">' +
      inside_content_html +
      '</div>' +
      '<div class="footer">' +
      inside_footer_html +
      '</div>' +
      '</div>',
      width = input_map.width !== undefined ? input_map.width * px_per_rem : 5.87 * px_per_rem,
      height = input_map.height !== undefined ? input_map.height * px_per_rem : 3.63 * px_per_rem,
      left = input_map.left !== undefined ? input_map.left * px_per_rem : 15.36 / 2 * px_per_rem - width / 2,
      top = input_map.top !== undefined ? input_map.top * px_per_rem : 7.23 / 2 * px_per_rem - height / 2,
      header_height = 0.33 * px_per_rem,
      footer_height = input_map.footer_height !== undefined ? input_map.footer_height : 0.146 * height,
      content_height = height - header_height - footer_height;

    $container.html(content_html);
    jqueryMap.$window = $container.find('.uknow-util_b-window');
    jqueryMap.$header = $container.find('.header');
    jqueryMap.$content = $container.find('.content');
    jqueryMap.$footer = $container.find('.footer');
    jqueryMap.$closeButton = jqueryMap.$header.find('i');

    //开始渐变显示
    jqueryMap.$window.fadeIn();

    dragWindow(jqueryMap.$header[0], jqueryMap.$window[0]);

    jqueryMap.$window.css({
      position: 'fixed',
      width: width,
      height: height,
      left: left,
      top: top,
      zIndex: 2
    }).addClass(class_string);

    jqueryMap.$header.css({
      height: header_height
    });

    jqueryMap.$content.css({
      height: content_height
    });

    jqueryMap.$footer.css({
      height: footer_height
    });

    jqueryMap.$closeButton.click(function() {
      jqueryMap.$closeButton.unbind();
      jqueryMap.$window.remove();

      if (close_callback) { close_callback(); }

      if ($shade) {
        $shade.fadeOut();
        $shade = null;
      }
    });

    if ($shade) {
      $shade.fadeIn();
    }

    return jqueryMap.$closeButton;
  };

  dragWindow = function(header, headerParent) {
    var $header = $(header),
      $headerParent = $(headerParent),
      diffX, diffY, e1, e2, left, top;
    header.onmousedown = function(e) {
      document.body.onselectstart = function() { return false; };
      e1 = e || window.event;
      diffX = e1.clientX - parseFloat($headerParent.css('left'));
      diffY = e1.clientY - parseFloat($headerParent.css('top'));
      if (header.setCapture != undefined) {
        header.setCapture();
      }
      document.onmousemove = function(e) {
        e2 = e || window.event;
        left = e2.clientX - diffX;
        top = e2.clientY - diffY;

        if (left < 0) {
          left = 0;
        } else if (left > window.innerWidth - headerParent.offsetWidth) {
          left = window.innerWidth - headerParent.offsetWidth;
        }

        if (top < 0) {
          top = 0;
        } else if (top > window.innerHeight - headerParent.offsetHeight) {
          top = window.innerHeight - headerParent.offsetHeight;
        }

        headerParent.style.left = left + 'px';
        headerParent.style.top = top + 'px';
      }
      document.onmouseup = function(e) {
        this.onmousemove = null;
        this.onmouup = null;
        document.body.onselectstart = null;
        if (header.releaseCaptrue != undefined) {
          header.releaseCaptrue();
        }
      }
    }
  };

  toSend = function(url, $form, callback, errorCB) {
    var
      data = {},
      formArray = $form.serializeArray();
    $.each(formArray, function(i, item) {
      data[item.name] = item.value;
    });
    data = JSON.parse(JSON.stringify(data));
    $.ajax({
      type: "POST",
      url: url,
      contentType: "application/x-www-form-urlencoded",
      data: data,
      success: callback,
      error: errorCB
    });
  };

  createWindowPlaceholder = function(className) {
    return $('#uknow-shell-components').append('<div class=' + className + '/>').find('.' + className);
  };

  sortEmailByName = function() {
    var data = uknow.data.getAllFriendData(),
      array = [],
      i;
    for (i in data) {
      if (data.hasOwnProperty(i)) {
        array.push(data[i]);
      }
    }

    array.sort(function(a, b) {
      return a.name - b.name;
    });

    return array;
  }

  updateLoginState = function() {

    uknow.sidebar.changeLoginState();
    uknow.chat.changeLoginState();

  };

  //创建一个生成未读消息数字的地方
  createUnreadNumber = function($container, num) {
    if (num > 0) {
      $container.append('<div class="uknow-util_b-unreadNumber" >' + num + '</div>');
    }
  };

  clearUnreadNumber = function($container) {
    $container.find('.uknow-util_b-unreadNumber').remove();
  }

  return {
    getRemSize: getRemSize,
    setNewWindow: setNewWindow,
    createWindowPlaceholder: createWindowPlaceholder,
    toSend: toSend,
    updateLoginState: updateLoginState,
    sortEmailByName: sortEmailByName,
    createUnreadNumber: createUnreadNumber,
    clearUnreadNumber: clearUnreadNumber
  };
}());