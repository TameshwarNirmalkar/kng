import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotifyService } from './notify.service';
import { LoggerService } from './logger.service';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

@Injectable()
export class ExceptionService implements OnDestroy {

  private subscription: Subscription;

  constructor(private notifyService: NotifyService, private logger: LoggerService) { }

  ngOnDestroy() {

  }

  subscribeErrorLogging() {
    this.notifyService.notifyErrorObservable$.pipe(untilComponentDestroyed(this)).subscribe((res) => {
      if (res.hasOwnProperty('component') && res.hasOwnProperty('error')) {
        this.logger.logError(res.component, res.error);
      }
    });
  }
}
