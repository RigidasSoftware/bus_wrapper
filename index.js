var service_bus = require('servicebus');

class Bus {

    constructor(options, implOpts) {

        let bus;
        let on_restart = options.on_restart;
        
        let init = () => {

            bus = service_bus.bus(options, implOpts);
            bus._subscribe = bus.subscribe;
            bus._publish = bus.publish;

            bus.subscribe = (queue_name, options) => {
                bus._subscribe(queue_name, (data, e) => {
                    let key = data.key;
                    if (options.callbacks) {
                        let cb = options.callbacks[key];
                        if (cb) {
                            cb(data.data);
                        }
                        else {
                            cb = options.callbacks['default'];
                            if (cb) {
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

        };

        let start = () => {
            try {
                init();

                bus.once('channel.close', event => {
                    console.error('channel closed');
                    failure(event);
                });

                console.log('bus connected');
                return true;
            }
            catch (e) {
                console.error('error starting bus: ' + e);
                return false;
            }
        };

        let failure = event => {
            console.error(event);
            try {
                try_restart();
            }
            catch (e) {
                console.error(e.stack || e);
            }
        };

        let tick;
        let try_restart = () => {
            tick = setInterval(() => {
                if (start() && tick) {
                    if(on_restart) {
                        on_restart(bus);
                    }
                    clearInterval(tick);
                }
            }, 10000);
        };

        start();

        return bus;
    }
}

module.exports = Bus;