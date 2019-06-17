import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@kng/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private http: HttpClient,
    private authSerivce: AuthService
  ) {

  }

  validateLoginName(userData) {
    return this.authSerivce.controlCenterLogin(userData);
  }

  validateOtp(payload) {
    return this.authSerivce.verifyOtp(payload);
  }

  generateOtpForToken(payload) {
    return this.authSerivce.generateOtpForToken(payload);
  }

  logOut() {
    // this.authSerivce.logoutUser();
    this.authSerivce.destroyUnAuthorizedUserSession();
  }

}


