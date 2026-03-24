export default function Loading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FAF9F7] selection:bg-[#c3a2ab]/30">
      <div className="flex flex-col items-center gap-8 pt-20">
        {/* Luxury Spinner */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <div 
            className="absolute inset-0 rounded-full border-[3px] border-t-[#c3a2ab] border-r-[#c3a2ab] border-b-transparent border-l-transparent animate-spin opacity-80" 
            style={{ animationDuration: '1.5s' }}
          ></div>
          <div 
            className="absolute inset-2 rounded-full border-2 border-b-[#161314] border-l-[#161314] border-t-transparent border-r-transparent opacity-50"
            style={{ animation: 'spin 2s linear infinite reverse' }}
          ></div>
        </div>
        
        {/* Text */}
        <p className="font-serif text-[#161314] tracking-[0.4em] uppercase text-[10px] animate-pulse">
          Loading Radiance
        </p>
      </div>
    </div>
  );
}
