import { Injectable, OnDestroy } from '@angular/core';
import { UserDeviceService } from './user-device.service';
import { LogMap } from '../models/log-map';
import { Log } from '../models/log';
import { ApplicationDataService } from './application-data.service';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

@Injectable()
export class LoggerService implements OnDestroy {

  private logDtl: Log;
  private sessionId: string;
  private userDetail: any = {
    name: '',
    email: '',
    id: ''
  };

  constructor(
    private applicationDataService: ApplicationDataService,
    private userDeviceService: UserDeviceService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnDestroy() {

  }

  initLoggingContext() {
    this.logDtl = new Log(this.applicationDataService.getOrgName(), this.applicationDataService.getAppName(),
      this.applicationDataService.getCallingEntity(), this.userDeviceService.fetchUserDeviceDetails());
  }

  logInfo(componentName: string, stackTrace: string) {
    this.logDtl.severity = 'INFO';
    this.log(componentName, stackTrace);
  }

  logError(componentName: string, stackTrace: string) {
    this.logDtl.severity = 'ERROR';
    this.log(componentName, stackTrace);
  }

  private log(componentName: string, stackTrace: string): void {
    const currentLog = Object.assign({}, this.logDtl);
    currentLog.session_id = this.authService.getToken();
    currentLog.user_details = this.getUserDetails();
    currentLog.log_map = this.createLogMapping(componentName);
    currentLog.date_time = this.getLogTime();
    currentLog.stack_trace = stackTrace;
    this.postLog(currentLog).pipe(untilComponentDestroyed(this)).subscribe(res => res);
  }

  private postLog(log) {
    return this.http.post(this.applicationDataService.getEnvironment().ApplicationApi + '/configMaster/clientConfig/printLog/v1', log);
  }

  private getLogTime(): string {
    const now: any = new Date();
    return now.toGMTString();
  }

  private getUserDetails(): any {
    const userDtl = this.authService.getUserDetail();
    if (this.userDetail.name === '' && userDtl !== undefined && userDtl !== null) {
      this.userDetail.name = userDtl.login_name;
      this.userDetail.email = userDtl.email;
      this.userDetail.id = userDtl.party_id;
    }
    return this.userDetail;
  }

  private createLogMapping(sourceComponent: string, ): LogMap {
    const logMap: LogMap = {} as LogMap;
    logMap.token = sourceComponent;
    logMap.sequence = '0';
    logMap.parent = 'WEB';
    logMap.child = '';
    return logMap;
  }
}
