/**
 * ################################################################
 * ################################################################
 * Edit this class to change the app behaviour in simulation
 * ################################################################
 * ################################################################
 */
export class BrowserSimulationConfig {
    public static hasDIDStores() : boolean {
        return false;
    }
}
/**
 * ################################################################
 * ################################################################
 */

 function simulated(funcName: string, className = null) {
    let log = "SIMULATED - "+funcName;
    if (className)
        log += " ("+className+")";
    
    console.warn(log);
}

function randomString() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 15);
}

export class SimulatedUnloadedCredential implements DIDPlugin.UnloadedVerifiableCredential {
    credentialId: string = "unloadedcredid";    
    hint: string = "fakehint";
}

export class SimulatedCredential implements DIDPlugin.VerifiableCredential {
    getId() {
        simulated("getId", "SimulatedCredential");
        return "did:elastos:"+randomString()+"#credname";
    }
    getFragment() {
        simulated("getFragment", "SimulatedCredential");
        return "did:elastos:abcdef#credname";
    }
    getType() {
        simulated("getType", "SimulatedCredential");
        return "FakeCredentialType";
    }
    getIssuer() {
        simulated("getIssuer", "SimulatedCredential");
        return "did:elastos:issuer-abcdef";
    }
    getIssuanceDate(): Date {
        simulated("getIssuanceDate", "SimulatedCredential");
        return new Date();
    }
    getExpirationDate(): Date {
        simulated("getExpirationDate", "SimulatedCredential");
        return new Date();
    }
    getSubject() {
        simulated("getSubject", "SimulatedCredential");
        return "did:elastos:abcdef";
    }
    getProof() {
        simulated("getProof", "SimulatedCredential");
        return {};
    }
    toString() : Promise<string> {
        return new Promise((resolve, reject)=>{
            resolve("")
        })
    }
}

export class SimulatedDIDStore implements DIDPlugin.DIDStore {
    getId(): string {
        simulated("getId", "SimulatedDIDStore");
        return randomString();
    }   

    initPrivateIdentity(language: DIDPlugin.MnemonicLanguage, mnemonic: string, passphrase: string, storepass: string, force: Boolean, onSuccess: () => void, onError?: (err: any) => void) {
        simulated("initPrivateIdentity", "SimulatedDIDStore");
    }

    hasPrivateIdentity(onSuccess: (hasPrivateIdentity: boolean) => void, onError?: (err: any) => void) {
        simulated("hasPrivateIdentity", "SimulatedDIDStore");
    }

    deleteDid(didString: string, onSuccess: () => void, onError?: (err: any) => void) {
        simulated("deleteDid", "SimulatedDIDStore");
    }

    newDid(passphrase: string, hint: string, onSuccess: (didString: string, didDocument: DIDPlugin.DIDDocument) => void, onError?: (err: any) => void) {
        simulated("newDid", "SimulatedDIDStore");
    }

    listDids(filter: any, onSuccess: (didString: DIDPlugin.UnloadedDID[]) => void, onError?: (err: any) => void) {
        simulated("listDids", "SimulatedDIDStore");
    }

    loadDidDocument(didString: string, onSuccess: (didDocument: DIDPlugin.DIDDocument) => void, onError?: (err: any) => void) {
        simulated("loadDidDocument", "SimulatedDIDStore");
    }

    resolveDidDocument(didString: string, onSuccess: (didDocument: DIDPlugin.DIDDocument) => void, onError?: (err: any) => void) {
        simulated("resolveDidDocument", "SimulatedDIDStore");
    }

    storeDidDocument(didDocument: DIDPlugin.DIDDocument, hint: string, onSuccess: () => void, onError?: (err: any) => void) {
        simulated("storeDidDocument", "SimulatedDIDStore");
    }

    updateDidDocument(didDocument: DIDPlugin.DIDDocument, storepass: string, onSuccess?: () => void, onError?: (err: any) => void) {
        simulated("updateDidDocument", "SimulatedDIDStore");
    }
}

export class SimulatedDID implements DIDPlugin.DID {
    getId(): string {
        simulated("getId", "SimulatedDID");
        return "";
    }
    getMethod(onSuccess: (data: any) => void, onError?: (err: any) => void) {
        simulated("getMethod", "SimulatedDID");
    }
    getMethodSpecificId(onSuccess: (data: any) => void, onError?: (err: any) => void) {
        simulated("getMethodSpecificId", "SimulatedDID");
    }
    resolveDidDocument(onSuccess: (didDocument: DIDPlugin.DIDDocument) => void, onError?: (err: any)=>void) {
        simulated("resolveDidDocument", "SimulatedDID");
        onSuccess(null);
    }
    toString(onSuccess: (data: any) => void, onError?: (err: any) => void) {
        simulated("toString", "SimulatedDID");
        onSuccess("");
    }
    issueCredential(subjectDID: string, credentialId: string, types: string[], expirationDate: Date, properties: any, passphrase: string, onSuccess: (credential: DIDPlugin.VerifiableCredential) => void, onError?: (err: any) => void) {
        simulated("issueCredential", "SimulatedDID");
        onSuccess(new SimulatedCredential());
    }
    deleteCredential(credentialId: string, onSuccess?: () => void, onError?: (err: any) => void) {
        simulated("deleteCredential", "SimulatedDID");
        onSuccess();
    }
    listCredentials(onSuccess: (credentials: DIDPlugin.UnloadedVerifiableCredential[]) => void, onError?: (err: any) => void) {
        simulated("listCredentials", "SimulatedDID");
        onSuccess([
            new SimulatedUnloadedCredential(),
            new SimulatedUnloadedCredential(),
            new SimulatedUnloadedCredential()
        ])
    }
    loadCredential(credentialId: string, onSuccess: (credential: DIDPlugin.VerifiableCredential) => void, onError?: (err: any) => void) {
        simulated("loadCredential", "SimulatedDID");
        onSuccess(new SimulatedCredential());
    }
    storeCredential(credential: DIDPlugin.VerifiableCredential, onSuccess?: () => void, onError?: (err: any) => void) {
        simulated("storeCredential", "SimulatedDID");
        onSuccess();
    }
}

export class BrowserSimulation {
    private static _runningInBrowser: boolean = false;
    
    public static setRunningInBrowser() {
        this._runningInBrowser = true;
    }

    public static runningInBrowser() : boolean {
        return this._runningInBrowser;
    }
}