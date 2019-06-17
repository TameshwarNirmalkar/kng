import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';

@Injectable()
export class ApplicationDataService {

  private readonly orgName = 'srkexports';
  private readonly appName = 'control-center';
  private readonly callingEntity = 'UI';
  private env: any;
  private applicationSettingList: any;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.initEnvironments();
  }

  getOrgName(): string {
    return this.orgName;
  }

  getAppName(): string {
    return this.appName;
  }

  getCallingEntity(): string {
    return this.callingEntity;
  }

  getEnvironment(): any {
    return this.env;
  }

  getApplicationSettingValue(settingName) {
    let settingValue;
    const applicationList = this.applicationSettingList || JSON.parse(localStorage.getItem('srk-application-setting'));
    for (const setting in applicationList) {
      if (applicationList.hasOwnProperty(setting) &&
        applicationList[setting].hasOwnProperty('entity_value') &&
        settingName === setting) {
        settingValue = applicationList[setting].entity_value;
      }
    }
    return settingValue;
  }

  initEnvironments(): any {
    if (this.env === undefined || this.env === 'undefined' || this.env === null) {
      return this.http.get('/assets/env/environment.json')
        .pipe(
          map((res: any) => {
            this.env = res;
            return this.env;
          })
        );
    } else {
      // return Observable.empty<Response>();
    }
  }

}
