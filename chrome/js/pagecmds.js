// Glee Page (!) Commands

// help: Opens the gleeBox manual page in a new tab
Glee.help = function(newtab) {
  Glee.Browser.openURL('http://thegleebox.com/manual.html', newtab, true);
  if (newtab) {
    Glee.empty();
  }
};

// tipjar: Opens the gleeBox TipJar site
Glee.tipjar = function(newtab) {
  Glee.Browser.openURL('http://tipjar.thegleebox.com/', newtab, true);
  if (newtab) {
    Glee.empty();
  }
};

// rss: Opens the rss feed of page in google reader
Glee.getRSSLink = function(newtab) {
  // code via bookmark for google reader
  var b = document.body;var GR________bookmarklet_domain = 'http://www.google.com';if (b && !document.xmlVersion) {void(z = document.createElement('script'));void(z.src = 'http://www.google.com/reader/ui/subscribe-bookmarklet.js');void(b.appendChild(z));}else {location = 'http://www.google.com/reader/view/feed/' + encodeURIComponent(location.href)}
};

// tweet: Opens the twitter sharing window with the title and shortened URL of the current page in the text field
Glee.sendTweet = function() {
  // http://dev.twitter.com/pages/share_bookmarklet
  window.twttr = window.twttr || {};
  var D = 550, A = 450, C = screen.height, B = screen.width, H = Math.round((B / 2) - (D / 2)), G = 0, F = document, E;
  var url = twitterBookmarklet();
  if (C > A) {G = Math.round((C / 2) - (A / 2))}
    window.twttr.shareWin = window.open(url, '', 'left=' + H + ',top=' + G + ',width=' + D + ',height=' + A + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1');

  // slightly modified code from http://platform.twitter.com/bookmarklets/share.js?v=1
  function twitterBookmarklet() {
   function B(L) {var M = [], K = 0, J = L.length;for (; K < J; K++) {M.push(L[K])}return M}function G(J) {return encodeURIComponent(J).replace(/\+/g, '%2B')}function C(L) {var K = [], J;for (J in L) {if (L[J] !== null && typeof L[J] !== 'undefined') {K.push(G(J) + '='+ G(L[J]))}}return K.sort().join('&')}function H() {var K = document.getElementsByTagName('a'), Q = document.getElementsByTagName('link'), J = /\bme\b/, M = /^https?\:\/\/(www\.)?twitter.com\/([a-zA-Z0-9_]+)$/, P = B(K).concat(B(Q)), O, S, L, N = 0, R;for (; (R = P[N]); N++) {S = R.getAttribute('rel');L = R.getAttribute('href');if (S && L && S.match(J) && (O = L.match(M))) {return O[2]}}}function F(K) {var J;if (K.match(/^https?:\/\//)) {return K}else {J = location.host;if (location.port.length > 0) {J += ':'+ location.port}return [location.protocol, '//', J, K].join('')}}function I() {var J = document.getElementsByTagName('link');for (var K = 0, L; (L = J[K]); K++) {if (L.getAttribute('rel') == 'canonical') {return F(L.getAttribute('href'))}}return null}var D = (function() {var K = {text: decodeURIComponent(document.title), url: (I() || location.href), _: ((new Date()).getTime())};var J = H();if (J) {K.via = J}return C(K)}());var E = window.twttr.shareWin, A = 'http://twitter.com/share?'+ D;
   return A;
 };
};

// inspect: Displays the jQuery selector if only one matching element is returned.
Glee.inspectPage = function() {
  var query = Glee.value().substring(9);
  LinkReaper.reapLinks(query);
  Glee.selectedElement = LinkReaper.getFirst();
  Glee.scrollToElement(Glee.selectedElement);
  if (LinkReaper.selectedLinks.length > 1) {
    Glee.setState('Tab through and select the element you want to inspect and press Enter', 'msg');
    Glee.inspectMode = true;
  }
  else {
    var generator = new SelectorGenerator(null, ['GleeHL']);
    var selector = generator.generate(Glee.selectedElement);
    // if a valid selector is returned
    if (selector) {
      var value = '*' + selector;
      Glee.value(value);
      Glee.lastQuery = value;
      Glee.Events.executeJQuerySelector(selector);
    }
    else {
      Glee.setState('No matching element found', 'msg');
    }
    return;
  }
  Glee.setSearchActivity(false);
};

// share: Share current page in mail/twitter/facebook. Makes use of the AddThis service
Glee.sharePage = function(newtab) {
  var site = Glee.value().substring(6).replace(' ', '');
  var loc = null;
  // get description
  var desc = $('meta[name=description],meta[name=Description],meta[name=DESCRIPTION]').attr('content');
  if ((!desc) || (desc == '')) {
    mailDesc = '';
    desc = '';
  }
  else {
    mailDesc = '  -  ' + desc; 
  }
  // Encode
  enUrl = encodeURIComponent(location.href);
  enTitle = encodeURIComponent(document.title);
  enDesc = encodeURIComponent(desc);
  enMailDesc = encodeURIComponent(mailDesc);

  // Short names of favorite services
  if (site === 'su')
    site = 'stumbleupon';
  else if (site === 'buzz')
    site = 'googlebuzz';
  else if (site === 'fb')
    site = 'facebook';
  else if (site === 'reader')
    site = 'googlereader';

  switch (site) {
    case 'g':
    case 'gmail':
      loc = 'https://mail.google.com/mail/?view=cm&ui=1&tf=0&to=&fs=1&su='
      + enTitle
      + '&body='
      + enUrl
      + enMailDesc;
      break;
    case 'm':
    case 'mail':
      loc = 'mailto:?subject='
      + document.title
      + '&body='
      + location.href
      + mailDesc;
      break;
    case 'deli':
    case 'delicious':
      loc = 'http://delicious.com/save?title='
      + enTitle
      + '&url='
      + enUrl
      + '&notes='
      + enDesc;
      break;
    case 't':
    case 'twitter':
      Glee.sendTweet(newtab);
      return;
    case '':
      loc = 'http://api.addthis.com/oexchange/0.8/offer?url='
      + enUrl
      + '&title='
      + enTitle;
      break;
    default:
      loc = 'http://api.addthis.com/oexchange/0.8/forward/'
      + site
      + '/offer?url='
      + enUrl
      + '&title='
      + enTitle;
  }
  if (loc) {
    if (newtab)
      Glee.Browser.openURL(loc, true, true);
    else
      location.href = loc;
  }
};

// read: Make the current page readable using Readability
Glee.makeReadable = function() {
  // code from the Readability bookmarklet (http://lab.arc90.com/experiments/readability/)
  location.href = 'javascript:(%28function%28%29%7Bwindow.baseUrl%3D%27https%3A//www.readability.com%27%3Bwindow.readabilityToken%3D%27%27%3Bvar%20s%3Ddocument.createElement%28%27script%27%29%3Bs.setAttribute%28%27type%27%2C%27text/javascript%27%29%3Bs.setAttribute%28%27charset%27%2C%27UTF-8%27%29%3Bs.setAttribute%28%27src%27%2CbaseUrl%2B%27/bookmarklet/read.js%27%29%3Bdocument.documentElement.appendChild%28s%29%3B%7D%29%28%29);';
  Glee.close();
};

// kindle: Send the current page to your Kindle using Readability
Glee.sendToKindle = function() {
  //code from the Readability bookmarklets (http://www.readability.com/bookmarklet/)
  location.href = 'javascript:(%28function%28%29%7Bwindow.baseUrl%3D%27https%3A//www.readability.com%27%3Bwindow.readabilityToken%3D%27%27%3Bvar%20s%3Ddocument.createElement%28%27script%27%29%3Bs.setAttribute%28%27type%27%2C%27text/javascript%27%29%3Bs.setAttribute%28%27charset%27%2C%27UTF-8%27%29%3Bs.setAttribute%28%27src%27%2CbaseUrl%2B%27/bookmarklet/send-to-kindle.js%27%29%3Bdocument.documentElement.appendChild%28s%29%3B%7D%29%28%29)';
  Glee.close();
};

// shorten: Shortens the current page's URL using bit.ly and displays the shortened URL in gleeBox
Glee.shortenURL = function() {
  this.Browser.sendRequest('http://api.bit.ly/shorten?version=2.0.1&longUrl='+ encodeURIComponent(location.href) + '&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82', 'GET',
  function(data) {
    var json = JSON.parse('['+ data + ']');
    var shortenedURL = json[0].results[location.href].shortUrl;
    Glee.value(shortenedURL);
    Glee.setState('Shortened URL copied to your clipboard!', 'msg');
    // copy URL to clipboard.
    Glee.Browser.copyToClipboard(shortenedURL);
  });
};

// v: Play/Pause YouTube videos
Glee.controlVideo = function() {
  var yPlayer = document.getElementById('movie_player'); //for YouTube
  var func = Glee.value().substring(2).replace(' ', '');
  if (yPlayer) {
    setTimeout(function() {
      Glee.scrollToElement(yPlayer);
    }, 0);
    var playerState = yPlayer.getPlayerState();
    // default function is to toggle video state (play/pause)
    if (func == '') {
      if (playerState == 1 || playerState == 3)
        yPlayer.pauseVideo();
      else if (playerState == 2)
        yPlayer.playVideo();
      else if (playerState == 0) {
        yPlayer.seekTo(0, 0);
        yPlayer.playVideo();
      }
    }
  }
  Glee.close();
};

// set: Set the value of a gleeBox option from inside gleeBox
// Syntax: !set option-name=option-value
Glee.setOptionValue = function() {
  var valid = true;
  var validOptions = [
    'scroll',
    'hyper',
    'size',
    'pos', 'position',
    'theme',
    'bsearch',
    'esp',
    'vision',
    'visions+',
    'scrapers+'
  ];

  // Checking if syntax is valid. Valid syntax is !set <valid-option>=<valid-value>
  var input = Glee.value().substring(4);
  var eqPos = input.indexOf('=');
  if (eqPos == -1) {
    valid = false;
  }
  else {
    var option = input.substring(0, eqPos).replace(/\s+|\s+/g, '');
    var value = $.trim(input.substring(eqPos + 1));
  }

  if (option === 'vision') {
    // TODO: implement for all protocols
    var url = location.href.replace('http://', '');
    // remove trailing / (if present)
    if (url[url.length - 1] == '/') {
      url = url.substring(0, url.length - 1);
    }
    value = {url: url, selector: value};
  }
  if (option === 'visions+') {
    var separator = value.indexOf(':');

    if ($.inArray($.trim(value.substring(0, separator)), ['http', 'https']) != -1) {
      separator = separator + 1 + value.substring(separator + 1, value.length).indexOf(':');
    }

    var url = $.trim(value.substring(0, separator));
    var sel = value.substring(separator + 1, value.length);
    if (url === '$') {
      url = location.href.replace('http://', '');
      url = (url[url.length - 1] == '/') ? url.substring(0, url.length - 1) : url;
    }
    value = {url: url, selector: sel};
  }
  if (option === 'scrapers+') {
    var separator = value.indexOf(':');
    var cmd = $.trim(value.substring(0, separator));
    var sel = value.substring(separator + 1, value.length);
    value = {command: cmd, selector: sel};
  }

  if (option === '' || $.inArray(option, validOptions) == -1)
    valid = false;
  else if ((option === 'scroll' 
            || option === 'hyper' 
            || option === 'bsearch' 
            || option === 'esp')
          && $.inArray(value, ['on', 'off']) == -1)
    valid = false;

  else if (option === 'size' 
          && $.inArray(value, ['small', 'medium', 'med', 'large']) == -1)
    valid = false;

  else if ((option === 'position' || option === 'pos') 
          && $.inArray(value, ['top', 'mid', 'middle', 'bottom']) == -1)
    valid = false;

  else if (option === 'theme' 
          && $.inArray(value, ['default', 'white', 'console', 'greener', 'ruby', 'glee']) == -1)
    valid = false;
  
  // if failed validity test, return
  if (!valid) {
    Glee.setState('Invalid !set syntax. Please refer manual using !help command', 'msg');
    return;
  }

  Glee.Browser.setOption(option, value);
};
