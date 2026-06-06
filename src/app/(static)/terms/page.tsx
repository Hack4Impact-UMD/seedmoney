import type { Metadata } from "next";
import {
  ContentSection,
  DraftNote,
  StaticPage,
} from "@/src/components/static-pages/StaticPage";

export const metadata: Metadata = {
  title: "Terms of Service | SeedMoney",
  description: "Terms of Service for SeedMoney Challenge campaign leaders.",
};

export default function TermsPage() {
  return (
    <StaticPage
      eyebrow="SeedMoney Challenge"
      title="Terms of Service for Campaign Leaders"
    >
      <DraftNote>
        Draft for review. A first draft, not legal advice; worth a quick
        attorney review before publishing. [Effective date: target June 21,
        2026.] Delete this note before publishing.
      </DraftNote>

      <ContentSection title="Welcome">
        <p>
          The SeedMoney Challenge gives community food garden projects a place
          to raise money and compete for grants. These Terms are the agreement
          between you — the person and organization running a campaign — and
          SeedMoney. They apply to Campaign Leaders.
        </p>
        <p>
          Donations themselves are processed and hosted by GiveButter, and
          donors agree to GiveButter&apos;s own terms. By creating an account or
          submitting an application, you agree to these Terms and to our Privacy
          Policy. Please read them before you apply.
        </p>
      </ContentSection>

      <ContentSection title="1. Your Affirmations">
        <p>
          By creating an account and submitting a campaign application for the
          SeedMoney Challenge, you affirm that:
        </p>
        <ul>
          <li>
            You are at least 18 years old and are authorized to raise funds on
            behalf of the garden project described in your application.
          </li>
          <li>
            All information you provide about your project — in the application
            and on your campaign page — is accurate and true.
          </li>
          <li>
            You have the consent of any individuals featured in your project
            photos. Where a person pictured is a minor, you have the consent of
            a parent or legal guardian.
          </li>
          <li>
            Funds raised will be used only for the nonprofit garden purposes
            described in your application and on your campaign page.
          </li>
          <li>
            Funds raised will not be used for political activities or for
            private benefit.
          </li>
          <li>
            You may contribute to your own campaign; however, for the purpose of
            grant eligibility, only the first US $100 of a Campaign
            Leader&apos;s own contributions will be counted by SeedMoney.
            SeedMoney reserves the right to adjust fundraising totals or grant
            eligibility if it determines that donations were made primarily to
            influence grant outcomes rather than to reflect genuine community
            support.
          </li>
          <li>
            If your project receives donations or a SeedMoney grant, you will
            provide SeedMoney with a brief progress report on your project if we
            request one.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="2. Your Account and Application">
        <p>
          You are responsible for keeping your login credentials secure and your
          contact information current, and for activity that occurs under your
          account. Please create only one account and one campaign per garden
          project.
        </p>
        <p>
          SeedMoney reviews each application and may approve it, decline it, or
          ask for changes, at our discretion. We may correct obvious errors and
          make minor formatting adjustments, and may ask you to revise text for
          clarity or length; we will not rewrite your submission in a way that
          changes its meaning or voice. Submitting an application does not
          create a campaign until SeedMoney approves it.
        </p>
      </ContentSection>

      <ContentSection title="3. How SeedMoney May Use Your Campaign Content">
        <p>
          You keep ownership of the text, photos, and progress reports you
          submit. By submitting them, you give SeedMoney and its grant partners
          permission to display, adapt for formatting, and republish this content
          — on your campaign page, the public leaderboard, social media,
          newsletters, promotional materials, and impact reports — in order to
          run and promote the Challenge and SeedMoney&apos;s charitable mission.
          This permission continues after the Challenge for SeedMoney&apos;s
          ongoing reporting about its programs.
        </p>
      </ContentSection>

      <ContentSection title="4. AI-Assisted Proofreading">
        <p>
          During the application, you choose whether to allow SeedMoney to use AI
          tools to proofread your campaign text. If you opt in, those tools
          correct objective errors such as spelling, grammar, and punctuation —
          they are instructed to fix errors only, not to rewrite your text for
          style or change its meaning. Whether you opt in or out, you remain
          responsible for reviewing and approving the final published version of
          your campaign text.
        </p>
      </ContentSection>

      <ContentSection title="5. Donations and Funds">
        <p>
          All donations to Challenge campaigns are processed and hosted by
          GiveButter, which provides the payment and fundraising infrastructure;
          your use of that process is also subject to GiveButter&apos;s terms.
          SeedMoney administers the Challenge and is responsible for disbursing
          grants and donations. Most donations reach campaigns in full, though
          certain payment methods — such as donations from donor-advised funds —
          carry a processing fee that is deducted from the donation. [Confirm
          current fee details against GiveButter&apos;s terms before publishing.]
        </p>
        <p>
          Donations are received by SeedMoney, a 501(c)(3) nonprofit
          organization based in Scarborough, Maine, United States. SeedMoney
          cannot transfer funds to individuals — funds are disbursed only to the
          nonprofit or community-based organization running a garden project, by
          check (for U.S.-based organizations) or by electronic transfer to a
          bank account in the organization&apos;s name (for organizations outside
          the U.S.). After the Challenge concludes, SeedMoney disburses the
          funds your campaign raised, together with any grant awarded, to that
          organization. International projects must raise at least US $50 to be
          eligible for a disbursement; if a project does not reach this minimum,
          the funds it raised are returned to its donors. You agree to provide
          any information we reasonably need to make a disbursement.
        </p>
        <p>
          SeedMoney does not provide tax or legal advice. You are responsible
          for any tax or reporting obligations that apply to your organization
          and the funds it receives.
        </p>
      </ContentSection>

      <ContentSection title="6. Grants">
        <p>
          SeedMoney offers grants to qualifying campaigns based on the criteria
          in the then-current Grant Guidelines [link once published], which may
          change from year to year. Reaching a ranking or fundraising threshold
          does not by itself guarantee a grant — your campaign must also comply
          with these Terms and with any verification we request. SeedMoney may
          withhold, reduce, or revoke a grant if it determines that a campaign
          violated these Terms or provided false or misleading information.
        </p>
      </ContentSection>

      <ContentSection title="7. If a Campaign Breaks the Rules">
        <p>
          If we have concerns about a campaign — for example, suspected fraud,
          manipulated or misleading content, coordinated donations, or a
          compliance issue — SeedMoney may temporarily suspend the campaign and
          pause disbursement while we review. We may also remove or modify
          specific campaign content that violates these Terms or that we believe
          is misleading, inappropriate, or inconsistent with the purposes of the
          Challenge.
        </p>
        <p>
          If we determine that a Campaign Leader has violated these Terms or
          provided false information, SeedMoney may disqualify or remove the
          campaign or close the account. Where a campaign that has already
          collected donations is disqualified, SeedMoney may return those
          donations to the donors.
        </p>
      </ContentSection>

      <ContentSection title="8. The Basics">
        <p>
          The service. The SeedMoney Challenge website is provided “as is.”
          SeedMoney does not guarantee uninterrupted service or any particular
          amount raised, donor traffic, ranking, or grant. To the fullest extent
          permitted by law, SeedMoney is not responsible for losses arising from
          use of the website or from third-party services such as GiveButter.
        </p>
        <p>
          International Campaign Leaders. The Challenge welcomes garden projects
          in many countries and is administered from the United States. If you
          are based outside the United States, you are responsible for complying
          with the laws that apply to you, including any fundraising, charity
          registration, data protection, and tax laws.
        </p>
        <p>
          Changes. SeedMoney may update these Terms from time to time. We will
          take reasonable steps to notify Campaign Leaders of significant
          changes, and continued use of the website after a change means you
          accept the updated Terms.
        </p>
        <p>
          Governing law. These Terms are governed by the laws of the State of
          Maine, United States.
        </p>
        <p>Contact. Questions about these Terms can be sent to challenge@seedmoney.org.</p>
      </ContentSection>
    </StaticPage>
  );
}
