import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

console.log("Application is starting");

platformBrowserDynamic().bootstrapModule(AppModule);
