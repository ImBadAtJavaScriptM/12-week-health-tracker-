const DB_NAME = 'twelve-week-health-tracker';
const DB_VERSION = 1;
const STORES = ['settings','baseline','dailyEntries','checkpoints','overrides','backupMetadata'];

function openDB() {
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const store of STORES) if (!db.objectStoreNames.contains(store)) db.createObjectStore(store);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore(store, mode, fn) {
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store, mode);
    const os = tx.objectStore(store);
    let req;
    try { req = fn(os); } catch(e) { db.close(); reject(e); return; }
    tx.oncomplete = () => { db.close(); resolve(req?.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function get(store,key) { return withStore(store,'readonly',os=>os.get(key)); }
export async function set(store,key,value) { return withStore(store,'readwrite',os=>os.put(value,key)); }
export async function del(store,key) { return withStore(store,'readwrite',os=>os.delete(key)); }
export async function getAll(store) {
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readonly'); const os=tx.objectStore(store);
    const keysReq=os.getAllKeys(); const valsReq=os.getAll();
    tx.oncomplete=()=>{ const out={}; keysReq.result.forEach((k,i)=>out[k]=valsReq.result[i]); db.close(); resolve(out); };
    tx.onerror=()=>{db.close(); reject(tx.error);};
  });
}

export async function clearAll() {
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORES,'readwrite');
    for (const s of STORES) tx.objectStore(s).clear();
    tx.oncomplete=()=>{db.close(); resolve();};
    tx.onerror=()=>{db.close(); reject(tx.error);};
  });
}

export async function exportData() {
  const data={ format:'12-week-health-tracker-backup', version:1, exportedAt:new Date().toISOString() };
  for (const s of STORES) data[s]=await getAll(s);
  return data;
}

export function validateBackup(data) {
  if (!data || data.format!=='12-week-health-tracker-backup' || data.version!==1) return false;
  return STORES.every(s=>data[s] && typeof data[s]==='object');
}

export async function restoreData(data) {
  if (!validateBackup(data)) throw new Error('Invalid backup file.');
  await clearAll();
  for (const s of STORES) for (const [k,v] of Object.entries(data[s])) await set(s,k,v);
}
