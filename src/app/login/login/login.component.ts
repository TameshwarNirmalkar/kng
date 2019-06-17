import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, NotifyService } from '@kng/core';
import { LoginService } from '../login.service';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { timer } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  public user: UserInterface = {
    userName: null,
    userPassword: null
  };
  public isLoading: boolean = false;
  public msgs: string[] = [];

  constructor(
    private loginService: LoginService,
    private route: Router,
    private messageService: MessageService,
    private notify: NotifyService
  ) { }

  ngOnInit() {
    this.loginService.logOut();
    this.notify.notifyShowGrowlMsgObservable$.pipe(untilComponentDestroyed(this)).subscribe(data => {
      this.msgs = [];
      this.messageService.invokeGrowlMessage(data.severity, data.messageCode, this.msgs);
      timer(5000).pipe(untilComponentDestroyed(this)).subscribe(res => {
        this.msgs = [];
      });
    });

  }

  onLogin() {
    this.isLoading = true;
    this.loginService.validateLoginName(this.user).pipe(untilComponentDestroyed(this)).subscribe((res: any) => {
      if (res.error_status) {
        this.messageService.showErrorGrowlMessage(res.message);
      }
    },
      (error: any) => {
        this.isLoading = false;
        this.messageService.showErrorGrowlMessage('VM not started or some server issue.');
      },
      () => { this.isLoading = false; }
    );
  }

  ngOnDestroy() {

  }

}


export interface UserInterface {
  userName: string;
  userPassword: string;
}
