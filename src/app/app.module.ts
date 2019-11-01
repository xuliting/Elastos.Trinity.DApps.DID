import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { QRCodeModule } from 'angularx-qrcode';
import { IonBottomDrawerModule } from 'ion-bottom-drawer';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { zh } from './../assets/i18n/zh';
import { en } from './../assets/i18n/en';

import { MyApp } from './app.component';
import { ComponentsModule } from './components/components.module';

import { AreaPage } from './pages/area/area';
import { NoIdentityPage } from './pages/noidentity/noidentity';
import { EditProfilePage } from './pages/editprofile/editprofile';
import { MyProfilePage, MyProfilePageMenu } from './pages/myprofile/myprofile';
import { SetPasswordPage } from './pages/setpassword/setpassword';
import { BackupDIDPage } from './pages/backupdid/backupdid';
import { ImportDIDPage } from './pages/importdid/importdid';
import { DIDSettingsPage } from './pages/didsettings/didsettings';
import { VerifyMnemonicsPage } from './pages/verifymnemonics/verifymnemonics';
import { CredentialAccessRequestPage } from './pages/credentialaccessrequest/credentialaccessrequest';

import { SecurityCheckComponent } from './components/securitycheck/securitycheck.component'

/** 通过类引用方式解析国家化文件 */
export class CustomTranslateLoader implements TranslateLoader {
    public getTranslation(lang: string): Observable<any> {
        return Observable.create(observer => {
            switch (lang) {
                case 'zh':
                default:
                    observer.next(zh);
                    break;
                case 'en':
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
    AreaPage,
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
    IonicModule.forRoot(),
    QRCodeModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: (TranslateLoaderFactory)
        }
    }),
  ],
  bootstrap: [MyApp],
  entryComponents: [
    MyApp,
    SecurityCheckComponent,

    // Menus
    MyProfilePageMenu
  ],
  providers: [
    Clipboard,
    StatusBar,
    SplashScreen,
    Platform,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: ErrorHandler, useClass: ErrorHandler}
  ]
})
export class AppModule {}
