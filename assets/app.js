'use strict';

var PublicServiceMessageApp = function PublicServiceMessageApp() {
  this.data = window.data;
  this.dataLocales = Object.keys(data);
};

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

PublicServiceMessageApp.prototype.decideMatchedLocale = function() {
  var index = this.dataLocales.indexOf(this.userLocale);
  if (index === -1) {
    index = this.dataLocales.indexOf(this.userLocale.substr(0, 2));
  }
  if (index === -1) {
    index = 0;
  }
  this.matchedLocale = this.dataLocales[index];
};

PublicServiceMessageApp.prototype.getData = function() {
  var localeData = this.data[this.matchedLocale];

  return localeData[Math.floor(Math.random() * localeData.length)];
};

PublicServiceMessageApp.prototype.start = function() {
  this.$container = $(this.CONTAINER_SELECTOR);

  this.decideUserLocale();
  this.decideMatchedLocale();

  var data = this.getData();
  this.show(data);
};
PublicServiceMessageApp.prototype.show = function(data) {
  var $card = $(this.TEMPLATE);
  $card.css('background-image', 'url("assets/data/' + data.backgroundImageFileName + '")');
  $card.find('.psm-card-link').prop('href', data.url);
  $card.find('.psm-card-link').prop('title', data.description);
  $card.find('.psm-card-link').on('click', function(evt) {
    if (!window._paq) {
      return;
    }
    /* category, action, opt_label, opt_value, opt_noninteraction */
    window._paq.push(['trackEvent', 'PSM', 'link', this.href]);
  });
  $card.find('.psm-card-title').text(data.title);
  if (data.iconImageFileName && data.siteTitle) {
    var $icon = $('<img>');
    $icon.prop('src', 'assets/data/' + data.iconImageFileName);
    $icon.prop('title', data.siteTitle);
    $card.find('.psm-card-title').prepend($icon);
  }
  this.$container.append($card);
};

var app = new PublicServiceMessageApp();
app.start();
