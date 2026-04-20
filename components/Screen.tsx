import { clsx } from "clsx";

/**
 * Self-contained phone screens rendered as React components.
 * Tokens are pulled from the Tabby Figma file (design tokens):
 *   - Black #0E0E0E
 *   - Dark Gray #1A1A1A
 *   - Cream #F8F4F0
 *   - White #FDFBF9
 *   - Bright Green #02D57C  (brand action)
 *   - Orange #FF7C61  (destructive / accent)
 *   - Gray #75847D
 */

export type ScreenVariant =
  | "welcome"
  | "scan"
  | "claim"
  | "claim-expanded"
  | "split-amount"
  | "add-split"
  | "tip"
  | "settle"
  | "card"
  | "confirmation"
  | "order-summary"
  | "progress"
  | "progress-friend"
  | "smart-receipts"
  | "dashboard"
  | "friends"
  | "groups"
  | "sugarfish";

export function Screen({ variant }: { variant: ScreenVariant }) {
  if (variant === "scan") return <ScanScreen />;
  if (variant === "claim" || variant === "progress") return <ClaimScreen />;
  if (variant === "sugarfish") return <SugarfishScreen />;
  return <SettleScreen />;
}

// --- shared ---

function StatusBar({ dark }: { dark?: boolean }) {
  const color = dark ? "#FDFBF9" : "#0E0E0E";
  return (
    <div
      className="flex items-center justify-between px-6 pt-[3%] pb-[1.2%] text-[2.6%] font-semibold"
      style={{ color }}
    >
      <span>9:41</span>
      <span className="w-[30%] h-[2.4%] rounded-full" style={{ background: dark ? "#0E0E0E" : "transparent" }} />
      <span className="flex items-center gap-1 text-[90%]">
        <span>•••</span>
        <span>󰖩</span>
        <span className="inline-block w-[9%] h-[42%] rounded-xs border" style={{ borderColor: color }} />
      </span>
    </div>
  );
}

// --- Scan ---

function ScanScreen() {
  return (
    <div className="relative w-full h-full bg-[#0E0E0E] text-[#FDFBF9] font-grotesk flex flex-col">
      <StatusBar dark />
      <div className="px-[5%] pt-[4%] pb-[4%] flex items-center gap-[3%]">
        <span className="text-[4%] opacity-80">‹</span>
        <span className="font-bold text-[3.3%]">Scan Receipt</span>
      </div>

      {/* Viewfinder */}
      <div className="relative mx-[5%] flex-1 rounded-[4%] overflow-hidden bg-[#1a140d]">
        {/* faux wood texture */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(100deg, #2a1e14 0 6px, #1f140c 6px 14px, #31221a 14px 22px)",
            opacity: 0.85,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.45) 90%)",
          }}
        />

        {/* receipt */}
        <div className="absolute left-[10%] right-[10%] top-[10%] bottom-[10%] bg-[#F3EBDA] rounded-[2%] p-[4%] text-[#2a2a2a] font-mono text-[2.4%] leading-[1.3] shadow-[0_8px_16px_rgba(0,0,0,0.35)]">
          <div className="font-bold">Appetizers</div>
          <Row item="Spinach Artichoke Dip" dots price="$14.00" />
          <Row item="Calamari" dots price="$16.00" />
          <div className="mt-1 font-bold">Entrees</div>
          <Row item="Grilled Salmon" dots price="$28.00" />
          <Row item="NY Strip Steak (12oz)" dots price="$42.00" />
          <Row item="Chicken Alfredo" dots price="$24.00" />
          <Row item="Smash Burger Deluxe" dots price="$19.00" />
          <div className="mt-1 font-bold">Drinks</div>
          <Row item="4x Margaritas @ $13" dots price="$52.00" />
          <Row item="2x IPA Draft @ $9" dots price="$18.00" />
          <Row item="2x House Wine (Red)" dots price="$22.00" />
          <Row item="Sparkling Water" dots price="$5.00" />
          <div className="mt-2 font-bold flex justify-between">
            <span>Subtotal:</span>
            <span>$261.00</span>
          </div>
          <div className="font-bold flex justify-between">
            <span>Tax (8.25%):</span>
            <span>$21.53</span>
          </div>
          <div className="mt-1 font-bold">Suggested Gratuity</div>
          <Row item="18%:" price="$46.98" />
          <Row item="20%:" price="$52.20" />
          <Row item="22%:" price="$57.42" />
          <div className="mt-1 font-bold flex justify-between">
            <span>Total w/ 20% Tip:</span>
            <span>$334.73</span>
          </div>
        </div>

        {/* green bracket corners */}
        {[
          "top-[4%] left-[4%] border-t-2 border-l-2",
          "top-[4%] right-[4%] border-t-2 border-r-2",
          "bottom-[4%] left-[4%] border-b-2 border-l-2",
          "bottom-[4%] right-[4%] border-b-2 border-r-2",
        ].map((c, i) => (
          <span
            key={i}
            className={clsx("absolute w-[8%] h-[6%]", c)}
            style={{ borderColor: "#02D57C" }}
          />
        ))}
      </div>

      {/* shutter row */}
      <div className="flex items-center justify-between px-[14%] py-[4%]">
        <span className="w-[7%] aspect-square rounded-xs border border-white/40 opacity-70" />
        <span className="relative w-[16%] aspect-square rounded-full bg-[#FDFBF9] flex items-center justify-center">
          <span className="absolute inset-[10%] rounded-full border-2 border-[#0E0E0E]" />
        </span>
        <span className="w-[7%] aspect-square rounded-full border border-white/40 flex items-center justify-center text-[3%] opacity-70">
          ⚡
        </span>
      </div>
    </div>
  );
}

