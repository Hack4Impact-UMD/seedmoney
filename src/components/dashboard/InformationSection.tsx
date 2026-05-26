import DashboardFooter from "../DashboardFooter";
import FaqSection from "./FaqSection";
import HelpForm from "./HelpForm";

export default function InformationSection() {
  return (
    <div className="space-y-10 font-lato text-slate-700 pt-10">

      <FaqSection />
      <HelpForm />

    </div>
  )
}