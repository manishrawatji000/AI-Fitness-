import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserButton } from "@clerk/clerk-react";

/* ── tiny helpers ─────────────────────────────────────────────────────────── */
const StatPill = ({ value, label }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <span style={{ color: "#22d3ee", fontSize: 24, fontWeight: 700 }}>{value}</span>
    <span style={{ color: "#64748b", fontSize: 11, letterSpacing: "0.1em" }}>{label}</span>
  </div>
);

const MetricCard = ({ label, value }) => (
  <div style={{ padding: "14px 16px", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(34,211,238,0.15)", borderRadius: 10 }}>
    <div style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>{label}</div>
    <div style={{ color: "#22d3ee", fontWeight: 700 }}>{value}</div>
  </div>
);

const UserCard = ({ id, level, name, age, freq, tag, workout, workoutSub, nutrition, nutSub, safety, safeSub, desc }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "rgba(15,23,42,0.9)", border: `1px solid ${hov ? "rgba(34,211,238,0.4)" : "rgba(148,163,184,0.1)"}`, borderRadius: 12, padding: "24px", transform: hov ? "translateY(-4px)" : "none", transition: "all 0.25s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 11, letterSpacing: "0.1em" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#22d3ee" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee", display: "inline-block" }} />{id}
        </span>
        <span style={{ color: "#64748b" }}>{level}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#1e3a5f,#0f2744)", border: "2px solid rgba(34,211,238,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#22d3ee", fontWeight: 700 }}>{name[0]}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{name}<span style={{ color: "#22d3ee" }}>.exe</span></div>
          <div style={{ color: "#64748b", fontSize: 12 }}>👤 {age} · {freq}</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ padding: "4px 12px", borderRadius: 6, background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)", color: "#22d3ee", fontSize: 12, fontWeight: 600 }}>⚡ {tag}</span>
        <span style={{ color: "#64748b", fontSize: 11 }}>⏱ v3.5</span>
      </div>
      {[{ icon:"🏋️", title:workout, sub:workoutSub }, { icon:"🍎", title:nutrition, sub:nutSub }, { icon:"🛡️", title:safety, sub:safeSub }].map((row, j) => (
        <div key={j} style={{ display: "flex", gap: 12, marginBottom: 10, paddingBottom: j < 2 ? 10 : 0, borderBottom: j < 2 ? "1px solid rgba(148,163,184,0.06)" : "none" }}>
          <span style={{ fontSize: 14, opacity: 0.7 }}>{row.icon}</span>
          <div>
            <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{row.title}</div>
            <div style={{ color: "#64748b", fontSize: 11 }}>{row.sub}</div>
          </div>
        </div>
      ))}
      <p style={{ color: "#64748b", fontSize: 12, marginTop: 12, lineHeight: 1.6, fontFamily: "'Courier New', monospace" }}>&gt; {desc}</p>
    </div>
  );
};

