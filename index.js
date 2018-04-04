var service_bus = require('servicebus');

function Bus(options, implOpts) {
    var bus = service_bus.bus(options, implOpts);

    bus._subscribe = bus.subscribe;
    bus._publish = bus.publish;

    bus.subscribe = (queue_name, options) => {
        bus._subscribe(queue_name, (data, e) => {
            let key = data.key;
            if(options.callbacks){
                let cb = options.callbacks[key];
                if(cb) {
                    cb(data.data);
                }
                else {
                    cb = options.callbacks['default'];
                    if(cb) {
                        cb(key, data.data);
                    }
                }
            }
        });
    };

    bus.publish = (queue, data) => {
        let queue_parts = queue.split('.');
        let queue_name = queue_parts[0];
        let key = queue_parts.length > 1 ? queue_parts[1] : '';
        bus._publish(queue_name, {
            key: key,
            data: data
        });
    };

    return bus;
}

module.exports = Bus;