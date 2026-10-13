/* MANIFEST · config: the only file a deployer edits.
   Leave the two Supabase values empty and the app runs in LOCAL mode:
   every tab on one machine shares one live session through the browser.
   That is how you rehearse. Fill them in and every phone in the room joins. */
(function (MF) {
'use strict';

MF.APP = {
  name: 'Manifest',
  course: 'Generative AI for Logistics & Supply Chain Professionals',
  date: 'Wednesday 14 October 2026',
  place: 'Pattaya',
  trainer: 'Ayush Kharel'
};

/* The certificate participants receive on their phones at the end of the day.
   linkedinOrgId: the number in CTB's LinkedIn company page admin URL, if you
   have it; it links the certificate to the company page. Leave '' to use the name. */
MF.CERT = {
  title: 'Certificate of Completion',
  issuer: 'Corporate Training Bangkok',
  logo: 'assets/brand/ctb-logo.png',
  course: MF.APP.course,
  detail: 'One-day workshop · 3.5 hours · Pattaya, Thailand',
  dateLong: '14 October 2026',
  issueYear: 2026, issueMonth: 10,
  trainer: MF.APP.trainer,
  trainerRole: 'Trainer',
  skills: ['Prompting with SCR + Constraint', 'Choosing the right AI tool', 'Checking AI output before it leaves your desk'],
  linkedinOrgId: ''
};

/* Supabase project (Settings → API). The anon key is public by design;
   Row Level Security in backend/schema.sql is what guards the data. */
MF.SUPABASE_URL = 'https://rgfxbyxxcniaqqwhughh.supabase.co';
MF.SUPABASE_ANON_KEY = 'sb_publishable_0Mx6Wu7C2OXPTVEVXIaHRA_jP9lK1Q2';

/* The room code people type, and the one the projector shows. */
MF.DEFAULT_ROOM = 'PTY14';

/* Where participants land when they scan the projector QR code.
   Leave empty to use the address the projector page is served from. */
MF.PUBLIC_URL = 'http://173.212.225.199:8100/';

/* 'auto' picks supabase when both values above are set, otherwise local.
   ?driver=local or ?driver=supabase in the address bar overrides it. */
MF.DRIVER = 'auto';

/* Tables in the room. Teams are tables: people sit with their team. */
MF.TEAMS = [
  { id: 'reefer',   name: 'Reefer',   color: '#1F7A72' },
  { id: 'flatrack', name: 'Flat Rack', color: '#E5622A' },
  { id: 'tank',     name: 'Tank',     color: '#2F5D8A' },
  { id: 'dry',      name: 'Dry Van',  color: '#C99A12' },
  { id: 'opentop',  name: 'Open Top', color: '#8A4FA0' },
  { id: 'hicube',   name: 'High Cube', color: '#B23A48' }
];

})(window.MF = window.MF || {});
