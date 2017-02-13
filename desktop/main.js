const electron = require('electron');
const { Menu, BrowserWindow, Tray, app, ipcMain } = electron;
const { Watcher } = require('./daemon-worker');
const notifier = require('node-notifier');
const open = require('open');

let mainWindow;

let daemonRun = false;

function onReady() {
    startDaemon();
    if (!daemonRun) {
        createWindow();
    }
}

function createWindow() {
    // app.dock.show();
    if (mainWindow) {
        mainWindow.show();
        return;
    }
    mainWindow = new BrowserWindow({
        transparent: true,
        frame: false,
        vibrancy: 'ultra-light'
    });
    mainWindow.loadURL('file://' + __dirname + '/../client/index.html');
    console.log('file://' + __dirname + '/../client/index.html');
    mainWindow.on('close', () => {
        mainWindow = null;
    });

    // mainWindow.webContents.openDevTools();
}

var tray;
function startDaemon() {
    tray = new Tray(`${__dirname}/../client/rss-symbol.png`);
    const menu = Menu.buildFromTemplate([
        { label: 'Show', click () { createWindow() } }
    ]);

    tray.setContextMenu(menu);
    // console.log(tray);

    ipcMain.on('service', (event, res) => {
        require(`../processers/${res.msg.service}`).fetch(res.msg.args).then((data) => {
            event.sender.send('service-reply', {
                id: res.id,
                reply: data
            });
        })
    });

    
    notifier.on('click', (notifierObj, options, m) => {
        // console.log(notifierObj, options, m);
        if (options.link) {
            open(link);
        }
    });

    notifier.notify({
        title: 'FeedsViewer',
        message: 'FeedsViewer daemon started',
        open: 'https://www.google.com',
        wait: true,
        timeout: 7200
    });

    // var watchers = ['战舰少女R', '心灵终结']
    //     .map(encodeURIComponent)
    //     .map(n => 'http://localhost:8119/json/bilibili/' + n)
    //     .map(n => new Watcher(n, 300000))
    var watchers = ['战舰少女R', '心灵终结']
        .map(n => ({
            service: 'bilibili-search',
            args: { k: n }
        }))
        .map(fetchInfo => new Watcher(fetchInfo, 300000))
    watchers.forEach(w => {
        w.on('update', (notices) => {
            notices.forEach(n => {
                notifier.notify({
                    title: n.title,
                    message: n.description,
                    // link: n.link,
                    open: n.link,
                    wait: true,
                    timeout: 7200
                });
            })
        });
        w.start();
    });
}

app.dock.hide();

app.on('ready', onReady);

app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin') {
    //     app.quit();
    // }
    app.dock.hide();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});