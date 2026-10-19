/** Original drawings; third-party reference images are not distributed. */
export const exerciseImages:Record<string,string>={
 incline_smith_press:'smith-incline',pec_deck:'pec-deck',
 seated_lateral_raise:'dumbbells-bench',seated_shoulder_press:'dumbbells-bench',
 rope_pushdown:'cable-tower',single_arm_katana:'cable-tower',
 pullover_machine:'pullover',close_grip_row:'row-machine',heavy_shrugs:'dumbbells-bench',
 rope_hammer_curls:'cable-tower',single_arm_bayesian_curls:'cable-tower',
 single_arm_rear_delt_row:'dumbbells-bench',leg_press:'leg-press',leg_extension:'leg-extension',
 romanian_deadlift:'barbell',lying_leg_curl:'lying-leg-curl',single_leg_adduction:'cable-ankle',
 calf_raise_leg_press:'leg-press',cable_crunches:'cable-tower',wide_grip_row:'row-machine',
 alternating_hammer_curls:'dumbbells-bench'
};
export function standardImage(id:string,base:string){return `${base}exercises/${exerciseImages[id]??id}.svg`}

export function imageSource(id:string,base:string,photo:string|undefined,failed:string[]){const standard=standardImage(id,base);return photo&&!failed.includes(photo)?photo:(exerciseImages[id]||Object.values(exerciseImages).includes(id))&&!failed.includes(standard)?standard:null}

