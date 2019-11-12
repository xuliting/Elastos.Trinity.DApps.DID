import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { CredentialListPage } from './credentiallist';

@Injectable()
export class CanDeactivateList implements CanDeactivate<CredentialListPage> {
  public async canDeactivate(component: CredentialListPage,
                             currentRoute: ActivatedRouteSnapshot,
                             currentState: RouterStateSnapshot,
                             nextState: RouterStateSnapshot): Promise<boolean> {
    return component.CanDeactivate();
  }
}
