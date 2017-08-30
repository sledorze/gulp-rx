"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("rxjs/Observable");
const Vinyl = require("vinyl");
const fs = require("fs");
const watch = require('glob-watcher');
class VinylStreamGlobWatchObservable extends Observable_1.Observable {
    constructor(glob, options, scheduler) {
        super();
        this.glob = glob;
        this.options = options;
        this.scheduler = scheduler;
    }
    static create(glob, options, scheduler) {
        return new VinylStreamGlobWatchObservable(glob, options, scheduler);
    }
    _subscribe(subscriber) {
        const watcher = watch(this.glob, this.options);
        const scheduler = this.scheduler;
        const mustRead = this.options ? this.options.read !== false : true;
        const next = (mustRead === false) ?
            ((path) => scheduler == null
                ? subscriber.next(new Vinyl({ path, contents: null }))
                : !subscriber.closed && subscriber.add(scheduler.schedule(subscriber.next, 0, new Vinyl({ path, contents: null })))) : ((path) => fs.readFile(path, (err, contents) => {
            if (err) {
                scheduler == null
                    ? subscriber.error(err)
                    : !subscriber.closed && subscriber.add(scheduler.schedule(subscriber.error, 0, err));
            }
            else {
                scheduler == null
                    ? subscriber.next(new Vinyl({ path, contents }))
                    : !subscriber.closed && subscriber.add(scheduler.schedule(subscriber.next, 0, new Vinyl({ path, contents })));
            }
        }));
        const unlink = (path) => {
            scheduler == null
                ? subscriber.next(new Vinyl({ path, contents: null }))
                : !subscriber.closed && subscriber.add(scheduler.schedule(subscriber.next, 0, new Vinyl({ path, contents: null })));
        };
        watcher.on('add', next);
        watcher.on('change', next);
        watcher.on('unlink', unlink);
    }
}
exports.VinylStreamGlobWatchObservable = VinylStreamGlobWatchObservable;
