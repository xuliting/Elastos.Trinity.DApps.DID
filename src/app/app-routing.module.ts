import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { NoIdentityPage } from './pages/noidentity/noidentity';
import { EditProfilePage } from './pages/editprofile/editprofile';
import { MyProfilePage } from './pages/myprofile/myprofile';
import { SetPasswordPage } from './pages/setpassword/setpassword';
import { BackupDIDPage } from './pages/backupdid/backupdid';
import { ImportDIDPage } from './pages/importdid/importdid';
import { VerifyMnemonicsPage } from './pages/verifymnemonics/verifymnemonics';
import { DIDSettingsPage } from './pages/didsettings/didsettings';
import { CredentialAccessRequestPage } from './pages/credentialaccessrequest/credentialaccessrequest';

const routes: Routes = [
  { path: '', redirectTo: 'didsettings', pathMatch: 'full' },
  { path: 'noidentity', component: NoIdentityPage },
  { path: 'createidentity', component: EditProfilePage }, // TODO: edit profile page, with special params
  { path: 'editprofile', component: EditProfilePage },
  { path: 'myprofile', component: MyProfilePage },
  { path: 'setpassword', component: SetPasswordPage },
  { path: 'importdid', component: ImportDIDPage },
  { path: 'backupdid', component: BackupDIDPage },
  { path: 'didsettings', component: DIDSettingsPage },
  { path: 'verifymnemonics', component: VerifyMnemonicsPage },
  { path: 'credaccessrequest', component: CredentialAccessRequestPage },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
