var app = require('express')();

app.get('/bilibili/:k', (req, res) => {
    console.log(`[${(new Date).toTimeString()}] bilibili-search; k = ${req.params.k}`);
    require('./processers/bilibili-search').fetch(req.params).then((items) => {
        res.type('application/rss+xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0">
<channel>
    <title>bilibili RSS</title>
    <link>http://search.bilibili.com/</link>
    <description>http://search.bilibili.com/</description>
    <lastBuildDate>${(new Date()).toUTCString()}</lastBuildDate>
    ${items.map(item => {
        return `
            <item>
                <title>${item.title}</title>
                <link>${item.link}</link>
                <description>${item.description}</description>
                <guid>${item.guid}</guid>
            </item>
        `;
    }).join('\n')}
</channel>
</rss>
        `);
    });
});

app.get('/show/bilibili/:k', (req, res) => {
    require('./processers/bilibili-search')(req.params).then((items) => {
        res.type('text/html');
        res.send(`<html>
    <head>
        <title>bilibili RSS</title>
    </head>
    <body>
    <h1>http://search.bilibili.com/</h1>
    <h2>http://search.bilibili.com/</h2>
    <span>Last Update: ${(new Date()).toUTCString()}</span>
    ${items.map(item => {
        return `
            <div>
                <h3>${item.title}</h3>
                <a href="${item.link}">${item.link}</a>
                <p>${item.description}</p>
                <!-- guid: ${item.guid} -->
            </div>
        `;
    }).join('\n')}
    </body>
</html>
        `);
    });
});

app.get('/json/bilibili/:k', (req, res) => {
    res.type('application/json');
    require('./processers/bilibili-search')(req.params).then((items) => {
        res.json(items);
    });
});

app.get('/list', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/bundle.js', (req, res) => {
    res.sendFile(__dirname + '/client/bundle.js');
});

app.listen(8119);

// localhost:8119/bilibili/心灵终结