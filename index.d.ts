
/**
 * 
 * Path to npm and node... 
 * In cpanel node,npm are in the same directory.
 * @eg cnad.config('/home/user/account_name/nodevenv/site_root/node_version)
 */
 export function config(PATH: string): boolean;

 /**
 * Watch for changes. 
 * 
 * if there is, then the server will restart
 */
 export function watch(RESTART_PATHS: []): void;

 /**
  * 
  * Start auto deployment
  */
  export function start(): void;