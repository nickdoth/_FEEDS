import React, { Component } from 'react';
import { render } from 'react-dom';
import { Button, ProgressCircle, View, NavPane, NavPaneItem } from 'react-desktop/windows';
import $ from 'jquery';
import electron, { ipcRenderer } from 'electron';
const assign = Object.assign;

window._electron0 = electron;

var sections = ['心灵终结', '战舰少女R', '森罗万象'];

function Main(props) {
    console.log('Main');
    return (
    <div style={{ height: props.height }}>
        <header style={{ '-webkit-app-region': 'drag', boxSizing: 'border-box', padding: '6px 9px', width: props.width, height: '30px', background: 'rgba(227,227,227,.5)' }}>
            <div style={{ float: 'left' }}>FeedsView</div>
            <div style={{ float: 'right', color: 'red' }} onClick={() => window.close()}>Close</div>
        </header>
        <div className="navpane">
            <NavPane>
                {sections.map(sec => 
                    renderFeedNavPaneItem({
                        title: sec, 
                        selected: sec === props.selected, 
                        items: props.items,
                        feedsWidth: props.width - 250
                    })
                )}
            </NavPane>
        </div>
    </div>
    );
}

function renderFeedNavPaneItem({ title, selected, items, feedsWidth }) {
    return (
    <NavPaneItem title={title}
        selected={selected}
        onSelect={() => selectNav(title)}>
        <Feed title={title} items={items} feedsWidth={feedsWidth} />
    </NavPaneItem>
    );
}


function Feed(props) {
    return (
        <div className="feeds" style={({ zdisplay: '', zflex: 1, overflowY: 'scroll' })}>
            <div>
                {props.items.map(item => <FeedItem {...item} key={item.guid} feedsWidth={props.feedsWidth} />)}
            </div>
        </div>
    );
  }

function FeedItem(props) {
    var isSml = props.feedsWidth < 640
    return (
    <div className="feed-item">
        <Button push color={props.color} onClick={() => openLink(props.link)}  style={{ width: props.feedsWidth, padding: 10 }}>
            <h4 style={{ color: '#333', textAlign: 'left' }}>{props.title}</h4>
            <div style={{ }}>
                <img src={props.image} style={{ float: 'left', width: isSml? '100%' : '30%' }} />
                <div style={{ color: '#333', textAlign: 'left', flex: 2, paddingLeft: 6, float: 'left', width: isSml? '100%' : '70%' }}>
                    <p>{props.description}</p>
                </div>
            </div>
        </Button>
    </div>
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

var requestService = (function(channelName) {
    var reqId = 0;
    var requestPromises = {};

    ipcRenderer.on(channelName + '-reply', (event, arg) => {
        var promise = requestPromises[arg.id];
        promise.resolve(arg.reply);
        delete requestPromises[arg.id];
    });

    function send(msg) {
        var promise = new Promise((resolve, reject) => {
            var id = ++reqId;
            ipcRenderer.send(channelName, {
                id: id,
                msg: msg
            });

            requestPromises[id] = {
                resolve: resolve, reject: reject
            };
        })

        return promise;
    }

    return send;
})('service');

var setState = (function(initState = {}) {
    function setState(state = {}) {
        console.log('setState');
        initState = assign({}, initState, state);
        render(<Main {...initState} />, document.getElementById('main'));
    }

    return setState;
})({
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
    }).then(items => setState({ items, selected: title }));
}

function openLink(link) {
    if (typeof require !== 'undefined') {
        require('open')(link);
    }
    else {
        window.open(link);
    }
}

selectNav(sections[0]);

window.onresize = () => setState({
    width: window.innerWidth,
    height: window.innerHeight
});




// window.onresize = () => {
//     // width: window.innerWidth,
//     document.body.style.height = window.innerHeight + 'px';
// };