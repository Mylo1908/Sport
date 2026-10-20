// Public Firebase Web configuration; no passwords or service-account credentials.
// Owner UID and production rules verified in Firebase console and emulator.
export const cloudConfig={
 enabled:true,
 ownerUid:'tVziIqlWLEhjrRxdHqe2Dw4G2Ip2',
 adminUid:'tVziIqlWLEhjrRxdHqe2Dw4G2Ip2',
 firebase:{
  apiKey:'AIzaSyB-wf5QDZx2f88rO7qNnV_kiogcBbWjAW8',
  authDomain:'sport-private.firebaseapp.com',
  projectId:'sport-private',
  appId:'1:970331240247:web:f1aec7f7ed11a6bca48cb2'
 }
};
export const cloudReady=()=>cloudConfig.enabled&&!!cloudConfig.ownerUid&&cloudConfig.ownerUid===cloudConfig.adminUid&&Object.values(cloudConfig.firebase).every(Boolean);
