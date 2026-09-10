import React from 'react';

/**
 * LandingBackground
 * 
 * O'rmon xo'jaligi davlat portali (Ruxsatnoma) uchun to'liq yorqin och-yashil (light green)
 * tabiat foni komponenti. Mutlaqo nuqtasiz, chiziqsiz, toza, silliq va zumrad-pastel tuslari.
 */
export const LandingBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute top-0 bottom-0 left-1/2 right-1/2 -mx-[50vw] w-screen pointer-events-none overflow-hidden z-0"
      style={{
        background: `
          linear-gradient(180deg, 
            #D8ECDE 0%, 
            #E3F3E8 25%, 
            #DBEFE1 50%, 
            #E1F3E7 75%, 
            #D8ECDE 100%
          )
        `,
      }}
    >
      {/* ── Ambient Nur Sharlari (Yumshoq yashil va zumrad gradient orblar) ── */}
      <div 
        className="absolute -top-10 right-[-10%] w-[650px] h-[650px] rounded-full opacity-50 blur-[130px]"
        style={{
          background: 'radial-gradient(circle, #A7F3D0 0%, #34D399 45%, transparent 70%)',
        }}
      />

      <div 
        className="absolute top-[28%] -left-[12%] w-[700px] h-[700px] rounded-full opacity-45 blur-[140px]"
        style={{
          background: 'radial-gradient(circle, #6EE7B7 0%, #059669 40%, transparent 70%)',
        }}
      />

      <div 
        className="absolute top-[55%] -right-[8%] w-[600px] h-[600px] rounded-full opacity-40 blur-[130px]"
        style={{
          background: 'radial-gradient(circle, #86EFAC 0%, #10B981 50%, transparent 70%)',
        }}
      />

      <div 
        className="absolute top-[78%] -left-[5%] w-[550px] h-[550px] rounded-full opacity-40 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, #A7F3D0 0%, #047857 45%, transparent 70%)',
        }}
      />
    </div>
  );
};
