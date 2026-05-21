import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');

        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-mono-dm  { font-family: 'DM Mono', monospace; }
        .font-sans-dm  { font-family: 'DM Sans', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .anim-1  { opacity:0; animation: fadeUp 0.6s ease forwards 0.10s; }
        .anim-2  { opacity:0; animation: fadeUp 0.6s ease forwards 0.30s; }
        .anim-3  { opacity:0; animation: fadeUp 0.7s ease forwards 0.45s; }
        .anim-4  { opacity:0; animation: fadeUp 0.7s ease forwards 0.55s; }
        .anim-5  { opacity:0; animation: fadeUp 0.6s ease forwards 0.70s; }
        .anim-6  { opacity:0; animation: fadeUp 0.6s ease forwards 0.85s; }
        .anim-7  { opacity:0; animation: fadeUp 0.6s ease forwards 0.50s; }
        .anim-8  { opacity:0; animation: fadeUp 0.7s ease forwards 0.65s; }
        .anim-9  { opacity:0; animation: fadeUp 0.7s ease forwards 0.90s; }
        .anim-10 { opacity:0; animation: fadeUp 0.6s ease forwards 1.00s; }

        .headline-size { font-size: clamp(40px, 5vw, 66px); }

        .arrow-btn { transition: transform 0.2s ease; }
        .cta-link:hover .arrow-btn { transform: translateX(5px); }
        .cta-link { transition: all 0.22s ease; }
      `}</style>

      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#f8f6f2] font-sans-dm">

        {/* LEFT */}
        <div className="flex flex-col justify-between px-16 py-16 border-b md:border-b-0 md:border-r border-[#e4e0d8]">

          <div className="anim-1 font-mono-dm text-[11px] tracking-[0.18em] uppercase text-[#6b7280]">
            SafeMum AI
          </div>

          <div className="flex flex-col justify-center py-12 flex-1">

            <div className="anim-2 font-mono-dm text-[10px] tracking-[0.2em] uppercase text-[#16a34a] mb-6">
              AI for Reproductive Health · Africa 2026
            </div>

            <h1 className="anim-3 font-playfair headline-size font-bold leading-[1.08] tracking-[-0.02em] text-[#0e0e0e] mb-1">
              No woman<br />should face{" "}
              <em className="text-[#16a34a]" style={{ fontStyle: "italic", fontWeight: 400 }}>loss</em>
            </h1>

            <div className="anim-4 font-playfair headline-size font-normal italic leading-[1.08] tracking-[-0.02em] text-[#6b7280] mb-10">
              alone.
            </div>

            <p className="anim-5 text-[15px] font-light leading-[1.75] text-[#444] max-w-[380px]">
              SafeMum AI is a post-pregnancy loss care platform built for
              Sub-Saharan Africa. It connects women to physical care, emotional
              support, and community — through any phone, anywhere.
            </p>

            <div className="anim-6 flex gap-10 mt-12 pt-10 border-t border-[#e4e0d8] flex-wrap">
              {[
                { num: "7%",  label: "of maternal deaths\nfrom early pregnancy loss" },
                { num: "3",   label: "pillars — prevent,\neducate, intervene" },
                { num: "0",   label: "internet needed\nfor emergency access" },
              ].map((s) => (
                <div key={s.num} className="flex flex-col gap-1">
                  <span className="font-playfair text-[28px] font-bold text-[#0e0e0e] leading-none">{s.num}</span>
                  <span className="text-[11px] text-[#6b7280] leading-[1.5] whitespace-pre-line">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="anim-10">
            <div className="inline-flex items-center gap-2 border border-[#e4e0d8] rounded-full px-4 py-1.5 font-mono-dm text-[11px] text-[#6b7280] tracking-[0.04em]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] flex-shrink-0" />
              Track I — Early Pregnancy Loss Care
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col justify-between px-14 py-16">

          <div className="anim-7 text-right">
            <div className="font-mono-dm text-[10px] tracking-[0.16em] uppercase text-[#6b7280]">
              AI Innovation Challenge · Hackathon 2026
            </div>
          </div>

          <div className="anim-8 flex flex-col justify-center flex-1">
            {[
              {
                num: "01",
                title: "Prevention",
                body: "Weekly tips, antenatal reminders, and danger signs education — delivered to any phone over SMS or USSD. No data required.",
              },
              {
                num: "02",
                title: "Education",
                body: "An AI assistant that explains what is happening in plain language — and a SafeRecovery Hub for women navigating grief and loss.",
              },
              {
                num: "03",
                title: "Intervention",
                body: "Smart referrals, live facility maps, and an emergency call line — connecting the right care to the right woman in seconds.",
              },
            ].map((item, i, arr) => (
              <div
                key={item.num}
                className={[
                  "flex gap-5 items-start py-7",
                  i === 0 ? "pt-0" : "",
                  i < arr.length - 1 ? "border-b border-[#e4e0d8]" : "pb-0",
                ].join(" ")}
              >
                <div className="font-mono-dm text-[11px] text-[#16a34a] mt-0.5 flex-shrink-0 w-5">
                  {item.num}
                </div>
                <div>
                  <div className="font-playfair text-[19px] font-bold text-[#0e0e0e] tracking-[-0.01em]">
                    {item.title}
                  </div>
                  <div className="text-[13.5px] font-light leading-[1.7] text-[#555] mt-1.5">
                    {item.body}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="anim-9">
            <div className="font-mono-dm text-[10px] tracking-[0.18em] uppercase text-[#6b7280] mb-3.5">
              Enter as
            </div>
            <div className="flex flex-col gap-2.5">

              <Link
                to="/home"
                className="cta-link flex items-center justify-between px-5 py-4 rounded-[10px] bg-[#0e0e0e] text-[#f8f6f2] no-underline hover:bg-[#1c1c1c]"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium">Patient</span>
                  <span className="text-[11px] font-light opacity-65">I am seeking care or support</span>
                </div>
                <span className="arrow-btn text-[18px] flex-shrink-0">→</span>
              </Link>

              <Link
                to="/chw/dashboard"
                className="cta-link flex items-center justify-between px-5 py-4 rounded-[10px] bg-[#dcfce7] text-[#14532d] border border-[#bbf7d0] no-underline hover:bg-[#d1fae5]"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium">Community Health Worker</span>
                  <span className="text-[11px] font-light opacity-65">I support women in my area</span>
                </div>
                <span className="arrow-btn text-[18px] flex-shrink-0">→</span>
              </Link>

              <Link
                to="/facility/dashboard"
                className="cta-link flex items-center justify-between px-5 py-4 rounded-[10px] bg-transparent text-[#0e0e0e] border border-[#e4e0d8] no-underline hover:bg-[#f1ede6] hover:border-[#ccc]"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium">Health Facility</span>
                  <span className="text-[11px] font-light opacity-65">I manage a clinic or hospital</span>
                </div>
                <span className="arrow-btn text-[18px] flex-shrink-0">→</span>
              </Link>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}