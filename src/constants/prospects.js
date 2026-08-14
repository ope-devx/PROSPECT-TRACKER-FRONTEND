/*
  constants/prospects.js — Single source of truth for all fixed lists and option values.

  WHY THIS FILE EXISTS:
  Every dropdown, badge, filter, and form field that shows a fixed list of options
  imports from here. This means if you ever need to add a new niche (e.g. "Auto Mechanic")
  or rename a status, you change it in ONE place and it updates everywhere automatically.

  The rule is: never type a niche name, status string, or pain signal directly
  inside a component. Always import from here.

  "export const" makes each list available to other files that import it.
*/

/*
  STATUSES — the pipeline stages a prospect moves through.

  Each entry is an object with two properties:
    value — what gets saved to the database/localStorage. Short, machine-friendly.
    label — what the user sees on screen. Human-readable.

  We always STORE the value ("follow_up") and DISPLAY the label ("Follow Up").
  This makes it easy to rename labels without breaking saved data.
*/
export const STATUSES = [
  { value: 'new',            label: 'Not Contacted' },
  { value: 'contacted',      label: 'Contacted'     },
  { value: 'follow_up',      label: 'Follow Up'     },
  { value: 'meeting_booked', label: 'Meeting Booked'},
  { value: 'closed',         label: 'Closed'        },
  { value: 'lost',           label: 'Lost'          },
]

/*
  NICHES — the business categories a prospect can belong to.
  Simple array of strings. Same value stored and displayed.
*/
export const NICHES = [
  'Bakery / Cakes',
  'Photography',
  'Event Planning',
  'Fashion / Tailoring',
  'Catering',
  'Hair / Beauty Salon',
  'Makeup Artist',
  'Clinic / Healthcare',
  'Gym / Fitness',
  'Real Estate',
  'Logistics',
  'Interior Decor',
  'Printing / Branding',
  'Other',
]

/*
  PAIN_SIGNALS — observable signs that a business needs a website.
  These are the checkboxes in the form. We look for these on their Instagram.
*/
export const PAIN_SIGNALS = [
  'People asking price in comments',
  'No booking system',
  'Sending DMs for every enquiry',
  'Price list in story highlights',
  'Running ads with no landing page',
  'Not on Google',
  'No link in bio',
  'Competitors have websites',
]

/*
  ENGAGEMENT_OPTIONS — how actively their Instagram audience interacts with posts.
  High = lots of comments/likes relative to follower count.
*/
export const ENGAGEMENT_OPTIONS = ['High', 'Medium', 'Low']

/*
  WEBSITE_OPTIONS — whether the prospect already has a website.
  "Partial / Broken" and "Yes but outdated" are good selling opportunities.
*/
export const WEBSITE_OPTIONS = [
  'No',
  'Partial / Broken',
  'Yes but outdated',
  'Yes (good)',
]

/*
  SPENDING_OPTIONS — whether they're already spending money on digital ads.
  If they're running ads with no landing page, that's a strong pain signal.
*/
export const SPENDING_OPTIONS = [
  'Yes (running ads)',
  'Yes (boosting posts)',
  'Unknown',
  'No',
]

/*
  SORT_OPTIONS — what order the prospect list can be sorted in.
  Used by the sort dropdown in FilterBar.
  value = the key used in code, label = what the user sees.
*/
export const SORT_OPTIONS = [
  { value: 'score',     label: 'Score (highest first)'  },
  { value: 'date',      label: 'Date added (newest)'    },
  { value: 'followers', label: 'Followers (most first)' },
  { value: 'status',    label: 'Status'                 },
]

/*
  IS_SPENDING — a subset of SPENDING_OPTIONS.
  A prospect is considered "actively spending on ads" only if their
  spending value is one of these two options.

  Used in two places:
  1. The spending filter in useProspects.js ("show only those spending on ads")
  2. The 💰 badge on ProspectCard

  Keeping this as a constant means if we ever add a new "Yes (TikTok ads)" option,
  we only add it here and the filter + badge both update automatically.
*/
export const IS_SPENDING = ['Yes (running ads)', 'Yes (boosting posts)']
