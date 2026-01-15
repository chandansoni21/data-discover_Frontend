import { LogLevel } from "@azure/msal-browser";
 
const hostname = window.location.hostname;
 
export const msalConfig = {
    auth: {
        clientId: process.env.REACT_APP_MS_CLIENTID,
        // authority: "https://login.microsoftonline.com/1772988b-575d-4313-9dbe-d212499a374e",
        authority: "https://login.microsoftonline.com/common",
        redirectUri:  window.location.origin
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {  
        loggerOptions: {    
            loggerCallback: (level, message, containsPii) => {  
                if (containsPii) {      
                    return;    
                }      
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }  
            }  
        }  
    }
};
 
export const loginRequest = {
    //scopes: ["User.Read"]
    scopes: ["User.Read"],
};


export const fileAccessRequest = () => ({
    scopes: ["Files.ReadWrite.All"], // Access to all files
    authority: "https://login.microsoftonline.com/a8801bcb-7990-408e-ab0c-e73eccd70288", // Tenant-specific authority
});
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};
 
 
 