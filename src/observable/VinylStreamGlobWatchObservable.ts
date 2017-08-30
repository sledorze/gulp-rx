

import { IScheduler } from 'rxjs/Scheduler';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { TeardownLogic } from 'rxjs/Subscription';

import { WatchOptions as ChokidarOptions } from 'chokidar'

import * as Vinyl from 'vinyl';
import * as fs from 'fs';
const watch = require('glob-watcher');


export type WatchOptions = ChokidarOptions & { read?: boolean }


export class VinylStreamGlobWatchObservable extends Observable<Vinyl> {

	static create(glob: string | string[], options?: WatchOptions, scheduler?: IScheduler): Observable<Vinyl> {
		return new VinylStreamGlobWatchObservable(glob, options, scheduler);
	}

	private constructor(private glob: string | string[], private options?: WatchOptions, private scheduler?: IScheduler) {
		super();
	}

	protected _subscribe(subscriber: Subscriber<Vinyl>): TeardownLogic {
		const watcher = watch(this.glob, this.options);
		const scheduler = this.scheduler;

		const mustRead = this.options ? this.options.read !== false : true

		const next =
			!mustRead ?
				(
					(path: string) =>
						scheduler == null
							? subscriber.next(new Vinyl({ path: path }))
							: !subscriber.closed && subscriber.add(scheduler.schedule(subscriber.next, 0, new Vinyl({ path: path })))
				) : (
					(path: string) =>
						fs.readFile(path, (err, data) => {
							if (err) {
								scheduler == null
									? subscriber.error(err)
									: !subscriber.closed && subscriber.add(scheduler.schedule(subscriber.error, 0, err));
							} else {
								scheduler == null
									? subscriber.next(new Vinyl({ path: path, contents: data }))
									: !subscriber.closed && subscriber.add(scheduler.schedule(subscriber.next, 0, new Vinyl({ path: path, contents: data })));
							}
						})
				)

		const unlink = (path: string) => {
			scheduler == null
				? subscriber.next(new Vinyl({ path: path, contents: null }))
				: !subscriber.closed && subscriber.add(scheduler.schedule(subscriber.next, 0, new Vinyl({ path: path, contents: null })));

		};

		watcher.on('add', next);
		watcher.on('change', next);
		watcher.on('unlink', unlink);
	}
}
