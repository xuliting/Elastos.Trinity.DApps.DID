import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AreaPage } from './pages/area/area';
import { NoIdentityPage } from './pages/noidentity/noidentity';
import { EditProfilePage } from './pages/editprofile/editprofile';
import { MyProfilePage } from './pages/myprofile/myprofile';
import { SlideMenuPage } from './pages/myprofile/slidemenu/slidemenu';
import { SetPasswordPage } from './pages/setpassword/setpassword';
import { BackupDIDPage } from './pages/backupdid/backupdid';
import { ImportDIDPage } from './pages/importdid/importdid';
import { VerifyMnemonicsPage } from './pages/verifymnemonics/verifymnemonics';
import { DIDSettingsPage } from './pages/didsettings/didsettings';
import { CredentialAccessRequestPage } from './pages/credentialaccessrequest/credentialaccessrequest';
import { CredentialListPage } from './pages/credential/list/credentiallist';
import { CanDeactivateList } from './pages/credential/list/candeactivate.service';
import { CredentialCreatePage } from './pages/credential/create/credentialcreate';
import { CredentialBackupPage } from './pages/credential/backup/credentialbackup';

const routes: Routes = [
  { path: '', redirectTo: 'noidentity', pathMatch: 'full' },
  { path: 'area', component: AreaPage },
  { path: 'noidentity', component: NoIdentityPage },
  { path: 'createidentity', component: EditProfilePage },
  { path: 'editprofile', component: EditProfilePage },
  {
    path: '',
    component: SlideMenuPage,
    children: [
      { path: 'myprofile', component: MyProfilePage },
    ],
  },
  // { path: 'myprofile', component: MyProfilePage },
  { path: 'setpassword', component: SetPasswordPage },
  { path: 'importdid', component: ImportDIDPage },
  { path: 'backupdid', component: BackupDIDPage },
  { path: 'didsettings', component: DIDSettingsPage },
  { path: 'verifymnemonics', component: VerifyMnemonicsPage },
  { path: 'credaccessrequest', component: CredentialAccessRequestPage },
  { path: 'credentiallist', component: CredentialListPage, canDeactivate: [CanDeactivateList] },
  { path: 'credentialcreate', component: CredentialCreatePage },
  { path: 'credentialbackup', component: CredentialBackupPage },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
