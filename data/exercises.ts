import { ExerciseCategory, ExerciseDefinition } from '../types';

const commonFields = {
  side: { key: 'side', label: 'Side', type: 'select', options: ['R', 'L', 'Both'], width: 'w-20' } as const,
  weight: { key: 'weight', label: 'Wt', type: 'text', placeholder: 'kg/lb', width: 'w-20' } as const,
  reps: { key: 'reps', label: 'Reps', type: 'text', placeholder: '10x3', width: 'w-20' } as const,
  mins: { key: 'mins', label: 'Mins', type: 'number', placeholder: 'min', width: 'w-20' } as const,
  level: { key: 'level', label: 'Level', type: 'text', placeholder: 'Lvl', width: 'w-20' } as const,
};

export const EXERCISE_DB: ExerciseDefinition[] = [
  // --- ELECTROTHERAPY ---
  { id: 'hot_pack', name: 'Hot pack', category: ExerciseCategory.ELECTROTHERAPY, fields: [] },
  { id: 'ice_pack', name: 'Ice pack', category: ExerciseCategory.ELECTROTHERAPY, fields: [] },
  { id: 'gameready', name: 'Gameready', category: ExerciseCategory.ELECTROTHERAPY, fields: [] },
  { id: 'magnetopulse', name: 'Magnetopulse + Ice', category: ExerciseCategory.ELECTROTHERAPY, fields: [] },
  { id: 'tens', name: 'TENS', category: ExerciseCategory.ELECTROTHERAPY, fields: [] },
  { id: 'ems', name: 'EMS', category: ExerciseCategory.ELECTROTHERAPY, fields: [] },
  { id: 'shockwave', name: 'Shockwave', category: ExerciseCategory.ELECTROTHERAPY, fields: [] },
  { id: 'us', name: 'US', category: ExerciseCategory.ELECTROTHERAPY, fields: [] },
  { id: 'int', name: 'INT', category: ExerciseCategory.ELECTROTHERAPY, fields: [{ key: 'val', label: '/ kg', type: 'text', width: 'w-24' }] },
  { id: 'ipt', name: 'IPT + Stool', category: ExerciseCategory.ELECTROTHERAPY, fields: [{ key: 'val', label: '/ kg', type: 'text', width: 'w-24' }] },
  
  // --- AEROBIC ---
  { id: 'lower_limb_ergo', name: 'Lower limb ergometer (大單車)', category: ExerciseCategory.AEROBIC, fields: [commonFields.level, commonFields.mins] },
  { id: 'nustep', name: 'NuStep (坐式踏步機)', category: ExerciseCategory.AEROBIC, fields: [{ key: 'seat', label: 'Seat', type: 'text', width: 'w-16' }, { key: 'arm', label: 'Arm', type: 'text', width: 'w-16' }, commonFields.level, commonFields.mins] },
  { id: 'treadmill', name: 'Treadmill (跑步機)', category: ExerciseCategory.AEROBIC, fields: [{ key: 'incline', label: 'Inc %', type: 'text', width: 'w-16' }, { key: 'speed', label: 'km/hr', type: 'text', width: 'w-16' }, commonFields.mins] },
  { id: 'stepper', name: 'Stepper (爬山機)', category: ExerciseCategory.AEROBIC, fields: [{ key: 'resistance', label: 'Resist', type: 'text', width: 'w-20' }, commonFields.mins] },
  
  // --- STRENGTHENING ---
  { id: 'biceps_curl', name: 'Biceps curl (肘上拉)', category: ExerciseCategory.STRENGTHENING, fields: [commonFields.weight, commonFields.reps] },
  { id: 'triceps_ext', name: 'Triceps extension (肘下壓)', category: ExerciseCategory.STRENGTHENING, fields: [commonFields.weight, commonFields.reps] },
  { id: 'pect_fly', name: 'Pect fly (蝴蝶式健胸)', category: ExerciseCategory.STRENGTHENING, fields: [commonFields.weight, commonFields.reps] },
  { id: 'lat_pull', name: 'Lat pull down (拉背)', category: ExerciseCategory.STRENGTHENING, fields: [commonFields.weight, commonFields.reps] },
  { id: 'leg_press_2', name: 'Leg press Rm 2 (撐腿機 二房)', category: ExerciseCategory.STRENGTHENING, fields: [commonFields.side, commonFields.weight, commonFields.reps] },
  { id: 'leg_press_3', name: 'Leg press Rm 3 (撐腿機 三房)', category: ExerciseCategory.STRENGTHENING, fields: [commonFields.side, commonFields.weight, commonFields.reps] },
  { id: 'sandbag_knee', name: 'Sandbag knee extension (踢沙包)', category: ExerciseCategory.STRENGTHENING, fields: [commonFields.side, commonFields.weight, commonFields.mins] },
  { id: 'theraband', name: 'Theraband (橡筋帶)', category: ExerciseCategory.STRENGTHENING, fields: [{ key: 'color', label: 'Color', type: 'select', options: ['Yellow', 'Red', 'Green', 'Blue'], width: 'w-24' }, commonFields.mins] },
  
  // --- MOBILIZATION ---
  { id: 'ankle_mob', name: 'Ankle mobilizer (藍船)', category: ExerciseCategory.MOBILIZATION, fields: [commonFields.side, commonFields.mins] },
  { id: 'heel_slide', name: 'Heel slide (腳跟滑動板)', category: ExerciseCategory.MOBILIZATION, fields: [{ key: 'side', label: 'Side', type: 'select', options: ['R', 'L'], width: 'w-20'}, commonFields.mins] },
  { id: 'pedlar', name: 'Pedlar exerciser (小單車)', category: ExerciseCategory.MOBILIZATION, fields: [commonFields.mins] },
  { id: 'rope_pulley', name: 'Reciprocal pulley (拉繩)', category: ExerciseCategory.MOBILIZATION, fields: [{key: 'part', label: 'Part', type: 'select', options: ['Shdr', 'Knee'], width: 'w-20'}, {key: 'dir', label: 'Dir', type: 'select', options: ['Front', 'Side', 'Back'], width: 'w-20'}, commonFields.mins] },

  // --- BALANCE ---
  { id: 'balance_foam', name: 'Balance foam (海棉/平衡墊)', category: ExerciseCategory.BALANCE, fields: [commonFields.side, {key: 'action', label: 'Act', type: 'select', options: ['Stand', 'Step'], width: 'w-24'}, commonFields.mins] },
  { id: 'biodex', name: 'Biodex (平衡機)', category: ExerciseCategory.BALANCE, fields: [{key: 'mode', label: 'Mode', type: 'select', options: ['PS', 'WS', 'LOS', 'MC'], width: 'w-20'}, commonFields.level, commonFields.mins] },
  
  // --- HAND ---
  { id: 'clipping', name: 'Clipping (手指練力夾)', category: ExerciseCategory.HAND, fields: [{ key: 'side', label: 'Side', type: 'select', options: ['R', 'L'], width: 'w-20'}, { key: 'color', label: 'Color', type: 'select', options: ['Yel', 'Red', 'Grn', 'Blu', 'Blk'], width: 'w-20' }, commonFields.mins] },
  { id: 'putty', name: 'Putty (泥膠)', category: ExerciseCategory.HAND, fields: [{ key: 'side', label: 'Side', type: 'select', options: ['R', 'L'], width: 'w-20'}, { key: 'color', label: 'Color', type: 'select', options: ['Bei', 'Yel', 'Red', 'Grn', 'Blu'], width: 'w-20' }, commonFields.mins] },

  // --- OTHERS ---
  { id: 'fit_ball', name: 'Fit ball / Peanut ball', category: ExerciseCategory.OTHERS, fields: [{key: 'action', label: 'Action', type: 'select', options: ['Front/Back', 'L/R', 'Bridge', 'Squat'], width: 'w-32'}, commonFields.mins] },
  { id: 'steps', name: 'Stepping exercise (踏級)', category: ExerciseCategory.OTHERS, fields: [{key: 'height', label: 'Height', type: 'text', placeholder: 'inches', width: 'w-24'}, commonFields.mins] },
];