/* ── Home ─────────────────────────────────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [typed, setTyped] = useState("");
  const full = "WORKOUT ANALYSIS COMPLETE";

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i <= full.length) { setTyped(full.slice(0, i)); i++; } else clearInterval(iv);
    }, 60);
    return () => clearInterval(iv);
  }, []);

  const toApp   = () => navigate(isSignedIn ? "/dashboard" : "/sign-up");
  const toTrain = () => navigate(isSignedIn ? "/workout"   : "/sign-up");

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>

      {/* NAVBAR */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 40px", background: "rgba(2,6,23,0.88)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="#22d3ee" strokeWidth="1.5" fill="none"/>
            <polygon points="11,6 16,9 16,13 11,16 6,13 6,9" fill="#22d3ee" opacity="0.3"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "0.04em" }}>codeflex<span style={{ color: "#22d3ee" }}>.ai</span></span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 14 }}>
          {["Home","Generate","Profile"].map(item => (
            <a key={item} href="#" style={{ color: "#cbd5e1", textDecoration: "none" }}
              onMouseEnter={e => e.target.style.color="#22d3ee"} onMouseLeave={e => e.target.style.color="#cbd5e1"}>{item}</a>
          ))}
          {isSignedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => navigate("/dashboard")} style={{ padding: "7px 18px", borderRadius: 8, border: "1px solid #22d3ee", background: "transparent", color: "#22d3ee", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                onMouseEnter={e => { e.target.style.background="#22d3ee"; e.target.style.color="#020617"; }}
                onMouseLeave={e => { e.target.style.background="transparent"; e.target.style.color="#22d3ee"; }}>Dashboard</button>
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width:34, height:34, border:"2px solid rgba(34,211,238,0.4)", borderRadius:"50%" } } }} />
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <Link to="/sign-in" style={{ padding:"7px 18px", borderRadius:8, border:"1px solid rgba(148,163,184,0.25)", background:"transparent", color:"#cbd5e1", fontWeight:500, fontSize:13, cursor:"pointer", textDecoration:"none", display:"inline-flex", alignItems:"center" }}>Sign In</Link>
              <button onClick={toApp} style={{ padding:"7px 18px", borderRadius:8, border:"1px solid #22d3ee", background:"transparent", color:"#22d3ee", fontWeight:600, fontSize:13, cursor:"pointer" }}
                onMouseEnter={e => { e.target.style.background="#22d3ee"; e.target.style.color="#020617"; }}
                onMouseLeave={e => { e.target.style.background="transparent"; e.target.style.color="#22d3ee"; }}>Get Started</button>
            </div>
          )}
        </nav>
      </header>

      {/* HERO */}
      <section style={{ display:"grid", gridTemplateColumns:"1fr 1fr", maxWidth:1300, margin:"0 auto", padding:"60px 40px 80px", minHeight:"85vh", alignItems:"center", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(34,211,238,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.035) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />

        {/* left */}
        <div style={{ position:"relative", zIndex:2 }}>
          <div style={{ position:"absolute", top:-20, left:-20, width:50, height:50, borderTop:"2px solid rgba(34,211,238,0.4)", borderLeft:"2px solid rgba(34,211,238,0.4)" }} />
          <h1 style={{ fontSize:"clamp(42px,5vw,68px)", fontWeight:900, lineHeight:1.1, margin:"0 0 18px", letterSpacing:"-0.02em" }}>
            <span style={{ color:"#f9fafb" }}>Transform</span><br /><span style={{ color:"#22d3ee" }}>Your Body</span><br />
            <span style={{ color:"#f9fafb" }}>With Advanced</span><br /><span style={{ color:"#f9fafb" }}>AI </span><span style={{ color:"#22d3ee" }}>Technology</span>
          </h1>
          <div style={{ width:200, height:1, background:"linear-gradient(90deg,rgba(34,211,238,0.6),transparent)", marginBottom:24 }} />
          <p style={{ color:"#94a3b8", fontSize:16, lineHeight:1.7, maxWidth:480, marginBottom:36 }}>Talk to our AI assistant and get personalized diet plans and workout routines designed just for you.</p>
          <div style={{ display:"flex", gap:36, marginBottom:40 }}>
            <StatPill value="500+" label="ACTIVE USERS" /><StatPill value="3min" label="GENERATION" /><StatPill value="100%" label="PERSONALIZED" />
          </div>
          <button onClick={toTrain} style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"14px 28px", background:"#22d3ee", color:"#020617", fontWeight:700, fontSize:15, border:"none", borderRadius:8, cursor:"pointer", fontFamily:"'Courier New',monospace", letterSpacing:"0.05em", boxShadow:"0 0 30px rgba(34,211,238,0.35)", transition:"box-shadow 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow="0 0 50px rgba(34,211,238,0.6)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow="0 0 30px rgba(34,211,238,0.35)"}>Build Your Program →</button>
        </div>

        {/* right */}
        <div style={{ position:"relative", display:"flex", justifyContent:"center", alignItems:"center" }}>
          <div style={{ position:"absolute", top:-10, right:-10, width:60, height:60, borderTop:"2px solid rgba(34,211,238,0.4)", borderRight:"2px solid rgba(34,211,238,0.4)", zIndex:3 }} />
          <div style={{ position:"absolute", bottom:40, left:-10, width:60, height:60, borderBottom:"2px solid rgba(34,211,238,0.4)", borderLeft:"2px solid rgba(34,211,238,0.4)", zIndex:3 }} />
          <div style={{ position:"relative", borderRadius:4, overflow:"hidden", border:"1px solid rgba(34,211,238,0.2)", background:"rgba(34,211,238,0.03)", width:"100%", maxWidth:500 }}>
            <img src="/hero-ai3.png" alt="AI Fitness Robot" style={{ width:"100%", display:"block", objectFit:"cover" }} />
            <div style={{ position:"absolute", bottom:16, left:16, right:16, background:"rgba(2,6,23,0.88)", border:"1px solid rgba(34,211,238,0.25)", borderRadius:6, padding:"12px 14px", fontFamily:"'Courier New',monospace", fontSize:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ color:"#22d3ee", display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:"#22d3ee", display:"inline-block", boxShadow:"0 0 6px #22d3ee" }} />SYSTEM ACTIVE
                </span>
                <span style={{ color:"#475569" }}>ID:78412.93</span>
              </div>
              <div style={{ color:"#94a3b8", marginBottom:6 }}>/ {typed}<span style={{ animation:"blink 1s infinite" }}>_</span></div>
              <div style={{ color:"#22d3ee", fontSize:11 }}>
                <div>01 30 min strength training (upper body)</div>
                <div>02 20 min cardio (moderate intensity)</div>
                <div>03 10 min flexibility (recovery)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAM GALLERY */}
      <section style={{ background:"rgba(15,23,42,0.6)", borderTop:"1px solid rgba(148,163,184,0.08)", borderBottom:"1px solid rgba(148,163,184,0.08)", padding:"60px 40px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ background:"rgba(15,23,42,0.8)", border:"1px solid rgba(148,163,184,0.1)", borderRadius:12, padding:"32px 40px 28px", marginBottom:40 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <span style={{ display:"flex", alignItems:"center", gap:8, color:"#22d3ee", fontSize:13 }}><span style={{ width:7, height:7, borderRadius:"50%", background:"#22d3ee", display:"inline-block" }} />Program Gallery</span>
              <span style={{ color:"#64748b", fontSize:13 }}>Featured Plans</span>
            </div>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:800, margin:"0 0 12px", textAlign:"center" }}>AI-Generated <span style={{ color:"#22d3ee" }}>Programs</span></h2>
            <p style={{ color:"#64748b", fontSize:15, textAlign:"center", margin:"0 0 28px" }}>Explore personalized fitness plans our AI assistant has created for other users</p>
            <div style={{ display:"flex", justifyContent:"center", gap:40 }}>
              <StatPill value="500+" label="PROGRAMS" /><StatPill value="3min" label="CREATION TIME" /><StatPill value="100%" label="PERSONALIZED" />
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            <UserCard id="USER.1" level="BEGINNER"     name="Sarah"   age="34y" freq="4d/week" tag="Weight Loss"     workout="Beginner Weight Loss Program"        workoutSub="Home gym"        nutrition="Balanced Nutrition Plan (Lactose-Free)" nutSub="System optimized nutrition" safety="AI Safety Protocols" safeSub="Protection systems enabled" desc="Focuses on building a consistent habit with low-impact cardio and bodyweight training." />
            <UserCard id="USER.2" level="INTERMEDIATE" name="Michael" age="28y" freq="5d/week" tag="Muscle Gain"     workout="Hypertrophy-Focused Muscle Building" workoutSub="Full gym"        nutrition="Muscle Building Nutrition Plan"          nutSub="System optimized nutrition" safety="AI Safety Protocols" safeSub="Protection systems enabled" desc="Traditional bodybuilding split with progressive overload principles." />
            <UserCard id="USER.3" level="INTERMEDIATE" name="Elena"   age="45y" freq="3d/week" tag="General Fitness" workout="Functional Fitness Program"            workoutSub="Bodyweight only" nutrition="Balanced Vegetarian Nutrition"           nutSub="System optimized nutrition" safety="AI Safety Protocols" safeSub="Protection systems enabled" desc="Functional movement patterns that improve everyday performance." />
          </div>
        </div>
      </section>

      {/* BODY ANALYTICS */}
      <section style={{ padding:"80px 40px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"center" }}>
          <div>
            <div style={{ color:"#22d3ee", fontSize:12, letterSpacing:"0.2em", marginBottom:12 }}>AI-POWERED TRACKING</div>
            <h2 style={{ fontSize:40, fontWeight:800, margin:"0 0 20px", lineHeight:1.2 }}>Real-Time<br /><span style={{ color:"#22d3ee" }}>Body Analytics</span></h2>
            <p style={{ color:"#64748b", fontSize:15, lineHeight:1.8, marginBottom:28 }}>Our AI tracks your form, monitors vital metrics, and provides instant feedback during every workout — just like having a personal trainer.</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <MetricCard label="Pose Detection" value="Real-time" /><MetricCard label="Rep Counting" value="Auto" />
              <MetricCard label="Form Score"     value="0–100"    /><MetricCard label="Calories"     value="Live" />
            </div>
          </div>
          <img src="/data-stats-around-person-doing-physical-activity.jpg" alt="AI body analytics" style={{ width:"100%", borderRadius:16, border:"1px solid rgba(34,211,238,0.15)", objectFit:"cover" }} />
        </div>
      </section>

      {/* SPORT TRACKING */}
      <section style={{ padding:"0 40px 80px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"center" }}>
          <div style={{ position:"relative" }}>
            <img src="/full-shot-man-doing-sport-with-stats.jpg" alt="Sport tracking" style={{ width:"100%", borderRadius:16, border:"1px solid rgba(34,211,238,0.15)", objectFit:"cover" }} />
            <div style={{ position:"absolute", bottom:20, left:20, right:20, background:"rgba(2,6,23,0.85)", border:"1px solid rgba(34,211,238,0.2)", borderRadius:10, padding:"12px 16px", fontFamily:"'Courier New',monospace", fontSize:12 }}>
              <div style={{ color:"#22d3ee", marginBottom:4 }}>⚡ 706 kcal — Best Calories Loss</div>
              <div style={{ color:"#64748b" }}>25% body fat · 45% muscle mass · Heart rate: 129 bpm</div>
            </div>
          </div>
          <div>
            <div style={{ color:"#22d3ee", fontSize:12, letterSpacing:"0.2em", marginBottom:12 }}>INTELLIGENT COACHING</div>
            <h2 style={{ fontSize:40, fontWeight:800, margin:"0 0 20px", lineHeight:1.2 }}>Every Rep.<br /><span style={{ color:"#22d3ee" }}>Perfectly Tracked.</span></h2>
            <p style={{ color:"#64748b", fontSize:15, lineHeight:1.8, marginBottom:28 }}>Advanced computer vision analyses your movement patterns and gives you science-backed feedback to maximise results and prevent injury.</p>
            <button onClick={toTrain} style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"13px 26px", background:"transparent", color:"#22d3ee", fontWeight:600, fontSize:14, border:"1px solid #22d3ee", borderRadius:8, cursor:"pointer", letterSpacing:"0.04em", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#22d3ee"; e.currentTarget.style.color="#020617"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#22d3ee"; }}>Start Training →</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:"rgba(15,23,42,0.5)", borderTop:"1px solid rgba(148,163,184,0.08)", padding:"80px 40px", textAlign:"center" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(34,211,238,0.1)", border:"1px solid rgba(34,211,238,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:28 }}>⚡</div>
          <h2 style={{ fontSize:40, fontWeight:800, margin:"0 0 16px" }}>Ready to <span style={{ color:"#22d3ee" }}>Transform</span>?</h2>
          <p style={{ color:"#64748b", fontSize:16, marginBottom:32 }}>Join 500+ users getting AI-powered personalized fitness programs in under 3 minutes.</p>
          <button onClick={toApp} style={{ padding:"16px 40px", background:"#22d3ee", color:"#020617", fontWeight:700, fontSize:16, border:"none", borderRadius:8, cursor:"pointer", fontFamily:"'Courier New',monospace", boxShadow:"0 0 40px rgba(34,211,238,0.4)", transition:"box-shadow 0.2s", letterSpacing:"0.05em" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow="0 0 60px rgba(34,211,238,0.7)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow="0 0 40px rgba(34,211,238,0.4)"}
          >{isSignedIn ? "Go to Dashboard →" : "Get Started Free →"}</button>
        </div>
      </section>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
};

export default Home;
