(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _windows = require('react-desktop/windows');

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assign = Object.assign;

window._electron0 = _electron2.default;

var sections = ['心灵终结', '战舰少女R', '森罗万象'];

function Main(props) {
    console.log('Main');
    return _react2.default.createElement(
        'div',
        { style: { height: props.height } },
        _react2.default.createElement(
            'header',
            { style: { '-webkit-app-region': 'drag', boxSizing: 'border-box', padding: '6px 9px', width: props.width, height: '30px', background: 'rgba(227,227,227,.5)' } },
            _react2.default.createElement(
                'div',
                { style: { float: 'left' } },
                'FeedsView'
            ),
            _react2.default.createElement(
                'div',
                { style: { float: 'right', color: 'red' }, onClick: function onClick() {
                        return window.close();
                    } },
                'Close'
            )
        ),
        _react2.default.createElement(
            'div',
            { className: 'navpane' },
            _react2.default.createElement(
                _windows.NavPane,
                null,
                sections.map(function (sec) {
                    return renderFeedNavPaneItem({
                        title: sec,
                        selected: sec === props.selected,
                        items: props.items,
                        feedsWidth: props.width - 250
                    });
                })
            )
        )
    );
}

function renderFeedNavPaneItem(_ref) {
    var title = _ref.title,
        selected = _ref.selected,
        items = _ref.items,
        feedsWidth = _ref.feedsWidth;

    return _react2.default.createElement(
        _windows.NavPaneItem,
        { title: title,
            selected: selected,
            onSelect: function onSelect() {
                return selectNav(title);
            } },
        _react2.default.createElement(Feed, { title: title, items: items, feedsWidth: feedsWidth })
    );
}

function Feed(props) {
    return _react2.default.createElement(
        'div',
        { className: 'feeds', style: { zdisplay: '', zflex: 1, overflowY: 'scroll' } },
        _react2.default.createElement(
            'div',
            null,
            props.items.map(function (item) {
                return _react2.default.createElement(FeedItem, _extends({}, item, { key: item.guid, feedsWidth: props.feedsWidth }));
            })
        )
    );
}

function FeedItem(props) {
    var isSml = props.feedsWidth < 640;
    return _react2.default.createElement(
        'div',
        { className: 'feed-item' },
        _react2.default.createElement(
            _windows.Button,
            { push: true, color: props.color, onClick: function onClick() {
                    return openLink(props.link);
                }, style: { width: props.feedsWidth, padding: 10 } },
            _react2.default.createElement(
                'h4',
                { style: { color: '#333', textAlign: 'left' } },
                props.title
            ),
            _react2.default.createElement(
                'div',
                { style: {} },
                _react2.default.createElement('img', { src: props.image, style: { float: 'left', width: isSml ? '100%' : '30%' } }),
                _react2.default.createElement(
                    'div',
                    { style: { color: '#333', textAlign: 'left', flex: 2, paddingLeft: 6, float: 'left', width: isSml ? '100%' : '70%' } },
                    _react2.default.createElement(
                        'p',
                        null,
                        props.description
                    )
                )
            )
        )
    );
}

// function FeedItem(props) {
//     return (
//     <div className="feed-item">
//         <Button push color={props.color} onClick={() => window.open(props.link)}>
//             <h4 style={{ color: '#333', textAlign: 'left' }}>{props.title}</h4>
//             <div style={{ float: 'left' }}>
//                 <img src={props.image} />
//                 <p style={{ color: '#333', textAlign: 'left' }}>{props.description}</p>
//             </div>
//         </Button>
//     </div>
//     );
// }

FeedItem.defaultProps = {
    // color: '#cc7f29'
    color: 'transparent',
    theme: 'medium-light'
};

var requestService = function (channelName) {
    var reqId = 0;
    var requestPromises = {};

    _electron.ipcRenderer.on(channelName + '-reply', function (event, arg) {
        var promise = requestPromises[arg.id];
        promise.resolve(arg.reply);
        delete requestPromises[arg.id];
    });

    function send(msg) {
        var promise = new Promise(function (resolve, reject) {
            var id = ++reqId;
            _electron.ipcRenderer.send(channelName, {
                id: id,
                msg: msg
            });

            requestPromises[id] = {
                resolve: resolve, reject: reject
            };
        });

        return promise;
    }

    return send;
}('service');

var setState = function () {
    var initState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    function setState() {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        console.log('setState');
        initState = assign({}, initState, state);
        (0, _reactDom.render)(_react2.default.createElement(Main, initState), document.getElementById('main'));
    }

    return setState;
}({
    items: [],
    selected: '',
    width: window.innerWidth,
    height: window.innerHeight
});

// render(<View>
//     <ProgressCircle color='#3a3' size={30} />
// </View>, document.getElementById('main'));


function selectNav(title) {
    // $.get(`/json/bilibili/${title}`).then(items => setState({ items, selected: title }));
    requestService({
        service: 'bilibili-search',
        args: {
            k: title
        }
    }).then(function (items) {
        return setState({ items: items, selected: title });
    });
}

function openLink(link) {
    if (typeof require !== 'undefined') {
        require('open')(link);
    } else {
        window.open(link);
    }
}

selectNav(sections[0]);

window.onresize = function () {
    return setState({
        width: window.innerWidth,
        height: window.innerHeight
    });
};

// window.onresize = () => {
//     // width: window.innerWidth,
//     document.body.style.height = window.innerHeight + 'px';
// };

},{"electron":undefined,"jquery":undefined,"open":undefined,"react":undefined,"react-desktop/windows":undefined,"react-dom":undefined}]},{},[1]);
