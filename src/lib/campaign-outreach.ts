export type OutreachTemplate = {
  id: string;
  title: string;
  description: string;
  date: string;
  subject: string;
  body: string;
  coaching: string;
};

export const outreachTemplates: readonly OutreachTemplate[] = [
  {
    "id": "warmup",
    "description": "Build anticipation before the campaign goes live",
    "date": "Send before Nov 15",
    "title": "Pre-Launch Warm-Up",
    "subject": "Mark Your Calendar: [Garden Name] Launches a Fundraising Campaign Nov 15!",
    "body": "Dear [Name],\n\nWe have some exciting news \u2014 [Garden Name] has been accepted into the 2026 SeedMoney Challenge, a 30-day fundraising campaign running from November 15 through December 15!\n\nThis is SeedMoney\u2019s annual fundraising event for community food garden projects, and it\u2019s a huge opportunity for us. In addition to keeping 100% of the funds we raise from supporters like you, we\u2019ll be competing for challenge grants of up to $1,000 from SeedMoney based on how much we raise during the 30-day period.\n\nHere\u2019s why we\u2019re reaching out now: SeedMoney is offering a $400 bonus grant to the campaign that raises the most in the first 24 hours, and 50 bonus grants of $100 each to the top 50 campaigns after the first week. That means early support makes an outsized difference.\n\nOur campaign goes live at noon Eastern on Saturday, November 15. We\u2019ll send you the donation link that morning \u2014 if you\u2019re able to give on day one, it would mean the world to us and give our campaign the strongest possible start.\n\nThank you for being part of our community. More details coming soon!\n\nWith gratitude,\n[Your Name]\n[Garden Name]",
    "coaching": "Send this 3\u20135 days before launch. The goal is to prime your supporters so they\u2019re ready to act on November 15, not to ask for money yet. There\u2019s no donation link in this message \u2014 that\u2019s intentional."
  },
  {
    "id": "launch",
    "description": "Announce your campaign and rally day-one support",
    "date": "Nov 15",
    "title": "Launch Day",
    "subject": "Help [Garden Name] Launch Strong in the SeedMoney Challenge!",
    "body": "Dear [Name],\n\nOur garden project is participating in the #SeedMoneyChallenge, a 30-day fundraising challenge, and we could really use your support TODAY!\n\nIn addition to keeping 100% of the funds we raise from individuals like you, we have a chance to win a challenge grant of up to $1,000 from SeedMoney based on how much we raise over the course of the 30-day period running from Nov 15 to Dec 15.\n\nAs extra incentives, SeedMoney is offering:\n\u2022 A $400 bonus grant to the campaign that raises the most in the first 24 hours\n\u2022 50 bonus grants of $100 each to the 50 garden projects that raise the most during the first week\n\nYour support TODAY can put us into the running for one of those bonus grants.\n\nPlease support our work here today: [campaign link]\n\nThank you for believing in our garden and our community!\n\nWith gratitude,\n[Your Name]\n[Garden Name]",
    "coaching": "Send this as soon as the campaign goes live at noon Eastern on November 15. Emphasize \u201ctoday\u201d \u2014 early donations count toward both the 24-hour bonus and the first-week Strong Start Grants."
  },
  {
    "id": "strong",
    "description": "Race to the top 50 for a $100 bonus grant",
    "date": "Nov 21",
    "title": "Strong Start Grant Push",
    "subject": "Help Us Win a $100 Strong Start Grant This Sunday!",
    "body": "Hi [Name],\n\nThe race is on! This Sunday, November 22, SeedMoney will award 50 Strong Start Grants of $100 to the projects that have raised the most during the first week of the 30-day Challenge.\n\nWe\u2019re close \u2014 but we need your help to get into (or stay in) the top 50.\n\nIf you can make a donation today, it will boost our ranking and help position us for the larger grants awarded at the end of the Challenge. Every dollar truly makes a difference.\n\nSupport our project here: [campaign link]\n\nThank you for supporting our project and helping us grow food and community!\n\nWith gratitude,\n[Your Name]\n[Garden Name]",
    "coaching": "This is a competitive, time-bound ask \u2014 your network already knows about the campaign from the launch email, so keep it focused on the leaderboard race. Don\u2019t re-explain the whole program."
  },
  {
    "id": "giving",
    "description": "Tap into the biggest giving day of the year",
    "date": "Dec 1",
    "title": "Giving Tuesday",
    "subject": "Help us grow something good this Giving Tuesday",
    "body": "Hello friends,\n\nOn Giving Tuesday, we\u2019re hoping to grow something special \u2014 fresh, healthy food for neighbors who need it most.\n\nThis year, our garden has:\n\u2022 [Grown and shared X pounds of produce]\n\u2022 [Helped X families access fresh, local food]\n\u2022 [Been supported by X volunteers who show up rain or shine]\n\nWe\u2019re proud of what\u2019s growing here \u2014 but we also have an important need right now.\n\nOur Giving Tuesday Goal\nWe\u2019re raising $[amount] for [your one specific need: seeds, soil, irrigation repairs, two new beds, tools, shade cloth, etc.]. Every gift \u2014 big or small \u2014 helps us grow more food for our community.\n\nIf you believe in gardens, good food, and neighbors helping neighbors, will you support our garden today?\n\nDonate to our SeedMoney campaign here: [campaign link]\n\nYour generosity helps us grow food \u2014 and hope \u2014 here in our community. Thank you for being part of this.\n\nWith gratitude,\n[Your Name]\n[Garden Name]\n\nP.S. Sharing our link with a friend helps more than you\u2019d think!",
    "coaching": "Choose ONE specific need for your Giving Tuesday ask \u2014 donors give more when they know exactly what they\u2019re funding. Examples: drip irrigation repair ($400), seeds + soil for spring ($350), two new raised beds ($600), volunteer tools ($275), shade cloth ($250).\n\nIf you only have 5 minutes, do two things: (1) send this email, and (2) post a short version on Facebook/Instagram Tuesday morning."
  },
  {
    "id": "soil",
    "description": "A mission-driven message about why your work matters",
    "date": "Dec 5",
    "title": "World Soil Day",
    "subject": "Soil = Life. Help Us Grow This World Soil Day.",
    "body": "Dear [Name],\n\nToday is World Soil Day \u2014 a day to recognize the living foundation beneath our feet. Soil = Life, and at [Garden Name], it\u2019s the source of the food we grow and the community we nourish.\n\nYour support this World Soil Day will help us:\n\u2022 [Build healthier soil through composting, raised beds, mulching, soil testing, or organic amendments]\n\u2022 [Grow and share more fresh, nutritious food with our community]\n\u2022 [Teach others how caring for the soil leads to healthier people and a healthier planet]\n\n(Feel free to personalize: \u201cLast season we harvested ___ pounds for our food pantry.\u201d)\n\nSupport our soil and our work here: [campaign link]\n\nAs part of the SeedMoney Challenge, every donation helps unlock challenge grants that multiply your impact. Your gift today moves us closer to our goal before December 15.\n\nThank you for helping us care for the soil \u2014 and for our community.\n\nWith gratitude,\n[Your Name]\n[Garden Name]",
    "coaching": "This is the most mission-oriented message in the set. It works well for supporters who didn\u2019t respond to urgency-based asks but connect with the \u201cwhy\u201d behind your work. Customize the bullet points to reflect what your garden actually does."
  },
  {
    "id": "finish",
    "description": "23 bonus grants for the top final-week fundraisers",
    "date": "Dec 8",
    "title": "Strong Finish",
    "subject": "Help Us Finish Strong! \ud83c\udf31",
    "body": "Hello [Name],\n\nWith less than 7 days left in our 30-day SeedMoney campaign, we\u2019re so close to reaching our goal \u2014 and we need your help to cross the finish line!\n\nSeedMoney is offering 23 Strong Finish Grants to campaigns that raise the most in this final week:\n\u2022 First prize: $500 grant\n\u2022 Second prize: $300 grant\n\u2022 Third prize: $200 grant\n\u2022 Fourth prizes: $100 grants to campaigns ranked 4th\u201323rd\n\nEvery campaign has a shot at these bonus grants, no matter where they started. Your support right now could help us not only reach our goal but also qualify for one of these extra grants!\n\nClick here to support us: [campaign link]\n\nTogether, we can make a lasting impact in our community. Thank you for being part of this journey!\n\nWarm regards,\n[Your Name]\n[Garden Name]",
    "coaching": "This mirrors the Strong Start Grant push from week one \u2014 a competitive, time-bound incentive. The key message: every campaign starts this final week with the same chance to win, regardless of where they stand on the leaderboard."
  },
  {
    "id": "heat",
    "description": "Last full day \u2014 the donation button turns off tomorrow",
    "date": "Dec 14",
    "title": "The Heat Is On",
    "subject": "The Heat Is On \u2014 1 Day Left for [Garden Name]! \ud83d\udd25",
    "body": "Dear [Name],\n\nThe heat is officially on! \ud83d\udd25 With just 1 full day left in our SeedMoney campaign, we\u2019re down to the final push.\n\nSupport us here: [campaign link]\n\nSeedMoney runs this fundraiser just once a year, and when the clock runs out, the donation button turns off. Every gift made today helps us finish strong \u2014 and helps us compete for SeedMoney challenge grant funding.\n\nHere\u2019s why your support matters right now:\n\u2022 Every donation moves us up the leaderboard.\n\u2022 Every dollar raised increases the size of the challenge grant we can earn.\n\u2022 Momentum in the final hours can make a real difference.\n\nWe\u2019re incredibly grateful for the support we\u2019ve already received, and we\u2019re feeling the warmth of this community behind us. If you\u2019ve been thinking about giving \u2014 or giving one last nudge to friends or family \u2014 today is the day.\n\nThanks for helping us turn up the heat and cross the finish line strong.\n\nWith gratitude,\n[Your Name]\n[Garden Name]",
    "coaching": "This message serves a dual audience: people who haven\u2019t donated yet AND people who already have. Existing donors are asked to share, not give again. That\u2019s important \u2014 it prevents donor fatigue while still giving everyone a way to help."
  },
  {
    "id": "final",
    "description": "Campaign ends at noon Eastern \u2014 absolute last chance",
    "date": "Dec 15",
    "title": "Final Hours",
    "subject": "Last Chance to Support [Garden Name]",
    "body": "Dear [Name],\n\nWe are in the final hours of our SeedMoney campaign.\n\nAt noon Eastern today, the donate button on our campaign page will be turned off and no further gifts can be accepted.\n\nEvery additional dollar raised before noon helps us qualify for a larger SeedMoney grant and increases what we can do in our community next year.\n\nIf you\u2019ve been meaning to give, or to share our campaign with a friend, now is the moment.\n\nSupport us here: [campaign link]\n\nYour support in these final hours will help provide healthy food, hands-on learning opportunities, and a welcoming community space through our garden.\n\nThank you for being part of this final push.\n\nWith gratitude,\n[Your Name]\n[Garden Name]",
    "coaching": "Keep this short and direct. By message #8, your supporters know the story. The only thing that matters is the deadline: noon Eastern today. Send this first thing in the morning."
  },
  {
    "id": "thanks",
    "description": "Express gratitude and share what happens next",
    "date": "Dec 16+",
    "title": "Thank You",
    "subject": "Thank You from [Garden Name] \u2014 Here\u2019s What You Helped Make Possible",
    "body": "Dear [Name],\n\nThe 2026 SeedMoney Challenge has ended, and we want to say a heartfelt thank you.\n\nThanks to [number] generous supporters, [Garden Name] raised $[amount] during the 30-day campaign. Every single gift \u2014 whether $10 or $100 \u2014 brought us closer to our goal and helped strengthen our garden and our community.\n\nHere\u2019s what your support will help us do:\n\u2022 [Briefly describe 1\u20132 specific things the funds will go toward, e.g., \u201cBuild four new raised beds for our youth gardening program\u201d]\n\u2022 [E.g., \u201cPurchase seeds and soil amendments for our spring growing season\u201d]\n\nWhat happens next: SeedMoney will determine final challenge grant awards and disburse all funds \u2014 including both your donations and any grant funding we\u2019ve earned \u2014 in January. We\u2019ll share an update once we know our final grant award.\n\nIn the meantime, we\u2019d love for you to stay connected with [Garden Name]. Whether that means volunteering, visiting the garden, or simply following along as we grow, you are part of this.\n\nThank you for believing in fresh food, good soil, and neighbors helping neighbors.\n\nWith deep gratitude,\n[Your Name]\n[Garden Name]\n\nP.S. If you\u2019d like to stay in the loop, [follow us on social media / join our email list / visit us at the garden].",
    "coaching": "Send this within a few days of the campaign closing. It does three things: expresses genuine gratitude, tells donors what their money will do, and sets expectations about the January disbursement timeline. Donors who see their impact are more likely to support you again."
  }
];
