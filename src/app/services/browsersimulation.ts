import { DIDURL } from "../model/didurl.model";

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
    hint: string = "fakehint";
    alias: string = "fakealias";

    constructor(public credentialId: string) {
    }
}

export class SimulatedCredential implements DIDPlugin.VerifiableCredential {
    constructor(public fragment: string, public basicProfileValue: string){
    }

    getId() {
        simulated("getId", "SimulatedCredential");
        return "#"+this.fragment;
    }
    getFragment() {
        simulated("getFragment", "SimulatedCredential");
        return this.fragment;
    }
    getType() {
        simulated("getType", "SimulatedCredential");
        return "BasicProfileCredential";
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
        let subject = {};
        subject[this.fragment] = this.basicProfileValue;
        return subject;
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

    static makeForCredentialId(credentialId: DIDURL): SimulatedCredential {
        let fragment = credentialId.getFragment();
        switch(fragment) {
            case "name":
                return new SimulatedCredential("name", "User_"+randomString());
            case "email":
                return new SimulatedCredential("email", "Email_"+randomString());
            default:
                return new SimulatedCredential("nokey", "novalue");
        }
    }
}

export class SimulatedVerifiablePresentation implements DIDPlugin.VerifiablePresentation {
    credentials: DIDPlugin.VerifiableCredential[] = [];

    constructor() {
        this.credentials.push(SimulatedCredential.makeForCredentialId(new DIDURL("#name")));
        this.credentials.push(SimulatedCredential.makeForCredentialId(new DIDURL("#email")));
        this.credentials.push(SimulatedCredential.makeForCredentialId(new DIDURL("#gender")));
    }
 
    getCredentials(): DIDPlugin.VerifiableCredential[] {
        simulated("getCredentials", "SimulatedVerifiablePresentation");
        return this.credentials;
    }
    toJson(onSuccess: (presentation: DIDPlugin.VerifiablePresentation) => void, onError?: (err: any) => void) {
        simulated("toJson", "SimulatedVerifiablePresentation");
        onSuccess(this);
    }
    isValid(onSuccess: (isValid: boolean) => void, onError?: (err: any) => void) {
        simulated("isValid", "SimulatedVerifiablePresentation");
        onSuccess(true);
    }
    isGenuine(onSuccess: (isValid: boolean) => void, onError?: (err: any) => void) {
        simulated("isGenuine", "SimulatedVerifiablePresentation");
        onSuccess(true);
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

    containsPrivateIdentity(onSuccess: (containsPrivateIdentity: boolean) => void, onError?: (err: any) => void) {
        simulated("containsPrivateIdentity", "SimulatedDIDStore");
    }

    deleteDid(didString: string, onSuccess: () => void, onError?: (err: any) => void) {
        simulated("deleteDid", "SimulatedDIDStore");
    }

    newDid(passphrase: string, alias: string, onSuccess: (did: DIDPlugin.DID, didDocument: DIDPlugin.DIDDocument) => void, onError?: (err: any) => void) {
        simulated("newDid", "SimulatedDIDStore");
        onSuccess(new SimulatedDID(), null);
    }

    listDids(filter: any, onSuccess: (dids: DIDPlugin.DID[]) => void, onError?: (err: any) => void) {
        simulated("listDids", "SimulatedDIDStore");
        onSuccess([
            new SimulatedDID(),
            new SimulatedDID(),
            new SimulatedDID()
        ])
    }

    loadDidDocument(didString: string, onSuccess: (didDocument: DIDPlugin.DIDDocument) => void, onError?: (err: any) => void) {
        simulated("loadDidDocument", "SimulatedDIDStore");
    }

    resolveDidDocument(didString: string, onSuccess: (didDocument: DIDPlugin.DIDDocument) => void, onError?: (err: any) => void) {
        simulated("resolveDidDocument", "SimulatedDIDStore");
    }

    storeDidDocument(didDocument: DIDPlugin.DIDDocument, alias: string, onSuccess: () => void, onError?: (err: any) => void) {
        simulated("storeDidDocument", "SimulatedDIDStore");
    }

    updateDidDocument(didDocument: DIDPlugin.DIDDocument, storepass: string, onSuccess?: () => void, onError?: (err: any) => void) {
        simulated("updateDidDocument", "SimulatedDIDStore");
    }

    setResolverUrl(resolver: string, onSuccess: () => void, onError?: (err: any) => void) {
        simulated("setResolverUrl", "SimulatedDIDStore");
    }

    synchronize(storepass: string, onSuccess: () => void, onError?: (err: any) => void) {
        simulated("synchronize", "SimulatedDIDStore");
    }
}

export class SimulatedDID implements DIDPlugin.DID {
    getDIDString(): string {
        simulated("getDIDString", "SimulatedDID");
        return "did:elastos:my-did";
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

    prepareIssuer(onSuccess?: ()=>void) {
        simulated("prepareIssuer", "SimulatedDID");
        onSuccess();
    }

    issueCredential(subjectDID: string, credentialId: string, types: string[], expirationDate: Date, properties: any, passphrase: string, onSuccess: (credential: DIDPlugin.VerifiableCredential) => void, onError?: (err: any) => void) {
        simulated("issueCredential", "SimulatedDID");
        onSuccess(new SimulatedCredential(credentialId, "someproperty"));
    }
    deleteCredential(credentialId: string, onSuccess?: () => void, onError?: (err: any) => void) {
        simulated("deleteCredential", "SimulatedDID");
        onSuccess();
    }
    listCredentials(onSuccess: (credentials: DIDPlugin.UnloadedVerifiableCredential[]) => void, onError?: (err: any) => void) {
        simulated("listCredentials", "SimulatedDID");
        onSuccess([
            new SimulatedUnloadedCredential("name"),
            new SimulatedUnloadedCredential("email"),
            new SimulatedUnloadedCredential("nation"),
            new SimulatedUnloadedCredential("birthDate"),
            new SimulatedUnloadedCredential("gender"),
            new SimulatedUnloadedCredential("telephone")
        ])
    }
    loadCredential(credentialId: DIDPlugin.CredentialID, onSuccess: (credential: DIDPlugin.VerifiableCredential) => void, onError?: (err: any) => void) {
        simulated("loadCredential", "SimulatedDID");
        onSuccess(SimulatedCredential.makeForCredentialId(new DIDURL(credentialId)));
    }
    storeCredential(credential: DIDPlugin.VerifiableCredential, onSuccess?: () => void, onError?: (err: any) => void) {
        simulated("storeCredential", "SimulatedDID");
        onSuccess();
    }
    createVerifiablePresentation(credentials: DIDPlugin.VerifiableCredential[], realm: string, nonce: string, storepass: string, onSuccess: (presentation: DIDPlugin.VerifiablePresentation) => void, onError?: (err: any) => void) {
        simulated("createVerifiablePresentation", "SimulatedDID");
        onSuccess(new SimulatedVerifiablePresentation());
    }
}

export class SimulatedDIDDocument implements DIDPlugin.DIDDocument {
    getId(): string {
        simulated("createVerifiablePresentation", "SimulatedDIDDocument");
        return "SimulatedDIDDocumentId";
    }

