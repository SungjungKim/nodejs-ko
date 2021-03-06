const { get } = require('https');
const { createWriteStream } = require('fs');
const replaceStream = require('replacestream');
const URL = process.argv[2];
const DATE = process.argv[3];
const POST_PATH = "./source/_posts/";

if (!URL) {
  console.info("A github raw url needed.");
  console.info("\tmore info) http://nodejs.github.io/nodejs-ko/CONTRIBUTING.html");
  return;
}

class TranslateScaffold {
  constructor(url, date) {
    this.url = url;
    this.date = date;
  }

  get isWeekly() {
    return this.url.indexOf("weekly-updates") > -1;
  }

  get fileName() {
    if (this.isWeekly) {
      return `${this.url.match(/\d{4}-\d{2}-\d{2}/)[0]}-weekly.md`;
    } else {
      return this.url.match(/blog\/(.+)\.md/)[0].replace(/\//g, "-").replace("blog", this.date);
    }
  }
  get filePath() {
    return `${POST_PATH}${this.fileName}`;
  }

  get file() {
    return createWriteStream(this.filePath);
  }

  get replaceText() {
    if (this.isWeekly) {
      return replaceStream(/---\n((?:.+\n)+)---/m,
                           (_, head) => `---
category: weekly
title: Node.js 주간 뉴스 ${head.match(/date: (\d{4}-\d{2}-\d{2})/)[1].replace(/-0?/, "년 ").replace(/-0?/, "월 ")}일
author: ${head.match(/author: (.+)/)[1]}
ref: ${head.match(/title: (.+)/)[1]}
refurl: https://nodejs.org/en/blog/${this.url.match(/blog\/(.+)\.md/)[1]}/
translator:
---`)
    } else {
      return replaceStream(/---\n((?:.+\n)+)---/m,
                           (_, head) => `---
category: articles
title:
author: ${head.match(/author: (.+)/)[1]}
ref: ${head.match(/title: (.+)/)[1]}
refurl: https://nodejs.org/en/blog/${this.url.match(/blog\/(.+)\.md/)[1]}/
translator:
---`)
    }
  }
}


get(URL, function(response) {
  const scaffold = new TranslateScaffold(URL, DATE);
  response
    .pipe(scaffold.replaceText)
    .pipe(scaffold.file);
});
