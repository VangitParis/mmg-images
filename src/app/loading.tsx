export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950">
      <div className="relative h-28 w-28">
        <div className="absolute inset-0 rounded-full border-2 border-amber-400/70 animate-spin blur-[0.4px]" />
        <div
          className="absolute inset-3 rounded-full border border-neutral-700/60 animate-spin"
          style={{ animationDuration: "1.8s" }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-950 rounded-full">
          <img
            src="/images/Logo_mmgimages.png"
            alt="MMG Images"
            className="h-14 w-14 object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>
    </div>
  );
}
