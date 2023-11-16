import { Injectable, Scope, Logger } from '@nestjs/common';

const ENABLED = true;
const DISABLED = false;
const RUNNING = true;
const STOPPED = false;

export interface StatisticInfo {
  numberOfBatches: number;
  numberOfTqvs: number;
  startTime: number;
  endTime: number;
  durationInMs: number;
  tqvsPerSeconds: number;
  succeedTqvs: number;
  failedTqvs: number;
  now: number;
}

export interface SenderOptions {
  maxTimeout: number;
  concurrency: number;
  maxRetry: number;
  retryDelay: number;
}

@Injectable({ scope: Scope.DEFAULT }) // Single instance
export class SenderStatistic {
  private logger = new Logger('SenderStatistic');

  private state: boolean = DISABLED;
  private numberOfTqvs = 0;
  private numberOfBatches = 0;
  private startTime = 0;
  private endTime = 0;
  private targetNumberOfTqvs = 0;
  private succeedTqvs = 0;
  private failedTqvs = 0;
  private statisticsStarted: boolean = STOPPED;
  private durationInMs = 0;
  private tqvsPerSeconds = 0;

  public now() {
    return Math.floor(Date.now());
  }

  public initStatistics(targetNumberOfTqvs: number) {
    this.state = ENABLED;
    this.numberOfTqvs = 0;
    this.numberOfBatches = 0;
    this.targetNumberOfTqvs = targetNumberOfTqvs;
    this.succeedTqvs = 0;
    this.failedTqvs = 0;
    this.statisticsStarted = STOPPED;
    this.tqvsPerSeconds = 0;
  }

  public startStatistics() {
    this.startTime = this.now();
    this.statisticsStarted = RUNNING;
  }

  public finishStatistics() {
    this.endTime = this.now();
    this.durationInMs = this.endTime - this.startTime;
    this.state = DISABLED;
    this.statisticsStarted = STOPPED;
    this.tqvsPerSeconds = (this.numberOfTqvs / this.durationInMs) * 1000;
    this.logger.log(`finishStatistics: completed: ${JSON.stringify(this.getStatistics())}`);
  }

  public updateStatistics(numberOfSucceedTqvs: number, numberOfFailedTqvs: number) {
    if (this.state === DISABLED) {
      return;
    }
    if (this.statisticsStarted === STOPPED) {
      this.startStatistics();
    }

    this.numberOfBatches++;
    this.succeedTqvs = this.succeedTqvs + numberOfSucceedTqvs;
    this.failedTqvs = this.failedTqvs + numberOfFailedTqvs;
    this.numberOfTqvs = this.succeedTqvs + this.failedTqvs;

    if (this.numberOfTqvs >= this.targetNumberOfTqvs) {
      this.finishStatistics();
    }
  }

  public getStatistics(): StatisticInfo | undefined {
    if (this.statisticsStarted === RUNNING) {
      return;
      // throw new PreconditionFailedException('Wait until data gathering is completed.');
    }
    return {
      numberOfBatches: this.numberOfBatches,
      numberOfTqvs: this.numberOfTqvs,
      startTime: this.startTime,
      endTime: this.endTime,
      durationInMs: this.durationInMs,
      tqvsPerSeconds: this.tqvsPerSeconds,
      succeedTqvs: this.succeedTqvs,
      failedTqvs: this.failedTqvs,
      now: this.now(),
    } as StatisticInfo;
  }
}
