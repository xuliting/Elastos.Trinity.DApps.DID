import { NgModule } from '@angular/core';
import { NoPreloading, PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AreaPage } from './pages/area/area';
import { NoIdentityPage } from './pages/noidentity/noidentity';
import { NewPasswordSetPage } from './pages/newpasswordset/newpasswordset';
import { EditProfilePage } from './pages/editprofile/editprofile';
import { HomePage } from './pages/home/home.page';
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
import { RegisterApplicationProfileRequestPage } from './pages/regappprofilerequest/regappprofilerequest';
import { DevPage } from './pages/devpage/devpage';
import { DIDListPage } from './pages/didlist/didlist';
import { ChooseDIDPage } from './pages/choosedid/choosedid';

const routes: Routes = [
  // { path: '', redirectTo: '', pathMatch: 'full' }, // No default route, services will decide this by themselves.
  { path: 'devpage', component: DevPage },
  { path: 'area', component: AreaPage },
  { path: 'noidentity', component: NoIdentityPage },
  { path: 'newpasswordset', component: NewPasswordSetPage },
  { path: 'createidentity', component: EditProfilePage },
  { path: 'editprofile', component: EditProfilePage },
  {
    path: 'profile',
    component: SlideMenuPage,
    children: [
      { path: 'myprofile', component: MyProfilePage },
    ],
  },
  {
    path: 'home', // Bottom Tab Navigation
    component: HomePage,
    children: [
      // 1st Tab
      {
        path: 'myprofile', component: MyProfilePage
      },
      {
        path: 'didlist', component: DIDListPage
      },
      {
        path: 'credentiallist', component: CredentialListPage, canDeactivate: [CanDeactivateList]
      },
      {
        path: 'didsettings', component: DIDSettingsPage
      }
    ]
  },
  // { path: 'myprofile', component: MyProfilePage },
  { path: 'setpassword', component: SetPasswordPage },
  { path: 'importdid', component: ImportDIDPage },
  { path: 'backupdid', component: BackupDIDPage },
  { path: 'verifymnemonics', component: VerifyMnemonicsPage },
  { path: 'credentialcreate', component: CredentialCreatePage },
  { path: 'credentialbackup', component: CredentialBackupPage },
  { path: 'choosedid', component: ChooseDIDPage },

  // Intents
  { path: 'credaccessrequest', component: CredentialAccessRequestPage },
  { path: 'regappprofilerequest', component: RegisterApplicationProfileRequestPage },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading/*PreloadAllModules*/ })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
