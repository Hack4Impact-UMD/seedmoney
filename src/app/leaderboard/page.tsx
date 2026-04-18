import { Open_Sans } from "next/font/google";
import LoginNavbar from "@/src/components/LoginNavbar";
import LeaderboardPage from "@/src/components/leaderboard/LeaderboardPage";
import mockLeaderboardData from "./mockLeaderboardData";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "700", "800"],
});

export default function PublicLeaderboardPage() {
  return (
    <div
      className={`${openSans.variable} min-h-screen bg-[#F6F4EE]`}
      style={{ fontFamily: "var(--font-open-sans), sans-serif" }}
    >
      <LoginNavbar />
      <LeaderboardPage data={mockLeaderboardData} />
    </div>
  );
}
