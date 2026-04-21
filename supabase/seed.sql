-- Seed data for local development.
-- This file runs after migrations when you execute: supabase db reset

-- ─── Competition (ongoing: Dec 1 2025 → Apr 24 2026) ────────────────────────
INSERT INTO public.competition_metadata (competition_id, start_date, end_date, is_current)
VALUES (1, '2025-12-01', '2026-04-24', true);

-- ─── Campaign (seed test campaign tied to competition 1) ────────────────────
-- status must be 'approved' so DashboardShell does NOT short-circuit into
-- NotComplete ('in_progress') or Pending ('submitted_under_review').
INSERT INTO public.campaigns (
  campaign_id, name, givebutterlink, status, goal,
  raised, donors, competition_id, date_created
) VALUES (
  1,
  'Seed Test Campaign',
  'https://givebutter.com/c/seed-test',
  'approved',
  5000,
  0, 0,
  1,
  '2025-12-01'
);

-- ─── Transactions (~45 rows across Dec 2025 → Apr 10 2026) ──────────────────
-- Designed to exercise: normal days, big spikes, multi-donor days, a six-day
-- consecutive streak, multi-week gaps, "today" edge, and 3 non-success rows
-- that should be filtered out once the converter lands.
INSERT INTO public.transactions
  (campaign_id, date, amount_donated, total_paid, first_name, last_name, email, phone, status)
