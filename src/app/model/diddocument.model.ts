import { Events } from '@ionic/angular';

import { Profile } from './profile.model';
import { DIDService } from '../services/did.service';
import { NewDID } from './newdid.model';
import { AuthService } from '../services/auth.service';
import { WrongPasswordException } from './exceptions/wrongpasswordexception.exception';

export class DIDDocument {
    constructor(private pluginDidDocument: DIDPlugin.DIDDocument) {

    }

    addCredential(credential: DIDPlugin.VerifiableCredential, storePass: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.pluginDidDocument.addCredential(
                credential,
                storePass,
                (ret) => {resolve(ret)}, (err) => {reject(err)},
            );
        });
    }

    publish(didDocument: DIDPlugin.DIDDocument, storepass: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            didDocument.publish(
                storepass,
                () => {resolve()}, (err) => {reject(err)},
            );
        });
    }

}