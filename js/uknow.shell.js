/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
uknow.shell = (function() {
  var configMap = {
      main_html: String() +
        '<div id="uknow-shell-content">' +
        '</div>' +
        '<div id="uknow-shell-sidebar">' +
        '</div>' +
        '<div id="uknow-shell-components">' +
          '<div class="shade">'+
          '</div>'+
        '</div>',
      anchor_schema_map: {
        sidebar: { opened: true, closed: false }
      }

    },
    stateMap = {
      $container: null,
      anchor_map: {},
      is_sidebar_extended: false
    },
    jqueryMap = {},

    setJqueryMap, initModule,
    copyAnchorMap, changeAnchorPart,
    onHashChange;

  //begin dom method
  copyAnchorMap = function() {
    return $.extend(true, {}, stateMap.anchor_map);
  }
  setJqueryMap = function() {
    var $container = stateMap.$container;
    jqueryMap = {
      $container: $container,
      $content: $container.find('#uknow-shell-content'),
      $sidebar: $container.find('#uknow-shell-sidebar'),
      $components: $container.find('#uknow-shell-components')
    };
  };
  changeAnchorPart = function(arg_map) {
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return = true,
      key_name, key_name_dep;

    //begin merge changes into anchor map
    KEYVAL:
      for (key_name in arg_map) {
        if (arg_map.hasOwnProperty(key_name)) {

          //skip dependent keys during iteration
          if (key_name.indexOf('_') === 0) { continue KEYVAL; }

          //update independent key value
          anchor_map_revise[key_name] = arg_map[key_name];

          //update matching dependent key
          key_name_dep = '_' + key_name;
          if (arg_map[key_name_dep]) {
            anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
          } else {
            delete anchor_map_revise[key_name_dep];
            delete anchor_map_revise['_s' + key_name_dep];
          }

        }
      }
    //end merge changes into anchor map
    //begin attempt to update URI,revert if not successful
    try {
      $.uriAnchor.setAnchor(anchor_map_revise);
    } catch (error) {
      //replace URI with existing state
      $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
      bool_return = false;
    }
    //end attempt to update URI

    return bool_return;
  };

  onHashChange = function(event) {
    var
      _s_sidebar_previous, _s_sidebar_proposed,
      anchor_map_proposed,
      is_ok = true,
      anchor_map_previous = copyAnchorMap();

    try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); } catch (error) {
      $.uriAnchor.setAnchor(anchor_map_previous, null, true);
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    _s_sidebar_previous = anchor_map_previous._s_sidebar;
    _s_sidebar_proposed = anchor_map_proposed._s_sidebar;

    if (!anchor_map_previous ||
      _s_sidebar_previous !== _s_sidebar_proposed) {
      s_sidebar_proposed = anchor_map_proposed.sidebar;
      switch (s_sidebar_proposed) {
        case 'opened':
          is_ok = uknow.sidebar.setSidebarPosition('opened');
          break;
        case 'closed':
          is_ok = uknow.sidebar.setSidebarPosition('closed');
          break;
        default:
          uknow.sidebar.setsidebarPosition('closed');
          delete anchor_map_proposed.sidebar;
          $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
      }
    }

    if (!is_ok) {
      if (anchor_map_previous) {
        $.uriAnchor.setAnchor(anchor_map_previous, null, true);
        stateMap.anchor_map = anchor_map_previous;
      } else {
        delete anchor_map_proposed.sidebar;
        $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
      }
    }

    return false;
  }

  setSidebarAnchor = function(position_type) {
    return changeAnchorPart({ sidebar: position_type });
  };
  //end dom method

  //begin public method
  initModule = function($container) {
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();

    uknow.sidebar.configModule({
      set_sidebar_anchor: setSidebarAnchor
    });
    uknow.sidebar.initModule(jqueryMap.$sidebar);

    $(window)
      .bind('hashchange', onHashChange)
      .trigger('hashchange');
  };
  //end public method

  return { initModule: initModule };
}());