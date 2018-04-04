let b = new Bus({
    host: '1.1.1.1',
    port: '5672',
    user: 'username',
    password: 'pw'
});

let pick_added = data => {
    console.log('pick_added: ' + JSON.stringify(data));
}

b.subscribe('my_queue', {
    callbacks: {
        my_event: pick_added,
        default: (key, data) => {
            console.log(key + ': ' + JSON.stringify(data))
        }
    }
});

var i = 0;
setInterval(() => {
    b.publish('my_queue.my_event', { data: ++i })
}, 1000);