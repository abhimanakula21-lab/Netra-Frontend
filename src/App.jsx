import React, { useMemo, useState } from "react";
import {
  AlertTriangle, Bell, Users, BookOpenCheck, MapPin, ShieldCheck,
  LayoutDashboard, Phone, MessageSquare, Send, Plus, Droplets,
  Waves, Navigation, Hospital, Home, CheckCircle2, Circle,
  TrendingUp, AlertOctagon, Radio, ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

const API = "http://localhost:5000/api";

const INK = "#0B1D26", PANEL = "#12303B", PANEL_2 = "#173B47";
const LINE = "#20505E", WATER = "#3AA6C9", WATER_DIM = "#2E86AB";
const AMBER = "#F2A541", RED = "#E15757", GREEN = "#4FA87A";
const TEXT = "#EAF3F5", MUTED = "#89A6AE";

const THRESHOLDS = {
  watch: 3.0,
  warning: 4.0,
  critical: 4.5
};

const ZONES = [
  { id:"z1", name:"Assam", risk:"severe", score:88, rain:62, level:4.8, trend:"rising" },
  { id:"z2", name:"Bihar", risk:"high", score:71, rain:48, level:3.6, trend:"rising" },
  { id:"z3", name:"West Bengal", risk:"moderate", score:46, rain:30, level:2.1, trend:"stable" },
  { id:"z4", name:"Telangana", risk:"low", score:18, rain:12, level:0.9, trend:"falling" },
  { id:"z5", name:"Odisha", risk:"high", score:76, rain:55, level:4.1, trend:"rising" },
  { id:"z6", name:"Uttar Pradesh", risk:"moderate", score:41, rain:26, level:1.8, trend:"stable" }
];

const WATER_TREND = [
  {t:"06:00",level:2.1},
  {t:"08:00",level:2.4},
  {t:"10:00",level:2.9},
  {t:"12:00",level:3.4},
  {t:"14:00",level:3.9},
  {t:"16:00",level:4.3},
  {t:"18:00",level:4.6},
  {t:"20:00",level:4.8}
];

const INITIAL_ALERTS = [
  {
    id:"a1",
    severity:"severe",
    zone:"Assam",
    msg:"River level exceeded critical threshold (4.5m). Evacuate low-lying streets now.",
    time:"2 min ago",
    channels:["push","sms","voice"]
  },
  {
    id:"a2",
    severity:"high",
    zone:"Bihar",
    msg:"Rainfall rate crossed 50mm/hr. Flash flood possible within 3 hours.",
    time:"18 min ago",
    channels:["push","sms"]
  },
  {
    id:"a3",
    severity:"moderate",
    zone:"West Bengal",
    msg:"Water level rising steadily. Monitor and prepare emergency kit.",
    time:"1 hr ago",
    channels:["push"]
  },
  {
    id:"a4",
    severity:"info",
    zone:"Odisha",
    msg:"Weather service extends flood watch through tomorrow evening.",
    time:"3 hr ago",
    channels:["push"]
  }
];

const CIRCLE = [
  {
    id:"c1",
    name:"Ananya Rao",
    relation:"Spouse",
    phone:"+919XXXXXXXXX",
    notified:true
  },
  {
    id:"c2",
    name:"Priya Sharma",
    relation:"Daughter",
    phone:"+919XXXXXXXXX",
    notified:true
  },
  {
    id:"c3",
    name:"Abhiman",
    relation:"Neighbor",
    phone:"+919XXXXXXXXX",
    notified:false
  },
  {
    id:"c4",
    name:"Ward Control Room",
    relation:"Local authority",
    phone:"+919XXXXXXXXX",
    notified:true
  }
];

const RISK_COLOR = {
  severe: RED,
  high: AMBER,
  moderate: "#E0C34C",
  low: GREEN
};

const RISK_LABEL = {
  severe:"Severe",
  high:"High",
  moderate:"Moderate",
  low:"Low"
};

function Pill({color, children}) {
  return (
    <span
      style={{
        display:"inline-flex",
        alignItems:"center",
        gap:6,
        fontSize:12,
        fontFamily:"monospace",
        padding:"3px 10px",
        borderRadius:999,
        background:color+"22",
        color,
        border:`1px solid ${color}55`
      }}
    >
      <span
        style={{
          width:6,
          height:6,
          borderRadius:999,
          background:color
        }}
      />
      {children}
    </span>
  );
}

function Card({children, style}) {
  return (
    <div
      style={{
        background:PANEL,
        border:`1px solid ${LINE}`,
        borderRadius:10,
        padding:"18px 20px",
        ...style
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({icon:Icon, children, sub}) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {Icon && <Icon size={18} color={WATER}/>}
        <h2
          style={{
            fontFamily:"'Barlow Condensed',sans-serif",
            fontWeight:600,
            fontSize:22,
            color:TEXT,
            margin:0,
            textTransform:"uppercase"
          }}
        >
          {children}
        </h2>
      </div>

      {sub && (
        <p
          style={{
            color:MUTED,
            fontSize:13,
            margin:"4px 0 0 28px"
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function RiskGauge({score}) {
  const pct = Math.max(0, Math.min(100, score));
  const angle = pct / 100 * 180;

  const r = 70;
  const cx = 90;
  const cy = 90;

  const rad = Math.PI / 180 * (180 - angle);

  const x = cx + r * Math.cos(rad);
  const y = cy - r * Math.sin(rad);

  const color =
    pct >= 75
      ? RED
      : pct >= 55
      ? AMBER
      : pct >= 30
      ? "#E0C34C"
      : GREEN;

  const arc = (sDeg, eDeg, col) => {
    const s = Math.PI / 180 * (180 - sDeg);
    const e = Math.PI / 180 * (180 - eDeg);

    const x1 = cx + r * Math.cos(s);
    const y1 = cy - r * Math.sin(s);

    const x2 = cx + r * Math.cos(e);
    const y2 = cy - r * Math.sin(e);

    return (
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
        stroke={col}
        strokeWidth="14"
        fill="none"
      />
    );
  };

  return (
    <svg width="180" height="110">
      {arc(0,60,GREEN)}
      {arc(60,100,"#E0C34C")}
      {arc(100,140,AMBER)}
      {arc(140,180,RED)}

      <line
        x1={cx}
        y1={cy}
        x2={x}
        y2={y}
        stroke={TEXT}
        strokeWidth="3"
      />

      <circle
        cx={cx}
        cy={cy}
        r="5"
        fill={TEXT}
      />

      <text
        x={cx}
        y={cy+26}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="20"
        fontWeight="700"
        fill={color}
      >
        {pct}
      </text>

      <text
        x={cx}
        y={cy+42}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="11"
        fill={MUTED}
      >
        RISK SCORE
      </text>
    </svg>
  );
}

function RiskMapView({
  waterLevel,
  setWaterLevel,
  onAlert
}) {
  const risk =
    waterLevel >= THRESHOLDS.critical
      ? "critical"
      : waterLevel >= THRESHOLDS.warning
      ? "warning"
      : waterLevel >= THRESHOLDS.watch
      ? "watch"
      : "safe";

  const color =
    risk === "critical"
      ? RED
      : risk === "warning"
      ? AMBER
      : risk === "watch"
      ? "#E0C34C"
      : GREEN;

  const score = Math.round(
    Math.min(100, waterLevel / 5 * 100)
  );

  return (
    <>
      <SectionTitle
        icon={Waves}
        sub="Water level monitoring with automatic escalation to SMS and voice calls."
      >
        Real-time flood risk map
      </SectionTitle>

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"1.3fr 1fr",
          gap:16,
          marginBottom:16
        }}
      >
        <Card>
          <span
            style={{
              fontFamily:"monospace",
              fontSize:11,
              color:MUTED
            }}
          >
            ZONE STATUS GRID
          </span>

          <div
            style={{
              display:"grid",
              gridTemplateColumns:"repeat(3,1fr)",
              gap:10,
              marginTop:10
            }}
          >
            {ZONES.map(z => (
              <div
                key={z.id}
                style={{
                  border:`1px solid ${RISK_COLOR[z.risk]}66`,
                  background:RISK_COLOR[z.risk]+"1a",
                  borderRadius:8,
                  padding:"10px 12px"
                }}
              >
                <div
                  style={{
                    fontSize:13,
                    color:TEXT,
                    fontWeight:500,
                    marginBottom:6
                  }}
                >
                  {z.name}
                </div>

                <Pill color={RISK_COLOR[z.risk]}>
                  {RISK_LABEL[z.risk]}
                </Pill>

                <div
                  style={{
                    display:"flex",
                    gap:10,
                    marginTop:8,
                    fontFamily:"monospace",
                    fontSize:11,
                    color:MUTED
                  }}
                >
                  <span>
                    <Droplets size={11}/> {z.rain}mm/hr
                  </span>

                  <span>
                    <Waves size={11}/> {z.level}m
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          style={{
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"center",
            gap:8
          }}
        >
          <span
            style={{
              fontFamily:"monospace",
              fontSize:11,
              color:MUTED
            }}
          >
            LIVE WATER LEVEL
          </span>

          <RiskGauge score={score}/>

          <div
            style={{
              fontSize:28,
              fontFamily:"monospace",
              fontWeight:700,
              color
            }}
          >
            {waterLevel.toFixed(1)} m
          </div>

          <Pill color={color}>
            {risk.toUpperCase()}
          </Pill>

          <div
            style={{
              display:"flex",
              gap:8,
              marginTop:8
            }}
          >
            <button
              onClick={() => {
                const n = Math.max(
                  0,
                  +(waterLevel - 0.1).toFixed(1)
                );
                setWaterLevel(n);
              }}
            >
              - 0.1m
            </button>

            <button
              onClick={() => {
                const n = +(waterLevel + 0.1).toFixed(1);
                setWaterLevel(n);
              }}
            >
              + 0.1m
            </button>

            <button
              onClick={() => onAlert()}
              style={{
                background:RED,
                color:"white",
                border:"none"
              }}
            >
              Trigger alert
            </button>
          </div>

          <small
            style={{
              color:MUTED,
              textAlign:"center"
            }}
          >
            Critical ≥ 4.5m · SMS + automated call
          </small>
        </Card>
      </div>

      <Card>
        <div
          style={{
            display:"flex",
            justifyContent:"space-between",
            marginBottom:10
          }}
        >
          <span
            style={{
              fontFamily:"monospace",
              fontSize:11,
              color:MUTED
            }}
          >
            RIVERSIDE GAUGE · WATER LEVEL (M)
          </span>

          <Pill
            color={
              waterLevel >= 4.5
                ? RED
                : waterLevel >= 4
                ? AMBER
                : WATER
            }
          >
            <TrendingUp size={11}/> Live
          </Pill>
        </div>

        <div style={{height:180}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                ...WATER_TREND,
                {
                  t:"NOW",
                  level:waterLevel
                }
              ]}
            >
              <CartesianGrid
                stroke={LINE}
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="t"
                stroke={MUTED}
              />

              <YAxis
                stroke={MUTED}
                domain={[0,6]}
              />

              <Tooltip/>

              <Area
                type="monotone"
                dataKey="level"
                stroke={WATER}
                fill={WATER}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}

function AlertsView({alerts}) {
  const sevColor = {
    severe:RED,
    high:AMBER,
    moderate:"#E0C34C",
    info:WATER,
    critical:RED,
    warning:AMBER
  };

  const chanIcon = {
    push:Radio,
    sms:MessageSquare,
    voice:Phone
  };

  return (
    <>
      <SectionTitle
        icon={Bell}
        sub="Alerts generated by water-level thresholds and delivered through configured channels."
      >
        Alerts
      </SectionTitle>

      <div
        style={{
          display:"flex",
          flexDirection:"column",
          gap:10
        }}
      >
        {alerts.map(a => (
          <Card
            key={a.id}
            style={{
              borderLeft:`3px solid ${sevColor[a.severity] || WATER}`
            }}
          >
            <div
              style={{
                display:"flex",
                gap:8,
                marginBottom:6
              }}
            >
              <Pill color={sevColor[a.severity] || WATER}>
                {a.severity.toUpperCase()}
              </Pill>

              <span
                style={{
                  fontSize:12,
                  color:MUTED
                }}
              >
                {a.zone}
              </span>
            </div>

            <p
              style={{
                margin:0,
                color:TEXT,
                fontSize:14
              }}
            >
              {a.msg}
            </p>

            <div
              style={{
                display:"flex",
                gap:10,
                marginTop:8
              }}
            >
              {a.channels.map(c => {
                const Icon = chanIcon[c];

                return Icon ? (
                  <Icon
                    key={c}
                    size={13}
                    color={MUTED}
                  />
                ) : null;
              })}

              <span
                style={{
                  fontSize:11,
                  color:MUTED
                }}
              >
                {a.time}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function CircleView() {
  const [contacts,setContacts] = useState(CIRCLE);
  const [name,setName] = useState("");
  const [relation,setRelation] = useState("");
  const [phone,setPhone] = useState("");

  const add = () => {
    if (!name || !relation || !phone) return;

    setContacts([
      ...contacts,
      {
        id:"c"+Date.now(),
        name,
        relation,
        phone,
        notified:false
      }
    ]);

    setName("");
    setRelation("");
    setPhone("");
  };

  return (
    <>
      <SectionTitle
        icon={Users}
        sub="These contacts receive SMS/call escalation from the backend."
      >
        Emergency circle
      </SectionTitle>

      <Card style={{marginBottom:16}}>
        <div
          style={{
            display:"flex",
            gap:8,
            flexWrap:"wrap"
          }}
        >
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
          />

          <input
            value={relation}
            onChange={e => setRelation(e.target.value)}
            placeholder="Relation"
          />

          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+91XXXXXXXXXX"
          />

          <button onClick={add}>
            <Plus size={14}/> Add
          </button>
        </div>
      </Card>

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"repeat(2,1fr)",
          gap:10
        }}
      >
        {contacts.map(c => (
          <Card
            key={c.id}
            style={{
              display:"flex",
              justifyContent:"space-between"
            }}
          >
            <div>
              <div style={{color:TEXT}}>
                {c.name}
              </div>

              <div
                style={{
                  color:MUTED,
                  fontSize:12
                }}
              >
                {c.relation} · {c.phone}
              </div>
            </div>

            {c.notified ? (
              <Pill color={GREEN}>
                Configured
              </Pill>
            ) : (
              <Pill color={MUTED}>
                Ready
              </Pill>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}

function GuidanceView() {
  const [phase,setPhase] = useState("before");

  const data = {
    before:[
      "Charge phones, power banks, and battery radios.",
      "Pack a 72-hour emergency kit.",
      "Move vehicles and valuables to higher ground.",
      "Identify your nearest shelter and two evacuation routes."
    ],

    during:[
      "Move immediately to higher floors or designated high ground.",
      "Avoid walking or driving through moving water.",
      "Turn off electricity and gas if water is entering the home.",
      "Keep your emergency circle informed."
    ],

    after:[
      "Do not return home until authorities confirm it is safe.",
      "Avoid floodwater—it may be contaminated or electrically charged.",
      "Photograph damage before cleanup.",
      "Report hazards through the app."
    ]
  };

  return (
    <>
      <SectionTitle icon={BookOpenCheck}>
        Flood guidance
      </SectionTitle>

      <div
        style={{
          display:"flex",
          gap:8,
          marginBottom:16
        }}
      >
        {["before","during","after"].map(p => (
          <button
            key={p}
            onClick={() => setPhase(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <Card>
        {data[phase].map((x,i) => (
          <div
            key={i}
            style={{
              padding:8,
              color:TEXT
            }}
          >
            {i+1}. {x}
          </div>
        ))}
      </Card>
    </>
  );
}

function SheltersView() {
  const shelters = [
    ["Flood Relief Centre","Shelter","0.8 km","120 / 300"],
    ["St. Xavier's Relief Hospital","Hospital","1.4 km","Accepting patients"],
    ["Shiksha High School","Shelter","2.1 km","40 / 250"],
    ["JNTUH Fire Station","Emergency services","2.6 km","Dispatch active"]
  ];

  return (
    <>
      <SectionTitle icon={MapPin}>
        Shelters & evacuation routes
      </SectionTitle>

      {shelters.map((s,i) => (
        <Card
          key={i}
          style={{
            marginBottom:10,
            display:"flex",
            justifyContent:"space-between"
          }}
        >
          <div>
            <b style={{color:TEXT}}>
              {s[0]}
            </b>

            <div
              style={{
                color:MUTED,
                fontSize:12
              }}
            >
              {s[1]} · {s[3]}
            </div>
          </div>

          <span style={{color:MUTED}}>
            {s[2]}
          </span>
        </Card>
      ))}
    </>
  );
}

function PrepView() {
  const [items,setItems] = useState([
    ["Emergency kit packed",true],
    ["Evacuation route identified",true],
    ["Emergency circle configured",true],
    ["Important documents digitized",false],
    ["Flood insurance reviewed",false],
    ["Home barriers ready",false]
  ]);

  const score = Math.round(
    items.filter(x => x[1]).length /
    items.length * 100
  );

  return (
    <>
      <SectionTitle icon={ShieldCheck}>
        Preparedness score
      </SectionTitle>

      <Card
        style={{
          display:"flex",
          flexDirection:"column",
          alignItems:"center"
        }}
      >
        <RiskGauge score={score}/>

        {items.map((x,i) => (
          <div
            key={i}
            onClick={() =>
              setItems(
                items.map((a,j) =>
                  j === i
                    ? [a[0],!a[1]]
                    : a
                )
              )
            }
            style={{
              width:"100%",
              padding:8,
              cursor:"pointer",
              color:x[1] ? MUTED : TEXT
            }}
          >
            {x[1]
              ? <CheckCircle2 size={18} color={GREEN}/>
              : <Circle size={18} color={MUTED}/>
            }

            {" "}{x[0]}
          </div>
        ))}
      </Card>
    </>
  );
}

function AdminView({waterLevel,alerts}) {
  return (
    <>
      <SectionTitle icon={LayoutDashboard}>
        Administrative dashboard
      </SectionTitle>

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"repeat(4,1fr)",
          gap:12
        }}
      >
        {[
          ["Water level",waterLevel.toFixed(1)+"m"],
          ["Active alerts",alerts.length],
          ["Critical threshold",THRESHOLDS.critical+"m"],
          ["Notification mode","SMS + CALL"]
        ].map((m,i) => (
          <Card key={i}>
            <div
              style={{
                color:MUTED,
                fontSize:12
              }}
            >
              {m[0]}
            </div>

            <div
              style={{
                fontFamily:"monospace",
                fontSize:24,
                color:TEXT,
                marginTop:8
              }}
            >
              {m[1]}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export default function FloodGuard() {
  const [tab,setTab] = useState("map");
  const [waterLevel,setWaterLevel] = useState(4.3);
  const [alerts,setAlerts] = useState(INITIAL_ALERTS);

  const trigger = async () => {
    try {
      const r = await fetch(
        API + "/simulate",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            waterLevel
          })
        }
      );

      const d = await r.json();

      if (d.alert) {
        setAlerts(a => [
          {
            ...d.alert,
            id:"live-"+Date.now(),
            time:"just now"
          },
          ...a
        ]);
      } else {
        alert(
          d.message ||
          "No threshold crossed."
        );
      }

    } catch (e) {
      alert(
        "Backend is not running. Start the backend with: npm start"
      );
    }
  };

  const views = useMemo(
    () => ({
      map:
        <RiskMapView
          waterLevel={waterLevel}
          setWaterLevel={setWaterLevel}
          onAlert={trigger}
        />,

      alerts:
        <AlertsView alerts={alerts}/>,

      circle:
        <CircleView/>,

      guidance:
        <GuidanceView/>,

      shelters:
        <SheltersView/>,

      prep:
        <PrepView/>,

      admin:
        <AdminView
          waterLevel={waterLevel}
          alerts={alerts}
        />
    }[tab]),
    [tab,waterLevel,alerts]
  );

  const nav = [
    ["map","Risk map",Waves],
    ["alerts","Alerts",Bell],
    ["circle","Emergency circle",Users],
    ["guidance","Guidance",BookOpenCheck],
    ["shelters","Shelters & routes",MapPin],
    ["prep","Preparedness",ShieldCheck],
    ["admin","Admin dashboard",LayoutDashboard]
  ];

  return (
    <div
      style={{
        display:"flex",
        minHeight:"100vh",
        background:INK,
        fontFamily:"Inter,Arial,sans-serif"
      }}
    >
      <aside
        style={{
          width:230,
          background:"#081319",
          padding:20
        }}
      >
        <h1 style={{color:TEXT}}>
          NETRA
        </h1>

        {nav.map(([id,label,Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display:"flex",
              gap:10,
              width:"100%",
              padding:10,
              margin:3,
              background:
                tab === id
                  ? PANEL
                  : "transparent",
              color:
                tab === id
                  ? TEXT
                  : MUTED,
              border:"none",
              borderRadius:8,
              cursor:"pointer"
            }}
          >
            <Icon size={16}/>
            {label}
          </button>
        ))}

        <div
          style={{
            marginTop:30,
            color:MUTED,
            fontSize:11
          }}
        >
          Live feed · backend connected when running
        </div>
      </aside>

      <main
        style={{
          flex:1,
          padding:"28px 36px",
          maxWidth:1150
        }}
      >
        {views}
      </main>
    </div>
  );
}