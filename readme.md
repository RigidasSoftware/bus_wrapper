```js

let b = new Bus({
    host: '1.1.1.1',
    port: '5672',
    user: 'username',
    password: 'pw'
});

let my_event = data => {
    console.log('my_event: ' + JSON.stringify(data));
}

b.subscribe('my_queue', {
    callbacks: {
        my_event: my_event,
        default: (key, data) => {
            console.log(key + ': ' + JSON.stringify(data))
        }
    }
});

var i = 0;
setInterval(() => {
    b.publish('my_queue.my_event', { data: ++i })
}, 1000);

```
