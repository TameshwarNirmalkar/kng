import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService, NotifyService } from '@kng/core';
import { timer } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, OnDestroy {

  public selectedDisplayName: string;
  public msgs: string[] = [];

  constructor(
    private messageService: MessageService,
    private notify: NotifyService
  ) {
  }

  ngOnInit() {
    this.notify.notifyShowGrowlMsgObservable$.pipe(untilComponentDestroyed(this)).subscribe(data => {
      this.msgs = [];
      this.messageService.invokeGrowlMessage(data.severity, data.messageCode, this.msgs);
      timer(3000).pipe(untilComponentDestroyed(this)).subscribe(res => {
        this.msgs = [];
      });
    });
  }

  ngOnDestroy() {

  }

}
