import type { Database } from './schema'

// Deterministic seed implementing the Ideation north-star story:
//   3 producers make a SAMPLE → a beatmaker makes a BEAT that USES the sample
//   (he is NOT on the sample roster) → sample goes to a pack → clearance-ready.
// "You" are Nova (current user). Kilo, Rue are linked collaborators. Zed is a beatmaker.

const T0 = '2026-05-02T18:20:00.000Z'
const T1 = '2026-05-02T18:41:00.000Z'
const T2 = '2026-06-14T22:05:00.000Z'
const T3 = '2026-07-19T15:30:00.000Z'
const T4 = '2026-07-24T11:12:00.000Z'

export function buildSeed(): Database {
  return {
    version: 1,
    current_user_id: 'u_nova',
    users: [
      {
        id: 'u_nova',
        email: 'nova@cosign.app',
        display_name: 'Nova',
        legal_name: 'Nadia Volkov',
        pro_name: 'ASCAP',
        pro_ipi: '00831142771',
        publisher_name: 'Nightbloom Publishing',
        publisher_ipi: '00922331',
        contact_email: 'nova@cosign.app',
        contact_social: '@novamakesbeats',
        notes: '',
        avatar_hue: 268,
        created_at: T0,
      },
      {
        id: 'u_kilo',
        email: 'kilo@cosign.app',
        display_name: 'Kilo',
        legal_name: 'Kwame Osei',
        pro_name: 'BMI',
        pro_ipi: '00514882900',
        publisher_name: '',
        publisher_ipi: '',
        contact_email: 'kilo@cosign.app',
        contact_social: '@kilo.wav',
        notes: '',
        avatar_hue: 150,
        created_at: T0,
      },
      {
        id: 'u_rue',
        email: 'rue@cosign.app',
        display_name: 'Rue',
        legal_name: 'Ruth Delacroix',
        pro_name: 'ASCAP',
        pro_ipi: '00778120043',
        publisher_name: 'Rue Songs',
        publisher_ipi: '00655120',
        contact_email: 'rue@cosign.app',
        contact_social: '@rue',
        notes: '',
        avatar_hue: 24,
        created_at: T0,
      },
    ],
    contacts: [
      {
        id: 'c_zed',
        owner_user_id: 'u_nova',
        display_name: 'Zed',
        legal_name: 'Ezekiel Marsh',
        pro_name: 'BMI',
        pro_ipi: '',
        publisher_name: '',
        publisher_ipi: '',
        contact_email: 'zed.beats@gmail.com',
        contact_social: '@zedonthebeat',
        notes: 'Beatmaker. Not on CoSign yet — invited 2026-07-20.',
        avatar_hue: 200,
        linked_user_id: null,
        created_at: T2,
      },
    ],
    works: [
      {
        id: 'w_sample',
        type: 'sample',
        primary_title: 'Velvet Static',
        notes: 'Warm rhodes + tape hiss loop. 74 BPM, key of F#m.',
        cover_url: '',
        created_by: 'u_nova',
        agreement_status: 'confirmed',
        created_at: T1,
        updated_at: T4,
      },
      {
        id: 'w_beat',
        type: 'beat',
        primary_title: 'Velvet Static (Type Beat)',
        notes: 'Drill flip built on the Velvet Static sample. Sold exclusive on BeatStars.',
        cover_url: '',
        created_by: 'u_nova',
        agreement_status: 'confirmed',
        created_at: T2,
        updated_at: T2,
      },
      {
        id: 'w_song',
        type: 'song',
        primary_title: 'No Ceilings',
        notes: 'Indie artist cut using Velvet Static. ~200k monthly listeners. Clearance in progress.',
        cover_url: '',
        created_by: 'u_rue',
        agreement_status: 'pending',
        created_at: T3,
        updated_at: T4,
      },
    ],
    akas: [
      { id: 'a_1', work_id: 'w_sample', title: 'rhodesloop_final_v3', added_by: 'u_nova', created_at: T1 },
      { id: 'a_2', work_id: 'w_sample', title: 'Velvet (pack cut)', added_by: 'u_kilo', created_at: T2 },
      { id: 'a_3', work_id: 'w_beat', title: 'Midnight Drill Type Beat', added_by: 'u_nova', created_at: T2 },
    ],
    links: [
      { id: 'l_1', work_id: 'w_sample', label: 'Drive folder', url: 'https://drive.google.com/velvet-static' },
      { id: 'l_2', work_id: 'w_beat', label: 'BeatStars listing', url: 'https://beatstars.com/velvet-static' },
      { id: 'l_3', work_id: 'w_song', label: 'Spotify', url: 'https://open.spotify.com/no-ceilings' },
    ],
    contributions: [
      // SAMPLE roster — 3 producers, even split. Zed is NOT here (he only made the beat).
      { id: 'ct_1', work_id: 'w_sample', user_id: 'u_nova', contact_id: null, role: 'Sample Creator', split_percent: 33.34, confirm_status: 'confirmed', offline_confirmed_at: null, offline_note: '' },
      { id: 'ct_2', work_id: 'w_sample', user_id: 'u_kilo', contact_id: null, role: 'Sample Creator', split_percent: 33.33, confirm_status: 'confirmed', offline_confirmed_at: null, offline_note: '' },
      { id: 'ct_3', work_id: 'w_sample', user_id: 'u_rue', contact_id: null, role: 'Sample Creator', split_percent: 33.33, confirm_status: 'confirmed', offline_confirmed_at: null, offline_note: '' },
      // BEAT roster — Zed (local contact) produced the beat using the sample; Nova co-produced.
      { id: 'ct_4', work_id: 'w_beat', user_id: null, contact_id: 'c_zed', role: 'Producer', split_percent: 50, confirm_status: 'awaiting_account', offline_confirmed_at: null, offline_note: '' },
      { id: 'ct_5', work_id: 'w_beat', user_id: 'u_nova', contact_id: null, role: 'Co-Producer', split_percent: 50, confirm_status: 'confirmed', offline_confirmed_at: null, offline_note: '' },
      // SONG roster — Rue topline + writer, plus sample carve-out placeholder.
      { id: 'ct_6', work_id: 'w_song', user_id: 'u_rue', contact_id: null, role: 'Topline', split_percent: 50, confirm_status: 'confirmed', offline_confirmed_at: null, offline_note: '' },
      { id: 'ct_7', work_id: 'w_song', user_id: 'u_nova', contact_id: null, role: 'Writer', split_percent: 50, confirm_status: 'pending', offline_confirmed_at: null, offline_note: '' },
    ],
    lineage: [
      { id: 'ln_1', parent_work_id: 'w_sample', child_work_id: 'w_beat', relation: 'uses', created_at: T2 },
      { id: 'ln_2', parent_work_id: 'w_sample', child_work_id: 'w_song', relation: 'uses', created_at: T3 },
    ],
    proposals: [
      {
        id: 'p_1',
        work_id: 'w_song',
        proposed_by: 'u_rue',
        status: 'pending',
        summary: 'Add Nova as Writer (50/50) for the sample interpolation on No Ceilings.',
        payload: [
          { contribution_id: 'ct_6', user_id: 'u_rue', contact_id: null, role: 'Topline', split_percent: 50 },
          { contribution_id: 'ct_7', user_id: 'u_nova', contact_id: null, role: 'Writer', split_percent: 50 },
        ],
        created_at: T4,
        resolved_at: null,
      },
    ],
    votes: [
      { id: 'v_1', proposal_id: 'p_1', voter_user_id: 'u_rue', vote: 'approve', created_at: T4 },
    ],
    events: [
      { id: 'e_1', work_id: 'w_sample', actor_user_id: 'u_nova', type: 'created', message: 'Nova created the sample “Velvet Static”.', created_at: T1 },
      { id: 'e_2', work_id: 'w_sample', actor_user_id: 'u_kilo', type: 'aka_added', message: 'Kilo added AKA “Velvet (pack cut)”.', created_at: T2 },
      { id: 'e_3', work_id: 'w_beat', actor_user_id: 'u_nova', type: 'created', message: 'Nova created the beat “Velvet Static (Type Beat)”.', created_at: T2 },
      { id: 'e_4', work_id: 'w_beat', actor_user_id: 'u_nova', type: 'lineage_added', message: 'Linked lineage: this beat uses “Velvet Static”.', created_at: T2 },
      { id: 'e_5', work_id: 'w_song', actor_user_id: 'u_rue', type: 'created', message: 'Rue created the song “No Ceilings”.', created_at: T3 },
      { id: 'e_6', work_id: 'w_song', actor_user_id: 'u_rue', type: 'proposal_opened', message: 'Rue proposed adding Nova as Writer (50/50).', created_at: T4 },
    ],
    shareLinks: [],
    notifications: [
      {
        id: 'n_1',
        user_id: 'u_nova',
        type: 'approval_requested',
        title: 'Rue needs your approval',
        body: '“No Ceilings” — proposed adding you as Writer at 50%.',
        work_id: 'w_song',
        read_at: null,
        created_at: T4,
      },
      {
        id: 'n_2',
        user_id: 'u_nova',
        type: 'added_to_work',
        title: 'You were added to “No Ceilings”',
        body: 'Rue added you to the roster.',
        work_id: 'w_song',
        read_at: null,
        created_at: T3,
      },
    ],
    invites: [
      { id: 'i_1', email: 'zed.beats@gmail.com', invited_by: 'u_nova', work_id: 'w_beat', contact_id: 'c_zed', token: 'seedtokenzed000000000000', status: 'sent', created_at: T2 },
    ],
  }
}
