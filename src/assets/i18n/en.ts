export const en = {
    // Generic actions / buttons
    'submit': 'Submit',
    'next': 'Next',
    'copy-to-clipboard': 'Copy to clipboard',
    'copied-to-clipboard': 'Copied to clipboard!',
    'confirm': 'Confirm',
    'go-back': 'Go back',
    'accept': 'Accept',
    'select-one': 'Select one',
    'select-date': 'Select date',
    'enter-here': 'Enter here',
    'backup': 'Backup',
    'delete': 'Delete',
    'edit-visibility': 'Edit visibility',
    'delete-credentials': 'Delete credentials',
    'publish': 'Publish',
    'cancel': 'Cancel',

    // DID operations
    'create-my-did': 'Create my DID',
    'import-my-did': 'Import my DID',
    'create-profile': 'Create Profile',
    'create-new-did-profile': 'Create New DID Profile',
    'import-did-profile': 'Import DID Profile',
    'import-did-popup-content': 'Import DID will overwrite existing DID store',
    'import-did-popup-confirm-question': 'Are you sure?',
    'add-new-did-profile': 'Add New DID Profile',
    'save-profile': 'Save profile',

    // Passwords
    'text-password-input': 'Your password',
    //'setPassword': 'Set Password',
    'your-identity-password': 'Your identity password',
    'repeat-password': 'Repeat Password',
    'import-password1-placeholder': 'Set Password',
    'import-password2-placeholder': 'Repeat Password',
    'text-pwd-validator': 'must be 8 or more characters',
    'password-set': 'Password Set!',
    'password': 'Password',
    'activate-fingerprint-popup-title': 'Fingerprint authentication',
    'activate-fingerprint-popup-content': 'Do you want to enable fingerprint authentication? The password you\'ve just typed will be used.',
    'activate-fingerprint-popup-confirm-question': 'Activate now?',
    'activate-fingerprint-activate': 'Activate',

    // Generic items
    'profile': 'Profile',
    'portfolio': 'Portfolio',
    'credentials': 'Credentials',
    'settings': 'Settings',
    'missing': 'Missing',

    // Profile fields
    'credential-info-type-did': 'DID',
    'credential-info-type-name': 'Name',
    'credential-info-type-email': 'Email',
    'credential-info-type-birthDate': 'Birth date',
    'credential-info-type-gender': 'Gender',
    'credential-info-type-nation': 'Country',
    'credential-info-type-telephone': 'Telephone',
    'credential-info-type-nickname': 'Nickname',
    'credential-info-type-birthPlace': 'Place of birth',
    'credential-info-type-description': 'Description',
    'credential-info-type-url': 'Website',
    'credential-info-type-facebook': 'Facebook',
    'credential-info-type-twitter': 'Twitter',
    'credential-info-type-telegram': 'Telegram',
    'credential-info-type-wechat': 'Wechat',
    'credential-info-type-weibo': 'Weibo',
    'male': 'Male',
    'female': 'Female',
    'your-did': 'Your DID',

    // Error messages
    'text-request-fail': 'request fail',
    'text-request-no-credential': 'no credential',
    'not-set': 'Not set',

    /////////////////////////////////////////////////
    //////////////// SCREEN SPECIFIC ////////////////
    /////////////////////////////////////////////////

    // screen: noidentity
    'welcome': 'Welcome',
    'elastos-did-portfolio': 'elastOS DID Portfolio',
    'welcome-text-intro-1': 'Manage your decentralized identities and share with friends and business that only you allow.',
    'welcome-text-intro-2': 'Own your identity on elastOS!',
    'welcome-text-intro-3': 'First time?',
    'welcome-text-intro-4': 'Let\'s create a DID profile',

    // screen: countrypicker
    'country': 'Country',

    // screen: password set
    'password-set-next-action':'Now let\'s create your profile.<br/>You don\'t need to share all or any of this information if you don\'t want to.',

    // screen: my profile
    'no-picture-placeholder': 'Profile<br/>Picture',
    'my-profile': 'My profile',
    'qr-code': 'QR code',
    'delete-did': 'Delete DID',
    'my-visible-data': 'My Visible Data',
    'my-hidden-data': 'My Hidden Data',
    'deletion-popup-warning': 'Warning!',
    'deletion-popup-content': 'Your identity will be permanently deleted along with all related credentials and third party app connections.',
    'deletion-popup-confirm-question': 'Are you sure?',
    'publish-changes': 'Publish changes',
    'publish-popup-title': 'Publish Your Selected Visibility',
    'publish-popup-content': 'Information will be stored on the blockchain when you confirm and will stay there!',
    'publish-popup-confirm-question': 'Are you sure?',
    'changepassword-success': 'Password changed successfully',

    // screen: edit profile
    'edit-profile': 'Edit profile',
    'edit-profile-intro': 'You can fill in as much or as little as you would like.',
    'name-is-required': 'Name is required.',
    'name-is-missing': 'Please at least provide your name',
    'add-info': 'Add info',

    // screen: did list
    'did-portfolio': 'DID Portfolio',

    // screen: credaccess
    'data-access': 'Data access',
    'data-access-from': 'Data Access From:',
    'credaccess-intro': 'This is a request for information<br/>Please review the following data items.',
    'mandatory-data-access': 'Mandatory Data Access',
    'optional-data-access': 'Optional Data Access',
    'credaccess-information-missing': 'At least one mandatory information is missing from your profile. Please complete your profile first and try again.',

    // screen: credissue
    'credential-import': 'Import Credential',
    'credential-import-from': 'Delivered by',
    'credissue-intro': 'You are about to add one or more credentials issued by a third party to your DID profile. Please carefully review the content.',

    // screen: did credentials
    'did-credentials': 'DID Credentials',
    'no-credential-yet': 'Seems like there is no credential yet.',
    'issuer': 'Issuer',
    'information-it-contains': 'Information it contains',
    'issuer-myself': 'Myself',
    'credential-deletion-popup-content': 'The selected credentials are going to be deleted locally and on chain permanently.',

    // screen: verify mnemonic
    'verification': 'Verification',
    'verify-title': 'Please select your mnemonic words.',
    'verify-subtitle': 'This verification is needed to make sure that your correctly saved your mnemonics.',

    // screen: choose did
    'choose-did': 'Choose DID',
    'choose-did-intro': 'Please select the DID Profile you want to use for this action',

    ////////////////////////////////////////////////////
    //////////////// COMPONENT SPECIFIC ////////////////
    ////////////////////////////////////////////////////

    // component: active-did
    'current-active-profile': 'Current active profile',

    // component: createpassword
    'createpassword-intro': 'Let\'s get started with setting a password.',
    'passwords-dont-match': 'Passwords don\'t match.',
    'changepassword-info' : 'Change password',

    // component: security check
    'security-check': 'Security check! Please type your app password',
    'security-check-fingerprint': 'Security check! Please authenticate',
    'wrong-password': 'Wrong password, please try again.',
    'use-fingerprint-authentication': 'Use fingerprint',

    // component: importdidsource
    'importdidsource-intro': 'How would you like to import your DID?',
    'import-from-mnemonic': 'Type my mnemonic words',
    'import-from-wallet-app': 'Import mnemonic from wallet app',

    // component: mnemonicpasscheck
    'mnemonicpasscheck-question': 'Do you have a mnemonic passphrase?',
    'have-passphrase': 'Yes, I will type it',
    'dont-have-passphrase-dont-know': 'No I don\' have, or I don\'t know',
    'mnemonicpassword-intro': 'Please type your mnemonic passphrase',

    // component: emptyimporteddocument
    'emptyimporteddocument-intro': 'We couldn\'t find any existing information to restore your profile. What would you like to do?',
    'create-an-empty-profile': 'Create an empty profile',

    // loading
    'loading-msg': 'Wait a moment',

    // id transaction
    'publish-success': 'Your public identity information has been sent to the public ID chain. Please wait a few minutes to see your changes live.',
    'publish-error':'Sorry, your public identity information could not be published for now. Please retry after a while.',
};


