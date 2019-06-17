import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from './notify.service';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

@Injectable()
export class MessageService implements OnDestroy {

  constructor(private translateService: TranslateService, private notify: NotifyService) { }

  ngOnDestroy() {

  }

  showSuccessGrowlMessage(messageCode: any) {
    this.notify.showGrowlMsg({ severity: 'success', messageCode: this.sanitizeCode(messageCode) });
  }

  showInfoGrowlMessage(messageCode: any) {
    this.notify.showGrowlMsg({ severity: 'info', messageCode: this.sanitizeCode(messageCode) });
  }

  showErrorGrowlMessage(messageCode: any) {
    this.notify.showGrowlMsg({ severity: 'error', messageCode: this.sanitizeCode(messageCode) });
  }

  sanitizeCode(messageCode: string) {
    let msgCode = messageCode;
    if (messageCode && messageCode.indexOf('[') > 0 && messageCode.indexOf(']') > 0) {
      msgCode = messageCode.substring(messageCode.indexOf('[') + 1, messageCode.indexOf(']'));
    }
    return msgCode;
  }

  showDynamicErrorGrowlMessage(messageCode: any, params: any) {
    this.translateService.get(messageCode, params).pipe(untilComponentDestroyed(this)).subscribe((res: string) => {
      this.showErrorGrowlMessage(res);
    });
  }

  showDynamicSuccessGrowlMessage(messageCode: any, params: any) {
    this.translateService.get(messageCode, params).pipe(untilComponentDestroyed(this)).subscribe((res: string) => {
      this.showSuccessGrowlMessage(res);
    });
  }

  showDynamicInfoGrowlMessage(messageCode: any, params: any) {
    this.translateService.get(messageCode, params).pipe(untilComponentDestroyed(this)).subscribe((res: string) => {
      this.showInfoGrowlMessage(res);
    });
  }

  // DO NOT USE THIS FUNCTION IN ANY COMPONENT. IT WILL BE USED ONLY ONCE THAT IS IN APP.COMPONENT.
  invokeGrowlMessage(severity: string, messageCode: any, msgs: any) {
    this.translateService.get(messageCode).pipe(untilComponentDestroyed(this)).subscribe((res: string) => {
      msgs.push({ severity, summary: '', detail: res });
    });
  }

}