VALUES
  (1, '2025-12-01',   50,   51.50, 'Alex',       'Chen',       'alex.chen@example.com',       '555-0101', 'succeeded'),
  (1, '2025-12-02',   25,   25.75, 'Maria',      'Lopez',      'maria.lopez@example.com',     '555-0102', 'succeeded'),
  (1, '2025-12-05',  100,  103.00, 'James',      'Patel',      'james.patel@example.com',     '555-0103', 'succeeded'),
  (1, '2025-12-10',   30,   30.90, 'Sarah',      'Kim',        'sarah.kim@example.com',       '555-0104', 'succeeded'),
  (1, '2025-12-15',   75,   77.25, 'David',      'Nguyen',     'david.nguyen@example.com',    '555-0105', 'succeeded'),
  (1, '2025-12-20',  500,  515.00, 'Priya',      'Shah',       'priya.shah@example.com',      '555-0106', 'succeeded'),
  (1, '2025-12-24',   40,   41.20, 'Chris',      'Johnson',    'chris.johnson@example.com',   '555-0107', 'succeeded'),
  (1, '2025-12-24',   60,   61.80, 'Emily',      'Wright',     'emily.wright@example.com',    '555-0108', 'succeeded'),
  (1, '2025-12-28',   20,   20.60, 'Ryan',       'O''Connor',  'ryan.oconnor@example.com',    '555-0109', 'succeeded'),
  (1, '2025-12-31',  200,  206.00, 'Lauren',     'Park',       'lauren.park@example.com',     '555-0110', 'succeeded'),
  (1, '2026-01-03',   45,   46.35, 'Nina',       'Gomez',      'nina.gomez@example.com',      '555-0111', 'succeeded'),
  (1, '2026-01-05',   30,   30.90, 'Tom',        'Weaver',     'tom.weaver@example.com',      '555-0112', 'succeeded'),
  (1, '2026-01-08',   85,   87.55, 'Hana',       'Tanaka',     'hana.tanaka@example.com',     '555-0113', 'succeeded'),
  (1, '2026-01-12', 1500, 1545.00, 'Acme Corp',  'Inc',        'giving@acmecorp.example.com', '555-0114', 'succeeded'),
  (1, '2026-01-15',   50,   51.50, 'Alicia',     'Brown',      'alicia.brown@example.com',    '555-0115', 'succeeded'),
  (1, '2026-01-15',  500,  515.00, 'Mark',       'Stevens',    'mark.stevens@example.com',    '555-0116', 'failed'),
  (1, '2026-01-20',   25,   25.75, 'Jon',        'Kelly',      'jon.kelly@example.com',       '555-0117', 'succeeded'),
  (1, '2026-01-20',   15,   15.45, 'Mei',        'Wu',         'mei.wu@example.com',          '555-0118', 'succeeded'),
  (1, '2026-01-22',   70,   72.10, 'Greg',       'Alvarez',    'greg.alvarez@example.com',    '555-0119', 'succeeded'),
  (1, '2026-01-28',   40,   41.20, 'Dana',       'Wilson',     'dana.wilson@example.com',     '555-0120', 'succeeded'),
  (1, '2026-02-02',   55,   56.65, 'Ivan',       'Ross',       'ivan.ross@example.com',       '555-0121', 'succeeded'),
  (1, '2026-02-03',   30,   30.90, 'Kim',        'Long',       'kim.long@example.com',        '555-0122', 'succeeded'),
  (1, '2026-02-04',   45,   46.35, 'Paul',       'Reeves',     'paul.reeves@example.com',     '555-0123', 'succeeded'),
  (1, '2026-02-05',  100,  103.00, 'Zoe',        'Martin',     'zoe.martin@example.com',      '555-0124', 'succeeded'),
  (1, '2026-02-06',   25,   25.75, 'Omar',       'Hassan',     'omar.hassan@example.com',     '555-0125', 'succeeded'),
  (1, '2026-02-07',   60,   61.80, 'Leah',       'Grant',      'leah.grant@example.com',      '555-0126', 'succeeded'),
  (1, '2026-02-14',  250,  257.50, 'Valentine',  'Donor',      'valentine@example.com',       '555-0127', 'succeeded'),
  (1, '2026-02-20',   35,   36.05, 'Carlos',     'Rivera',     'carlos.rivera@example.com',   '555-0128', 'succeeded'),
  (1, '2026-02-20',  100,  103.00, 'Kate',       'Obi',        'kate.obi@example.com',        '555-0129', 'pending'),
  (1, '2026-02-25',   80,   82.40, 'Henry',      'Liu',        'henry.liu@example.com',       '555-0130', 'succeeded'),
  (1, '2026-03-01',  150,  154.50, 'Olivia',     'Shaw',       'olivia.shaw@example.com',     '555-0131', 'succeeded'),
  (1, '2026-03-05',   40,   41.20, 'Marcus',     'Reed',       'marcus.reed@example.com',     '555-0132', 'succeeded'),
  (1, '2026-03-10',   60,   61.80, 'Nadia',      'Farah',      'nadia.farah@example.com',     '555-0133', 'succeeded'),
  (1, '2026-03-10',   40,   41.20, 'Sam',        'Porter',     'sam.porter@example.com',      '555-0134', 'succeeded'),
  (1, '2026-03-10',   25,   25.75, 'Ashley',     'Kumar',      'ashley.kumar@example.com',    '555-0135', 'succeeded'),
  (1, '2026-03-15',   90,   92.70, 'Victor',     'Hale',       'victor.hale@example.com',     '555-0136', 'succeeded'),
  (1, '2026-03-15',  200,  206.00, 'Rachel',     'Scott',      'rachel.scott@example.com',    '555-0137', 'refunded'),
  (1, '2026-03-20',  200,  206.00, 'Diana',      'Cross',      'diana.cross@example.com',     '555-0138', 'succeeded'),
  (1, '2026-03-25',   50,   51.50, 'Eli',        'Brooks',     'eli.brooks@example.com',      '555-0139', 'succeeded'),
  (1, '2026-03-30',   75,   77.25, 'Isabela',    'Mendes',     'isabela.mendes@example.com',  '555-0140', 'succeeded'),
  (1, '2026-04-02',  100,  103.00, 'Theo',       'Kane',       'theo.kane@example.com',       '555-0141', 'succeeded'),
  (1, '2026-04-05',  300,  309.00, 'Sophia',     'Bennett',    'sophia.bennett@example.com',  '555-0142', 'succeeded'),
  (1, '2026-04-07',   45,   46.35, 'Jason',      'Ortiz',      'jason.ortiz@example.com',     '555-0143', 'succeeded'),
  (1, '2026-04-09',   80,   82.40, 'Morgan',     'Reyes',      'morgan.reyes@example.com',    '555-0144', 'succeeded'),
  (1, '2026-04-10',  120,  123.60, 'Nora',       'Castillo',   'nora.castillo@example.com',   '555-0145', 'succeeded'),
  (1, '2026-04-10',   35,   36.05, 'Lucas',      'Fernandes',  'lucas.fernandes@example.com', '555-0146', 'succeeded');
