var service_bus = require('servicebus');

class Bus {

    constructor(options, implOpts) {

        let bus;
        let on_restart = options.on_restart;
        
        let self = this;

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

        this.start = () => {
            try {
                self.init();
                
                bus.once('channel.close', event => {
                    console.error('channel closed');
                    self.failure(event);
                });

                console.log('bus connected');
                return true;
            }
            catch (e) {
                console.error('error starting bus: ' + e);
                return false;
            }
        };

        this.failure = event => {
            console.error(event);
            try {
                self.try_restart();
            }
            catch (e) {
                console.error(e.stack || e);
            }
        };

        this.tick;
        this.try_restart = () => {
            self.tick = setInterval(() => {
                if (self.start() && self.tick) {
                    if(on_restart) {
                        on_restart(bus);
                    }
                    clearInterval(self.tick);
                }
            }, 10000);
        };

        this.start();

        return bus;
    }
}

module.exports = Bus;