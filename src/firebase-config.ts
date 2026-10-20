// Public web configuration only. Keep disabled until Spark, UID and deployed rules are verified.
export const cloudConfig={
 enabled:false,
 ownerUid:'',
 adminUid:'',
 firebase:{apiKey:'',authDomain:'',projectId:'',appId:''}
};
export const cloudReady=()=>cloudConfig.enabled&&!!cloudConfig.ownerUid&&cloudConfig.ownerUid===cloudConfig.adminUid&&Object.values(cloudConfig.firebase).every(Boolean);
