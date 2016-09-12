#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request');

var rootDir = path.join(__dirname, '..');
var config = JSON.parse(fs.readFileSync(path.join(rootDir, 'config.json')));
var messages = JSON.parse(fs.readFileSync(path.join(rootDir, 'messages.json')));

var data = {};

function getAndSaveImage(imgUrl, imgFileName) {
  return new Promise((res, rej) => {
    request.get({
      url: imgUrl,
      encoding: null
    },
    (err, response, body) => {
      if (err) {
        return rej(err);
      }

      fs.writeFileSync(
        path.join(rootDir, 'assets', 'data', imgFileName),
        body);
      return res();
    });
  });
}

var p = Promise.resolve();

for (var locale in messages) {
  ((locale) => {
    data[locale] = [];
    messages[locale].forEach((url) => {
      p = p.then(() => {
        return new Promise((res, rej) => {
          request.get({
            url: config.apiURL,
            qs: {
              api_key: config.apiKey,
              url: url,
              group: true,
              rel: 'thumbnail'
            }
          },
          (err, response, body) => {
            if (err) {
              return rej(err);
            }
            var info = JSON.parse(body);

            if (info.error) {
              return rej({
                url: url,
                apiError: info
              });
            }

            var imgUrl = info.links.thumbnail[0].href;
            var imgFileName = imgUrl
              .substr(imgUrl.indexOf('//') + 2)
              .replace(/[\/\\]/g, '-')
              .replace(/\?.+$/, '');
            p = Promise.all([p, getAndSaveImage(imgUrl, imgFileName)]);

            var dataInfo = {
              url: info.meta.canonical || url,
              backgroundImageFileName: imgFileName,
              title: info.meta.title,
              description: info.meta.description
            };

            if (info.links.icon && info.meta.site) {
              var iconUrl = info.links.icon[0].href;
              var iconFileName = iconUrl
                .substr(iconUrl.indexOf('//') + 2)
                .replace(/[\/\\]/g, '-')
                .replace(/\?.+$/, '');
              p = Promise.all([p, getAndSaveImage(iconUrl, iconFileName)]);

              dataInfo.siteTitle = info.meta.site;
              dataInfo.iconImageFileName = iconFileName;
            }

            data[locale].push(dataInfo);

            return res();
          });
        });
      });
    });
  })(locale);
}

p = p.then(() => {
  fs.writeFileSync(rootDir + '/assets/data.js',
    '// Machine generated, do not edit.\n\n' +
    'var data = \n' + JSON.stringify(data, null, 2) + ';');
});

p.catch((e) => console.error(e));
