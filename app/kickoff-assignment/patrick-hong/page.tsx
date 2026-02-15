export default function PatrickPage() {
  const terminalPrompt = "patrick@Patricks-Macbook ~ %";
  return (
    <div className="font-mono flex min-h-screen items-center justify-center bg-gray-800">
      <div
        className="relative w-full max-w-2xl rounded-2xl px-5 pt-12 pb-50 text-white shadow-xl 
      bg-linear-to-b from-[#0f0f11] from-8% via-zinc-950 via-8% to-zinc-950"
      >
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
          <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
          <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
        </div>
        <p>{terminalPrompt} Bio</p>
        <p>{terminalPrompt} Patrick Hong</p>
        <p>
          {terminalPrompt} Hi! My name is Patrick and I am a junior computer
          science and mathematics major at UMD. Outside of school I love trying
          new food, playing osu!, and going to the gym.
        </p>
      </div>
    </div>
  );
}
