var jsdom = require('jsdom');

module.exports = {
    displayName: 'Bilibili上的搜索结果',

    fetch(args) {
        return new Promise((resolve, reject) => {
            jsdom.env(`http://search.bilibili.com/all?keyword=${encodeURIComponent(args.k)}&page=1&order=pubdate`, (err, window) => {
                if (err) return reject(err);
                var items = Array.from(window.document.querySelectorAll('li.matrix'))
                .map((el) => {
                    return {
                        title: el.querySelector('.info a.title').title.trim(),
                        description: el.querySelector('.info .des').innerHTML.trim(),
                        link: el.querySelector('.info a.title').href,
                        guid: el.querySelector('.info a.title').href,
                        image: el.querySelector('.img img').src
                    }
                });

                resolve(items);
            });
        });
    }
}

// module.exports({ k: '心灵终结' }).then((items) => console.log(items));