function Row({ item, dots, price }: { item: string; dots?: boolean; price: string }) {
  return (
    <div className="flex">
      <span className="whitespace-nowrap">{item}</span>
      {dots && <span className="flex-1 overflow-hidden mx-[2%] opacity-60">...................</span>}
      {!dots && <span className="flex-1" />}
      <span>{price}</span>
    </div>
  );
}

// --- Claim ---

function ClaimScreen() {
  return (
    <div className="relative w-full h-full bg-[#F8F4F0] text-[#0E0E0E] font-grotesk flex flex-col">
      <StatusBar />
      <div className="flex items-center justify-between px-[5%] pt-[3%] pb-[3%]">
        <div className="flex items-center gap-[3%]">
          <span className="text-[4%]">‹</span>
          <span className="font-bold text-[3.8%]">Select Items</span>
        </div>
        <span className="flex items-center gap-[1%] bg-white border border-black/10 rounded-full px-[3%] py-[1.2%] text-[2.6%] font-semibold">
          USD <span className="text-[70%]">▾</span>
        </span>
      </div>

      <div className="border-t border-black/10" />

      <div className="flex-1 overflow-hidden px-[5%] pt-[3%] text-[2.8%]">
        <div className="flex items-center gap-[2%] text-[#75847D] font-medium">
          <span>🍞</span>
          <span>Appetizers</span>
        </div>

        <ClaimRow name="Spinach Artichoke Dip" price="$14.00" expanded avatars={["#CFAFA6", "#F6C6B3", "#AFCFCB"]} />
        <SubRow avatarColor="#CFAFA6" name="1x Spinach Artichoke Dip" price="$4.66" action="plus" />
        <SubRow avatarColor="#F6C6B3" name="1x Spinach Artichoke Dip" price="$4.66" action="plus" />
        <SubRow avatarColor="#AFCFCB" name="1x Spinach Artichoke Dip" price="$4.66" action="minus" />

        <ClaimRow name="Calamari" price="$16.00" avatars={["#BFCBF0"]} action="minus" />

        <div className="mt-[3%] flex items-center gap-[2%] text-[#75847D] font-medium">
          <span>🍽</span>
          <span>Entrees</span>
        </div>
        <ClaimRow name="NY Strip Steak" price="$42.00" avatars={["#F2B9B3"]} />
        <ClaimRow name="Grilled Salmon" price="$28.00" avatars={["#D8CBA8"]} action="minus" />
        <ClaimRow name="Chicken Alfredo" price="$24.00" avatars={["#C8B9D8"]} />
        <ClaimRow name="Smash Burger Deluxe" price="$19.00" avatars={["#B8C8D8"]} />

        <div className="mt-[3%] flex items-center gap-[2%] text-[#75847D] font-medium">
          <span>🥤</span>
          <span>Drinks</span>
        </div>
      </div>

      {/* Pay pill */}
      <div className="px-[6%] pb-[6%] pt-[3%]">
        <div className="bg-[#0E0E0E] text-[#FDFBF9] rounded-full px-[6%] py-[4%] text-center font-bold text-[3.3%]">
          Pay $64.00
        </div>
      </div>
    </div>
  );
}

