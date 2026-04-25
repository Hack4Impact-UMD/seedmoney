import Image from "next/image";
import ButtonLink from "@/src/components/ButtonLink";
import ApplicationFooter from "@/src/components/application/ApplicationFooter";

export default function ApplyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src="/seedmoneyTeam.png"
          alt="Login Background Header"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="flex w-full max-w-lg flex-col items-center gap-5">
          <div className="w-full rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-medium">
              SeedMoney Challenge Application
            </h2>
            <p className="text-[15px] leading-7 text-[#2F2F2F]">
              SeedMoney supports nonprofit and community-based food garden
              projects through a combination of online fundraising tools and
              grant funding. By completing this application, you are applying to
              participate in the SeedMoney Challenge and to run a 30-day online
              fundraising campaign supported by SeedMoney running from
              11/15/2026-12/15/2026. <br />
              <br />
              Most applicants complete this application in 20-30 minutes.
            </p>
          </div>

          <ButtonLink
            href="/apply/terms"
            variant="contained"
            size="medium"
            className="!min-w-[260px] !px-7 !py-3 !text-sm !tracking-[0.12em]"
          >
            Start Application
          </ButtonLink>
        </div>
      </main>

      <div className="w-full px-6 pb-5 pt-4 md:px-8 lg:px-10">
        <ApplicationFooter />
      </div>
    </div>
  );
}
