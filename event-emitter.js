/**
 * EventEmitter (ES6) from:
 * https://gist.github.com/bloodyowl/41b1de3388c626796eca
 */

const DEFAULT_MAX_LISTENERS = 12;
const Console = window.console || {};

function error(...args) {
  Console.error.call(Console, ...args);
  Console.trace();
}

class EventEmitter {
  constructor() {
    this.maxListeners = DEFAULT_MAX_LISTENERS;
    this.events = {};
    this.pipeDestinations = [];
  }

  pipeEvents(destination) {
    this.pipeDestinations.push(destination);
  }

  unpipeEvents(destination) {
    const i = this.pipeDestinations.indexOf(destination);
    if (i === -1) return;
    this.pipeDestinations.splice(i, 1);
  }

  on(type, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError();
    }

    const listeners = this.events[type] || (this.events[type] = []);
    if (listeners.indexOf(listener) !== -1) {
      return this;
    }
    listeners.push(listener);

    if (listeners.length > this.maxListeners) {
      error(
        `possible memory leak, added %i %s listeners,
        use EventEmitter#setMaxListeners(number) if you
        want to increase the limit (%i now)`,
        listeners.length,
        type,
        this.maxListeners,
      );
    }
    return this;
  }

  once(type, listener) {
    const eventsInstance = this;
    function onceCallback(...args) {
      eventsInstance.off(type, onceCallback);
      listener.call(null, ...args);
    }
    return this.on(type, onceCallback);
  }

  off(type, ...args) {
    if (args.length === 0) {
      this.events[type] = null;
      return this;
    }

    const listener = args[0];
    if (typeof listener !== 'function') {
      throw new TypeError();
    }

    const listeners = this.events[type];
    if (!listeners || !listeners.length) {
      return this;
    }

    const indexOfListener = listeners.indexOf(listener);
    if (indexOfListener === -1) {
      return this;
    }

    listeners.splice(indexOfListener, 1);
    return this;
  }

  emit(type, ...args) {
    this.pipeDestinations.forEach((dest) => {
      dest.emit(type, ...args);
    });

    const listeners = this.events[type];
    if (!listeners || !listeners.length) {
      return false;
    }

    listeners.forEach((fn) => fn.call(null, ...args));

    return true;
  }

  setMaxListeners(newMaxListeners) {
    if (parseInt(newMaxListeners, 10) !== newMaxListeners) {
      throw new TypeError();
    }

    this.maxListeners = newMaxListeners;
  }
}

export default EventEmitter;
