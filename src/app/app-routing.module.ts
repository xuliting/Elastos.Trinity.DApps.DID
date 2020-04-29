import { NgModule } from '@angular/core';
import { NoPreloading, PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { CountryPickerPage } from './pages/countrypicker/countrypicker';
import { NoIdentityPage } from './pages/noidentity/noidentity';
import { NewPasswordSetPage } from './pages/newpasswordset/newpasswordset';
import { EditProfilePage } from './pages/editprofile/editprofile';
import { HomePage } from './pages/home/home.page';
import { MyProfilePage } from './pages/myprofile/myprofile';
import { BackupDIDPage } from './pages/backupdid/backupdid';
import { ImportDIDPage } from './pages/importdid/importdid';
import { VerifyMnemonicsPage } from './pages/verifymnemonics/verifymnemonics';
import { CredentialAccessRequestPage } from './pages/credentialaccessrequest/credentialaccessrequest';
import { CredentialListPage } from './pages/credential/list/credentiallist';
import { CredentialCreatePage } from './pages/credential/create/credentialcreate';
import { CredentialBackupPage } from './pages/credential/backup/credentialbackup';
import { RegisterApplicationProfileRequestPage } from './pages/regappprofilerequest/regappprofilerequest';
import { DevPage } from './pages/devpage/devpage';
import { DIDListPage } from './pages/didlist/didlist';
import { ChooseDIDPage } from './pages/choosedid/choosedid';
import { SignRequestPage } from './pages/signrequest/signrequest';
import { CredentialIssueRequestPage } from './pages/credentialissuerequest/credentialissuerequest';
 
const routes: Routes = [
  // { path: '', redirectTo: '', pathMatch: 'full' }, // No default route, services will decide this by themselves.
  { path: 'devpage', component: DevPage },
  { path: 'countrypicker', component: CountryPickerPage },
  { path: 'noidentity', component: NoIdentityPage },
  { path: 'newpasswordset', component: NewPasswordSetPage },
  { path: 'createidentity', component: EditProfilePage },
  { path: 'editprofile', component: EditProfilePage },
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
        path: 'credentiallist', component: CredentialListPage
      },
    ]
  },
  // { path: 'myprofile', component: MyProfilePage },
  { path: 'importdid', component: ImportDIDPage },
  { path: 'backupdid', component: BackupDIDPage },
  { path: 'verifymnemonics', component: VerifyMnemonicsPage },
  { path: 'credentialcreate', component: CredentialCreatePage },
  { path: 'credentialbackup', component: CredentialBackupPage },
  { path: 'choosedid', component: ChooseDIDPage },

  // Intents
  { path: 'credaccessrequest', component: CredentialAccessRequestPage },
  { path: 'credissuerequest', component: CredentialIssueRequestPage },
  { path: 'regappprofilerequest', component: RegisterApplicationProfileRequestPage },
  { path: 'signrequest', component: SignRequestPage },
  { path: 'newpassword', loadChildren: './pages/newpassword/newpassword.module#NewpasswordPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading/*PreloadAllModules*/ })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
