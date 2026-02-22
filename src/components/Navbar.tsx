import React, { useState } from "react";

type SidebarProps = {
  campaigns: Array<{ id: string; name: string }>;
  selectedCampaignId: string;
}

export default function Navbar({
  campaigns,
  selectedCampaignId,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Routing placeholder handlers
  const handleCampaignClick = (id: string) => {
    console.log(`Navigate -> /campaigns/${id}`);
  };

  const handleNewCampaign = () => {
    console.log("Navigate -> /campaigns/new");
  };

  const handleLogout = () => {
    console.log("Navigate -> /logout");
  };

  return <div>Navbar</div>;  
}
