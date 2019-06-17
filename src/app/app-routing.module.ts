import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { environment } from 'environments/environment';
import { ApplicationDataService } from '@kng/core';
import { LoginComponent } from './login/login/login.component';
import { PageNoFoundComponent } from './login/page-no-found/page-no-found.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    resolve: {
      env: ApplicationDataService,
    }
  },
  { path: 'login/reset', redirectTo: 'login' },
  { path: 'login/forgot-password', redirectTo: 'login' },
  {
    path: 'web',
    loadChildren: './index/index.module#IndexModule',
    resolve: {
      env: ApplicationDataService,
    },
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: PageNoFoundComponent, }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: environment.production ? PreloadAllModules : false
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
