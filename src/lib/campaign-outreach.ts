export type OutreachTemplate = {
  id: string;
  title: string;
  description: string;
  date: string;
  subject: string;
  body: string;
  coaching: string;
};

export function fillOutreachPlaceholders(
  text: string,
  values: Record<string, string>,
): string {
  return text.replace(/\[([^\]]+)\]/g, (placeholder, token: string) => {
    const value = values[token]?.trim();
    return value || placeholder;
  });
}

// Copy source: "SeedMoney 2026 Outreach Templates — Review Copy", Revision 2 (Nov 11, 2026).
export const outreachTemplates: readonly OutreachTemplate[] = [
  {
    id: "warmup",
    description: "Build anticipation before the campaign goes live",
    date: "Send before Nov 15",
    title: "Pre-Launch Warm-Up",
    subject:
      "Mark Your Calendar: [Garden Name] Launches a Fundraising Campaign Nov 15!",
    body: `Dear [Name],

We have some exciting news — our garden, [Garden Name], has been accepted into the 2026 SeedMoney Challenge, a 30-day fundraising campaign running from November 15 through December 15!

SeedMoney’s annual Challenge helps gardens like ours raise funds from their communities and earn grants on top. No platform fee is taken out of what we raise. We can also earn a Challenge Grant of up to $1,000 based on our final fundraising ranking, plus additional bonus grants.

Here’s why we’re reaching out now: SeedMoney is offering a $400 Strongest Start grant to the campaign that raises the most in the first 24 hours, and 50 Strong Start grants of $100 each to the campaigns that raise the most during the first week. Your early support can help us earn one or both of these bonus grants.

Our campaign goes live at noon Eastern on Sunday, November 15. We’ll send you the donation link when our campaign opens — if you’re able to give on day one, it would mean the world to us and give our campaign the strongest possible start.

Thank you for being part of our community. More details coming soon!

With gratitude,
[Your Name]
[Garden Name]`,
    coaching:
      "Send this 3–5 days before launch. The goal is to prime your supporters so they’re ready to act on November 15, not to ask for money yet. There’s no donation link in this message — that’s intentional.",
  },
  {
    id: "launch",
    description: "Announce your campaign and rally day-one support",
    date: "Nov 15",
    title: "Launch Day",
    subject: "Help [Garden Name] Launch Strong in the SeedMoney Challenge!",
    body: `Dear [Name],

Our garden project is participating in the #SeedMoneyChallenge, a 30-day fundraising challenge, and we could really use your support TODAY!

Your gift supports our work to grow healthy food for our community. No platform fee is taken out of what we raise, and we can also earn a SeedMoney Challenge Grant of up to $1,000 based on our final fundraising ranking, plus additional bonus grants. Our campaign runs from noon Eastern on November 15 to noon Eastern on December 15.

As extra incentives, SeedMoney is offering:
• A $400 Strongest Start grant to the campaign that raises the most in the first 24 hours
• 50 Strong Start grants of $100 each to the campaigns that raise the most during the first week

Your support TODAY can put us into the running for one of those bonus grants.

Please support our work here today: [campaign link]

Thank you for believing in our garden and our community!

With gratitude,
[Your Name]
[Garden Name]`,
    coaching:
      "Send this as soon as the campaign goes live at noon Eastern on November 15. Emphasize “today” — early donations count toward both the 24-hour bonus and the first-week Strong Start Grants.",
  },
  {
    id: "strong",
    description: "Race to the top 50 for a $100 bonus grant",
    date: "Nov 21",
    title: "Strong Start Grant Push",
    subject: "Help Us Win a $100 Strong Start Grant This Sunday!",
    body: `Dear [Name],

The race is on! The Strong Start competition closes at noon Eastern this Sunday, November 22. The 50 campaigns that raise the most during the first week of the SeedMoney Challenge will each earn a $100 grant.

Your donation today can help us compete for one of these grants. It also counts toward our total for the Challenge Grants awarded after the campaign ends on December 15. Every dollar supports our garden and helps us finish stronger.

Support our project here: [campaign link]

Thank you for supporting our project and helping us grow food and community!

With gratitude,
[Your Name]
[Garden Name]`,
    coaching:
      "Send on November 21, before the Strong Start fundraising deadline of noon Eastern on November 22. Keep this focused on the deadline and the opportunity to earn a $100 grant. If you mention your current ranking, check it first.",
  },
  {
    id: "giving",
    description: "Tap into the biggest giving day of the year",
    date: "Dec 1",
    title: "Giving Tuesday",
    subject: "Help us grow something good this Giving Tuesday",
    body: `Dear [Name],

On Giving Tuesday, we’re hoping to grow something special — fresh, healthy food for neighbors who need it most.

This year, our garden has:
• Grown and shared [Pounds] pounds of produce
• Helped [Families] families access fresh, local food
• Been supported by [Volunteers] volunteers

We’re proud of what’s growing here — but we also have an important need right now.

Our Giving Tuesday Goal
Our goal today is to raise $[amount] for [specific need]. Every gift — big or small — helps us grow more food for our community.

If you believe in gardens, good food, and neighbors helping neighbors, will you support our garden today?

Donate to our SeedMoney campaign here: [campaign link]

Your generosity helps us grow food — and hope — here in our community. Thank you for being part of this.

With gratitude,
[Your Name]
[Garden Name]

P.S. Sharing our link with a friend helps more than you’d think!`,
    coaching: `Send on Tuesday, December 1. Choose one specific need and a fundraising goal for Giving Tuesday itself. Examples include irrigation repairs, seeds and soil, raised beds, or volunteer tools; use your own costs. Enter accurate figures in the three separate fields. For the amount, enter the number only (for example, 1250); the dollar sign is already included.

After pasting into your email, remove any accomplishment you cannot document. For a new garden, replace the accomplishments section with “With your help, we’re working toward:” and two or three planned outcomes. Adapt the next sentence to fit. You can edit all of the text after pasting.

If time is short, send this email and post a short version on Facebook or Instagram that morning.`,
  },
  {
    id: "soil",
    description: "A mission-driven message about why your work matters",
    date: "Dec 5",
    title: "World Soil Day",
    subject: "Soil = Life. Help Us Grow This World Soil Day.",
    body: `Dear [Name],

Today is World Soil Day — a day to recognize the living foundation beneath our feet. Soil = Life, and at [Garden Name], it’s the source of the food we grow and the community we nourish.

Last season, we harvested [Pounds] pounds of food for our community.

Your support this World Soil Day will help us:
• Build healthier soil through [soil practices]
• Grow and share more fresh, nutritious food with our community
• Teach others how caring for the soil leads to healthier people and a healthier planet

Support our soil and our work here: [campaign link]

Your donation supports our garden and helps us compete for additional SeedMoney grant funding. Our campaign closes at noon Eastern on December 15.

Thank you for helping us care for the soil — and for our community.

With gratitude,
[Your Name]
[Garden Name]`,
    coaching: `Send on Saturday, December 5. Focus on why healthy soil matters to your garden. Enter practices you use or plan to use, such as composting, mulching, or soil testing.

After pasting into your email, remove the harvest sentence if your garden is new or you do not have a reliable figure. Adapt the other statements to reflect what your garden does. You can edit all of the text after pasting.`,
  },
  {
    id: "finish",
    description: "23 bonus grants for the top final-week fundraisers",
    date: "Dec 8",
    title: "Strong Finish",
    subject: "Help Us Finish Strong! 🌱",
    body: `Dear [Name],

With one week left in our SeedMoney campaign, we’re making our final push — and your support can help us finish strong!

SeedMoney is offering 23 Strong Finish grants to the campaigns that raise the most from noon Eastern on December 8 through noon Eastern on December 15:
• First place: $500 grant
• Second place: $300 grant
• Third place: $200 grant
• 4th through 23rd place: $100 grant each

Only funds raised during this final week count toward Strong Finish awards, so we can compete regardless of our earlier fundraising total. Your support will help us do more for our garden and could help us earn one of these bonus grants!

Click here to support us: [campaign link]

Together, we can make a lasting impact in our community. Thank you for being part of this journey!

With gratitude,
[Your Name]
[Garden Name]`,
    coaching:
      "Send at or after noon Eastern on December 8, when the final seven-day competition begins. Strong Finish awards depend only on money raised during that period, regardless of earlier fundraising totals. Those donations also count toward the campaign’s overall total for the main Challenge Grants.",
  },
  {
    id: "heat",
    description: "Last full day — the donation button turns off tomorrow",
    date: "Dec 14",
    title: "The Heat Is On",
    subject: "The Heat Is On — [Garden Name]’s Campaign Ends Tomorrow! 🔥",
    body: `Dear [Name],

The heat is officially on! 🔥 Our SeedMoney campaign closes tomorrow, Tuesday, December 15, at noon Eastern. We’re down to the final push.

Support us here: [campaign link]

SeedMoney runs this Challenge once a year. Every gift made before the deadline supports our garden and helps us compete for SeedMoney grants.

Here’s why your support matters right now:
• Every donation adds to our fundraising total.
• Additional support can help us qualify for a larger Challenge Grant.
• Gifts made during this final week also count toward Strong Finish awards.

We’re grateful for the support we’ve already received. If you’ve been thinking about giving, today is a great time to help.

Already donated? Thank you! Sharing our campaign with a friend is another valuable way to help.

Thanks for helping us turn up the heat and cross the finish line strong.

With gratitude,
[Your Name]
[Garden Name]`,
    coaching:
      "Send on Monday, December 14. This message invites people who have not donated to give and explicitly thanks existing donors and invites them to share. Keep the closing time visible: noon Eastern on Tuesday, December 15.",
  },
  {
    id: "final",
    description: "Campaign ends at noon Eastern — absolute last chance",
    date: "Dec 15",
    title: "Final Hours",
    subject: "Last Chance to Support [Garden Name]",
    body: `Dear [Name],

We are in the final hours of our SeedMoney campaign.

Our SeedMoney campaign closes at noon Eastern today, Tuesday, December 15.

Every additional dollar raised before noon supports our garden and can help us qualify for a larger SeedMoney grant.

If you’ve been meaning to give, or to share our campaign with a friend, now is the moment.

Support us here: [campaign link]

Your support in these final hours will help us grow healthy food and strengthen our community.

Thank you for being part of this final push.

With gratitude,
[Your Name]
[Garden Name]`,
    coaching:
      "Send early on Tuesday, December 15, before the campaign closes at noon Eastern. Keep the message short and the deadline clear. Check your email tool’s time zone if you schedule it in advance.",
  },
  {
    id: "thanks",
    description: "Express gratitude and share what happens next",
    date: "Dec 16+",
    title: "Thank You",
    subject:
      "Thank You from [Garden Name] — Here’s What You Helped Make Possible",
    body: `Dear [Name],

The 2026 SeedMoney Challenge has ended, and we want to say a heartfelt thank you.

Thanks to [number] generous supporters, [Garden Name] raised $[amount] in donations during the 30-day campaign. Every gift helped strengthen our garden and our community.

Here’s what your support will help us do:
• [First use]
• [Second use]

What happens next: SeedMoney will confirm Challenge Grant awards after verifying the final results. Distribution of campaign donations and grant funds is scheduled to begin in January 2027. We’ll share our grant results when they’re confirmed.

In the meantime, we’d love for you to stay connected with [Garden Name]. We look forward to sharing what your support makes possible as our garden grows.

Thank you for believing in fresh food, good soil, and neighbors helping neighbors.

With deep gratitude,
[Your Name]
[Garden Name]

P.S. If you’d like to stay in the loop, [stay connected].`,
    coaching: `Send within a few days of the December 15 close. Use the donation total, excluding grants, and the number of distinct supporters rather than the number of transactions. For the amount, enter the number only (for example, 1250); the dollar sign is already included. If you cannot verify the supporter count, remove that phrase after pasting.

For the two bullets, describe what the funds will do, such as “Build four new raised beds” or “Buy seeds and soil amendments.” For the P.S., enter a complete instruction, such as “follow our updates on our Facebook page.”

After pasting into your email, adapt the grant-results sentence if your award is already confirmed. You can edit all of the text after pasting.`,
  },
];
