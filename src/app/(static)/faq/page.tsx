import type { Metadata } from "next";
import { StaticHtmlPage } from "@/src/components/static-pages/StaticPage";

export const metadata: Metadata = {
  title: "FAQ | SeedMoney",
  description: "Frequently asked questions for the SeedMoney Challenge.",
};

const faqHtml = `
  <!-- DRAFT NOTE — delete before publishing -->
  <div class="draft-note">
    <strong>Draft for review.</strong> Trimmed and updated from the prior FAQ; questions already
    answered on the How It Works page were removed so the two pages do not duplicate. Highlighted
    items need a quick confirmation before publishing. Delete this note before going live.
  </div>

  <!-- Header -->
  <div class="header">
    <h1>Frequently Asked Questions</h1>
    <div class="subtitle">
      For an overview of the Challenge, key dates, and the grants available, see
      <a href="https://challenge.seedmoney.org/how-it-works">How It Works</a>. The questions
      below cover the details that page does not.
    </div>
  </div>

  <!-- Eligibility -->
  <div class="block-label">Eligibility</div>
  <div class="faq-list">

    <details class="faq">
      <summary>What kinds of garden projects can apply?</summary>
      <div class="answer">
        <p>A wide range of public food garden projects are welcome &mdash; including school
        gardens, community gardens, food pantry gardens, shelter gardens, job-training gardens,
        tribal gardens, senior gardens, library gardens, college gardens, healing and therapeutic
        gardens, and projects that combine several of these. Whatever the form, every project
        shares three things: it must be a <em>food</em> garden, it must be a <em>public</em>
        garden, and it must be run by a nonprofit or community cause that can document its
        nonprofit or public-service status.</p>
      </div>
    </details>

    <details class="faq">
      <summary>Does my organization have to be a registered 501(c)(3)?</summary>
      <div class="answer">
        <p>No. &ldquo;Nonprofit cause&rdquo; covers a broad range of groups &mdash; past
        participants have included schools, churches, shelters, food pantries, and many community
        groups that are not formally incorporated as 501(c)(3) organizations. What matters is that
        your project is nonprofit in purpose and that you can document your status (for example,
        with a nonprofit registration number, a school identification, a letter from a school
        official, or a description of your group where no formal registration applies). If you are
        unsure whether your project qualifies, just ask us.</p>
      </div>
    </details>

    <details class="faq">
      <summary>What makes a garden &ldquo;public&rdquo;? Can I apply for a personal garden if I donate the produce?</summary>
      <div class="answer">
        <p>A public garden is one that serves a community rather than a household. We are not able
        to fund an individual's private garden, even a generous one where the produce is donated
        &mdash; our funding is restricted to nonprofit, community-serving projects.</p>
      </div>
    </details>

    <details class="faq">
      <summary>Are there geographic restrictions?</summary>
      <div class="answer">
        <p>No &mdash; projects anywhere in the world may apply. A few things are worth knowing: a
        larger share of grants goes to U.S.-based projects, because that is where SeedMoney and its
        funders are based, and all fundraising and disbursement is handled in U.S. dollars.
        Projects outside the U.S. must be able to receive funds by bank transfer to an account in
        the organization's name. SeedMoney cannot send funds to individuals.</p>
      </div>
    </details>

    <details class="faq">
      <summary>Can I apply for a garden that hasn't been built yet?</summary>
      <div class="answer">
        <p>Yes. Historically, about a quarter of SeedMoney grants have gone to brand-new projects.
        For your campaign photo, you can either show the site where the garden will be located
        &mdash; which lets you share before-and-after images later &mdash; or show some of the
        people the garden will serve.</p>
      </div>
    </details>

    <details class="faq">
      <summary>Our project received a SeedMoney grant before. Can we apply again?</summary>
      <div class="answer">
        <p>Yes. Projects that received grants in past years are welcome to apply again.</p>
      </div>
    </details>

  </div>

  <!-- Applying and Running a Campaign -->
  <div class="block-label">Applying and Running a Campaign</div>
  <div class="faq-list">

    <details class="faq">
      <summary>I participated before &mdash; can I use my old login?</summary>
      <div class="answer">
        <p>No. The SeedMoney Challenge is running on a new platform, so everyone needs to create a
        new account, including returning campaign leaders. Your past participation does not carry
        over a login.</p>
      </div>
    </details>

    <details class="faq">
      <summary>Can I create more than one campaign?</summary>
      <div class="answer">
        <p>Please create only one campaign per garden project. If your organization or school
        wants to run campaigns for two separate projects, ask a second person from your group to
        register and create the second campaign.</p>
      </div>
    </details>

    <details class="faq">
      <summary>Do I have to finish my application in one sitting?</summary>
      <div class="answer">
        <p>No &mdash; you can save your application and return to edit it as many times as you
        need before submitting it.</p>
      </div>
    </details>

    <details class="faq">
      <summary>Can I edit my campaign after it goes live?</summary>
      <div class="answer">
        <p>Campaign leaders can edit their campaign freely before submitting it. Once a campaign
        is live, it can no longer be edited directly &mdash; but if you need a change, you can
        request one through the help section of your campaign leader dashboard, and we will assist
        you.</p>
      </div>
    </details>

    <details class="faq">
      <summary>What can the funds be used for?</summary>
      <div class="answer">
        <p>Funds may be used for the nonprofit food garden project described in your application
        &mdash; for many groups that means operating costs like seeds, supplies, tools, and
        compost; for others it means a specific need such as an irrigation system or a greenhouse.
        You know your project best. To keep your campaign clear and trustworthy for donors,
        describe your project's needs as specifically as you can.</p>
      </div>
    </details>

    <details class="faq">
      <summary>How can I promote my campaign?</summary>
      <div class="answer">
        <p>Your campaign page includes social media sharing tools, and you can also share your
        campaign link directly. Word of mouth matters as much as anything &mdash; mentions in
        newsletters, local newspapers, community groups, and personal outreach to people who know
        your project all make a real difference. SeedMoney also provides outreach resources to
        help.</p>
      </div>
    </details>

  </div>

  <!-- Grants and Funds -->
  <div class="block-label">Grants and Funds</div>
  <div class="faq-list">

    <details class="faq">
      <summary>Can my project receive more than one type of grant?</summary>
      <div class="answer">
        <p>Yes &mdash; and it is common. A project can receive a Challenge Grant and a Strong
        Start Grant, for example. Projects located in Maine or in the Global South can also qualify
        for a Geographic Interest Grant on top of any other grants. No separate application is
        needed; entering the Challenge considers you for every grant you qualify for. See
        <a href="https://challenge.seedmoney.org/how-it-works">How It Works</a> for the full grant
        breakdown.</p>
      </div>
    </details>

    <details class="faq">
      <summary>Can campaign leaders donate to their own campaigns?</summary>
      <div class="answer">
        <p>Yes. You may contribute to your own campaign &mdash; but for the purpose of grant
        eligibility, only the first $100 of a campaign leader's own contributions counts toward
        your totals. This keeps the Challenge fair: SeedMoney's crowdgranting approach is meant to
        help projects broaden their base of support rather than rely on a few large donors.</p>
      </div>
    </details>

    <details class="faq">
      <summary>When will I find out if my project won a grant?</summary>
      <div class="answer">
        <p>Challenge Grant winners are announced shortly after the Challenge closes, once final
        project rankings are verified. Geographic Interest Grant winners are announced by the end
        of the following January.</p>
      </div>
    </details>

    <details class="faq">
      <summary>How and when will my project receive its funds?</summary>
      <div class="answer">
        <p>Funds are disbursed after the Challenge concludes. Projects in the U.S. receive a paper
        check, mailed during the second week of January. Projects outside the U.S. receive funds by
        bank transfer through Wise, beginning the third week of January.</p>
      </div>
    </details>

    <details class="faq">
      <summary>What happens if my project doesn't reach its funding goal?</summary>
      <div class="answer">
        <p>Your project keeps every dollar donated to it, whether or not it reaches its goal.
        There is no minimum to keep what you raise &mdash; so it is always worth donating to a
        project, even one that seems unlikely to hit its target. One exception applies to
        international projects: see the note on the minimum for international disbursement on the
        <a href="https://challenge.seedmoney.org/how-it-works">How It Works</a> page.</p>
      </div>
    </details>

  </div>

  <!-- For Donors -->
  <div class="block-label">For Donors</div>
  <div class="faq-list">

    <details class="faq">
      <summary>How do I donate to a project?</summary>
      <div class="answer">
        <p>Each campaign page has a donate button. Donations are processed by GiveButter,
        SeedMoney's payment platform, which handles your payment securely. After donating, you will
        receive a confirmation email.</p>
      </div>
    </details>

    <details class="faq">
      <summary>Is my donation tax-deductible?</summary>
      <div class="answer">
        <p>Donations are tax-deductible under U.S. tax law. The legal recipient of your donation is
        SeedMoney, a Maine-based 501(c)(3) nonprofit, which then directs your contribution to the
        garden project you chose to support. Deductibility for residents of other countries depends
        on local law.</p>
      </div>
    </details>

    <details class="faq">
      <summary>Can I cancel or refund my donation?</summary>
      <div class="answer">
        <p>Donations are generally final. If you believe a donation was made in error &mdash; for
        example, a duplicate gift or an incorrect amount &mdash; please contact us as soon as
        possible at <a href="mailto:challenge@seedmoney.org">challenge@seedmoney.org</a> and we
        will do our best to help.</p>
      </div>
    </details>

  </div>

  <!-- Contact -->
  <div class="contact">
    <h2>Still have questions?</h2>
    <p>If your question isn't answered here or on the
    <a href="https://challenge.seedmoney.org/how-it-works">How It Works</a> page, contact us at
    <a href="mailto:challenge@seedmoney.org">challenge@seedmoney.org</a>.</p>
  </div>
`;

export default function FaqPage() {
  return <StaticHtmlPage html={faqHtml} />;
}
