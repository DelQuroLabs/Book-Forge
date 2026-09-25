import Database from 'better-sqlite3';
import {existsSync,mkdirSync,chmodSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
const source=resolve(process.env.DATA_DIR||'data','ghost-writer.db');
const destination=resolve(process.argv[2]||join(process.env.DATA_DIR||'data','backups',`ghost-writer-${new Date().toISOString().replaceAll(':','-')}.db`));
if(destination===source||existsSync(destination))throw new Error('Choose a new backup filename; backups never overwrite existing files.');
mkdirSync(dirname(destination),{recursive:true,mode:0o700});
const db=new Database(source,{readonly:true,fileMustExist:true});
try {await db.backup(destination);chmodSync(destination,0o600);console.log(`Consistent SQLite backup written to ${destination}`);} finally {db.close();}
