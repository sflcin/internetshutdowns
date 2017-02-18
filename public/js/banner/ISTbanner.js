(function(){

  var options = {
    banner_id: 'ist_banner',
    path: '/js/banner/iframe/banner.html',
    css_id: 'ist_banner_css'
  }

  function onDomContentLoaded() {
    // Create CSS
    var css = '#' + options.banner_id + ' { position: fixed; left: 0px; bottom: 0px; width: 100%; height: 54px; z-index: 20000; }';
    var style = document.createElement('style');
		style.type = 'text/css';
		style.id = options.css_id;
		if (style.styleSheet) style.styleSheet.cssText = css;
		else style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);

    // Create the iframe
    var iframe = document.createElement('iframe');
    iframe.id = 'ist_banner';
    iframe.src = options.path;
    iframe.frameBorder = 0;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    setTimeout(function () {
      iframe.style.display = 'block';
    }, 1000);

  }

  function closeIframe() {
    var iframe = document.getElementById(options.banner_id);
    iframe.parentNode.removeChild(iframe);
  }

  document.addEventListener('DOMContentLoaded', onDomContentLoaded, false);

  window.addEventListener('message', handleMessage, false);
  function handleMessage(message) {
    switch (message.data.action) {
      case 'close':
        closeIframe();
        break;
      default:

    }
  }

})();
