import { Button, MenuItem, Select } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export default function HelpForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <div className="bg-white p-8 rounded-xl border-2 border-[#e5e5e5]">
      <h2 className="text-xl font-bold text-[#212121] mb-2">Need Help?</h2>
      <p className="text-[#666666] text-sm mb-8 font-medium">
        Send a request to the SeedMoney team and we&apos;ll get back to you
        within one business day.
      </p>

      <form className="space-y-10 max-w-full" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="help-topic" className="block text-sm font-bold text-[#212121]">
            What do you need help with?
          </label>
          <Select
            id="help-topic"
            name="help-topic"
            fullWidth
            variant="standard"
            defaultValue=""
            displayEmpty
            className="!text-[#9e9e9e]"
            sx={{
              "&:before": { borderBottomColor: "#1b76d2" },
              "&:after": { borderBottomColor: "#1b76d2" },
            }}
          >
            <MenuItem value="" disabled>Choose a topic</MenuItem>
            <MenuItem value="edit-campaign">Request a campaign page edit</MenuItem>
            <MenuItem value="new-stretch-goal">Request a new stretch goal</MenuItem>
            <MenuItem value="account-issue">Request an account issue</MenuItem>
            <MenuItem value="something-else">Something else</MenuItem>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="help-details" className="block text-sm font-bold text-slate-700">
            Tell us more
          </label>
          <input
            id="help-details"
            name="help-details"
            type="text"
            placeholder="Describe what you need, the more detail, the faster we can help"
            className="w-full border-b border-[#949494] py-2 focus:outline-none transition placeholder:text-[#9e9e9e] text-sm"
          />
        </div>

        <Button type="submit" variant="contained" size="small" startIcon={<SendIcon />}>
          Submit Request
        </Button>
      </form>
    </div>
  );
}