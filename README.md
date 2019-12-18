# About

This is the Decentralized IDentity DApp for the Elastos browser/Trinity. It's used to let users create and manage identities, and deliver profile information (credentials) to requesting third party applications.

Read more on [the Elastos developer website](https://developer.elastos.org) to learn more about building and running your own Trinity applications.

# DID Plugin usage

Here are a few important notes about the way we use the DID plugin.

* For now we don't support multiple users (you, your wife, your kid), we support only a single user.
* One user can have multiple identities (Personal, Work, Private ...).
* The app uses a single DIDStore, and this store holds all the identities (DID instances).
* As a consequence, only one mnemonic is used in the app to hold all user's identities.