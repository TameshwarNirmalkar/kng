import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '@srk/core';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent implements OnInit, OnDestroy {

  public loggedUserName: string;
  public startValue: number = 3600;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.loggedUserName = this.authService.getLoginName();
  }

  ngOnDestroy() {

  }

  logout() {
    this.authService.logoutUser().pipe(untilComponentDestroyed(this)).subscribe( res => {
      // console.log( res );
    });
    // this.authService.destroyUnAuthorizedUserSession();
  }

}
