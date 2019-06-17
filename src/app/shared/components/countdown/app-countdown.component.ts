import { Component, OnDestroy, Input, OnChanges } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

@Component({
  selector: 'app-countdown',
  templateUrl: './app-countdown.component.html',
  styleUrls: ['./app-countdown.component.scss']
})
export class AppCountdownComponent implements OnDestroy, OnChanges {

  @Input() navigateUrl: string = 'login';
  @Input() startTime: number = 0;
  @Input() token: string;
  @Input() msgLabel: string;

  public timerSub: Subscription;
  public value: number;

  constructor(private router: Router) { }

  public startTimer(startValue) {
    startValue = Math.trunc(startValue);
    timer(0, 1000).pipe(
      untilComponentDestroyed(this),
      take(startValue),
      map((value: any) => startValue - value)
    ).subscribe({
      next: (value) => this.value = value,
      error: () => {
        this.timerSub = null;
        this.router.navigate([this.navigateUrl]);
      }
    });
  }

  ngOnChanges(changes) {
    const oldtime = localStorage.getItem('user-otp-start-time');
    if (!oldtime) {
      this.setUserOtpTime();
    } else {
      this.updateTime();
    }
  }

  ngOnDestroy() {

  }

  private updateTime() {
    const finishTime: number = +localStorage.getItem('user-otp-start-time');
    const dt = +(new Date());
    const timeLeft = finishTime - dt;
    this.startTimer(timeLeft / 1000);
  }

  private setUserOtpTime() {
    const ts = ((new Date()).getTime() + this.startTime * 1000);
    localStorage.setItem('user-otp-start-time', ts.toString());
    this.updateTime();
  }

}
