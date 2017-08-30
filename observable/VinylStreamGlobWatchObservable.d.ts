/// <reference types="vinyl" />
import { IScheduler } from 'rxjs/Scheduler';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { TeardownLogic } from 'rxjs/Subscription';
import { WatchOptions as ChokidarOptions } from 'chokidar';
import * as Vinyl from 'vinyl';
export declare type WatchOptions = ChokidarOptions & {
    read?: boolean;
};
export declare class VinylStreamGlobWatchObservable extends Observable<Vinyl> {
    private glob;
    private options;
    private scheduler;
    static create(glob: string | string[], options?: WatchOptions, scheduler?: IScheduler): Observable<Vinyl>;
    private constructor();
    protected _subscribe(subscriber: Subscriber<Vinyl>): TeardownLogic;
}
