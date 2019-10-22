import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { NoIdentityPage } from './pages/noidentity/noidentity';
import { EditProfilePage } from './pages/editprofile/editprofile';
import { SetPasswordPage } from './pages/setpassword/setpassword';
import { CredentialAccessRequestPage } from './pages/credentialaccessrequest/credentialaccessrequest';

const routes: Routes = [
  { path: '', redirectTo: 'setpassword', pathMatch: 'full' },
  { path: 'noidentity', component: NoIdentityPage },
  { path: 'createidentity', component: EditProfilePage },
  { path: 'setpassword', component: SetPasswordPage },
  { path: 'credaccessrequest', component: CredentialAccessRequestPage },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
