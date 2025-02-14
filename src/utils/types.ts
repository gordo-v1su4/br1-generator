// TTS Types
export type TTSLanguage = 
  | 'american-english'
  | 'british-english'
  | 'french'
  | 'german'
  | 'italian'
  | 'polish'
  | 'portuguese'
  | 'spanish'
  | 'turkish';

export type TTSVoiceMap = {
  'american-english': [
    'af_aoede',
    'af_nova',
    'af_sarah',
    'af_nicole',
    'af_river',
    'am_adam',
    'am_michael',
    'am_liam'
  ];
  'british-english': ['bf_emma', 'bf_lucy', 'bm_adam', 'bm_james'];
  'french': ['ff_emma', 'ff_lucy', 'fm_adam', 'fm_james'];
  'german': ['gf_emma', 'gf_lucy', 'gm_adam', 'gm_james'];
  'italian': ['if_emma', 'if_lucy', 'im_adam', 'im_james'];
  'polish': ['pf_emma', 'pf_lucy', 'pm_adam', 'pm_james'];
  'portuguese': ['pf_emma', 'pf_lucy', 'pm_adam', 'pm_james'];
  'spanish': ['sf_emma', 'sf_lucy', 'sm_adam', 'sm_james'];
  'turkish': ['tf_emma', 'tf_lucy', 'tm_adam', 'tm_james'];
};

export type TTSVoice = TTSVoiceMap[keyof TTSVoiceMap][number];

export interface VoiceOption {
  id: TTSVoice;
  name: string;
}

// Runtime map of voices by language
export const voicesByLanguage: Record<TTSLanguage, TTSVoice[]> = {
  'american-english': ['af_aoede', 'af_nova', 'af_sarah', 'af_nicole', 'af_river', 'am_adam', 'am_michael', 'am_liam'],
  'british-english': ['bf_emma', 'bf_lucy', 'bm_adam', 'bm_james'],
  'french': ['ff_emma', 'ff_lucy', 'fm_adam', 'fm_james'],
  'german': ['gf_emma', 'gf_lucy', 'gm_adam', 'gm_james'],
  'italian': ['if_emma', 'if_lucy', 'im_adam', 'im_james'],
  'polish': ['pf_emma', 'pf_lucy', 'pm_adam', 'pm_james'],
  'portuguese': ['pf_emma', 'pf_lucy', 'pm_adam', 'pm_james'],
  'spanish': ['sf_emma', 'sf_lucy', 'sm_adam', 'sm_james'],
  'turkish': ['tf_emma', 'tf_lucy', 'tm_adam', 'tm_james']
};

export const languageVoices: VoiceOption[] = [
  { id: 'af_aoede', name: 'Aoede' },
  { id: 'af_nova', name: 'Nova' },
  { id: 'af_sarah', name: 'Sarah' },
  { id: 'af_nicole', name: 'Nicole' },
  { id: 'af_river', name: 'River' },
  { id: 'am_adam', name: 'Adam' },
  { id: 'am_michael', name: 'Michael' },
  { id: 'am_liam', name: 'Liam' },
  { id: 'bf_emma', name: 'Emma' },
  { id: 'bf_lucy', name: 'Lucy' },
  { id: 'bm_adam', name: 'Adam' },
  { id: 'bm_james', name: 'James' },
  { id: 'ff_emma', name: 'Emma' },
  { id: 'ff_lucy', name: 'Lucy' },
  { id: 'fm_adam', name: 'Adam' },
  { id: 'fm_james', name: 'James' },
  { id: 'gf_emma', name: 'Emma' },
  { id: 'gf_lucy', name: 'Lucy' },
  { id: 'gm_adam', name: 'Adam' },
  { id: 'gm_james', name: 'James' },
  { id: 'if_emma', name: 'Emma' },
  { id: 'if_lucy', name: 'Lucy' },
  { id: 'im_adam', name: 'Adam' },
  { id: 'im_james', name: 'James' },
  { id: 'pf_emma', name: 'Emma' },
  { id: 'pf_lucy', name: 'Lucy' },
  { id: 'pm_adam', name: 'Adam' },
  { id: 'pm_james', name: 'James' },
  { id: 'sf_emma', name: 'Emma' },
  { id: 'sf_lucy', name: 'Lucy' },
  { id: 'sm_adam', name: 'Adam' },
  { id: 'sm_james', name: 'James' },
  { id: 'tf_emma', name: 'Emma' },
  { id: 'tf_lucy', name: 'Lucy' },
  { id: 'tm_adam', name: 'Adam' },
  { id: 'tm_james', name: 'James' }
];
