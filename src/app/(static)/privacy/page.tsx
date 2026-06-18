import type { Metadata } from "next";
import { ContentSection, StaticPage } from "@/src/components/static-pages/StaticPage";

export const metadata: Metadata = {
  title: "Privacy Policy | SeedMoney",
  description: "Privacy Policy for the SeedMoney Challenge website.",
};

export default function PrivacyPage() {
  return (
    <StaticPage eyebrow="SeedMoney Challenge" title="Privacy Policy">
      <ContentSection title="Our Approach to Privacy">
        <p>
          This Privacy Policy explains what personal information SeedMoney
          collects through the SeedMoney Challenge website at
          challenge.seedmoney.org, how we use it, who we share it with, and the
          choices and rights you have.
        </p>
        <p>
          SeedMoney is a small nonprofit organization, and we keep our use of
          personal information modest and purposeful. We collect what we need to
          run the SeedMoney Challenge, support campaign leaders, and pursue our
          charitable mission — and not more.
        </p>
        <p>
          This policy applies to campaign leaders, account holders, and visitors
          to the website. It does not cover donations: donations are processed by
          GiveButter, and GiveButter&apos;s own privacy policy governs the
          information donors provide when they give.
        </p>
      </ContentSection>

      <ContentSection title="Who Is Responsible for Your Information">
        <p>
          SeedMoney is the organization responsible for the personal information
          described in this policy (the “data controller”). SeedMoney is a
          501(c)(3) nonprofit organization based in Scarborough, Maine, United
          States. You can reach us about privacy questions at
          challenge@seedmoney.org.
        </p>
      </ContentSection>

      <ContentSection title="Information We Collect">
        <p>
          Information you provide when you create an account. When you sign up —
          including through Google sign-in — we receive your name and email
          address, and we create an account record for you.
        </p>
        <p>
          Information you provide in a campaign application. When you apply to
          the Challenge, you provide information about yourself and your garden
          project. This typically includes your contact details, your
          organization&apos;s name and location, organization verification
          details (such as an EIN, charity number, school identification, or a
          description of your organization), your project description and garden
          story text, and photographs you upload. If you choose to opt in, your
          campaign text may be processed by AI-assisted proofreading tools, as
          described in our Terms of Service.
        </p>
        <p>
          Communications. If you email us or contact us for support, we keep a
          record of that correspondence so we can help you.
        </p>
        <p>
          Information collected automatically. When you use the website, our
          systems and service providers may automatically receive limited
          technical information such as your device type, browser, IP address,
          and general usage activity. We use this information to keep the website
          running well, to monitor and help prevent fraud, and to understand how
          the site is used. The website uses essential cookies for account
          authentication, but the current application does not use analytics or
          non-essential tracking cookies.
        </p>
        <p>
          We do not ask for or intentionally collect sensitive personal
          information beyond what is described above, and we ask that you not
          include unnecessary sensitive details in your application text or
          photos.
        </p>
      </ContentSection>

      <ContentSection title="How We Use Your Information">
        <p>We use personal information to:</p>
        <ul>
          <li>Create and manage your account and verify who you are;</li>
          <li>
            Review your application and administer your participation in the
            Challenge;
          </li>
          <li>Build and display your campaign and the public leaderboard;</li>
          <li>
            Send you communications about the Challenge and your campaign,
            including account, application, and campaign notifications;
          </li>
          <li>
            Add campaign leaders to our email list so we can send Challenge
            updates and related news — we keep these emails to a minimum and
            send them only when we have something worth your time, and you may
            unsubscribe at any point (see Your Choices);
          </li>
          <li>Provide support and respond to your questions;</li>
          <li>Understand and improve how the website works;</li>
          <li>
            Report on the impact of our programs, including aggregated
            statistics and the use of campaign content as described in our Terms
            of Service;
          </li>
          <li>
            Comply with our legal obligations and protect the integrity of the
            Challenge.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="Information That Is Public">
        <p>
          The SeedMoney Challenge is a public program. By participating, you
          understand that some information is shown publicly:
        </p>
        <ul>
          <li>
            Your campaign page displays your garden story, photographs,
            organization name, and location.
          </li>
          <li>
            The public leaderboard displays information such as your campaign
            name, location, ranking, amount raised, and number of donors.
          </li>
        </ul>
        <p>
          Please keep this in mind when deciding what to include in your
          campaign content.
        </p>
      </ContentSection>

      <ContentSection title="How We Share Information">
        <p>
          We do not sell your personal information. We share it only in these
          limited ways:
        </p>
        <ul>
          <li>
            Service providers. We use trusted third-party services to operate
            the Challenge, and they may process personal information on our
            behalf — including GiveButter (donations and campaign hosting), our
            website hosting and database providers, and Brevo (transactional
            email for account, application, and campaign notifications). These
            providers may only use the information to provide their services to
            us.
          </li>
          <li>
            Our project team. SeedMoney works with a student engineering team
            (Hack4Impact) that builds and maintains the platform through
            December 2026. Authorized members of that team may access platform
            data, including personal information, while doing that work. They
            act on SeedMoney&apos;s behalf and do not own or control your
            information.
          </li>
          <li>
            Legal and safety reasons. We may disclose information if required by
            law, or where we believe it is necessary to protect the rights,
            safety, or property of SeedMoney, campaign leaders, donors, or
            others.
          </li>
          <li>
            Organizational changes. If SeedMoney&apos;s programs are
            transferred to another organization, information may be transferred
            as part of that change, subject to this policy.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="International Transfers">
        <p>
          SeedMoney is based in the United States, and the Challenge is
          administered from the United States. If you are located outside the
          United States, the information you provide will be transferred to and
          processed in the United States, where data protection laws may differ
          from those in your country.
        </p>
      </ContentSection>

      <ContentSection title="How Long We Keep Information">
        <p>
          We keep personal information for as long as needed to run the
          Challenge, support campaign leaders, meet our legal and reporting
          obligations, and document the impact of our programs. Campaign content
          and program records may be kept on an ongoing basis as part of
          SeedMoney&apos;s historical record, as described in our Terms of
          Service. When information is no longer needed, we take reasonable steps
          to delete it or remove identifying details.
        </p>
      </ContentSection>

      <ContentSection title="Your Choices and Rights">
        <p>Wherever you are located, you may:</p>
        <ul>
          <li>Access the personal information we hold about you;</li>
          <li>Correct information that is inaccurate or out of date;</li>
          <li>
            Request deletion of personal information that we are not legally
            required or reasonably needed to retain;
          </li>
          <li>
            Unsubscribe from our email list at any time, using the link in our
            emails or by contacting us. Please note that some essential messages
            about your account or active campaign are part of running the
            Challenge and are not promotional.
          </li>
        </ul>
        <p>
          To make a request, email us at challenge@seedmoney.org. We will
          respond within a reasonable time and may need to verify your identity
          first. Some requests may be limited by law or by our need to keep
          certain records — for example, information tied to a completed
          Challenge or to a grant we have awarded.
        </p>
      </ContentSection>

      <ContentSection title="Children's Privacy">
        <p>
          The SeedMoney Challenge is intended for adults. Account holders and
          campaign leaders must be at least 18 years old, and the website is not
          directed to children. We do not knowingly collect personal information
          directly from children. Campaign leaders are responsible for obtaining
          the necessary consent before including images of any identifiable
          individual — including any minor — in their campaign content, as
          described in our Terms of Service.
        </p>
      </ContentSection>

      <ContentSection title="Cookies and Similar Technologies">
        <p>
          The website uses cookies and similar technologies that are necessary
          for it to function, such as keeping you signed in to your account. The
          current application does not use analytics or other non-essential
          tracking cookies.
        </p>
      </ContentSection>

      <ContentSection title="Security">
        <p>
          We take reasonable measures to protect personal information, including
          encryption and authentication tools, and access to personal information
          is limited to the people who need it to run the Challenge and who are
          expected to keep it confidential. Our service providers maintain their
          own security practices. No method of storage or transmission over the
          internet is completely secure, however, so we cannot guarantee absolute
          security.
        </p>
      </ContentSection>

      <ContentSection title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. If we make a
          significant change, we will take reasonable steps to notify you, for
          example by email or a notice on the website. The “effective date” above
          shows when this policy was last updated.
        </p>
      </ContentSection>

      <ContentSection title="Contact Us">
        <p>
          If you have questions about this policy or about how SeedMoney handles
          your personal information, contact us at challenge@seedmoney.org.
        </p>
      </ContentSection>

    </StaticPage>
  );
}
