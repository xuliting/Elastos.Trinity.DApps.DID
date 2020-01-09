import { DIDPluginException } from "../model/exceptions/didplugin.exception";
import { WrongPasswordException } from "../model/exceptions/wrongpasswordexception.exception";

export class DIDHelper {
    /**
     * From a raw JS exception, try to extract more usable information and return clearer
     * exception types such as WrongPasswordException.
     */
    static reworkedDIDPluginException(e: DIDPluginException) {
        if (!e || !e.message)
          return e; // No more info - return the raw error.
  
        if (e.message.includes("password"))
          return new WrongPasswordException();
          
        // All other cases: return the raw error.
        return e;
      }
}