import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { SecurityCheckComponent } from './securitycheck/securitycheck.component';
import { HeaderMenuButtonComponent } from './header-menu-button/header-menu-button.component';
import { DIDButtonComponent } from './did-button/did-button.component';

@NgModule({
  declarations: [
    HeaderBarComponent, 
    SecurityCheckComponent,
    HeaderMenuButtonComponent,
    DIDButtonComponent
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
    DIDButtonComponent
  ],
  providers: [
  ],
  entryComponents: [],
})
export class ComponentsModule { }
