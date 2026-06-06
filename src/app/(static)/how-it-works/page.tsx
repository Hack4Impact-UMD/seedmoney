import type { Metadata } from "next";
import { StaticHtmlPage } from "@/src/components/static-pages/StaticPage";

export const metadata: Metadata = {
  title: "How It Works | SeedMoney",
  description:
    "Overview, key dates, and grants available for the SeedMoney Challenge.",
};

const howItWorksHtml = `
  <!-- Header -->
  <div class="header">
    <h1>The SeedMoney Challenge &mdash; How It Works</h1>
    <div class="subtitle">A free, 30-day crowdfunding challenge for public food garden projects around the world.</div>
  </div>

  <!-- How It Works lead -->
  <p class="lead">
    The SeedMoney Challenge is a free, 30-day crowdfunding opportunity for public food garden
    projects around the world &mdash; including school, community, food bank, and senior gardens.
    Projects keep <strong>100% of what they raise</strong> and can also earn bonus grants from
    <strong>$100 to $1,000</strong> based on performance. The more you raise, the more you can win.
  </p>

  <!-- Key Dates -->
  <div class="block-label">Key Dates</div>
  <div class="dates">
    <div class="date-card">
      <div class="date">November 12</div>
      <div class="date-title">Applications Due</div>
      <div class="date-detail">Applications are due by 11:59 PM Eastern Time. Only complete applications submitted through our website by this time will be accepted.</div>
    </div>
    <div class="date-card">
      <div class="date">November 15</div>
      <div class="date-title">Challenge Begins</div>
      <div class="date-detail">At noon Eastern Time, eligible campaigns go live and can begin raising funds. Let your supporters know in advance so you are ready to hit the ground running.</div>
    </div>
    <div class="date-card">
      <div class="date">December 15</div>
      <div class="date-title">Challenge Ends</div>
      <div class="date-detail">The 30-day Challenge ends at noon Eastern Time. You keep all the funds you have raised, even if you have not reached your goal.</div>
    </div>
  </div>

  <!-- Reassurance -->
  <div class="reassurance">
    Most projects that receive grants do so by setting a realistic goal and reaching out
    steadily to their community throughout the Challenge. <strong>You do not need to finish
    near the top to qualify for funding</strong> &mdash; hundreds of grants are awarded each year.
  </div>

  <!-- Grants Available -->
  <div class="block-label">Grants Available</div>

  <!-- Summary -->
  <div class="summary-strip">
    <div class="summary-card">
      <div class="number">$81,000</div>
      <div class="label">Total Available</div>
    </div>
    <div class="summary-card">
      <div class="number">432</div>
      <div class="label">Grants Available</div>
    </div>
    <div class="summary-card">
      <div class="number">288</div>
      <div class="label">Ranked Projects</div>
    </div>
  </div>

  <!-- Intro: how the grants work -->
  <div class="intro">
    <p class="intro-lead">
      There is no separate grant application: by entering the SeedMoney Challenge, your project
      is automatically considered for <strong>every grant it qualifies for</strong>, based on how
      much it raises and where it is located. A project can win in more than one category.
    </p>
    <div class="example">
      <div class="example-label">For example</div>
      <p>
        A project that raises <strong>$3,000</strong> and qualifies for a <strong>$400</strong>
        Challenge Grant, a <strong>$100</strong> Strong Start Grant, and a <strong>$100</strong>
        Strong Finish Grant would receive a check for <strong>$3,600</strong> &mdash; the amount
        raised plus all grants combined.
      </p>
    </div>
  </div>

  <!-- Challenge Grants -->
  <div class="section">
    <div class="section-header">
      <div class="dot" style="background: var(--green-600);"></div>
      <h2>Challenge Grants</h2>
      <span class="section-total">$57,600 &middot; 288 grants</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Grant</th>
            <th># Grants</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span class="rank">
                <span class="rank-badge gold">1</span>
                <span class="rank-label">1st Place</span>
              </span>
            </td>
            <td>$1,000</td>
            <td>1</td>
            <td>$1,000</td>
          </tr>
          <tr>
            <td>
              <span class="rank">
                <span class="rank-badge silver">2</span>
                <span class="rank-label">2nd Place</span>
              </span>
            </td>
            <td>$900</td>
            <td>1</td>
            <td>$900</td>
          </tr>
          <tr>
            <td>
              <span class="rank">
                <span class="rank-badge bronze">3</span>
                <span class="rank-label">3rd Place</span>
              </span>
            </td>
            <td>$800</td>
            <td>1</td>
            <td>$800</td>
          </tr>
          <tr>
            <td>
              <span class="rank">
                <span class="rank-badge tier">4–9</span>
                <span class="rank-label">Tier A<span class="rank-sublabel">6 projects</span></span>
              </span>
            </td>
            <td>$600</td>
            <td>6</td>
            <td>$3,600</td>
          </tr>
          <tr>
            <td>
              <span class="rank">
                <span class="rank-badge tier">10–18</span>
                <span class="rank-label">Tier B<span class="rank-sublabel">9 projects</span></span>
              </span>
            </td>
            <td>$500</td>
            <td>9</td>
            <td>$4,500</td>
          </tr>
          <tr>
            <td>
              <span class="rank">
                <span class="rank-badge tier">19–36</span>
                <span class="rank-label">Tier C<span class="rank-sublabel">18 projects</span></span>
              </span>
            </td>
            <td>$400</td>
            <td>18</td>
            <td>$7,200</td>
          </tr>
          <tr>
            <td>
              <span class="rank">
                <span class="rank-badge tier">37–72</span>
                <span class="rank-label">Tier D<span class="rank-sublabel">36 projects</span></span>
              </span>
            </td>
            <td>$300</td>
            <td>36</td>
            <td>$10,800</td>
          </tr>
          <tr>
            <td>
              <span class="rank">
                <span class="rank-badge tier">73–144</span>
                <span class="rank-label">Tier E<span class="rank-sublabel">72 projects</span></span>
              </span>
            </td>
            <td>$200</td>
            <td>72</td>
            <td>$14,400</td>
          </tr>
          <tr>
            <td>
              <span class="rank">
                <span class="rank-badge tier">145–288</span>
                <span class="rank-label">Tier F<span class="rank-sublabel">144 projects</span></span>
              </span>
            </td>
            <td>$100</td>
            <td>144</td>
            <td>$14,400</td>
          </tr>
          <tr class="subtotal">
            <td colspan="2">Subtotal</td>
            <td>288</td>
            <td>$57,600</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Timing Grants -->
  <div class="section">
    <div class="section-header">
      <div class="dot" style="background: var(--gold-500);"></div>
      <h2>Strong Start &amp; Strong Finish Grants</h2>
      <span class="section-total">$8,400 &middot; 74 grants</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Grant</th>
            <th>Amount</th>
            <th># Grants</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span class="timing-icon">
                <svg viewBox="0 0 24 24" fill="var(--gold-500)"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                <span class="rank-label">Strongest Start<span class="rank-sublabel">Most raised in the first 24 hours</span></span>
              </span>
            </td>
            <td>$400</td>
            <td>1</td>
            <td>$400</td>
          </tr>
          <tr>
            <td>
              <span class="timing-icon">
                <svg viewBox="0 0 24 24" fill="var(--gold-400)"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                <span class="rank-label">Strong Start<span class="rank-sublabel">Top 50 by amount raised in the first 7 days</span></span>
              </span>
            </td>
            <td>$100</td>
            <td>50</td>
            <td>$5,000</td>
          </tr>
          <tr>
            <td>
              <span class="timing-icon">
                <svg viewBox="0 0 24 24" fill="var(--green-600)"><path d="M5 13l4 4L19 7"/><path d="M5 13l4 4L19 7" fill="none" stroke="var(--green-600)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="rank-label">Strong Finish — 1st<span class="rank-sublabel">Most raised in the final 7 days</span></span>
              </span>
            </td>
            <td>$500</td>
            <td>1</td>
            <td>$500</td>
          </tr>
          <tr>
            <td>
              <span class="timing-icon">
                <svg viewBox="0 0 24 24" fill="var(--green-500)"><path d="M5 13l4 4L19 7"/><path d="M5 13l4 4L19 7" fill="none" stroke="var(--green-500)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="rank-label">Strong Finish — 2nd<span class="rank-sublabel">2nd by amount raised in the final 7 days</span></span>
              </span>
            </td>
            <td>$300</td>
            <td>1</td>
            <td>$300</td>
          </tr>
          <tr>
            <td>
              <span class="timing-icon">
                <svg viewBox="0 0 24 24" fill="var(--green-400)"><path d="M5 13l4 4L19 7"/><path d="M5 13l4 4L19 7" fill="none" stroke="var(--green-400)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="rank-label">Strong Finish — 3rd<span class="rank-sublabel">3rd by amount raised in the final 7 days</span></span>
              </span>
            </td>
            <td>$200</td>
            <td>1</td>
            <td>$200</td>
          </tr>
          <tr>
            <td>
              <span class="timing-icon">
                <svg viewBox="0 0 24 24" fill="var(--green-400)"><path d="M5 13l4 4L19 7"/><path d="M5 13l4 4L19 7" fill="none" stroke="var(--green-400)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="rank-label">Strong Finish — 4th–23rd<span class="rank-sublabel">4th&ndash;23rd by amount raised in the final 7 days</span></span>
              </span>
            </td>
            <td>$100</td>
            <td>20</td>
            <td>$2,000</td>
          </tr>
          <tr class="subtotal">
            <td colspan="2">Subtotal</td>
            <td>74</td>
            <td>$8,400</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Geographic Grants -->
  <div class="section">
    <div class="section-header">
      <div class="dot" style="background: var(--bronze-500);"></div>
      <h2>Geographic Interest Grants</h2>
      <span class="section-total">$15,000 &middot; 70 grants</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Region</th>
            <th>Grant</th>
            <th># Grants</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span class="rank">
                <span class="rank-badge" style="background: #eef6ff; color: #3b82c8; font-size: 0.85rem;">🌍</span>
                <span class="rank-label">International<span class="rank-sublabel">Global South</span></span>
              </span>
            </td>
            <td>$150</td>
            <td>40</td>
            <td>$6,000</td>
          </tr>
          <tr>
            <td>
              <span class="rank">
                <span class="rank-badge" style="background: var(--green-100); color: var(--green-700); font-size: 0.85rem;">🌲</span>
                <span class="rank-label">Maine<span class="rank-sublabel">Home state projects</span></span>
              </span>
            </td>
            <td>$300</td>
            <td>30</td>
            <td>$9,000</td>
          </tr>
          <tr class="subtotal">
            <td colspan="2">Subtotal</td>
            <td>70</td>
            <td>$15,000</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Grand Total -->
  <div class="grand-total">
    <div>
      <div class="gt-label">Grand Total</div>
      <div class="gt-detail">432 grants available across all categories</div>
    </div>
    <div class="gt-amount">$81,000</div>
  </div>

  <div class="footer-note">
    Challenge grants will be determined by final campaign ranking at the close of the 30-day Challenge (Nov 15 – Dec 15, 2026).<br>
    Projects may qualify for grants in multiple categories.
  </div>
`;

export default function HowItWorksPage() {
  return <StaticHtmlPage html={howItWorksHtml} wide />;
}