function ClaimRow({
  name,
  price,
  avatars,
  expanded,
  action,
}: {
  name: string;
  price: string;
  avatars: string[];
  expanded?: boolean;
  action?: "plus" | "minus";
}) {
  return (
    <div className="flex items-center gap-[3%] mt-[3%]">
      <AvatarStack colors={avatars} />
      <span className="flex-1 font-medium flex items-center gap-[1.5%]">
        <span className="truncate">{name}</span>
        {expanded && <span className="text-[70%] opacity-60">▴</span>}
      </span>
      <span className="opacity-70 mr-[2%]">{price}</span>
      <ActionDot kind={action ?? "plus"} />
    </div>
  );
}

function SubRow({
  avatarColor,
  name,
  price,
  action,
}: {
  avatarColor: string;
  name: string;
  price: string;
  action: "plus" | "minus";
}) {
  return (
    <div className="flex items-center gap-[3%] mt-[2%] pl-[6%]">
      <span className="text-[#75847D] text-[3%]">↳</span>
      <span
        className="w-[7%] aspect-square rounded-full"
        style={{ background: avatarColor }}
      />
      <span className="flex-1 font-medium truncate opacity-80">{name}</span>
      <span className="opacity-60 mr-[2%]">{price}</span>
      <ActionDot kind={action} />
    </div>
  );
}

function AvatarStack({ colors }: { colors: string[] }) {
  return (
    <span className="flex">
      {colors.map((c, i) => (
        <span
          key={i}
          className="w-[8%] aspect-square rounded-full border-2 border-[#F8F4F0]"
          style={{ background: c, marginLeft: i === 0 ? 0 : "-2%" }}
        />
      ))}
    </span>
  );
}

function ActionDot({ kind }: { kind: "plus" | "minus" }) {
  const bg = kind === "minus" ? "#FF4D4D" : "#D9D9D9";
  const color = kind === "minus" ? "#fff" : "#888";
  return (
    <span
      className="w-[6%] aspect-square rounded-full flex items-center justify-center text-[2.4%] font-bold"
      style={{ background: bg, color }}
    >
      {kind === "minus" ? "−" : "+"}
    </span>
  );
}

// --- Settle ---

