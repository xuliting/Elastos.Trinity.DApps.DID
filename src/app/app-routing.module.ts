import { NgModule } from '@angular/core';
import { NoPreloading, RouterModule, Routes } from '@angular/router';

import { CountryPickerPage } from './pages/countrypicker/countrypicker';
import { EditProfilePage } from './pages/editprofile/editprofile';
import { MyProfilePage } from './pages/myprofile/myprofile';
import { CredentialAccessRequestPage } from './pages/credentialaccessrequest/credentialaccessrequest';
import { CredentialListPage } from './pages/credential/list/credentiallist';
import { CredentialCreatePage } from './pages/credential/create/credentialcreate';
import { CredentialBackupPage } from './pages/credential/backup/credentialbackup';
import { RegisterApplicationProfileRequestPage } from './pages/regappprofilerequest/regappprofilerequest';
import { SignRequestPage } from './pages/signrequest/signrequest';
import { CredentialIssueRequestPage } from './pages/credentialissuerequest/credentialissuerequest';
import { DeleteDIDPage } from './pages/deletedid/deletedid';
import { NotSignedInPage } from './pages/notsignedin/notsignedin';
import { CredentialImportRequestPage } from './pages/credentialimportrequest/credentialimportrequest';
 
const routes: Routes = [
  // { path: '', redirectTo: '', pathMatch: 'full' }, // No default route, services will decide this by themselves.
  { path: 'countrypicker', component: CountryPickerPage },
  { path: 'createidentity', component: EditProfilePage },
  { path: 'editprofile', component: EditProfilePage },
  { path: 'myprofile', component: MyProfilePage },
  { path: 'credentiallist', component: CredentialListPage },

  { path: 'deletedid', component: DeleteDIDPage },
  { path: 'credentialcreate', component: CredentialCreatePage },
  { path: 'credentialbackup', component: CredentialBackupPage },

  // Intents
  { path: 'credaccessrequest', component: CredentialAccessRequestPage },
  { path: 'credissuerequest', component: CredentialIssueRequestPage },
  { path: 'credimportrequest', component: CredentialImportRequestPage },
  { path: 'regappprofilerequest', component: RegisterApplicationProfileRequestPage },
  { path: 'signrequest', component: SignRequestPage },
  { path: 'notsignedin', component: NotSignedInPage },
  { path: 'createdata', loadChildren: './pages/createdata/createdata.module#CreatedataPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading/*PreloadAllModules*/ })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
