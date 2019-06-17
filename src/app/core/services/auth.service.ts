import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApplicationDataService } from './application-data.service';
import { UserDeviceService } from './user-device.service';
import { ErrorHandlerService } from './error-handler.service';
import { SessionTimeoutService } from './session-timeout.service';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class AuthService {
  private token: any;
  private userRole: any;
  private userDetail: any;
  private elementList: any;
  private urlList = {};
  private login_name: any;

  constructor(
    private errorHandler: ErrorHandlerService,
    private applicationData: ApplicationDataService,
    private userDeviceService: UserDeviceService,
    private http: HttpClient,
    private router: Router,
    private sessionTimeoutService: SessionTimeoutService
  ) {
    this.getLocalStoredValues();
  }

  getLocalStoredValues() {
    const paramLoginName = this.getUrlParameter('?loginName');
    const localStorageLoginName = this.getStringFromLocalStorage('login-name');
    this.login_name = paramLoginName || localStorageLoginName;
    if (this.login_name) {
      this.setStringInLocalStorage('login-name', this.login_name);
      this.token = this.getStringFromLocalStorage(this.login_name + '-auth-token');
      this.userRole = this.getObjectFromLocalStorage(this.login_name + '-user-role');
      this.userDetail = this.getObjectFromLocalStorage(this.login_name + '-user-detail');
      this.elementList = this.getObjectFromLocalStorage(this.login_name + '-element-list');
    }
  }


  getToken(): string {
    this.sessionTimeoutService.resetSessionTimeout();
    return this.token;
  }

  getUserDetail() {
    return this.userDetail;
  }

  getLoginName() {
    if (this.userDetail && this.userDetail.login_name) {
      return this.userDetail.login_name;
    } else {
      this.destroyUnAuthorizedUserSession();
    }
  }

  isUserSessionAvailable(): boolean {
    if (this.getLoginName() && this.token) {
      return true;
    } else {
      return false;
    }
  }

  hasRoutePermission(url: string) {
    // TODO:- need to check the 'provided url' permission in user permission list.
    return true;
  }

  hasElementPermission(elementName: string) {
    const elements = this.elementList;
    const list = Object.keys(elements);
    let flag = false;
    list.forEach((element) => {
      if (!flag) {
        if (element === elementName) {
          flag = true;
        }
      }
    });
    return flag;
  }

  getApiLinkForKey(elementName: string, key: string) {
    let link;
    for (const element in this.elementList) {
      if (this.elementList.hasOwnProperty(element) && element === elementName) {
        if (this.elementList[element].action && this.elementList[element].action[key]) {
          link = this.elementList[element].action[key];
          link = this.replaceIdsInUrl(link);
        } else {
          link = this.elementList[element].action;
          link = this.replaceIdsInUrl(link);
        }
      }
    }
    return link;
  }

  private replaceIdsInUrl(link: string): string {
    if (link) {
      if (link.indexOf(':login_name') >= 0) {
        link = link.replace(':login_name', this.getLoginName());
      }
      if (link.indexOf(':party_id') >= 0) {
        link = link.replace(':party_id', this.userDetail.party_id);
      }
      if (link.indexOf(':StoneManagementApi') >= 0) {
        link = link.replace(':StoneManagementApi', this.applicationData.getEnvironment().StoneManagementApi);
      }
      if (link.indexOf(':StoneManagementApi') >= 0) {
        link = link.replace(':StoneManagementApiVersion', this.applicationData.getEnvironment().StoneManagementApiVersion);
      }
    }
    return link;
  }

  fetchPermissionList(list) {
    const htmlElementJson = {};
    const urlJson = {};
    for (const element in list) {
      if (list.hasOwnProperty(element)) {
        const listData = list[element];
        if (listData.resource_type === 'HTML-ELEMENT') {
          htmlElementJson[element] = listData;
        } else {
          urlJson[element] = listData;
        }
      }
    }
    this.elementList = htmlElementJson;
    this.setObjectInLocalStorage(this.login_name + '-element-list', htmlElementJson);
    this.urlList = urlJson;
  }

  // tslint:disable:variable-name
  createLoginData(login_name: string, password: string): any {
    const org_name = this.applicationData.getOrgName();
    const app_name = this.applicationData.getAppName();
    const device_details: any = this.userDeviceService.fetchUserDeviceDetails();
    const app_code = 13;
    const otp = '';

    return {
      login_name,
      password,
      app_name,
      org_name,
      device_details,
      app_code,
      otp
    };
  }
  // tslint:enable:variable-name

  getUserRole() {
    const roleNames = Object.keys(this.userRole);
    this.fetchPermissionList(this.userRole[roleNames[0]]);
    return roleNames[0];
  }

  verifyOtp(data) {
    let endpoint = '/otp/';
    if (data.token) {
      endpoint = '/token/otp/';
      delete data.token;
    }
    const payload = Object.assign({}, ...this.createLoginData('', ''), ...data);
    // tslint:disable:max-line-length
    const url = `${this.applicationData.getEnvironment().CONTROL_CENTER.host}${endpoint}${this.applicationData.getEnvironment().CONTROL_CENTER.version}`;
    // tslint:enable:max-line-length
    return this.http.post(url, payload).pipe(
      map((res: any) => {
        if (!res.error_status) {
          if (!res.data.session_data) {
            res.data.session_data = res.data;
          }
          const token = res.data.session_data.mapping.token;
          this.setLocalStorageCredentials(res.data.session_data.user_details.login_name, token, res.data.session_data);
          this.navigateToUserDashboard();
        }
        return res;
      }),
      catchError(err => this.errorHandler.handleError('AuthService:verifyOtp', err))
    );
  }

  logoutUser() {
    return this.http.get(this.applicationData.getEnvironment().CONTROL_CENTER.host
      + '/logout/' + this.applicationData.getEnvironment().CONTROL_CENTER.version)
      .pipe(
        map((response: any) => {
          if (!response.error_status) {
            this.destroyUnAuthorizedUserSession();
            return response;
          }
        }),
        catchError(err => this.errorHandler.handleError('AuthService:logoutUser', err))
      );
  }

  destroyUnAuthorizedUserSession() {
    this.clearLocalStorageData();
    this.clearUserData();
    this.router.navigate(['login']);
  }

  clearUserData() {
    this.token = null;
    this.userDetail = {};
    this.userRole = {};
    this.elementList = [];
  }

  clearLocalStorageData() {
    if (this.userDeviceService.isDeviceSupportLocalStorage()) {
      localStorage.removeItem(this.login_name + '-auth-token');
      localStorage.removeItem(this.login_name + '-user-detail');
      localStorage.removeItem(this.login_name + '-user-role');
      localStorage.removeItem(this.login_name + '-element-list');
      localStorage.removeItem(this.login_name + '-session-timeout');
      localStorage.removeItem('login-name');
      localStorage.removeItem('branch-code');
      localStorage.removeItem('organization-details');
      localStorage.removeItem('user-otp-start-time');
    }
  }

  getStringFromLocalStorage(key): any {
    if (this.userDeviceService.isDeviceSupportLocalStorage()) {
      return window.localStorage.getItem(key);
    } else {
      return null;
    }
  }

  private setStringInLocalStorage(key, value) {
    if (this.userDeviceService.isDeviceSupportLocalStorage() && value !== undefined && value !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  }

  private getObjectFromLocalStorage(key): any {
    if (this.userDeviceService.isDeviceSupportLocalStorage()) {
      return window.localStorage.getItem(key) ? JSON.parse(window.localStorage.getItem(key)) : '';
    } else {
      return null;
    }
  }

  private setObjectInLocalStorage(key, value) {
    if (this.userDeviceService.isDeviceSupportLocalStorage() && value !== undefined && value !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }

  setLocalStorageCredentials(loginName, token, userData) {
    this.login_name = loginName;
    this.token = token;
    this.userDetail = userData.user_details;
    this.clearLocalStorageData();
    this.setStringInLocalStorage('login-name', loginName);
    this.setStringInLocalStorage(loginName + '-auth-token', token);
    this.setObjectInLocalStorage(loginName + '-user-detail', userData.user_details);
    // this part is for Role.
    // this.setObjectInLocalStorage(loginName + '-user-role', userData.roles);
    // this.userRole = userData.roles;
    // const roleNames = Object.keys(this.userRole);
    // this.fetchPermissionList(this.userRole[roleNames[0]]);
  }

  // a method to get user code
  getUserCode() {
    if (this.userDetail && this.userDetail.user_code) {
      return this.userDetail.user_code;
    } else {
      this.destroyUnAuthorizedUserSession();
    }
  }

  getUrlParameter(name: string) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  navigateToOtp(loginName) {
    this.router.navigate([`login/otp/${loginName}`]);
  }

  navigateToUserDashboard() {
    this.router.navigate(['/web/dashboard']);
  }

  controlCenterLogin(data: any) {
    const loginData = this.createLoginData(data.userName, data.userPassword);
    return this.http.post(this.applicationData.getEnvironment().CONTROL_CENTER.host
      + '/login/' + this.applicationData.getEnvironment().CONTROL_CENTER.version, loginData)
      .pipe(
        map((response: any) => {
          const status = response.error_status;
          if (!status) {
            // const mobileNumber = response.message.replace(/\D/g, '');
            // const token = response.data.session_data.mapping.token;
            // this.setLocalStorageCredentials(response.data.user_payload.user_loginname, token, response.data);
            // this.navigateToUserDashboard();
            this.navigateToOtp(data.userName);
          }
          return response;
        }),
        catchError(err => {
          return this.errorHandler.handleError('Login', err);
        })
      );
  }

  generateOtpForToken(token) {
    this.token = token;
    // tslint:disable-next-line:max-line-length
    const url = `${this.applicationData.getEnvironment().CONTROL_CENTER.host}/token/otp/${this.applicationData.getEnvironment().CONTROL_CENTER.version}`;
    return this.http.get(url);
  }

}