function SettleScreen() {
  return (
    <div className="relative w-full h-full bg-[#F8F4F0] text-[#0E0E0E] font-grotesk flex flex-col">
      <StatusBar />
      <div className="flex items-center justify-between px-[5%] pt-[3%] pb-[3%]">
        <span className="font-bold text-[3.8%]">Payment Methods</span>
        <span className="bg-[#0E0E0E] text-[#FDFBF9] rounded-full px-[3.5%] py-[1.5%] text-[2.4%] font-semibold flex items-center gap-[1%]">
          <span>＋</span> Add
        </span>
      </div>

      <div className="px-[5%]">
        <div className="bg-white rounded-[3%] p-[3%] flex items-center gap-[3%] border border-black/5">
          <div className="relative w-[22%] aspect-3/2 rounded-[6%] bg-linear-to-br from-[#f4e4dc] to-[#ead2c4] flex items-end justify-end p-[4%] overflow-hidden">
            <span className="text-[70%] font-extrabold text-[#0E0E0E]">VISA</span>
            <span className="absolute top-[10%] left-[10%] w-[32%] aspect-square rounded-full bg-[#FF7C61]" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-[3.2%]">Wallet</div>
            <div className="text-[#75847D] text-[2.4%]">Balance: $85.32</div>
          </div>
          <span className="w-[16%] h-[8%] rounded-full bg-[#D9D9D9] relative">
            <span className="absolute left-[6%] top-[10%] w-[38%] aspect-square rounded-full bg-white" />
          </span>
        </div>
      </div>

      <div className="px-[5%] text-[2.8%] flex-1 overflow-hidden mt-[3%]">
        <SettleGroup title="Bank Accounts" icon="🏦">
          <SettleRow logoBg="#E31837" logo="BoA" name="Bank of America" meta="Fees apply" />
          <SettleRow logoBg="#1A4079" logo="Ch" name="Chase" meta="Fees apply" selected />
        </SettleGroup>
        <SettleGroup title="Cards" icon="💳">
          <SettleRow logoBg="#fff" logo="VISA" logoColor="#1A4079" name="Visa — 7793" meta="3% fee" />
          <SettleRow logoBg="#0066b2" logo="AmEx" name="AmEx — 8732" meta="3% fee" />
        </SettleGroup>
        <SettleGroup title="Connections" icon="🔗">
          <SettleRow logoBg="#2775CA" logo="C" name="Coinbase" meta="Fees apply" />
          <SettleRow logoBg="#253b80" logo="P" name="Paypal" meta="Fees apply" />
        </SettleGroup>
      </div>

      {/* bottom tab bar */}
      <div className="border-t border-black/10 flex items-center justify-around px-[5%] py-[2.5%]">
        <span className="w-[7%] aspect-square rounded-full bg-[#C8B9D8]" />
        <span className="text-[3.5%] opacity-60">👥</span>
        <span className="text-[3.5%] opacity-60">⬜</span>
        <span className="relative text-[3.5%]">
          🗂
          <span className="absolute -bottom-[4%] left-1/2 -translate-x-1/2 w-[20%] h-[8%] rounded-full bg-[#FF7C61]" />
        </span>
        <span className="text-[3.5%] opacity-60">⚙</span>
      </div>
    </div>
  );
}

function SettleGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-[3%]">
      <div className="flex items-center gap-[2%] text-[#75847D] font-medium">
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <div className="mt-[2%] space-y-[2.5%]">{children}</div>
    </div>
  );
}

function SettleRow({
  logo,
  logoBg,
  logoColor = "#fff",
  name,
  meta,
  selected,
}: {
  logo: string;
  logoBg: string;
  logoColor?: string;
  name: string;
  meta: string;
  selected?: boolean;
}) {
  return (
    <div className="flex items-center gap-[3%]">
      <span
        className="w-[9%] aspect-square rounded-full flex items-center justify-center font-bold text-[2%]"
        style={{ background: logoBg, color: logoColor }}
      >
        {logo}
      </span>
      <span className="flex-1 font-medium">{name}</span>
      <span className="text-[#75847D] mr-[2%]">{meta}</span>
      <span
        className="w-[6%] aspect-square rounded-full flex items-center justify-center text-[2.2%]"
        style={{
          background: selected ? "#02D57C" : "transparent",
          border: selected ? "none" : "2px solid #D9D9D9",
          color: "#fff",
        }}
      >
        {selected ? "✓" : ""}
      </span>
    </div>
  );
}

// --- Sugarfish (restaurant detail — Pro feature) ---

