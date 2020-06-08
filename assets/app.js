'use strict';

var PublicServiceMessageApp = function PublicServiceMessageApp() {
  this.data = window.data;
  this.dataLocales = Object.keys(data);
};

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
  this.container = document.body;

  this.decideUserLocale();
  this.decideMatchedLocale();

  var data = this.getData();
  this.show(data);
};
PublicServiceMessageApp.prototype.show = function(data) {
  document.body.innerHTML = this.TEMPLATE;
  var cardEl = document.querySelector(".psm-card");

  cardEl.style.backgroundImage  = 'url("assets/data/' + data.backgroundImageFileName + '")';
  document.querySelector('.psm-card-link').href = data.url;
  document.querySelector('.psm-card-link').title = data.description;
  document.querySelector('.psm-card-link').addEventListener('click', function(evt) {
    if (!window._paq) {
      return;
    }
    /* category, action, opt_label, opt_value, opt_noninteraction */
    window._paq.push(['trackEvent', 'PSM', 'link', this.href]);
  });

  var titleEl = document.querySelector('.psm-card-title');
  titleEl.textContent = data.title;
  if (data.iconImageFileName && data.siteTitle) {
    var iconEl = document.createElement('img');
    iconEl.src = 'assets/data/' + data.iconImageFileName;
    iconEl.title = data.siteTitle;
    titleEl.insertBefore(iconEl, titleEl.firstChild);
  }
};

var app = new PublicServiceMessageApp();
app.start();
