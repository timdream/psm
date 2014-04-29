'use strict';

var PublicServiceMessageApp = function PublicServiceMessageApp() {
  this.messages = [
    /* en */
    [
      'http://www.bbc.com/news/world-asia-27184298',
      'http://4am.tw/'
    ],
    /* zh-TW */
    [
      'http://nonukeyesvote.tw/whynonuke.php',
      'http://nonuke.today/',
      'https://billy3321.github.io/tisa2/'
    ]
  ];

  this.locales = ['en', 'zh-TW'];
};

PublicServiceMessageApp.prototype.IFRAMELY_API_KEY =
  'a3fa332969aa7a719fc658';

PublicServiceMessageApp.prototype.IFRAMELY_API_URL =
  'http://iframely.com/iframely';

PublicServiceMessageApp.prototype.CONTAINER_SELECTOR = 'body';

PublicServiceMessageApp.prototype.TEMPLATE = '<div class="psm-card">' +
  '<a target="_blank" class="psm-card-overlay psm-card-link">' +
    '<p class="psm-card-title"></p>'
  '</a>' +
'</div>';

PublicServiceMessageApp.prototype.decideUserLocale = function() {
  if (window.location.hash.indexOf('locale=') !== -1) {
    this.userLocale = window.location.hash.match(/locale=([\w\-]*)/)[1];

    return;
  }

  var userLocale = navigator.language || navigator.userLanguage;
  userLocale = userLocale.replace(/-[a-z]{2}$/i, function(str) {
    return str.toUpperCase();
  });
  this.userLocale = userLocale;
};

PublicServiceMessageApp.prototype.decideLocaleIndex = function() {
  var index = this.locales.indexOf(this.userLocale);
  if (index === -1) {
    index = this.locales.indexOf(this.userLocale.substr(0, 2));
  }
  if (index === -1) {
    index = 0;
  }
  this.localeIndex = index;
};

PublicServiceMessageApp.prototype.getRandomMessageUri = function() {
  var localeMessage = this.messages[this.localeIndex];
  return localeMessage[Math.floor(Math.random() * localeMessage.length)];
};

PublicServiceMessageApp.prototype.start = function() {
  this.$container = $(this.CONTAINER_SELECTOR);

  this.decideUserLocale();
  this.decideLocaleIndex();

  var uri = this.getRandomMessageUri();

  $.getJSON(
    this.IFRAMELY_API_URL,
    {
      'api_key': this.IFRAMELY_API_KEY,
      'uri': uri,
      'group': 'true',
      'rel': 'thumbnail'
    }
  ).success(function(data) {
    this.show(data, uri)
  }.bind(this));
};
PublicServiceMessageApp.prototype.show = function(data, uri) {
  var $card = $(this.TEMPLATE);
  $card.css('background-image', 'url("' + data.links.thumbnail[0].href + '")');
  $card.find('.psm-card-link').prop('href', data.meta.canonical || uri);
  $card.find('.psm-card-link').prop('title', data.meta.description);
  $card.find('.psm-card-link').on('click', function(evt) {
    if (!window._gaq) {
      return;
    }
    /* category, action, opt_label, opt_value, opt_noninteraction */
    window._gaq.push(['_trackEvent', 'PSM', 'link', this.href]);
  });
  $card.find('.psm-card-title').text(data.meta.title);
  this.$container.append($card);
};

var app = new PublicServiceMessageApp();
app.start();