    setSubject(subject: any, onSuccess?: (data: any) => void, onError?: (err: any) => void) {
        simulated("setSubject", "SimulatedDIDDocument");
    }

    getCreated(): Date {
        simulated("getCreated", "SimulatedDIDDocument");
        return new Date();
    }
    getUpdated(): Date {
        simulated("getUpdated", "SimulatedDIDDocument");
        return new Date();
    }
    getSubject(): DIDPlugin.DID {
        simulated("getSubject", "SimulatedDIDDocument");
        return new SimulatedDID();
    }
    getPublicKeyCount(): Number {
        simulated("getPublicKeyCount", "SimulatedDIDDocument");
        return 0;
    }
    getPublicKey(didString: string): DIDPlugin.PublicKey {
        simulated("getPublicKey", "SimulatedDIDDocument");
        return null;
    }
    getPublicKeys(): DIDPlugin.PublicKey[] {
        simulated("getPublicKeys", "SimulatedDIDDocument");
        return null;
    }
    deleteCredential(credential: DIDPlugin.VerifiableCredential, storePass: string, onSuccess?: () => void, onError?: (err: any) => void) {
        simulated("deleteCredential", "SimulatedDIDDocument");
    }
    getCredential(credentialId: string): DIDPlugin.VerifiableCredential {
        simulated("getCredential", "SimulatedDIDDocument");
        return null;
    }
    getCredentials(): DIDPlugin.VerifiableCredential[] {
        simulated("getCredentials", "SimulatedDIDDocument");
        return null;
    }

    getDefaultPublicKey(onSuccess: (data: any) => void, onError?: (err: any) => void) {
        simulated("getDefaultPublicKey", "SimulatedDIDDocument");
    }

    addCredential(credential: DIDPlugin.VerifiableCredential, storePass: string, onSuccess?: (d: any) => void, onError?: (err: any) => void) {
        simulated("addCredential", "SimulatedDIDDocument");
    }

    sign(storePass: string, originString: string, onSuccess: (data: any) => void, onError?: (err: any) => void) {
        simulated("sign", "SimulatedDIDDocument");
    }

    verify(signString: string, originString: string, onSuccess: (data: any) => void, onError?: (err: any) => void) {
        simulated("verify", "SimulatedDIDDocument");
    }

    publish(storepass: string, onSuccess?: () => void, onError?: (err: any) => void) {
        simulated("publish", "SimulatedDIDDocument");
    }
}

export class BrowserSimulation {
    private static _runningInBrowser: boolean = false;

    public static setRunningInBrowser() {
        console.warn("Setting app to BROWSER mode (simulated)");
        this._runningInBrowser = true;
    }

    public static runningInBrowser() : boolean {
        return this._runningInBrowser;
    }
}