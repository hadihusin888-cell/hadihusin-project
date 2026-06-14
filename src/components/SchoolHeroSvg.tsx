import React from 'react';

export default function SchoolHeroSvg() {
  return (
    <svg
      id="school-hero-svg"
      viewBox="0 0 1000 667"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-cover rounded-[1.5rem]"
    >
      {/* DEFINITIONS & GRADIENTS */}
      <defs>
        {/* Sky Sunset Gradient */}
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="30%" stopColor="#F5D0C5" />
          <stop offset="65%" stopColor="#FAE8FF" />
          <stop offset="100%" stopColor="#FFF7ED" />
        </linearGradient>

        {/* Building Warm Spotlight Gradient */}
        <linearGradient id="warmLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#FEF3C7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.2" />
        </linearGradient>

        {/* Terracotta/Brown Column Polish */}
        <linearGradient id="terracottaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="30%" stopColor="#D97706" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Roof Shadow */}
        <linearGradient id="roofShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </linearGradient>

        {/* Golden Logo Gradient */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Window Reflection Gradient */}
        <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
        </linearGradient>

        {/* Soft shadow for depth */}
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
        </filter>
        <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* 1. SKY BACKGROUND */}
      <rect width="1000" height="667" fill="url(#skyGrad)" />

      {/* Gentle twilight clouds */}
      <path d="M -50 200 Q 150 120 400 180 T 900 150 Q 1000 160 1100 190 L 1100 0 L -50 0 Z" fill="#FFFFFF" fillOpacity="0.25" />
      <path d="M 100 240 Q 350 180 600 220 T 1100 200 L 1100 0 L 100 0 Z" fill="#FEF08A" fillOpacity="0.15" />

      {/* 2. MAIN BUILDING STRUCTURE BACKDROP (THE BROWN FRAME) */}
      {/* Core Background Wall */}
      <rect x="50" y="100" width="900" height="490" fill="#E2E8F0" />

      {/* Ground floor line / foundation */}
      <rect x="50" y="580" width="900" height="15" fill="#94A3B8" />

      {/* 3. ROOF & UPPER STRUCTURE BEAMS (Terracotta Wood Pattern) */}
      <rect x="35" y="80" width="930" height="35" fill="url(#terracottaGrad)" rx="4" />
      <rect x="35" y="115" width="930" height="15" fill="#78350F" /> {/* Roof Underside Shadow */}

      {/* 4. RECTANGULAR COLUMNS (BEIGE / TERRACOTTA ARCHITECTURE) */}
      {/* Side column extreme left */}
      <rect x="50" y="115" width="40" height="465" fill="#F59E0B" fillOpacity="0.15" />
      <rect x="50" y="115" width="40" height="465" fill="url(#terracottaGrad)" />
      
      {/* Inner columns (4 major vertical beams) */}
      <rect x="150" y="115" width="35" height="465" fill="url(#terracottaGrad)" />
      <rect x="370" y="115" width="38" height="465" fill="url(#terracottaGrad)" />
      <rect x="495" y="115" width="35" height="465" fill="url(#terracottaGrad)" />
      <rect x="785" y="115" width="38" height="465" fill="url(#terracottaGrad)" />
      <rect x="910" y="115" width="40" height="465" fill="url(#terracottaGrad)" />

      {/* Upper floor horizontal beam */}
      <rect x="50" y="290" width="900" height="30" fill="url(#terracottaGrad)" />

      {/* 5. INDOOR GLASS WINDOWS & DOORS */}
      {/* Upper Floor Windows (Left) */}
      <rect x="90" y="130" width="60" height="160" fill="#1E293B" />
      <rect x="95" y="135" width="50" height="150" fill="url(#glassReflection)" />
      
      {/* Upper Floor Windows (Middle-Left) */}
      <rect x="185" y="130" width="185" height="160" fill="#1E293B" />
      <rect x="190" y="135" width="85" height="150" fill="url(#glassReflection)" />
      <rect x="280" y="135" width="85" height="150" fill="url(#glassReflection)" />

      {/* Upper Floor Windows (Right-Middle) */}
      <rect x="530" y="130" width="255" height="160" fill="#1E293B" />
      <rect x="535" y="135" width="120" height="150" fill="url(#glassReflection)" />
      <rect x="660" y="135" width="120" height="150" fill="url(#glassReflection)" />

      {/* Upper Floor Windows (Right extreme) */}
      <rect x="823" y="130" width="87" height="160" fill="#1E293B" />
      <rect x="828" y="135" width="77" height="150" fill="url(#glassReflection)" />

      {/* Ground Floor Windows (Left) */}
      <rect x="90" y="440" width="60" height="140" fill="#1E293B" />
      <rect x="95" y="445" width="50" height="130" fill="url(#glassReflection)" />

      {/* Ground Floor Windows (Middle-Left) */}
      <rect x="185" y="440" width="185" height="140" fill="#1E293B" />
      <rect x="190" y="445" width="85" height="130" fill="url(#glassReflection)" />
      <rect x="280" y="445" width="85" height="130" fill="url(#glassReflection)" />

      {/* Ground Floor Windows (Right extreme) */}
      <rect x="823" y="440" width="87" height="140" fill="#1E293B" />
      <rect x="828" y="445" width="77" height="130" fill="url(#glassReflection)" />


      {/* 6. MIDDLE VISIBLE GLASS ENTRANCE LOBBY */}
      {/* Lobby Chamber */}
      <rect x="530" y="380" width="255" height="200" fill="#F8FAFC" />
      
      {/* Warm internal lighting glow */}
      <rect x="530" y="380" width="255" height="200" fill="url(#warmLight)" />

      {/* Desks and Chairs silhouette inside the lobby */}
      <rect x="625" y="490" width="55" height="10" fill="#64748B" rx="1" /> {/* Table */}
      <rect x="635" y="500" width="35" height="80" fill="#475569" /> {/* Front desk panel */}
      {/* Chairs */}
      <path d="M 700 530 h 15 v 15 h -15 z M 705 545 v 20 M 710 545 v 20" stroke="#475569" strokeWidth="2" />
      <path d="M 725 530 h 15 v 15 h -15 z M 730 545 v 20 M 735 545 v 20" stroke="#475569" strokeWidth="2" />
      {/* Frame pictures inside the lobby */}
      <rect x="545" y="405" width="25" height="35" fill="#475569" rx="1" />
      <rect x="548" y="408" width="19" height="29" fill="#E2E8F0" />
      <rect x="580" y="410" width="30" height="25" fill="#475569" rx="1" />
      <rect x="583" y="413" width="24" height="19" fill="#E2E8F0" />
      <rect x="670" y="415" width="20" height="25" fill="#475569" rx="1" />

      {/* Large Lobby Glass Doors & Frame */}
      <rect x="530" y="380" width="255" height="200" stroke="#1E293B" strokeWidth="4" fill="none" />
      {/* Middle glass slit line */}
      <line x1="657.5" y1="380" x2="657.5" y2="580" stroke="#1E293B" strokeWidth="3" />
      <line x1="593.75" y1="380" x2="593.75" y2="580" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
      <line x1="721.25" y1="380" x2="721.25" y2="580" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />


      {/* 7. PRESTIGIOUS CENTER LOGO BLOCK (THE WHITE BALCONY PROJECTION) */}
      <g filter="url(#softShadow)">
        {/* Main block */}
        <rect x="340" y="115" width="395" height="280" fill="#F8FAFC" rx="4" />
        <rect x="340" y="115" width="395" height="15" fill="#E2E8F0" />
        <rect x="340" y="385" width="395" height="10" fill="#CBD5E1" />
        {/* Under ceiling spotlight bar */}
        <rect x="340" y="395" width="395" height="10" fill="#FEF08A" />
      </g>

      {/* Warm ambient spotlight projection below white block */}
      <polygon points="340,405 530,580 725,580 735,405" fill="#FEF08A" fillOpacity="0.4" />

      {/* 8. GOLDEN WING EMBLEM OF AL-IRSYAD */}
      <g id="alirsyad-emblem" transform="translate(450, 150)">
        {/* Outer Wing/Shield Shape */}
        <path 
          d="M 12 10 Q 50 -10 88 10 Q 75 35 50 48 Q 25 35 12 10 Z" 
          fill="url(#goldGrad)" 
          stroke="#78350F" 
          strokeWidth="2.5" 
        />
        {/* Wing feather detailing (left) */}
        <path d="M 16 13 Q 32 10 46 22" stroke="#78350F" strokeWidth="1.5" fill="none" />
        <path d="M 19 20 Q 32 20 44 28" stroke="#78350F" strokeWidth="1.5" fill="none" />
        <path d="M 23 27 Q 34 28 42 34" stroke="#78350F" strokeWidth="1.5" fill="none" />
        
        {/* Wing feather detailing (right) */}
        <path d="M 84 13 Q 68 10 54 22" stroke="#78350F" strokeWidth="1.5" fill="none" />
        <path d="M 81 20 Q 68 20 56 28" stroke="#78350F" strokeWidth="1.5" fill="none" />
        <path d="M 77 27 Q 66 28 58 34" stroke="#78350F" strokeWidth="1.5" fill="none" />

        {/* Center Shield */}
        <path d="M 40 18 Q 50 12 60 18 Q 58 38 50 44 Q 42 38 40 18 Z" fill="#FEF08A" stroke="#78350F" strokeWidth="1.5" />
        
        {/* Center Torch/Globe element in Emblem */}
        <circle cx="50" cy="27" r="5" fill="#D97706" />
        <line x1="50" y1="22" x2="50" y2="38" stroke="#78350F" strokeWidth="1.5" />
        <line x1="43" y1="28" x2="57" y2="28" stroke="#78350F" strokeWidth="1.5" />

        {/* Inner Ribbon / Text placeholder */}
        <path d="M 25 43 Q 50 52 75 43" stroke="#78350F" strokeWidth="2.5" fill="none" />
        {/* Tiny "SMP" Text */}
        <text x="50" y="47" fill="#78350F" fontSize="5.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">SMP</text>
      </g>

      {/* 9. MAIN TEXT INSCRIPTION ON BUILDING FACE */}
      <g id="building-inscription" filter="url(#textShadow)">
        {/* "AL-IRSYAD AL-ISLAMIYYAH" */}
        <text 
          x="538" 
          y="255" 
          fill="#0F172A" 
          fontSize="24" 
          fontWeight="900" 
          textAnchor="middle" 
          letterSpacing="1.2"
          fontFamily="Inter, system-ui, sans-serif"
        >
          AL - IRSYAD AL - ISLAMIYYAH
        </text>

        {/* "SURAKARTA" */}
        <text 
          x="538" 
          y="285" 
          fill="#0F172A" 
          fontSize="21" 
          fontWeight="900" 
          textAnchor="middle" 
          letterSpacing="4"
          fontFamily="Inter, system-ui, sans-serif"
        >
          SURAKARTA
        </text>
      </g>


      {/* 10. FLAGPOLES & BENDERAS (INDONESIA + PALM TREES ON LEFT) */}
      {/* 3 FLAGPOLES */}
      {/* Red White Flag Pole (Tallest Middle) */}
      <line x1="285" y1="180" x2="285" y2="585" stroke="#94A3B8" strokeWidth="3.5" />
      <circle cx="285" cy="180" r="3.5" fill="#CBD5E1" />

      {/* White Flag Pole (Left side) */}
      <line x1="218" y1="230" x2="218" y2="585" stroke="#94A3B8" strokeWidth="2.5" />
      <circle cx="218" cy="230" r="2.5" fill="#CBD5E1" />

      {/* Green Flag Pole (Right side) */}
      <line x1="248" y1="235" x2="248" y2="585" stroke="#94A3B8" strokeWidth="2.5" />
      <circle cx="248" cy="235" r="2.5" fill="#CBD5E1" />

      {/* INDONESIAN FLAG (RED/WHITE) flag wave */}
      <g id="indonesia-flag">
        <path d="M 285 185 Q 305 170 322 188 Q 335 200 350 185 L 350 215 Q 335 230 322 218 Q 305 200 285 215 Z" fill="#EF4444" />
        <path d="M 285 215 Q 305 200 322 218 Q 335 230 350 215 L 350 245 Q 335 260 322 248 Q 305 230 285 245 Z" fill="#FFFFFF" />
        {/* Shadow flag fold */}
        <path d="M 322 188 Q 335 200 350 185 L 350 245 Q 335 260 322 248 Z" fill="#000000" fillOpacity="0.06" />
      </g>

      {/* AL IRSYAD WHITE FLAG (with emblem logo print) */}
      <g id="white-flag">
        <path d="M 183 235 Q 200 223 218 238 L 218 263 Q 200 248 183 260 Z" fill="#1E3A8A" fillOpacity="0.05" />
        <path d="M 183 235 Q 200 223 218 238 L 218 263 Q 200 248 183 260 Z" fill="#FFFFFF" />
        {/* Green inner emblem print on white flag */}
        <circle cx="201" cy="245" r="4" fill="#047857" />
        <path d="M 198 245 C 198 240 204 240 204 245 Z" fill="#D97706" />
      </g>

      {/* ISLAMIC GREEN FLAG (on the right pole) */}
      <g id="green-flag">
        <path d="M 248 240 Q 258 228 274 242 L 274 267 Q 258 253 248 265 Z" fill="#059669" />
        {/* White circle design */}
        <circle cx="261" cy="251" r="3.5" fill="#FFFFFF" />
        <circle cx="261" cy="251" r="2.5" fill="#059669" />
      </g>


      {/* 11. ENTRANCE STAIRS & FRONT TILES */}
      {/* Paved road entry in perspective */}
      <polygon points="50,595 950,595 1000,667 0,667" fill="#E2E8F0" />
      {/* Horizontal pavement lines */}
      <line x1="0" y1="620" x2="1000" y2="620" stroke="#CBD5E1" strokeWidth="2.5" />
      <line x1="0" y1="645" x2="1000" y2="645" stroke="#CBD5E1" strokeWidth="2.5" />
      {/* Plazas/Steps */}
      <polygon points="340,580 735,580 745,592 330,592" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
      <polygon points="330,592 745,592 755,605 320,605" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />


      {/* 12. NATURAL ELEMENTS (Layered palms, bushes & flowers) */}
      {/* Left side palm trees */}
      <g id="palm-trees-left">
        {/* Trunk 1 */}
        <path d="M 30 595 Q 25 460 70 380" stroke="#78350F" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M 30 595 Q 25 460 70 380" stroke="#92400E" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Leaves 1 */}
        <path d="M 70 380 Q 20 380 -10 405" stroke="#047857" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 70 380 Q 50 340 10 330" stroke="#047857" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 70 380 Q 110 330 130 320" stroke="#059669" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 70 380 Q 120 370 140 400" stroke="#047857" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M 70 380 Q 40 420 20 440" stroke="#065F46" strokeWidth="5" strokeLinecap="round" fill="none" />

        {/* Trunk 2 (Behind 1) */}
        <path d="M 115 595 Q 110 490 125 430" stroke="#78350F" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Leaves 2 */}
        <path d="M 125 430 Q 80 410 50 430" stroke="#065F46" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <path d="M 125 430 Q 100 380 70 395" stroke="#047857" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <path d="M 125 430 Q 160 380 180 390" stroke="#10B981" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <path d="M 125 430 Q 170 420 185 450" stroke="#059669" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      </g>

      {/* Layered deep green garden at left base */}
      <path d="M -10 605 Q 40 560 90 585 T 190 575 T 290 590 L 290 620 L -10 620 Z" fill="#065F46" />
      <path d="M -10 610 Q 50 575 110 595 T 220 585 T 275 610 L 275 620 L -10 620 Z" fill="#047857" />
      <path d="M -10 615 Q 30 590 70 605 T 150 600 T 250 615 L -10 615 Z" fill="#10B981" />

      {/* Right side plant container & pink flowers */}
      <g id="right-garden">
        {/* Large dark pot container */}
        <ellipse cx="910" cy="625" rx="55" ry="15" fill="#334155" />
        <ellipse cx="910" cy="622" rx="55" ry="12" fill="#475569" />
        <ellipse cx="910" cy="622" rx="50" ry="8" fill="#1E293B" />

        {/* Flowering Bushes growing inside */}
        {/* Dark Green Back-bush */}
        <path d="M 850 620 Q 820 540 880 520 T 985 570 T 960 620 Z" fill="#064E3B" />
        {/* Plant leaf strokes */}
        <path d="M 910 620 Q 920 520 950 490" stroke="#047857" strokeWidth="3" fill="none" />
        <path d="M 910 620 Q 870 540 820 510" stroke="#047857" strokeWidth="3" fill="none" />
        <path d="M 910 620 Q 940 540 980 530" stroke="#047857" strokeWidth="3.5" fill="none" />
        <path d="M 910 620 Q 890 500 880 470" stroke="#059669" strokeWidth="3.5" fill="none" />

        {/* Bright green leaves detail */}
        <path d="M 870 620 Q 855 575 885 570 T 945 580 T 955 620 Z" fill="#047857" />
        <path d="M 885 620 Q 880 590 915 590 T 940 610 Z" fill="#10B981" />

        {/* Red / Pink Flowers (Circles of blossom blooms) */}
        <circle cx="850" cy="540" r="8" fill="#EC4899" />
        <circle cx="853" cy="537" r="5" fill="#F472B6" />
        <circle cx="850" cy="540" r="2" fill="#FDE047" />

        <circle cx="880" cy="505" r="9" fill="#EF4444" />
        <circle cx="883" cy="501" r="6" fill="#F87171" />
        <circle cx="880" cy="505" r="2.5" fill="#FEF08A" />

        <circle cx="945" cy="500" r="10" fill="#EC4899" />
        <circle cx="948" cy="496" r="6" fill="#F472B6" />
        <circle cx="945" cy="500" r="2" fill="#FDE047" />

        <circle cx="910" cy="525" r="7" fill="#F43F5E" />
        <circle cx="912" cy="522" r="4" fill="#FB7185" />
        <circle cx="910" cy="525" r="1.5" fill="#FEF08A" />

        <circle cx="975" cy="535" r="8" fill="#EC4899" />
        <circle cx="977" cy="532" r="5" fill="#F472B6" />
        <circle cx="975" cy="535" r="2" fill="#FDE047" />

        <circle cx="895" cy="555" r="8" fill="#EF4444" />
        <circle cx="895" cy="555" r="2" fill="#FEF08A" />

        <circle cx="950" cy="550" r="8" fill="#EC4899" />
        <circle cx="950" cy="550" r="2" fill="#FEF08A" />
      </g>
    </svg>
  );
}
