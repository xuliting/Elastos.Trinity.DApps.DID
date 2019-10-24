import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { IonBottomDrawerModule } from 'ion-bottom-drawer';

import { MyApp } from './app.component';
import { ComponentsModule } from './components/components.module';

import { NoIdentityPage } from './pages/noidentity/noidentity';
import { EditProfilePage } from './pages/editprofile/editprofile';
import { MyProfilePage, MyProfilePageMenu } from './pages/myprofile/myprofile';
import { SetPasswordPage } from './pages/setpassword/setpassword';
import { BackupDIDPage } from './pages/backupdid/backupdid';
import { ImportDIDPage } from './pages/importdid/importdid';
import { DIDSettingsPage } from './pages/didsettings/didsettings';
import { VerifyMnemonicsPage } from './pages/verifymnemonics/verifymnemonics';
import { CredentialAccessRequestPage } from './pages/credentialaccessrequest/credentialaccessrequest';

@NgModule({
  declarations: [
    MyApp,
    NoIdentityPage,
    EditProfilePage,
    MyProfilePage,
    SetPasswordPage,
    BackupDIDPage,
    ImportDIDPage,
    DIDSettingsPage,
    VerifyMnemonicsPage,
    CredentialAccessRequestPage,

    // Menus
    MyProfilePageMenu
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    ComponentsModule,
    FormsModule,
    IonBottomDrawerModule,
    IonicModule.forRoot()
  ],
  bootstrap: [MyApp],
  entryComponents: [
    MyApp,

    // Menus
    MyProfilePageMenu
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Platform,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: ErrorHandler, useClass: ErrorHandler}
  ]
})
export class AppModule {}
