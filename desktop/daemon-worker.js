'use strict';
var http = require('http');
var Eventemitter = require('events').EventEmitter;

class Watcher extends Eventemitter {
    constructor(fetchInfo, checkInterval) {
        super();
        // this.fetchUrl = fetchUrl;
        this.fetchInfo = fetchInfo;
        this.checkInterval = checkInterval;
        this.switch = true;

        Object.defineProperty(this, 'localFeeds', {
            get() {
                return this._localFeeds;
            },
            set(val) {
                this._localFeeds = val;
                this.saveLocalFeeds();
            }
        })
    }

    start() {
        if (!this.switch) {
            this.switch = true;
            return;
        }

        this.initLocalFeeds().then(() => {
            this.run().then(() => {
                setTimeout(() => this.start(), this.checkInterval);
            }).catch((err) => {
                console.error('Watcher.start(): Error:', err);
                setTimeout(() => this.start(), this.checkInterval / 10);
            });
        });
    }

    stop() {
        this.switch = false;
    }

    initLocalFeeds() {
        // as-is
        if (this.localFeeds) return Promise.resolve();
        return this.fetch().then((data) => {
            this.localFeeds = data;
        });
    }

    saveLocalFeeds() {
        //as-is
        return;
    }

    /**
     * @private
     */
    run() {
        return this.fetch().then((data) => {
            var notices = getNewFeeds(this.localFeeds, data);
            this.localFeeds = data;
            notices.length && console.info('[INFO] Got new feeds:', notices);
            notices.length && this.emit('update', notices);
        });
    }

    fetchFromServer() {
        return new Promise((resolve) => {
            var data = '';
            // console.log('fetchUrl', this.fetchUrl);
            http.get(this.fetchUrl, (res) => {
                res.on('data', (chunk) => {
                    data += chunk.toString();
                }).on('end', () => {
                    resolve(JSON.parse(data));
                })
            }).on('error', (err) => {
                console.error('http.get error:', err);
                throw err;
            });
        });
    }

    fetch() {
        var service = require(`../processers/${this.fetchInfo.service}`);
        return service.fetch(this.fetchInfo.args);
    }

    
}

function getNewFeeds(currentFeeds, nextFeeds) {
    var notices = [];
    for (var i = 0; 
        !feedEquals(currentFeeds[0], nextFeeds[i]) && i < nextFeeds.length;
        ++i) {
        notices.push(nextFeeds[i]);
    }
    // console.log('nextFeeds:', nextFeeds.length, 'Same in i =', i);
    return notices;
}

function feedEquals(a, b) {
    if (!b) return false;
    return a.guid === b.guid;
}

// test main

// var w0 = new Watcher('http://localhost:8119/json/bilibili/%E6%88%98%E8%88%B0%E5%B0%91%E5%A5%B3R', 600000);
// w0.start();
// w0.on('update', (notices) => console.log(notices));

exports.Watcher = Watcher;