import Image from "next/image";
import Link from "next/link";
import { Button } from "@mui/material";
import Footer from "@/src/components/Footer";

export default function ApplyPage() {
  return (
    <div className="flex flex-1 flex-col min-h-full">
      <div className="flex flex-1 flex-col items-center w-full">
        <div className="relative w-full h-70 overflow-hidden">
          <Image
            src="/seedmoneyTeam.png"
            alt="Login Background Header"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="bg-white rounded-2xl max-w-2xl mx-auto mt-15 border border-black/10 p-5">
          <h2 className="text-xl font-medium mb-1">
            SeedMoney Challenge Application
          </h2>
          <p>
            SeedMoney supports nonprofit and community-based food garden projects
            through a combination of online fundraising tools and grant funding.
            By completing this application, you are applying to participate in the
            SeedMoney Challenge and to run a 30-day online fundraising campaign
            supported by SeedMoney running from 11/15/2026-12/15/2026. <br />
            <br />
            Most applicants complete this application in 20-30 minutes.
          </p>
        </div>
        <div className="mt-6">
          <Button
            component={Link}
            href="/apply/terms"
            variant="contained"
            size="medium"
          >
            Start Application
          </Button>
        </div>
      </div>
      <div className="mt-auto w-full">
        <Footer />
      </div>
    </div>
  );
}
