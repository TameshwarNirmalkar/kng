import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AppCountdownComponent } from '../../shared/components/countdown/app-countdown.component';
import { LoginService } from '../login.service';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { MessageService } from 'primeng/api';
import { AuthService } from '@kng/core';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit, OnDestroy {

  @ViewChild(AppCountdownComponent, {static: false}) countDown: AppCountdownComponent;

  private paylods: any = {
    token: null,
    login_name: null
  };
  public validToken: boolean = false;
  public otp: string;
  public startValue: number = 60;

  constructor(
    private route: ActivatedRoute,
    private loginService: LoginService,
    private msgService: MessageService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.pipe(untilComponentDestroyed(this)).subscribe((val: any) => {
      if (!val) {
        this.loginService.logOut();
      } else {
        this.maintainSession(val);
      }
    });
  }

  ngOnDestroy() {

  }

  generateOtpFromToken(token) {
    if (token) {
      this.validToken = false;
      this.loginService.generateOtpForToken(token).pipe(untilComponentDestroyed(this)).subscribe(res => {
        this.validToken = true;
      });
    }
  }

  validateOtp() {
    const paylod = Object.assign({}, this.paylods, { otp: this.otp });
    this.loginService.validateOtp(paylod).pipe(untilComponentDestroyed(this)).subscribe((res: any) => {
      if (res.error_status) {
        this.msgService.add({
          key: 'myKey1', severity: 'error', detail: `${this.otp} ${res.message}`
        });
      }
    });
  }

  private maintainSession(val) {
    const savedToken = this.authService.getToken();
    if (savedToken && savedToken === val.token) {
      this.router.navigate(['/web/dashboard']);
    } else {
      this.validToken = true;
      this.paylods = { ...val };
      this.generateOtpFromToken(val.token);
    }
  }

}
