import { CardHeader } from "./CardHeader";

const DonorsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3346 17.5V15.8333C13.3346 14.9493 12.9834 14.1014 12.3583 13.4763C11.7332 12.8512 10.8854 12.5 10.0013 12.5H5.0013C4.11725 12.5 3.2694 12.8512 2.64428 13.4763C2.01916 14.1014 1.66797 14.9493 1.66797 15.8333V17.5" stroke="#99A1AF" strokeWidth="1.42857" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.332 2.60645C14.0468 2.79175 14.6799 3.20917 15.1318 3.79316C15.5837 4.37716 15.8289 5.09469 15.8289 5.83311C15.8289 6.57154 15.5837 7.28906 15.1318 7.87306C14.6799 8.45706 14.0468 8.87447 13.332 9.05978" stroke="#99A1AF" strokeWidth="1.42857" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.332 17.5001V15.8334C18.3315 15.0948 18.0857 14.3774 17.6332 13.7937C17.1807 13.2099 16.5471 12.793 15.832 12.6084" stroke="#99A1AF" strokeWidth="1.42857" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5013 9.16667C9.34225 9.16667 10.8346 7.67428 10.8346 5.83333C10.8346 3.99238 9.34225 2.5 7.5013 2.5C5.66035 2.5 4.16797 3.99238 4.16797 5.83333C4.16797 7.67428 5.66035 9.16667 7.5013 9.16667Z" stroke="#99A1AF" strokeWidth="1.42857" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function TotalDonorsCard({
  totalDonors,
}: {
  totalDonors: number;
  donorsChangePercent?: number | null;
}) {
  return (
    <div className="bg-white rounded-lg border border-[#e5e5e5] p-4 overflow-hidden">
      <CardHeader label="Total Donors" icon={<DonorsIcon />} />
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 my-3">{totalDonors}</h2>
      <p className="text-sm text-gray-500">Donors</p>
    </div>
  );
}