function SugarfishScreen() {
  return (
    <div className="relative w-full h-full bg-[#F8F4F0] font-grotesk text-[#0E0E0E] flex flex-col overflow-hidden">
      <StatusBar />

      {/* Dark map header with faint street grid */}
      <div className="absolute top-0 left-0 right-0 h-[24%] overflow-hidden bg-[#2f2f2f]">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(120,120,120,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(120,120,120,0.45) 1px, transparent 1px)",
            backgroundSize: "7% 6%",
            transform: "rotate(-8deg) scale(1.2)",
            transformOrigin: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 75%, rgba(0,0,0,0.55), transparent 60%)",
          }}
        />
        <div className="absolute top-[34%] right-[4%] bg-[#0E0E0E] text-[#FDFBF9] font-bold rounded-md px-[2.2%] py-[1%] text-[2.2%]">
          Open in Maps
        </div>
        <div className="absolute top-[34%] left-[4%] text-[#FDFBF9] text-[3%]">
          ‹
        </div>
      </div>

      {/* Circular avatar + fish glyph */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[20%] aspect-square rounded-full bg-[#FDFBF9] shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex items-center justify-center text-[6%]"
        style={{ top: "18%" }}
      >
        🐟
      </div>

      {/* Restaurant name */}
      <p
        className="absolute left-0 right-0 text-center font-medium text-[#0E0E0E] text-[3.3%] leading-none"
        style={{ top: "29%" }}
      >
        Sugarfish
      </p>

      {/* Address */}
      <p
        className="absolute left-0 right-0 text-center text-[#75847D] text-[1.5%]"
        style={{ top: "33.5%" }}
      >
        1345 2nd St., Santa Monica, CA 90401
      </p>

      {/* Stat cards */}
      <div
        className="absolute left-[4%] right-[4%] flex gap-[2%]"
        style={{ top: "38.5%" }}
      >
        {[
          { label: "Last Visit", value: "Jan 5, 2026" },
          { label: "Average Spend", value: "$144.98" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex-1 bg-[#FDFBF9] rounded-[12px] px-[4%] py-[2.5%]"
          >
            <p className="text-[#75847D] text-[1.5%] font-medium">{s.label}</p>
            <p className="text-[#012F20] text-[2.4%] font-extrabold mt-[1%]">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Most Ordered */}
      <div
        className="absolute left-[4%] right-[4%]"
        style={{ top: "49%" }}
      >
        <div className="flex items-center gap-[1.2%] text-[#75847D] text-[2%] font-medium">
          <span>🍴</span>
          <span>Most Ordered</span>
        </div>
        <div className="mt-[3%] space-y-[2%]">
          {[
            ["Grilled Salmon", "$7.00"],
            ["Maki Roll", "$7.00"],
            ["Yellowtail Sashimi", "$7.00"],
          ].map(([item, price]) => (
            <div
              key={item}
              className="flex items-center justify-between"
            >
              <span className="text-[#0E0E0E] text-[2.4%] font-medium">
                {item}
              </span>
              <span className="text-[#75847D] text-[1.6%] font-medium">
                {price}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Friends */}
      <div
        className="absolute left-[4%] right-[4%]"
        style={{ top: "67%" }}
      >
        <div className="flex items-center gap-[1.2%] text-[#75847D] text-[2%] font-medium">
          <span>◎</span>
          <span>Friends</span>
        </div>
        <div className="mt-[3%] space-y-[3%]">
          {[
            { name: "Maya Chen", meta: "Last split: 3 days ago", splits: "8" },
            { name: "Sam Chisick", meta: "Last split: Feb 19", splits: "24" },
          ].map((f) => (
            <div
              key={f.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-[2%]">
                <span className="w-[9%] aspect-square rounded-full bg-[#d9d4cc]" />
                <div className="flex flex-col">
                  <span className="text-[#0E0E0E] text-[2.4%] font-medium leading-none">
                    {f.name}
                  </span>
                  <span className="text-[#75847D] text-[1.5%] mt-[4%] leading-none">
                    {f.meta}
                  </span>
                </div>
              </div>
              <span className="bg-[#FDFBF9] rounded-full px-[3%] py-[1%] text-[#0E0E0E] text-[1.6%] font-medium">
                {f.splits} Splits
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reserve Table button */}
      <div
        className="absolute left-[4%] right-[4%] rounded-full flex items-center justify-center py-[3.5%] border-[3px] border-white/15 shadow-[0_20px_30px_-15px_rgba(0,0,0,0.45)]"
        style={{
          top: "90%",
          background: "linear-gradient(to top, #0E0E0E, #2c2c2c)",
        }}
      >
        <span className="text-[#FDFBF9] font-bold text-[2.2%]">
          Reserve Table
        </span>
      </div>
    </div>
  );
}
