import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';
import { IonicStorageModule } from "@ionic/storage";
import { AppRoutingModule } from './app-routing.module';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { QRCodeModule } from 'angularx-qrcode';
import { IonBottomDrawerModule } from 'ion-bottom-drawer';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { IonicImageLoader } from 'ionic-image-loader';
import { WebView } from '@ionic-native/ionic-webview/ngx';

import { zh } from './../assets/i18n/zh';
import { en } from './../assets/i18n/en';
import { fr } from './../assets/i18n/fr';

import { MyApp } from './app.component';
import { ComponentsModule } from './components/components.module';

import { DevPage } from './pages/devpage/devpage';
import { AreaPage } from './pages/area/area';
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
import { DIDListPage } from './pages/didlist/didlist';

import { SecurityCheckComponent } from './components/securitycheck/securitycheck.component';
import { CreatePasswordComponent } from './components/createpassword/createpassword.component';

import { LocalStorage } from './services/localstorage';
import { PopupProvider } from './services/popup';
import { ChooseDIDPage } from './pages/choosedid/choosedid';
import { ShowQRCodeComponent } from './components/showqrcode/showqrcode.component';
import { ProfileEntryPickerPage } from './pages/profileentrypicker/profileentrypicker';

/** 通过类引用方式解析国家化文件 */
export class CustomTranslateLoader implements TranslateLoader {
    public getTranslation(lang: string): Observable<any> {
        return Observable.create(observer => {
            switch (lang) {
                case 'zh':
                  observer.next(zh);
                  break;
                case 'fr':
                  observer.next(fr);
                  break;
                case 'en':
                default:
                  observer.next(en);
            }

            observer.complete();
        });
    }
}

export function TranslateLoaderFactory() {
    return new CustomTranslateLoader();
}

@NgModule({
  declarations: [
    MyApp,
    DevPage,
    AreaPage,
    BackupDIDPage,
    CredentialAccessRequestPage,
    CredentialListPage,
    CredentialCreatePage,
    CredentialBackupPage,
    EditProfilePage,
    ImportDIDPage,
    HomePage,
    MyProfilePage,
    NoIdentityPage,
    NewPasswordSetPage,
    VerifyMnemonicsPage,
    RegisterApplicationProfileRequestPage,
    DIDListPage,
    ChooseDIDPage,
    ProfileEntryPickerPage,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    ComponentsModule,
    FormsModule,
    IonBottomDrawerModule,
    IonicModule.forRoot({
      mode: 'ios',
      scrollAssist: false,
      scrollPadding: false
    }),
    QRCodeModule,
    IonicStorageModule,
    IonicStorageModule.forRoot({
            name: '__diddb',
            driverOrder: ['localstorage', 'indexeddb', 'sqlite', 'websql']
        }),
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: (TranslateLoaderFactory)
        }
    }),
    IonicImageLoader.forRoot(),
  ],
  bootstrap: [MyApp],
  entryComponents: [
    MyApp,
    SecurityCheckComponent,
    CreatePasswordComponent,
    ShowQRCodeComponent,
    ProfileEntryPickerPage
  ],
  providers: [
    Clipboard,
    LocalStorage,
    PopupProvider,
    StatusBar,
    SplashScreen,
    Platform,
    WebView,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: ErrorHandler, useClass: ErrorHandler}
  ]
})
export class AppModule {}
