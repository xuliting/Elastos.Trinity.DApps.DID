import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { SecurityCheckComponent } from './securitycheck/securitycheck.component';
import { HeaderMenuButtonComponent } from './header-menu-button/header-menu-button.component';
import { DIDButtonComponent } from './did-button/did-button.component';
import { ActiveDIDComponent } from './active-did/active-did.component';
import { LargeMenuItemComponent } from './large-menu-item/large-menu-item.component';
import { VerifyMnemonicWordComponent } from './verify-mnemonic-word/verify-mnemonic-word.component';
import { MainContentComponent } from './main-content/main-content.component';

@NgModule({
  declarations: [
    HeaderBarComponent, 
    SecurityCheckComponent,
    HeaderMenuButtonComponent,
    DIDButtonComponent,
    ActiveDIDComponent,
    LargeMenuItemComponent,
    VerifyMnemonicWordComponent,
    MainContentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule
  ],
  exports: [
    HeaderBarComponent, 
    SecurityCheckComponent,
    HeaderMenuButtonComponent,
    DIDButtonComponent,
    ActiveDIDComponent,
    LargeMenuItemComponent,
    VerifyMnemonicWordComponent,
    MainContentComponent
  ],
  providers: [
  ],
  entryComponents: [],
})
export class ComponentsModule { }
