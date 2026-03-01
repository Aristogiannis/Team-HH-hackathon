export interface TaskDoc {
  id: string;
  title: string;
  keywords: string[];
  category: string;
  content: string;
}

export const tasks: TaskDoc[] = [
  // ── Engine / Under the Hood ──────────────────────────────────────
  {
    id: "check-engine-oil",
    title: "Check and Top Up Engine Oil",
    keywords: [
      "oil",
      "dipstick",
      "engine oil",
      "oil level",
      "top up oil",
      "low oil",
      "oil cap",
      "M111",
      "111.946",
    ],
    category: "engine",
    content: `## Check and Top Up Engine Oil — Mercedes SLK 200 (R170)

**Engine:** M111.946 — 2.0L Inline-4, 16-valve, naturally aspirated.

**Oil specification:** Mercedes-Benz spec 229.1 or 229.3. Recommended viscosity is 5W-40 or 0W-40 fully synthetic. Total oil capacity with filter is approximately 5.5 litres.

### Steps

1. Park the car on a level surface and turn off the engine. Wait at least 5 minutes for the oil to settle back into the sump.
2. Open the bonnet — the release lever is on the left side of the footwell, near the door. Pull it, then lift the bonnet and secure it with the prop rod.
3. Locate the dipstick — it's on the left side of the engine (passenger side in LHD cars), with a yellow loop handle. It sits between the intake manifold and the engine block.
4. Pull the dipstick out and wipe it clean with a lint-free cloth.
5. Re-insert the dipstick fully, then pull it out again and hold it horizontally.
6. Read the oil level — the oil film should sit between the MIN and MAX markings. The gap between MIN and MAX represents roughly 1.5 litres.
7. If the level is near or below MIN, remove the oil filler cap on top of the engine (marked with an oil can symbol), and add oil in 250ml increments. Wait a minute between additions, then re-check.
8. Do not overfill beyond the MAX mark — overfilling can damage seals and the catalytic converter.
9. Replace the dipstick and oil filler cap, close the bonnet, and you're done.

**Tip:** The M111 engine is known to consume a small amount of oil — up to 0.5L per 1000 km is considered normal by Mercedes.`,
  },
  {
    id: "change-engine-oil-filter",
    title: "Change Engine Oil and Oil Filter",
    keywords: [
      "oil change",
      "oil filter",
      "drain plug",
      "sump",
      "oil service",
      "engine service",
      "oil drain",
      "fresh oil",
    ],
    category: "engine",
    content: `## Change Engine Oil and Oil Filter — Mercedes SLK 200 (R170)

**You will need:** 5.5L of 5W-40 or 0W-40 fully synthetic oil (MB 229.1/229.3 spec), a new oil filter (Mann W712/22 or equivalent), a new drain plug crush washer (14mm copper), a 13mm socket for the drain plug, an oil filter wrench, a drain pan, and jack stands or ramps.

### Steps

1. Warm the engine to operating temperature — a short 5 minute drive is enough. Warm oil flows out faster and carries more contaminants.
2. Lift the car on ramps or jack stands. Make sure it is level and secure.
3. Place the drain pan under the sump. The drain plug is at the very bottom rear of the oil sump, facing downward.
4. Using the 13mm socket, loosen the drain plug anti-clockwise. Remove it by hand for the last few turns — be ready for hot oil.
5. Let the oil drain fully — this takes about 10 minutes.
6. While it drains, locate the oil filter on the left side of the engine block, near the exhaust manifold. Use the filter wrench to unscrew it anti-clockwise.
7. Before fitting the new filter, lightly coat the rubber gasket ring with fresh oil using your finger. This ensures a proper seal.
8. Hand-tighten the new filter — turn it until the gasket contacts the block, then tighten another three-quarter turn by hand. Do not use the wrench to tighten.
9. Replace the drain plug with a new crush washer and tighten to 25 Nm (about 18 lb-ft). Do not over-tighten.
10. Lower the car, then add approximately 5 litres of fresh oil through the filler cap on top of the engine.
11. Start the engine and let it idle for 30 seconds — the oil pressure warning light should go out within a few seconds.
12. Turn the engine off, wait 2 minutes, then check the level with the dipstick. Top up to the MAX mark if needed.
13. Reset the service indicator if applicable — on the R170, hold the trip reset button while turning the ignition to position 2.

**Drain interval:** Every 10,000 km or once a year, whichever comes first.`,
  },
  {
    id: "check-coolant-level",
    title: "Check and Top Up Coolant",
    keywords: [
      "coolant",
      "antifreeze",
      "coolant level",
      "expansion tank",
      "coolant reservoir",
      "overheating",
      "water",
      "temperature",
      "radiator",
    ],
    category: "engine",
    content: `## Check and Top Up Coolant — Mercedes SLK 200 (R170)

**Coolant spec:** Mercedes-Benz genuine anticorrosion/antifreeze agent (blue), mixed 50/50 with distilled water. Total cooling system capacity is approximately 7.5 litres.

### Steps

1. **IMPORTANT:** Only check coolant when the engine is COLD. The system is pressurised when hot and opening the cap can cause serious burns.
2. Open the bonnet.
3. Locate the coolant expansion tank — it's a translucent plastic reservoir on the right side of the engine bay (driver side on LHD), near the firewall. It has a blue cap.
4. Check the level visually through the side of the tank — the coolant should be between the MIN and MAX marks.
5. If the level is low, carefully unscrew the blue cap (anti-clockwise).
6. Add a 50/50 mix of Mercedes-approved antifreeze and distilled water. Never use plain tap water — mineral deposits will clog the system.
7. Fill to the MAX mark, but no higher. Replace the cap and hand-tighten firmly.
8. If you're regularly losing coolant, check for leaks. Common spots on the R170 are the water pump (front of engine), thermostat housing, and the radiator end tanks.

**Warning:** If coolant is found in the engine oil (milky residue on the oil filler cap or dipstick), this indicates a head gasket failure and the car should not be driven.`,
  },
  {
    id: "check-brake-fluid",
    title: "Check Brake Fluid Level",
    keywords: [
      "brake fluid",
      "brake",
      "DOT 4",
      "brake reservoir",
      "brakes",
      "brake warning",
      "brake level",
    ],
    category: "engine",
    content: `## Check Brake Fluid Level — Mercedes SLK 200 (R170)

**Brake fluid spec:** DOT 4 Plus (Mercedes-Benz spec 331.0). Brake fluid is hygroscopic — it absorbs moisture over time, which lowers its boiling point.

### Steps

1. Open the bonnet.
2. Locate the brake fluid reservoir — it's at the rear of the engine bay, directly in front of the windscreen, slightly to the left. It has a black cap and is connected to the brake master cylinder.
3. The reservoir is translucent, so you can read the level without opening it. The fluid should be between MIN and MAX.
4. If it's low, clean the area around the cap before opening to prevent dirt contamination — this is critical because brake systems are extremely sensitive to debris.
5. Unscrew the cap and top up with fresh DOT 4 Plus fluid to the MAX line.
6. If the fluid looks very dark or murky, it's time for a full brake fluid flush (recommended every 2 years regardless of mileage).
7. Replace the cap firmly.

**Note:** A slowly dropping brake fluid level is normal as brake pads wear — it simply means there's more space in the caliper pistons. A sudden drop, however, indicates a leak and is dangerous. Do not drive if you suspect a brake fluid leak.`,
  },
  {
    id: "check-top-up-washer-fluid",
    title: "Top Up Windscreen Washer Fluid",
    keywords: [
      "washer fluid",
      "windscreen",
      "wiper fluid",
      "washer reservoir",
      "screen wash",
      "wiper",
    ],
    category: "engine",
    content: `## Top Up Windscreen Washer Fluid — Mercedes SLK 200 (R170)

### Steps

1. Open the bonnet.
2. Locate the washer fluid reservoir — it's on the right side of the engine bay. The cap has a windscreen wiper symbol on it and is usually blue or black.
3. Pull off or unscrew the cap.
4. Fill with a mixture of screen wash concentrate and water according to the product instructions. In winter, use a higher concentration of screen wash for frost protection.
5. The reservoir holds approximately 4 litres.
6. Replace the cap.
7. Test the washers from the driver's seat — the SLK R170 has a single washer jet setup for the front windscreen.

**Tip:** Never use plain water alone — it doesn't clean effectively, can freeze in winter, and allows algae growth inside the reservoir.`,
  },
  {
    id: "replace-air-filter",
    title: "Replace Engine Air Filter",
    keywords: [
      "air filter",
      "engine air filter",
      "air box",
      "airbox",
      "intake",
      "filter change",
      "air cleaner",
    ],
    category: "engine",
    content: `## Replace Engine Air Filter — Mercedes SLK 200 (R170)

**Filter type:** Panel filter — common part numbers include Mann C25114 or equivalent.

### Steps

1. Open the bonnet.
2. Locate the air filter box — it's a large black plastic housing on the left side of the engine bay, connected to the intake duct.
3. Unclip the metal spring clips on the sides of the air box lid (usually 4 clips). Some models also have a Torx screw — use a T25 bit if present.
4. Carefully lift the lid and note the orientation of the old filter.
5. Remove the old filter. Inspect the inside of the air box — if there's dirt, dust, or debris, wipe it out with a damp cloth and let it dry.
6. Drop the new filter in, making sure it seats flat and the rubber seal edges sit correctly in the grooves.
7. Replace the lid and re-secure all clips until they click.
8. Make sure the intake duct is properly reconnected.

**Replacement interval:** Every 20,000 km or every 2 years. In dusty conditions, check it more frequently.

**Why it matters:** A clogged air filter restricts airflow to the M111 engine, reducing power and increasing fuel consumption. On the SLK 200's naturally aspirated 2.0L, you'll feel even a modest restriction.`,
  },
  {
    id: "replace-spark-plugs",
    title: "Replace Spark Plugs",
    keywords: [
      "spark plugs",
      "spark plug",
      "ignition",
      "misfire",
      "plugs",
      "rough idle",
      "engine misfire",
      "tune up",
    ],
    category: "engine",
    content: `## Replace Spark Plugs — Mercedes SLK 200 (R170)

**Engine:** M111.946 — 4 cylinders, 16 valves, 4 spark plugs.
**Spark plug spec:** Bosch FR8DC+ or equivalent. Gap: 0.8mm. Socket size: 16mm (5/8 inch).

### Steps

1. Let the engine cool completely — changing plugs on a hot aluminium head risks damaging the threads.
2. Open the bonnet and identify the spark plug area — on the M111, the plugs sit under the plastic engine cover. Remove the cover by pulling upward on the clips or unscrewing the bolts (varies by year).
3. You will see 4 ignition coil packs sitting on top of the cylinder head in a row.
4. Disconnect the electrical connector from the first coil pack — press the tab and pull.
5. Remove the coil pack bolt (usually 8mm or 10mm) and pull the coil pack straight up and out of the well.
6. Use a 16mm spark plug socket with a rubber insert (to grip the plug) and a ratchet with an extension to reach into the well.
7. Unscrew the old plug anti-clockwise. If it's very tight, apply a small amount of penetrating oil and wait 5 minutes.
8. Check the new plug's gap with a feeler gauge — it should be 0.8mm.
9. Hand-thread the new plug clockwise into the hole to avoid cross-threading. Only use the ratchet for the final tightening — torque to 25 Nm.
10. Reinstall the coil pack and its bolt, reconnect the electrical connector.
11. Repeat for all 4 cylinders.
12. Replace the engine cover, start the engine, and verify smooth idle.

**Replacement interval:** Every 30,000 km or every 3 years.`,
  },
  {
    id: "serpentine-belt-inspection",
    title: "Inspect and Replace Serpentine Belt",
    keywords: [
      "serpentine belt",
      "drive belt",
      "belt",
      "accessory belt",
      "belt squeal",
      "squeaking",
      "belt tensioner",
      "alternator belt",
    ],
    category: "engine",
    content: `## Inspect and Replace Serpentine Belt — Mercedes SLK 200 (R170)

**Belt type:** Single serpentine belt driving the alternator, power steering pump, water pump, and A/C compressor.

### Inspection

1. Open the bonnet and look at the front of the engine.
2. The serpentine belt is the long ribbed rubber belt running around the pulleys at the front of the engine block.
3. Visually inspect the belt for cracks, fraying, glazing (shiny smooth surface), or missing ribs.
4. Press the belt between two pulleys with your thumb — there should be no more than about 10mm of deflection.
5. Listen for squealing on cold start — this usually indicates the belt is worn or the tensioner is weak.

### Replacement

1. Locate the automatic belt tensioner — it's spring-loaded. Use a 17mm socket on the tensioner bolt.
2. Rotate the tensioner clockwise to release tension on the belt.
3. Slip the old belt off the pulleys. Before you do, take a photo of the routing or refer to the belt routing diagram on the underside of the bonnet or the fan shroud.
4. Route the new belt around all pulleys EXCEPT the tensioner.
5. Rotate the tensioner again and slip the belt onto the tensioner pulley last.
6. Release the tensioner slowly and verify the belt is seated in every pulley groove.
7. Start the engine and watch the belt for 30 seconds to confirm proper tracking.

**Replacement interval:** Every 60,000 km or every 4 years, or immediately if cracking or fraying is visible.`,
  },

  // ── Dashboard / Warning Lights ──────────────────────────────────
  {
    id: "dashboard-warning-lights",
    title: "Dashboard Warning Lights Explained",
    keywords: [
      "warning light",
      "dashboard light",
      "check engine",
      "engine light",
      "oil light",
      "battery light",
      "ABS light",
      "SRS",
      "airbag light",
      "temperature light",
      "coolant warning",
      "indicator",
      "warning",
      "dashboard",
      "instrument cluster",
    ],
    category: "dashboard",
    content: `## Dashboard Warning Lights — Mercedes SLK 200 (R170)

### Red Lights (Stop Driving / Immediate Attention)

- **Oil Pressure (oil can symbol):** Engine oil pressure is critically low. Stop immediately and turn off the engine. Check oil level. Do NOT continue driving — you will destroy the engine.
- **Coolant Temperature (thermometer in liquid):** Engine is overheating. Pull over safely, turn off the engine, and let it cool. Check coolant level when cold. Possible causes: low coolant, failed thermostat, water pump failure, blocked radiator.
- **Brake Warning (exclamation mark in circle):** Either the handbrake is on, or brake fluid is critically low, or there's a brake system fault. If the handbrake is released and this light is on, check brake fluid immediately. Do not drive if the pedal feels soft.
- **Battery / Charging (battery symbol):** The alternator is not charging the battery. The car will run on battery power only for a limited time. Drive to a safe location. Common cause on R170: worn serpentine belt or failed alternator.
- **SRS / Airbag (seated figure with circle):** Airbag system fault. Airbags may not deploy in a crash. Get this diagnosed — common R170 cause is the clockspring in the steering column or seat belt pre-tensioner connectors.

### Yellow / Amber Lights (Caution — Service Soon)

- **Check Engine / MIL (engine outline):** The engine management system has detected a fault. The car is usually safe to drive but should be scanned with a diagnostic tool. Common M111 causes: oxygen sensor, mass airflow sensor, ignition coils.
- **ABS (ABS in circle):** Anti-lock braking system fault. Normal brakes still work, but ABS will not intervene. Common cause: wheel speed sensor failure — the R170 is known for this, especially at the rear.
- **ESP / BAS (triangle with skid marks):** Electronic stability or brake assist fault. Often triggered alongside ABS. Same sensor issues usually.
- **Low Fuel (fuel pump symbol):** Approximately 8 litres remaining in the 53 litre tank. Range of roughly 70–90 km depending on driving.

### Green / Blue Lights (Information Only)

- **Turn signals (green arrows):** Indicator active. If flashing rapidly, one of the bulbs has blown.
- **High beam (blue headlight symbol):** High beams are on. Remember to dip for oncoming traffic.
- **Cruise control (speedometer with arrow):** Cruise control is active.`,
  },
  {
    id: "reset-service-indicator",
    title: "Reset Service Indicator",
    keywords: [
      "service indicator",
      "service reset",
      "maintenance light",
      "service due",
      "reset",
      "service interval",
      "assyst",
      "FSS",
    ],
    category: "dashboard",
    content: `## Reset Service Indicator — Mercedes SLK 200 (R170)

The R170 SLK uses the Flexible Service System (FSS). After performing a service, you need to manually reset the counter.

### Steps

1. Sit in the driver's seat and close the door.
2. Insert the key into the ignition but do NOT turn it yet.
3. Press and HOLD the trip odometer reset button on the instrument cluster (the small button near the odometer display).
4. While holding the button, turn the ignition key to position 2 (all lights on, engine off).
5. Continue holding the button for about 10 seconds until the display shows the service indicator and then resets (you may see a countdown or the wrench symbol flash).
6. Release the button.
7. Turn the ignition off and remove the key.
8. Start the engine to verify — the service indicator should no longer be displayed.

**Note:** If this doesn't work, some R170 model years require you to simultaneously hold the trip reset button and turn the ignition. The exact procedure can vary slightly between pre-facelift (1996–2000) and facelift (2000–2004) models.`,
  },

  // ── Tyres & Brakes ──────────────────────────────────────────────
  {
    id: "check-tyre-pressure",
    title: "Check and Adjust Tyre Pressure",
    keywords: [
      "tyre pressure",
      "tire pressure",
      "tyres",
      "tires",
      "inflate",
      "flat tyre",
      "pressure",
      "PSI",
      "bar",
      "205/60 R15",
    ],
    category: "tyres",
    content: `## Check and Adjust Tyre Pressure — Mercedes SLK 200 (R170)

**Tyre size (all four wheels):** 205/60 R15 (standard fitment).
**Recommended pressure:** Approximately 2.2 bar (32 PSI) front, 2.4 bar (35 PSI) rear for normal load. Check the sticker on the driver's door jamb or fuel filler flap for your exact model year's specification.

### Steps

1. Check tyre pressure when the tyres are COLD — after the car has been parked for at least 2 hours or driven less than 3 km. Hot tyres read higher than actual.
2. Remove the valve cap from the tyre valve stem.
3. Press the pressure gauge firmly onto the valve. Read the pressure.
4. If the pressure is too low, attach the air hose and inflate in short bursts. Recheck between bursts.
5. If the pressure is too high, press the small pin in the centre of the valve to release air in short bursts.
6. Replace the valve cap (finger tight is fine — the cap is just to keep dirt out, the valve itself seals the air).
7. Repeat for all four tyres and the spare (if equipped).

**How often:** Check tyre pressure at least once a month and before any long journey.

**Spare tyre:** The R170 has very limited boot space (145 litres). Some models came with a space-saver spare under the boot floor, others with a tyre repair kit only. Check which one you have.`,
  },
  {
    id: "change-flat-tyre",
    title: "Change a Flat Tyre",
    keywords: [
      "flat tyre",
      "flat tire",
      "change tyre",
      "change tire",
      "spare wheel",
      "jack",
      "wheel nuts",
      "puncture",
      "roadside",
      "lug nuts",
    ],
    category: "tyres",
    content: `## Change a Flat Tyre — Mercedes SLK 200 (R170)

**Wheel nut size:** 17mm. **Torque spec:** 110 Nm. The SLK R170 may use lug bolts (not nuts) depending on the wheels fitted.

### Steps

1. Pull over to a safe, flat, hard surface. Turn on your hazard lights.
2. Apply the handbrake firmly and leave the car in 1st gear (manual).
3. Locate the jack and wheel brace — in the R170, they are stored in the boot, usually in a compartment under or beside the boot floor.
4. Loosen (but do NOT remove) each wheel bolt by half a turn using the wheel brace. Turn anti-clockwise. If they're very tight, you can stand on the brace carefully for extra leverage.
5. Position the jack under the reinforced jacking point on the sill — there are small triangular marks or notches on the sill that indicate the correct position. On the front, it's just behind the front wheel arch. On the rear, it's just in front of the rear wheel arch.
6. Raise the car until the flat tyre is about 2-3 cm off the ground.
7. Fully remove the wheel bolts and pull the wheel off.
8. Mount the spare wheel, aligning the bolt holes. Insert the bolts by hand and tighten them in a star pattern (opposite corners) — finger tight first.
9. Lower the jack until the tyre touches the ground but the car's full weight isn't on it yet.
10. Tighten all bolts firmly with the wheel brace in a star pattern.
11. Lower the car fully and remove the jack.
12. Final-tighten all bolts. Ideally torque to 110 Nm with a torque wrench at the earliest opportunity.
13. Stow the flat tyre and tools. If using a space-saver spare, do not exceed 80 km/h and drive to a tyre shop as soon as possible.

**Important:** The R170 is a small, lightweight car (1170 kg). Make sure the jack is on solid ground — soft earth or gravel is dangerous.`,
  },
  {
    id: "inspect-brake-pads-discs",
    title: "Inspect Brake Pads and Discs",
    keywords: [
      "brake pads",
      "brake discs",
      "brake rotors",
      "brake inspection",
      "worn brakes",
      "brake check",
      "grinding",
      "squealing brakes",
      "disc thickness",
    ],
    category: "brakes",
    content: `## Inspect Brake Pads and Discs — Mercedes SLK 200 (R170)

**Front brakes:** Ventilated discs, 288mm diameter. **Rear brakes:** Solid discs, 278mm diameter.

### Visual Inspection (Without Removing Wheels)

1. Turn the steering wheel to full lock to get a better view of the front brakes through the wheel spokes.
2. Look through the wheel at the brake caliper — you can usually see the outer brake pad pressing against the disc.
3. Estimate the pad thickness — new pads are typically 10-12mm of friction material. If the pad is 3mm or less, it needs replacement.
4. Look at the disc surface — it should be smooth and even. Light grooves are normal, but deep scoring, visible ridges at the edge, or blue heat marks indicate the disc may need replacing.

### Measuring (Wheels Removed)

1. Remove the wheel (see the flat tyre change guide).
2. Use a vernier caliper to measure the disc thickness at several points.
3. Front discs: minimum thickness is typically 25.4mm (from a new thickness of ~28mm). Rear discs: minimum is about 9mm (from ~11mm new).
4. If the disc is at or below minimum, replace it.
5. Check pad thickness — minimum is 2mm of friction material. If close, replace both pads on that axle (always replace pads in pairs — both sides of the same axle).

**Warning signs while driving:** Squealing or grinding noise when braking, pulsating brake pedal (warped disc), car pulling to one side under braking (uneven pad wear or seized caliper).

**Replacement interval:** Pads typically last 30,000–50,000 km depending on driving style. Discs last 60,000–80,000 km.`,
  },

  // ── Exterior / Lighting ─────────────────────────────────────────
  {
    id: "replace-headlight-bulb",
    title: "Replace Headlight Bulb",
    keywords: [
      "headlight",
      "headlamp",
      "bulb",
      "H7",
      "H1",
      "low beam",
      "high beam",
      "light bulb",
      "headlight replacement",
      "blown bulb",
    ],
    category: "exterior",
    content: `## Replace Headlight Bulb — Mercedes SLK 200 (R170)

**Bulb types:** Low beam: H7 (55W). High beam: H1 (55W). Side/parking light: W5W.

### Steps — Low Beam (H7)

1. Open the bonnet.
2. Locate the back of the headlight assembly. The low beam bulb holder is the largest one, typically in the centre or lower portion of the headlight unit.
3. Disconnect the electrical connector from the bulb holder by pressing the release tab and pulling.
4. Remove the rubber dust cap by pulling it off (it stretches over the bulb housing).
5. You'll see a wire retaining clip holding the bulb. Press the clip inward and swing it away.
6. Carefully pull the old bulb straight out.
7. Insert the new H7 bulb — DO NOT touch the glass with your fingers. Oils from your skin create hot spots that shorten the bulb's life dramatically. Handle it by the base or use a clean cloth.
8. Secure the wire retaining clip back into place.
9. Replace the rubber dust cap.
10. Reconnect the electrical connector.
11. Test the light before closing the bonnet.

**Tip:** If access is tight (especially on the left headlight where it's near the battery), you may find it easier to remove the air intake duct temporarily for more room.

**If both headlights are dim:** Check the condition of the headlight lenses — the R170's plastic headlight lenses are known to yellow and haze with age, reducing light output significantly. Polishing kits can restore them.`,
  },
  {
    id: "replace-tail-light-bulb",
    title: "Replace Tail Light or Brake Light Bulb",
    keywords: [
      "tail light",
      "brake light",
      "rear light",
      "indicator bulb",
      "turn signal",
      "rear bulb",
      "P21W",
      "P21/5W",
    ],
    category: "exterior",
    content: `## Replace Tail Light / Brake Light Bulb — Mercedes SLK 200 (R170)

**Common bulbs:** Brake light: P21W (single filament). Tail + brake combined: P21/5W (dual filament). Indicator: PY21W (amber). Reverse: P21W.

### Steps

1. Open the boot.
2. Locate the tail light access panel on the inside of the boot, behind the affected light cluster. On the R170, you may need to pull back a section of the boot lining or remove a plastic cover held by clips or a thumbscrew.
3. You'll see the back of the bulb holders — they twist to lock.
4. Turn the relevant bulb holder anti-clockwise (about a quarter turn) and pull it out of the housing.
5. Push the old bulb in slightly and turn anti-clockwise to release it from the bayonet fitting. Pull it out.
6. Insert the new bulb — push in and turn clockwise until it clicks into the bayonet socket.
7. Reinsert the holder into the light cluster and turn clockwise to lock.
8. Test the light — have someone press the brake pedal or activate the indicator while you watch, or use a wall reflection.
9. Replace the boot lining or cover panel.

**Note:** If a single indicator bulb blows, the dashboard indicator will flash rapidly (double speed). This is normal and is your alert that a bulb has failed.`,
  },

  // ── SLK-Specific Features ───────────────────────────────────────
  {
    id: "operate-vario-roof",
    title: "Operate the Retractable Vario Roof",
    keywords: [
      "vario roof",
      "retractable roof",
      "hardtop",
      "convertible",
      "roof open",
      "roof close",
      "roof won't open",
      "roof stuck",
      "roof mechanism",
      "cabriolet",
      "top down",
    ],
    category: "slk-specific",
    content: `## Operate the Retractable Vario Roof — Mercedes SLK 200 (R170)

The SLK R170 was the first production car with an automatic folding metal hardtop (the "Vario Roof"). The entire operation takes about 25 seconds.

### Prerequisites

- The car must be STATIONARY (the system will not operate above walking speed).
- The handbrake should be engaged.
- The engine must be running (the hydraulic pump needs electrical power).
- The boot must be empty enough for the roof to fold in — there is a mechanical bar/partition in the boot that must be in the correct position (upright when the roof is down, folded flat when the roof is up).

### Opening the Roof (Top Down)

1. Make sure the windows are fully closed (they will auto-drop slightly during the operation).
2. Unlock the roof latch — press and hold the roof switch on the centre console (it has a symbol of a car with an arrow). On pre-facelift models, you may need to first turn a manual latch at the top of the windscreen frame.
3. Continue holding the switch until the roof has fully folded into the boot and the boot lid has closed.
4. Do not release the switch until the operation is completely finished — releasing mid-cycle will stop the roof.

### Closing the Roof (Top Up)

1. Press and hold the same roof switch in the opposite direction.
2. The boot lid opens, the roof unfolds and swings forward, and the boot lid closes.
3. Hold until fully latched.

### Common Issues

- **Roof stops mid-cycle:** Usually a hydraulic issue — low fluid, a failing hydraulic pump, or a microswitch out of alignment. Check the hydraulic fluid reservoir (located behind the left rear trim panel, near the boot hinge area). Use Pentosin CHF 11S fluid.
- **Boot lid won't open:** The boot partition/divider bar may be in the wrong position, or the boot lock microswitch has failed.
- **Slow operation:** In cold weather, the hydraulic oil is thicker and the roof moves more slowly. This is normal. If it's very slow in warm weather, the hydraulic pump may be weak.
- **Water leaks with roof closed:** Check the rubber seals along the header rail (top of windscreen) and the side channels. Clean and treat with silicone-based rubber conditioner.

**Maintenance tip:** Exercise the roof at least once a month, even in winter. This keeps the seals supple and the hydraulic system in good condition.`,
  },
  {
    id: "slk-fuse-box-locations",
    title: "Fuse Box Locations and Common Fuses",
    keywords: [
      "fuse",
      "fuse box",
      "blown fuse",
      "electrical",
      "fuse location",
      "relay",
      "fuse panel",
      "no power",
    ],
    category: "slk-specific",
    content: `## Fuse Box Locations — Mercedes SLK 200 (R170)

The R170 has two main fuse boxes.

### 1. Interior Fuse Box (Main)

**Location:** On the left side of the dashboard, behind a removable panel near the driver's left knee. Pull the panel down or pry it off gently — it's held by clips.

This box contains most of the fuses for comfort, lighting, and accessory circuits.

**Common fuses to know:**
- Cigarette lighter / 12V socket: 15A
- Radio / head unit: 10A
- Interior lights: 5A
- Power windows: 20A
- Roof mechanism: 25A (critical — if the vario roof won't operate, check this first)
- Central locking: 15A

### 2. Engine Bay Fuse Box

**Location:** On the left side of the engine bay, near the battery. It has a black plastic cover that clips on.

This box contains higher-amperage fuses and relays for engine systems.

**Common fuses to know:**
- Fuel pump relay and fuse: 15A
- Engine management (ECU): 10A
- Horn: 15A
- Headlights (left/right): 10A each
- ABS module: 30A
- Starter relay
- Alternator main fuse: 80A (fusible link)

### How to Check and Replace a Fuse

1. Turn the ignition off.
2. Locate the fuse using the diagram on the inside of the fuse box cover (or the owner's manual).
3. Pull the fuse straight out — there's usually a plastic fuse puller tool clipped inside the fuse box cover.
4. Hold the fuse up to the light — if the thin wire inside is broken, the fuse is blown.
5. Replace with a fuse of the SAME amperage rating. Never uprate a fuse — the wiring behind it is only rated for the original amperage and could catch fire.
6. If the new fuse blows immediately, there is a short circuit in that circuit. Do not keep replacing fuses — have the wiring inspected.`,
  },
  {
    id: "slk-vehicle-specs",
    title: "SLK 200 Vehicle Specifications and Overview",
    keywords: [
      "specs",
      "specifications",
      "SLK 200",
      "R170",
      "engine specs",
      "horsepower",
      "torque",
      "weight",
      "dimensions",
      "fuel tank",
      "top speed",
      "0-100",
      "what car is this",
      "tell me about this car",
    ],
    category: "slk-specific",
    content: `## Mercedes-Benz SLK 200 (R170) — Full Specifications

### Overview
The Mercedes-Benz SLK (R170) was produced from 1996 to 2004. The "SLK" stands for "Sportlich, Leicht, Kurz" — Sporty, Light, Short. It was the first production car to feature an electrically operated retractable hardtop (Vario Roof).

### Engine
- **Type:** M111.946 — Inline 4-cylinder, 16 valves, naturally aspirated
- **Displacement:** 1,998 cc (2.0 litres)
- **Bore × Stroke:** 89.9 × 78.7 mm
- **Compression ratio:** 10.4:1
- **Fuel system:** MPI — Bosch HFM (1996–1998) / Bosch ME (1998–2000)
- **Power:** 136 PS (134 HP / 100 kW) at 5,500 rpm
- **Torque:** 190 Nm (140 lb-ft) at 3,700 rpm
- **Fuel type:** Petrol (Premium unleaded recommended, 95+ RON)

### Transmission
- **Gearbox:** 5-speed manual
- **Drive:** Rear-wheel drive (RWD)

### Performance
- **0–100 km/h:** 9.7 seconds
- **Top speed:** 208 km/h (129 mph)

### Fuel Economy (NEDC)
- **City:** 12.9 L/100 km (18 MPG US)
- **Highway:** 6.9 L/100 km (34 MPG US)
- **Combined:** 9.1 L/100 km (26 MPG US)
- **CO₂ emissions:** 217 g/km
- **Fuel tank capacity:** 53 litres (14 US gallons)
- **Estimated range:** ~582 km (362 miles)

### Dimensions
- **Length:** 4,000 mm
- **Width:** 1,720 mm
- **Height:** 1,280 mm
- **Wheelbase:** 2,400 mm

### Weight
- **Kerb weight:** 1,170 kg (2,579 lbs)
- **Power-to-weight ratio:** 8.6 kg/hp

### Brakes
- **Front:** Ventilated discs — 288 mm diameter
- **Rear:** Solid discs — 278 mm diameter

### Tyres
- **Front and rear:** 205/60 R15

### Suspension
- **Front:** Independent double wishbones, coil springs, anti-roll bar
- **Rear:** Multi-link, coil springs, anti-roll bar

### Interior
- **Seats:** 2
- **Boot capacity:** 145 litres (with roof up — significantly less with roof down)`,
  },
  {
    id: "check-battery-jump-start",
    title: "Check Car Battery and Jump Start",
    keywords: [
      "battery",
      "dead battery",
      "jump start",
      "won't start",
      "no crank",
      "battery dead",
      "jumper cables",
      "boost",
      "flat battery",
      "battery voltage",
    ],
    category: "electrical",
    content: `## Check Battery and Jump Start — Mercedes SLK 200 (R170)

**Battery location:** Under the bonnet, on the right side of the engine bay (driver's side on LHD). It's a standard 12V lead-acid battery. Common size is Group 48 / H6 (also called DIN Type 075).

**Battery specification:** 12V, typically 70Ah, 570–640 CCA (cold cranking amps).

### Checking the Battery

1. Open the bonnet.
2. Visually inspect the battery — look for corrosion (white/green powder) around the terminals, cracked casing, or bulging sides.
3. If you have a multimeter, set it to DC voltage and touch the probes to the battery terminals — red to positive (+), black to negative (-).
4. A healthy battery reads 12.6V or higher when the engine is off. 12.4V means about 75% charge. Below 12.2V, the battery is significantly discharged.
5. With the engine running, you should see 13.8–14.4V — this confirms the alternator is charging.

### Jump Starting

1. Position the donor car close enough for the jumper cables to reach, but the cars must NOT touch each other.
2. Turn off the ignition and all electrical consumers (lights, radio, A/C) in both cars.
3. Connect the RED cable to the POSITIVE (+) terminal of the dead battery.
4. Connect the other end of the RED cable to the POSITIVE (+) terminal of the donor battery.
5. Connect the BLACK cable to the NEGATIVE (-) terminal of the donor battery.
6. Connect the other end of the BLACK cable to an unpainted metal surface on the SLK's engine block — NOT to the dead battery's negative terminal. This grounds the circuit and avoids sparking near the battery (which can release hydrogen gas).
7. Start the donor car and let it idle for 2-3 minutes.
8. Try to start the SLK. If it doesn't crank, wait another few minutes.
9. Once the SLK starts, remove cables in REVERSE order: black from SLK engine, black from donor, red from donor, red from SLK.
10. Drive the SLK for at least 20-30 minutes to let the alternator recharge the battery.

**If the battery keeps dying:** The battery may be end-of-life (typical lifespan is 4–6 years), or there may be a parasitic drain. Common R170 parasitic drain sources include the CD changer, aftermarket stereos, and the vario roof module.`,
  },
];
