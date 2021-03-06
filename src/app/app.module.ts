import { NgModule, ErrorHandler, Injectable } from '@angular/core';
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

import { CountryPickerPage } from './pages/countrypicker/countrypicker';
import { EditProfilePage } from './pages/editprofile/editprofile';
import { MyProfilePage } from './pages/myprofile/myprofile';
import { CredentialAccessRequestPage } from './pages/credentialaccessrequest/credentialaccessrequest';
import { CredentialListPage } from './pages/credential/list/credentiallist';
import { CredentialCreatePage } from './pages/credential/create/credentialcreate';
import { CredentialBackupPage } from './pages/credential/backup/credentialbackup';
import { RegisterApplicationProfileRequestPage } from './pages/regappprofilerequest/regappprofilerequest';

import { LocalStorage } from './services/localstorage';
import { PopupProvider } from './services/popup';
import { ShowQRCodeComponent } from './components/showqrcode/showqrcode.component';
import { ProfileEntryPickerPage } from './pages/profileentrypicker/profileentrypicker';

import * as Sentry from "@sentry/browser";
import { SignRequestPage } from './pages/signrequest/signrequest';
import { CredentialIssueRequestPage } from './pages/credentialissuerequest/credentialissuerequest';
import { DeleteDIDPage } from './pages/deletedid/deletedid';
import { NotSignedInPage } from './pages/notsignedin/notsignedin';
import { WarningComponent } from './components/warning/warning.component';
import { OptionsComponent } from './components/options/options.component';
import { PictureComponent } from './components/picture/picture.component';
import { CredentialImportRequestPage } from './pages/credentialimportrequest/credentialimportrequest';

Sentry.init({
  dsn: "https://f563821bdc2546c3bf7357c997a78059@sentry.io/1874652"
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor(private popup: PopupProvider) {}

  handleError(error) {
    console.error("Globally catched exception:", error);

    console.log(document.URL);
    // Only send reports to sentry if we are not debugging.
    if (document.URL.includes('localhost')) { // Prod builds or --nodebug CLI builds use "http://localhost"
      /*const eventId = */ Sentry.captureException(error.originalError || error);
      //Sentry.showReportDialog({ eventId });
    }

    this.popup.ionicAlert("Error", "Sorry, the application encountered an error. This has been reported to the team.", "Close");
  }
}

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
    CountryPickerPage,
    CredentialAccessRequestPage,
    CredentialIssueRequestPage,
    CredentialImportRequestPage,
    CredentialListPage,
    CredentialCreatePage,
    CredentialBackupPage,
    EditProfilePage,
    MyProfilePage,
    RegisterApplicationProfileRequestPage,
    SignRequestPage,
    ProfileEntryPickerPage,
    DeleteDIDPage,
    NotSignedInPage,
    OptionsComponent,
    WarningComponent,
    PictureComponent
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
    ShowQRCodeComponent,
    ProfileEntryPickerPage,
    OptionsComponent,
    WarningComponent,
    PictureComponent
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
    { provide: ErrorHandler, useClass: SentryErrorHandler }
  ]
})
export class AppModule {}
