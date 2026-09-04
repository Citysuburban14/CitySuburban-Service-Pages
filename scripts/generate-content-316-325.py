import json
import re
from pathlib import Path

import openpyxl


ROOT = Path(__file__).resolve().parents[1]
SOURCE_WORKBOOK = Path(r"C:\Users\muthu\Downloads\HVAC_Keyword_Clusters.xlsx")
BASE_CONTENT = ROOT / "data" / "source-content-306-315.json"
OUTPUT_CONTENT = ROOT / "data" / "source-content-316-325.json"
OUTPUT_REVIEWS = ROOT / "data" / "review-context-316-325.json"

ICONS = [
    '<rect x="10" y="10" width="28" height="28" rx="5"/><path class="ln" d="M17 18h14M17 24h14M17 30h10"/>',
    '<circle cx="24" cy="24" r="14"/><path class="ln" d="M24 10v28M10 24h28"/>',
    '<path class="ln" d="M9 35V15h30v20M15 35V22h18v13M7 39h34"/>',
    '<path class="ln" d="M12 12h24v24H12zM17 17l14 14M31 17L17 31"/>',
    '<path class="ln" d="M8 30c7-15 25-15 32 0M13 30v8h22v-8M20 17v-6h8v6"/>',
    '<path class="ln" d="M9 24h9l5-10 7 20 5-10h5M12 39h24"/>',
]


def parts(items):
    return "||".join("::".join(str(value) for value in item) for item in items)


def normalized_text(value):
    return re.sub(r"\s+", " ", str(value or "")).strip().lower()


def rows_as_dicts(sheet, header_row):
    headers = [str(cell.value or "").strip() for cell in sheet[header_row]]
    records = []
    for values in sheet.iter_rows(min_row=header_row + 1, values_only=True):
        if not any(value is not None for value in values):
            continue
        records.append({headers[i]: value for i, value in enumerate(values) if i < len(headers) and headers[i]})
    return records


P = {
    316: dict(
        slug="ceiling-fan-installation-repair", name="Ceiling Fan Installation & Repair", parent="Indoor Air Quality & Ventilation",
        h1="Ceiling Fan Installation and Repair", cta="Confirm Electrical Scope",
        lede="A ceiling fan complaint can be a failed control, loose mounting, worn motor, unbalanced blades, or a branch-circuit problem. Chicago search demand is real, but this is electrical-trade work rather than verified HVAC scope for City & Suburban. This draft explains the diagnostic and installation questions accurately while keeping the page unpublished until the owner confirms licensing, staffing, and service boundaries.",
        issues=["Fan will not start", "Wobbling or clicking", "Light works but fan does not", "Remote or wall control failed", "Replacing an existing fan", "Planning a new fan location"],
        types=[("Standard downrod fan", "Ceiling height, box rating, downrod length, and blade clearance decide a safe installation."), ("Low-profile fan", "A close-to-ceiling assembly for lower rooms where bracket and box access are limited."), ("Fan with light kit", "The fan and light may share or separate controls; existing conductors determine the options."), ("Remote-controlled fan", "Receiver, handset pairing, canopy space, and line-voltage supply all belong in diagnosis."), ("Outdoor damp-rated fan", "Porch exposure requires the correct damp or wet rating and corrosion-resistant mounting."), ("New-location installation", "New wiring, a fan-rated box, switching, and patching make this electrical construction work.")],
        brands=["Hunter", "Casablanca", "Minka-Aire", "Hampton Bay", "Kichler", "Modern Forms"],
        feature=("Scope gate", "A fan-rated box matters more than the fan label", "A light-fixture box is not automatically rated for the weight and dynamic load of a ceiling fan. Before replacing or adding a fan, the box, brace, branch circuit, controls, ceiling height, and access above the ceiling must be confirmed. City & Suburban should not accept this work until the responsible electrical scope is verified."),
        price=[("Existing-fan diagnosis", "Control, receiver, capacitor, motor, mounting, and access", "Usually no permit for repair"), ("Like-for-like replacement", "Fan-rated box, ceiling height, assembly, and controls", "Electrical scope must be confirmed"), ("New fan location", "New circuit or cable, switch, box, access, and patching", "Permit may be required"), ("Outdoor fan", "Location rating, weather exposure, GFCI/AFCI rules, and mounting", "Depends on electrical scope")],
        price_note="The city source contains only two ceiling-fan-tagged permits, far too few for a defensible price benchmark. A useful quote separates the fan, fan-rated support, controls, new wiring, access equipment, patching, and permit responsibility. Do not publish this service until City & Suburban confirms that it can legally and operationally perform the electrical work.",
        faqs=[("Does City & Suburban currently install ceiling fans?", "This page remains a draft because company scope has not been verified. Confirm the responsible electrical license and service policy before publication."), ("Why does a ceiling fan wobble?", "Loose hardware, blade variation, a bent blade arm, or an unsuitable mounting box can cause movement. The support must be checked before balancing is attempted."), ("Can a light fixture be replaced with a fan?", "Only when the box and support are fan-rated and the wiring supports the intended controls. A standard light box may be unsafe."), ("Can you add a fan where there is no fixture?", "That is new electrical work involving cable routing, a fan-rated box, switching, and possibly a permit."), ("What photos help before booking?", "Send the entire fan, canopy, wall controls, ceiling height, and any accessible box label."), ("Do you repair portable floor fans?", "No. This draft concerns permanently mounted ceiling fans, not retail portable appliances.")],
        keywords=["ceiling fan repair"], volume="2,100/mo primary · 150/mo Chicago-tagged · 13,500/mo across the cluster", secondary=["ceiling fan installers near me", "ceiling fan repair near me", "ceiling fan installation", "ceiling fan replacement"], permit=(2, "ceiling-fan permits tagged, 24mo"),
        review_excerpts={"R055":"Very professional and friendly. Job is done and price is reasonable", "R069":"Very fair rates, communicated well, and showed up quickly.", "R160":"Robert was great and resolved my issue quickly and relatively cheaply.", "R174":"Very quick response, helpful and doesn't try to upsell."},
    ),
    317: dict(
        slug="exhaust-fan-installation-repair", name="Bathroom & Kitchen Exhaust Fan Service", parent="Indoor Air Quality & Ventilation",
        h1="Bathroom & Kitchen Exhaust Fan Installation, Repair and Cleaning", cta="Describe the Ventilation Problem",
        lede="An exhaust fan only works when the fan, duct, termination, and make-up air work as one system. A noisy bathroom fan may need a motor or cleaning; recurring moisture can point to an undersized fan, a crushed duct, or discharge into the attic. Kitchen hood work adds grease, capture area, fire clearance, and make-up-air questions. Diagnosis should follow the air path instead of replacing the visible grille by default.",
        issues=["Bathroom stays damp", "Fan is noisy or slow", "Fan runs but airflow is weak", "Kitchen hood does not capture", "Condensation at the grille", "Planning a replacement or new vent"],
        types=[("Bathroom exhaust fan", "Capacity, sound rating, duct length, backdraft damper, and exterior termination control performance."), ("Fan-light combination", "Shared housings add lighting, controls, and tighter replacement dimensions."), ("Range hood", "Capture area, blower capacity, grease duct, clearances, and make-up air must be evaluated together."), ("Inline exhaust fan", "A remote fan can serve a long or multi-inlet duct when access and controls permit."), ("Whole-house fan", "This is high-volume seasonal ventilation, not the same as a bathroom exhaust fan or HVAC return."), ("ERV or HRV", "Balanced ventilation requires supply and exhaust design, filtration, condensate, and commissioning.")],
        brands=["Broan", "NuTone", "Panasonic", "Fantech", "Air King", "Delta Breez"],
        feature=("Follow the duct", "A spinning fan does not prove that air leaves the building", "Tissue at the grille is not a full ventilation test. The duct may be disconnected, crushed, excessively long, restricted by lint or grease, or terminated in the attic. A complete visit checks the housing, wheel, damper, duct path, exterior termination, controls, and replacement air."),
        price=[("Bathroom-fan diagnosis", "Motor, wheel, housing size, controls, duct, and termination access", "No permit for routine repair"), ("Like-for-like fan replacement", "Housing dimensions, ceiling access, electrical connection, and duct adapter", "Depends on scope"), ("New exterior-vent route", "Core drilling, roof or wall termination, duct length, insulation, and patching", "Permit may be required"), ("Range-hood correction", "Blower, grease duct, clearances, roof access, and make-up air", "Often permit-dependent")],
        price_note="The source file records 20 exhaust-fan permits with construction values, but that is far below the 100 costed-permit threshold needed for a stable median. Quotes should instead state fan capacity, duct material and length, exterior termination, electrical work, access, patching, and permit responsibility.",
        faqs=[("Why is the bathroom still damp when the fan runs?", "The fan may be undersized, dirty, poorly ducted, or not discharging outdoors. Runtime and make-up air also matter."), ("Can a bathroom fan vent into the attic?", "No. Moist air should terminate outdoors through a properly flashed and dampered outlet."), ("Should a loud fan be replaced?", "Not always. Dirt, a loose wheel, damper chatter, or a failing motor can be diagnosed before replacement."), ("Do range hoods need make-up air?", "Some high-capacity systems do. Building tightness, combustion appliances, and local code determine the requirement."), ("Can one fan serve two bathrooms?", "An engineered inline system can, but ordinary bath fans should not simply be tied together."), ("What should be measured after installation?", "Verify airflow or static performance, damper operation, exterior discharge, control operation, and acceptable sound.")],
        keywords=["vent hood installation"], volume="1,500/mo primary · 12,550/mo across the cluster", secondary=["bathroom vent fan replacement", "exhaust fan repair", "vent cleaning service", "whole house fan repair", "ventilation contractor"], permit=(20, "exhaust-fan permits tagged, 24mo"),
        review_excerpts={"R064":"Came out very quickly, diagnosed me, and got me all set up", "R149":"the scheduling to service was so easy/zero stress.", "R016":"Quick, knowledgeable, and friendly service.", "R067":"Very fast response time and fixed our heating problem quickly."},
    ),
    318: dict(
        slug="commercial-refrigeration-repair-maintenance", name="Commercial Refrigeration & Ice Machine Service", parent="Commercial & Specialty",
        h1="Commercial Refrigeration and Ice Machine Repair and Maintenance", cta="Confirm Commercial Equipment Scope",
        lede="A warm walk-in, slow ice machine, or nuisance chiller alarm can threaten inventory and operating hours. The first response should identify equipment type, product temperature, alarm history, condenser condition, refrigerant, electrical supply, and whether another service company controls the warranty. City & Suburban’s light-commercial capability must be confirmed before this page is published, so the draft does not promise refrigeration work that has not been verified.",
        issues=["Walk-in temperature rising", "Ice production is slow", "Condenser is dirty or overheating", "Water or ice is leaking", "Chiller is alarming", "Planning preventive maintenance"],
        types=[("Walk-in cooler", "Box condition, door seals, evaporator, condenser, controls, and load history all affect temperature."), ("Walk-in freezer", "Defrost, heaters, drains, door infiltration, and low-temperature controls add failure points."), ("Commercial ice machine", "Water quality, sanitation, harvest cycle, condenser condition, and drain layout must be checked."), ("Reach-in refrigerator", "Airflow, gaskets, evaporator icing, controls, and compressor performance guide repair."), ("Process or comfort chiller", "Pump flow, approach temperatures, safeties, water treatment, and control history define the call."), ("Remote condensing system", "Roof access, line condition, refrigerant, controls, and shutdown planning affect service.")],
        brands=["Manitowoc", "Scotsman", "Hoshizaki", "True", "Traulsen", "Copeland"],
        feature=("Protect the load", "Record product temperature before resetting the alarm", "A reset can erase the sequence that explains the failure. Record box and product temperatures, alarm codes, recent door or loading events, condenser condition, and any ice pattern first. Food-safety and inventory decisions belong to the operator; the technician’s job is to define the equipment fault and restore verified performance."),
        price=[("Walk-in diagnosis", "Temperature history, access, controls, refrigerant circuit, and product protection", "No permit for routine repair"), ("Ice-machine cleaning", "Model, scale, water filtration, sanitizer procedure, and access", "Usually no permit"), ("Leak or refrigerant repair", "Leak location, refrigerant type, recovery, parts, and evacuation", "No construction permit for repair"), ("System replacement", "Load, electrical, piping, roof access, controls, and shutdown window", "Permit likely")],
        price_note="The city file contains only eight costed commercial-refrigeration permits in the source classification, too few for a responsible median. Commercial quotes should define response priority, diagnostic limit, after-hours terms, refrigerant, lift or roof access, product-protection responsibilities, and the proof used to return equipment to service.",
        faqs=[("Does City & Suburban currently service walk-ins and ice machines?", "This draft requires owner confirmation of equipment, refrigerant, staffing, and after-hours scope before publication."), ("What should we do when a walk-in warms up?", "Minimize door openings, record temperatures, protect product according to your food-safety plan, and call with the model and alarm history."), ("Can an ice machine be cleaned without service?", "The manufacturer procedure, approved chemicals, water filter, and sanitation steps matter. Scale or a mechanical fault may require service."), ("Do you guarantee an emergency arrival time?", "No. Availability and travel vary. A booking should state the actual response window rather than promise 24/7 service by default."), ("What refrigerant information is useful?", "Send the rating plate and any service label. Do not infer refrigerant from equipment age alone."), ("What proves the repair worked?", "Stable temperatures, normal pressures and amperage where applicable, correct controls, and a documented observation period.")],
        keywords=["commercial ice machine repair"], volume="1,100/mo primary · 10,850/mo across the cluster", secondary=["walk in freezer repair", "refrigeration technician", "chiller repair", "ice machine cleaning service", "commercial refrigeration maintenance"], permit=(8, "costed refrigeration permits, 24mo"),
        review_excerpts={"R041":"Reliable service highly recommended.", "R059":"Great service. Very responsive.", "R048":"They always show up on schedule with a heads-up text", "R133":"I have been using Rob for years now"},
    ),
    319: dict(
        slug="humidifier-installation-repair", name="Whole-Home Humidifier Service", parent="Indoor Air Quality & Ventilation",
        h1="Whole-Home Humidifier Installation, Repair and Maintenance", cta="Check the Humidity Problem",
        lede="Chicago winter air can feel dry, but a whole-home humidifier should be selected and controlled from measured indoor humidity, outdoor temperature, building leakage, water quality, and furnace airflow. White dust, window condensation, a constantly running drain, or no water across the pad each point to a different cause. The goal is controlled moisture without wet windows, ducts, or hidden building cavities.",
        issues=["Indoor air feels too dry", "Humidifier is not using water", "Water leaks near the furnace", "White scale builds up", "Windows are condensing", "Planning a whole-home unit"],
        types=[("Bypass humidifier", "Uses furnace airflow and a bypass duct; damper position and airflow are central to performance."), ("Fan-powered humidifier", "An integral fan increases delivery but adds power, motor, and clearance requirements."), ("Steam humidifier", "Provides independent output but requires electrical capacity, drainage, water-quality planning, and controls."), ("Manual humidistat", "A fixed setting needs seasonal adjustment to avoid condensation as outdoor temperatures fall."), ("Automatic outdoor-reset control", "An outdoor sensor can reduce output during cold weather when condensation risk rises."), ("Replacement water panel", "Pad orientation, scale, drain flow, and seasonal replacement affect evaporation and hygiene.")],
        brands=["Aprilaire", "Honeywell Home", "GeneralAire", "Carrier", "Lennox", "Trane"],
        feature=("Measure first", "Dry comfort and safe humidity are not the same number", "A high setting can create condensation on windows and inside cold wall or roof assemblies. A useful plan records indoor relative humidity, outdoor temperature, window condition, furnace runtime, water flow, drain condition, and control type before increasing output."),
        price=[("No-humidity diagnosis", "Water supply, valve, pad, airflow, drain, humidistat, and furnace call", "No permit for repair"), ("Annual pad service", "Pad, scale, drain, orifice, and seasonal damper setup", "No permit"), ("Bypass replacement", "Duct opening, bypass route, water, drain, controls, and access", "Depends on scope"), ("Steam humidifier installation", "Electrical load, water quality, drain temperature, controls, and distribution", "Permit may be required")],
        price_note="Only one humidifier/dehumidifier-tagged permit appears in the source file, so no permit-price median is defensible. Compare quotes by humidifier type, rated output at the actual furnace conditions, water and drain work, electrical requirements, control strategy, commissioning, and recurring pad or canister cost.",
        faqs=[("What indoor humidity should I use in winter?", "Use the lowest setting that provides comfort without window or building-surface condensation; the safe target changes with outdoor temperature and envelope quality."), ("Why is water running down the drain?", "Flow-through units intentionally drain some water, but a stuck valve, blocked orifice, incorrect pad, or control fault can waste water."), ("Why does the humidifier run but humidity stays low?", "Airflow, water delivery, pad condition, furnace runtime, leakage, and equipment capacity all matter."), ("Can a humidifier cause mold?", "Excess humidity or leakage can. Correct sizing, drainage, controls, cleaning, and monitoring reduce that risk."), ("How often is the pad replaced?", "Follow the manufacturer and local water conditions; many homes need at least seasonal inspection and regular replacement."), ("Do portable humidifiers belong on this page?", "No. This page concerns duct-mounted whole-home equipment attached to the HVAC system.")],
        keywords=["humidifier repair"], volume="2,300/mo primary · 10,700/mo across the cluster", secondary=["whole home humidifier installation", "humidifier service", "humidifier repair near me", "furnace humidifier maintenance"], permit=(1, "humidity-equipment permit tagged, 24mo"),
        review_excerpts={"R066":"I have done two service calls with this company", "R006":"Easy appointment scheduling and reasonably priced.", "R044":"Very quick and easy, will be using them again!", "R108":"Been using these guys for 2 years."},
    ),
    320: dict(
        slug="dehumidifier-installation-repair", name="Whole-Home Dehumidifier Service", parent="Indoor Air Quality & Ventilation",
        h1="Whole-Home Dehumidifier Installation and Repair", cta="Describe the Moisture Pattern",
        lede="A damp Chicago basement can come from outdoor air, groundwater, plumbing, an oversized cooling system, or insufficient HVAC runtime. A dehumidifier manages moisture in air; it does not repair bulk-water entry. Before sizing equipment, document relative humidity, temperature, drainage, foundation symptoms, affected floors, and whether the problem changes with rain or air-conditioning runtime.",
        issues=["Basement smells musty", "Humidity stays above target", "Unit runs but collects little water", "Drain or condensate pump leaks", "Coil freezes", "Planning a ducted dehumidifier"],
        types=[("Portable basement unit", "A retail appliance suited to one open area; drainage and low-temperature operation limit results."), ("Whole-home ducted unit", "Connects to the HVAC air path and needs airflow, static-pressure, control, and condensate design."), ("Dedicated basement unit", "Treats a basement separately when the main system does not run enough during mild humid weather."), ("Crawl-space dehumidifier", "Low-clearance equipment needs a sealed space, continuous drain, filtration access, and service clearance."), ("Condensate pump system", "Used where gravity drainage is unavailable; pump capacity, overflow safety, and maintenance matter."), ("Ventilation-integrated control", "Outdoor air should only be introduced when its moisture load and building pressure are understood.")],
        brands=["Aprilaire", "Santa Fe", "Ultra-Aire", "Honeywell Home", "AprilAire E-Series", "Broan"],
        feature=("Source before sizing", "A dehumidifier cannot fix water entering through the foundation", "Map the moisture to rain, season, room, HVAC runtime, and visible water. Bulk-water entry, plumbing leaks, sewer issues, and foundation defects need their own repairs. Dehumidification is appropriate when the remaining load is moisture in the air and there is a dependable drain path."),
        price=[("Performance diagnosis", "Humidity log, coil, filter, fan, refrigerant circuit, controls, and drain", "No permit for repair"), ("Portable-unit assessment", "Room temperature, capacity, drainage, and economic repairability", "No permit"), ("Ducted installation", "Load, duct connection, static pressure, controls, power, and condensate", "Depends on scope"), ("Crawl-space system", "Encapsulation, access, drainage, electrical, and service clearance", "Multiple trades may apply")],
        price_note="The city source provides only one humidity-equipment-tagged permit, not enough for a price statistic. A complete quote states moisture source assumptions, rated capacity at operating conditions, duct and electrical scope, drainage and overflow protection, commissioning target, filter access, and expected maintenance.",
        faqs=[("What humidity is too high?", "Persistent indoor relative humidity above roughly 60% deserves investigation, but temperature, surface conditions, and measurement accuracy also matter."), ("Will a dehumidifier stop basement water?", "No. It can remove moisture from air, not stop groundwater, plumbing leaks, or liquid water entering through the structure."), ("Why does the coil freeze?", "Low room temperature, restricted airflow, a dirty coil, fan problems, or a refrigerant fault can cause icing."), ("Should the unit drain continuously?", "A gravity drain or condensate pump avoids frequent bucket emptying, but it needs proper slope, overflow protection, and maintenance."), ("Can it connect to existing ductwork?", "Often, but the return and supply locations, static pressure, HVAC fan strategy, and controls must be designed together."), ("Do you rent portable dehumidifiers?", "No rental service is represented here. The source keyword set includes rental intent, which is intentionally excluded from this HVAC page.")],
        keywords=["dehumidifier repair"], volume="1,000/mo primary · 9,350/mo across the cluster", secondary=["whole home dehumidifier installation", "dehumidifier service", "crawl space dehumidifier", "ducted dehumidifier installation"], permit=(1, "humidity-equipment permit tagged, 24mo"),
        review_excerpts={"R103":"On time and honest. Robert is very knowledgeable and professional.", "R116":"Friendly, efficient, patient, and helpful service from Rob and his office staff!", "R025":"Great service and quick to reply. Honest work.", "R107":"Great service! Highly recommend. Explained all the details."},
    ),
    321: dict(
        slug="oil-propane-heating-repair-maintenance", name="Oil & Propane Heating Service", parent="Heating & Hot Water",
        h1="Oil and Propane Heating Repair and Maintenance", cta="Confirm Fuel and Equipment",
        lede="Oil and propane heating are uncommon inside Chicago compared with natural gas and electric systems, and the keyword file is dominated by fuel-retail searches rather than heating service. This draft excludes filling stations, kerosene sales, and tank delivery. Before publication, City & Suburban should confirm burner, fuel, tank, and combustion-testing scope for the limited systems it is prepared to service.",
        issues=["Burner will not start", "System locks out", "Soot or odor is present", "Heat cycles unevenly", "Planning annual burner service", "Unsure whether fuel service is supported"],
        types=[("Oil-fired furnace", "Burner setup, draft, filter, nozzle, combustion, heat exchanger, and warm-air delivery all matter."), ("Oil-fired boiler", "Adds hydronic or steam controls, pumps, water level, venting, and distribution."), ("Propane furnace", "Gas pressure, regulators, ignition, venting, combustion air, and tank supply must be separated."), ("Propane boiler", "Appliance controls and water-side performance need diagnosis alongside fuel supply."), ("Power burner", "Burner model, fuel, draft, combustion instruments, and approved parts determine serviceability."), ("Fuel tank and regulator", "Tank integrity, filling, regulators, and fuel delivery may belong to the propane or oil supplier.")],
        brands=["Beckett", "Riello", "Weil-McLain", "Burnham", "Carrier", "Trane"],
        feature=("Separate the trades", "Fuel delivery and appliance service are different appointments", "An empty tank, regulator freeze-up, blocked oil line, burner lockout, venting problem, and failed heating control can all look like no heat. Confirm fuel level, supplier responsibility, appliance model, burner model, lockout code, and visible soot or odor before dispatch."),
        price=[("No-heat diagnosis", "Fuel supply, burner, ignition, draft, controls, and distribution", "No permit for repair"), ("Annual oil-burner service", "Filter, nozzle, electrode, draft, smoke, combustion, and heat exchanger", "No permit"), ("Propane appliance repair", "Tank level, regulators, gas pressure, ignition, venting, and parts", "No permit for repair"), ("Fuel conversion or replacement", "Equipment, tank, piping, venting, electrical, removal, and inspections", "Permits and multiple trades likely")],
        price_note="The keyword volume cannot be treated as Chicago service demand because most high-volume phrases seek fuel sales. The permit source has only one oil/propane-tagged project. Do not quote a median. A useful estimate names fuel-supplier work, appliance work, combustion testing, parts, venting, permits, and any tank responsibility separately.",
        faqs=[("Does City & Suburban service oil and propane equipment?", "This page remains a draft until the owner confirms supported appliances, burner brands, fuel-side boundaries, and combustion-testing capability."), ("Do you deliver propane or heating oil?", "No fuel-delivery or filling-station service is represented by this page."), ("What should I do after a burner lockout?", "Do not repeatedly press reset. Record the code, check fuel level safely, and call for qualified diagnosis if the burner does not start normally."), ("Why is soot a concern?", "Soot can indicate poor combustion, draft, fuel atomization, or heat-exchanger problems. Shut down unsafe equipment and arrange inspection."), ("What belongs in annual oil service?", "Typical work includes filter and nozzle condition, electrodes, burner cleaning, draft, smoke, combustion readings, and heat-exchanger inspection."), ("Is conversion to natural gas included?", "Conversion is a separate construction project involving fuel availability, equipment, piping, venting, removal, and permits.")],
        keywords=["oil heating repair", "propane furnace repair"], volume="9,350/mo raw cluster; most volume is fuel-retail intent and excluded", secondary=["oil burner service", "oil furnace maintenance", "propane heating repair", "oil boiler repair"], permit=(1, "oil/propane permit tagged, 24mo"),
        review_excerpts={"R060":"Eddie, Sam, & Clarissa are wonderful to work with!", "R091":"Very efficient, easy to work with and prompt!", "R153":"Rob was the best, very helpful and knowledgeable!", "R110":"Great people, company, work and professionalism. A+."},
    ),
    322: dict(
        slug="dryer-vent-cleaning-repair", name="Dryer Vent Cleaning & Repair", parent="Indoor Air Quality & Ventilation",
        h1="Dryer Vent Cleaning and Repair", cta="Check the Vent Route",
        lede="Long drying times, a hot laundry room, lint at the exterior hood, or a dryer that shuts down can point to restricted exhaust, but the appliance, transition duct, concealed run, and termination all need separation. Dryer-vent work is an adjacent service rather than verified core HVAC scope for City & Suburban, so the page stays in draft until cleaning equipment, routing limits, and repair responsibility are confirmed.",
        issues=["Clothes take too long to dry", "Dryer or laundry room gets hot", "Exterior flap barely opens", "Vent line is disconnected", "Lint keeps collecting", "Planning a safer vent route"],
        types=[("Short wall vent", "A simple route can still fail at the transition hose, hood, damper, or accumulated lint."), ("Long concealed run", "Length, elbows, material, joints, and access points determine cleaning method and pressure loss."), ("Roof termination", "Roof access, cap design, screens, weather, and safe working conditions affect service."), ("Stacked laundry closet", "Tight access can hide crushed transition duct and make disconnection or reassembly difficult."), ("Booster-fan system", "The fan, pressure switch, cleaning access, and manufacturer limits must match the run."), ("Damaged or improper duct", "Plastic, foil, screws, crushed flex, open joints, or an unsafe termination may require correction.")],
        brands=["InOvate", "Fantech", "Broan", "Lambro", "Deflecto", "DryerWallVent"],
        feature=("Verify the full path", "The lint screen is only the first restriction point", "A complete check follows air from the dryer outlet through the transition connector, concealed metal duct, elbows, booster fan if present, and exterior termination. Airflow after cleaning should be compared with the starting condition, and any damaged, disconnected, or combustible duct should be documented."),
        price=[("Vent inspection", "Route length, elbows, material, access, termination, and dryer movement", "No permit"), ("Mechanical cleaning", "Restriction level, access points, roof or wall termination, and cleanup", "No permit"), ("Disconnected-joint repair", "Access opening, approved metal connection, sealing, and patching", "Depends on scope"), ("Vent reroute", "New path, exterior penetration, firestopping, structure, and patching", "Permit may be required")],
        price_note="Only two dryer-vent-tagged permits appear in the city source, so no price median is justified. Quotes should identify the accessible length, termination, dryer movement, roof work, booster fan, repair versus cleaning, airflow verification, and whether wall or ceiling opening and patching are included.",
        faqs=[("Does City & Suburban currently clean dryer vents?", "This adjacent service remains a draft until the owner confirms equipment, routing limits, roof policy, and repair scope."), ("How often should a dryer vent be cleaned?", "There is no universal interval. Drying time, lint load, household use, route length, and manufacturer guidance determine inspection frequency."), ("Why do clothes need two cycles?", "Restricted exhaust is one cause, but dryer heat, airflow, load size, and moisture sensing should also be considered."), ("Can a screen cover the outside vent?", "Fine screens can trap lint and restrict flow. The termination should use a code-appropriate damper designed for dryer exhaust."), ("Is foil flex acceptable?", "The transition connector and concealed duct have different requirements. Concealed runs generally need smooth metal duct and approved joints."), ("What proof should cleaning include?", "Document the route and condition, show the removed restriction, verify the termination opens, and compare airflow or operating performance.")],
        keywords=["dryer vent repair near me"], volume="5,400/mo primary · 8,250/mo across the cluster", secondary=["dryer vent cleaning", "cleaning dryer vents near me", "dryer vent repair", "dryer exhaust inspection"], permit=(2, "dryer-vent permits tagged, 24mo"),
        review_excerpts={"R138":"Super fast, friendly, effective, great communication.", "R054":"perfect efficient friendly informative", "R144":"Rob came to my aunts house in Wicker Park.", "R002":"I got a call back within 10 minutes of reaching out."},
    ),
    323: dict(
        slug="attic-fan-installation-repair", name="Attic Fan Installation & Repair", parent="Indoor Air Quality & Ventilation",
        h1="Attic Fan Installation and Repair", cta="Confirm Attic and Electrical Scope",
        lede="An attic fan can reduce attic heat only when intake ventilation, air-sealing, roof geometry, controls, and electrical work are appropriate. It cannot replace insulation or a properly designed whole-house ventilation strategy, and it can create unwanted house depressurization when the ceiling plane leaks. This adjacent-service draft stays unpublished until City & Suburban confirms roof-access and electrical scope.",
        issues=["Fan will not start", "Fan runs continuously", "Motor is noisy", "Attic remains extremely hot", "Roof or gable unit leaks", "Planning a powered attic fan"],
        types=[("Gable-mounted fan", "Uses a wall opening; intake area, weather protection, vibration, controls, and wiring matter."), ("Roof-mounted fan", "Adds flashing, roof condition, weather exposure, safe access, and leak responsibility."), ("Solar attic fan", "Solar exposure, panel placement, controls, capacity, and roof penetration determine performance."), ("Thermostat-controlled fan", "Setpoint and sensor location should respond to attic conditions without excessive runtime."), ("Humidity-controlled fan", "Humidity control does not repair roof leaks or indoor moisture escaping through ceiling gaps."), ("Passive attic ventilation", "Soffit, ridge, and roof vents may solve the air path without a powered fan when correctly sized.")],
        brands=["QuietCool", "Air Vent", "iLiving", "Remington Solar", "Master Flow", "Broan"],
        feature=("Building first", "Powered exhaust needs enough outdoor-air intake", "Without adequate soffit or other intake, a powered attic fan can pull conditioned air from the house and potentially affect combustion appliances. Inspect the ceiling plane, attic bypasses, insulation, passive vent area, roof condition, controls, and electrical feed before recommending a fan."),
        price=[("Fan diagnosis", "Motor, control, sensor, wiring, blade, vibration, and safe attic access", "No permit for routine repair"), ("Gable replacement", "Opening size, intake, mounting, weather protection, and electrical work", "Depends on scope"), ("Roof-mounted installation", "Roof pitch, flashing, access, structure, controls, and wiring", "Permit may be required"), ("Ventilation assessment", "Intake and exhaust area, air sealing, insulation, and combustion safety", "No permit for assessment")],
        price_note="No attic-fan-tagged permit appears in the 24-month source classification, so the dataset cannot support a price. Compare written scopes for roof or gable work, electrical responsibility, intake-vent assessment, controls, air sealing, flashing, access, commissioning, and leak warranty.",
        faqs=[("Does City & Suburban currently install attic fans?", "This adjacent service remains a draft until roof-access, electrical, licensing, and warranty responsibilities are confirmed."), ("Will an attic fan cool my house?", "It may reduce attic temperature, but insulation, air sealing, roof ventilation, and the home cooling system determine indoor comfort."), ("Can an attic fan pull air from the house?", "Yes, if attic intake is inadequate or the ceiling plane is leaky. That risk should be evaluated before installation."), ("Is a solar fan automatically better?", "No. Solar exposure, capacity, controls, roof penetrations, and the ventilation design still matter."), ("Why does the fan run all night?", "A failed or poorly located sensor, incorrect setpoint, wiring issue, or persistent attic condition can keep it operating."), ("What photos help estimate the work?", "Send the fan, roof or gable exterior, attic access, control, electrical feed, and wide views of soffit and ridge ventilation.")],
        keywords=["attic fan installation near me"], volume="2,700/mo primary · 5,200/mo across the cluster", secondary=["attic fan repair", "solar attic fan installation", "attic ventilation contractor", "gable fan repair"], permit=(0, "attic-fan permits tagged, 24mo"),
        review_excerpts={"R112":"They reviewed my options and helped me make the decision", "R008":"got a callback within a few minutes.", "R018":"Called them at 4:50 on a Friday", "R094":"Rob came out immediately"},
    ),
    324: dict(
        slug="radiator-radiant-heat-repair-installation", name="Radiator & Radiant Heat Service", parent="Heating & Hot Water",
        h1="Radiator and Radiant Heat Repair and Installation", cta="Describe the Cold Rooms",
        lede="Chicago’s older buildings make radiator work a distribution problem as often as an appliance problem. One cold cast-iron radiator may be air-bound, valve-limited, pitched incorrectly, steam-trap restricted, or starved by a system balance issue. Heated floors add pumps, mixing controls, manifold flow, floor coverings, and water-temperature limits. Diagnosis should identify steam, hot water, or electric radiant heat before parts are selected.",
        issues=["One radiator stays cold", "Radiator bangs or hisses", "Valve or pipe is leaking", "Rooms heat unevenly", "Radiant floor zone is cold", "Planning radiator or radiant replacement"],
        types=[("One-pipe steam radiator", "Pitch, air venting, supply valve position, pressure, and main venting affect heat and noise."), ("Two-pipe steam radiator", "Trap condition, supply control, return pressure, and system balance guide diagnosis."), ("Hot-water radiator", "Air, flow, valve condition, circulator performance, and water temperature determine output."), ("Cast-iron baseboard", "Low profile does not remove the need for flow, balancing, air removal, and clearance."), ("Hydronic radiant floor", "Manifolds, pumps, mixing valves, tubing circuits, controls, and floor limits form one system."), ("Electric radiant floor", "Electrical resistance, sensors, controls, and floor assembly make this a different trade path.")],
        brands=["Burnham", "Weil-McLain", "Slant/Fin", "Honeywell Home", "Taco", "Caleffi"],
        feature=("Identify the system", "Steam and hot-water radiators use different diagnostics", "A steam air vent is not a hydronic bleeder, and a steam supply valve is generally intended to be fully open or closed. Photograph the boiler, radiator connections, valves, vents or traps, and piping before the appointment. The system type decides the safe diagnostic sequence."),
        price=[("Cold-radiator diagnosis", "System type, vent or trap, valve, pitch, air, flow, and boiler operation", "No permit for repair"), ("Valve or trap replacement", "Access, shutdown, seized fittings, asbestos risk, and system refill or steam test", "Usually repair scope"), ("Radiator replacement", "Output, connection size, floor support, handling, piping, and finish work", "Permit may apply"), ("Radiant-floor zone repair", "Controls, pump, mixing, manifold, tubing, thermal imaging, and floor access", "Depends on scope")],
        price_note="The source groups 98 radiant/radiator permits, but the available cost classifications do not provide a stable, service-specific price benchmark. A good quote identifies steam, hot water, or electric; names the failed component or balancing issue; and separates access, piping, finish repair, controls, permits, and system testing.",
        faqs=[("Why is one radiator cold?", "The cause can be air, a vent or trap, a closed or failed valve, poor pitch, low flow, or system imbalance. System type comes first."), ("Should a steam radiator valve be partly closed?", "Generally no. Many one-pipe steam valves should be fully open or fully closed so condensate can return properly."), ("Why does the radiator bang?", "Water trapped by poor pitch, high pressure, fast valves, or piping problems can create steam hammer."), ("Can an old radiator be replaced?", "Yes when output, connection dimensions, system type, floor support, handling, and piping are planned together."), ("Can radiant floors be repaired without opening the floor?", "Controls, pumps, manifolds, sensors, and flow can often be tested first. A tubing leak or floor defect may still require access."), ("Do radiator repairs need permits?", "Routine repair generally does not. Replacement, new piping, boiler work, or new radiant construction may require permits depending on scope.")],
        keywords=["radiant heat installation", "radiant heat repair"], volume="500/mo installation · 450/mo repair · 4,250/mo across the cluster", secondary=["radiator repair", "radiator installation", "radiant heating repair", "steam radiator service", "radiant floor repair"], permit=(98, "radiant/radiator permits tagged, 24mo"),
        review_excerpts={"R183":"Rob Koehler showed up on time and fixed my boiler", "R127":"Rob has been servicing my boiler for several years.", "R079":"Within minutes of calling he got here and right to work.", "R152":"Robert is super professional, trustworthy and kind."},
    ),
    325: dict(
        slug="generator-installation-repair", name="Standby Generator Service", parent="Commercial & Specialty",
        h1="Standby Generator Installation, Repair and Maintenance", cta="Find a Licensed Generator Contractor",
        lede="A permanently installed standby generator combines electrical generation, transfer equipment, fuel supply, ventilation, clearances, controls, and code-required testing. The source confirms that this is outside City & Suburban’s verified HVAC scope. This document is retained only as an architecture and content draft; it must not be published as an offered service unless the company adds the required licensed capability and defines responsibility with the gas trade.",
        issues=["Generator will not start", "Weekly exercise failed", "Transfer switch did not operate", "Unit starts then shuts down", "Battery or charger alarm", "Planning a standby system"],
        types=[("Air-cooled standby generator", "Residential packages still require load calculation, transfer equipment, fuel sizing, clearances, and commissioning."), ("Liquid-cooled standby generator", "Larger capacity adds coolant, starting, enclosure, fuel, exhaust, and commercial maintenance requirements."), ("Automatic transfer switch", "Service rating, switching arrangement, load management, utility coordination, and testing are electrical work."), ("Natural-gas generator", "Meter and piping capacity must support generator demand alongside existing appliances."), ("Propane generator", "Tank capacity, vaporization, regulators, piping, setbacks, and supplier responsibility must be designed."), ("Portable generator", "Portable equipment and temporary cords are not the permanently installed standby service described here.")],
        brands=["Generac", "Kohler", "Briggs & Stratton", "Cummins", "Champion", "Caterpillar"],
        feature=("Do not publish", "Generator work requires verified electrical responsibility", "A standby system is not an HVAC accessory page. The responsible contractor must calculate load, specify transfer equipment, coordinate utility and permits, verify grounding and bonding, size fuel supply, meet clearance and exhaust rules, and commission the system under load. City & Suburban should refer this work until that capability is documented."),
        price=[("No-start diagnosis", "Qualified electrical diagnosis, battery, charger, controls, fuel, and fault history", "Licensed scope required"), ("Annual maintenance", "Model schedule, oil, filters, battery, exercise record, transfer test, and load test", "Service scope still must be verified"), ("Standby installation", "Load, generator, transfer switch, service, trenching, pad, fuel, permits, and commissioning", "Electrical and fuel permits required"), ("Fuel-system correction", "Meter or tank, regulators, piping, demand, pressure test, and coordination", "Fuel-trade permit likely")],
        price_note="The source contains no useful Chicago generator cost benchmark, and its keyword set is polluted by ozone-generator and portable-equipment intent. A legitimate standby proposal must separate equipment, transfer switch, electrical service work, site and concrete work, trenching, fuel work, permits, utility coordination, startup, load testing, and maintenance. This is not a City & Suburban price page.",
        faqs=[("Does City & Suburban install standby generators?", "No verified capability is documented. This page is marked out of scope and must remain unpublished unless licensed electrical responsibility is added and confirmed."), ("Is a standby generator an HVAC appliance?", "No. Fuel may overlap with mechanical work, but generation, transfer, service connection, grounding, and commissioning are electrical scope."), ("Does installation require permits?", "Yes, a permanent standby system commonly involves electrical and fuel permits plus utility and siting requirements."), ("Can the existing gas meter support a generator?", "Only a load and pressure evaluation can answer that. The generator and existing appliances must be considered together."), ("What is an automatic transfer switch?", "It detects an outage and transfers selected loads or the service to generator power under a designed electrical arrangement."), ("Are portable generators covered here?", "No. Portable units, extension cords, interlocks, and temporary operation are a different safety and service category.")],
        keywords=["home generator service near me"], volume="450/mo relevant primary · 1,050/mo raw cluster; ozone intent excluded", secondary=["standby generator installation", "standby generator maintenance", "automatic transfer switch", "generator repair"], permit=(0, "verified generator permits in source"),
        review_excerpts={"R077":"Eddie came out within an hour of us calling.", "R079":"Prices felt fair.", "R152":"He will return your call right away.", "R053":"Always quick to respond. On time arrival"},
    ),
}


def build_equipment(service_id, profile):
    parent_slug = "heating" if profile["parent"] == "Heating & Hot Water" else ("commercial-specialty" if profile["parent"] == "Commercial & Specialty" else "indoor-air-quality-ventilation")
    service_url = f"https://www.citysuburbanheating.com/services/{profile['slug']}/"
    types = [(ICONS[i % len(ICONS)], name, description) for i, (name, description) in enumerate(profile["types"])]
    scope_reason = profile["feature"][2]
    why = [
        ("Founded in 1952", "City & Suburban is family owned and second generation. The public profile and source pack support the founding year; the page does not invent certifications or dealer status."),
        ("4.98 across 204 Google reviews", "The rating and count come from one verified Google profile pulled 31 August 2026. Each excerpt links to its original review."),
        ("Named people, not anonymous claims", "Customers repeatedly name Rob, Eddie, Carissa, Frank, Nate, Sam and Clarissa. That is checkable service-process evidence rather than a generic badge."),
        ("Response patterns without guarantees", "Customers record callbacks, arrival communication and prompt work. Those observations are reported without promising an arrival time that traffic, weather, and workload can change."),
        ("Permit data used honestly", "The city file found zero permits matched to City & Suburban after searching all contractor contact fields. Citywide permits explain scope and vocabulary, never the company’s job count."),
        (profile["feature"][1], scope_reason),
    ]
    return {
        "C": service_id, "slug": profile["slug"], "name": profile["name"], "parent_name": profile["parent"],
        "parent_url": f"https://www.citysuburbanheating.com/services/{parent_slug}/", "hub_url": service_url,
        "h1_prefix": profile["h1"], "hero_lede": profile["lede"], "cta_secondary": profile["cta"],
        "issue_question": "What is happening?", "issue_options": "||".join(profile["issues"]),
        "types_heading": "Equipment, Configurations & Scope", "types_lede": "The service name covers several systems. These configurations change diagnosis, access, code responsibility, and the repair-versus-replace decision.",
        "types": parts(types), "types_footnote": "Send a wide equipment photo, rating plate, controls, connections, and the surrounding installation. Those details identify the responsible trade and reduce the chance of booking the wrong visit.",
        "brands_heading": "Common Equipment Names", "brands_lede": "Brand can guide manuals and parts, but condition, configuration, access, and service scope come first.",
        "brands": "||".join(profile["brands"]), "brands_note": "These are examples found in the market, not dealer affiliations, endorsements, or a promise that every model is serviceable. The model and serial number are needed to check age, parts, recalls, and manufacturer instructions.",
        "why_heading": "Why City & Suburban", "why_lede": "The checkable company facts stay consistent; the final item explains the service-specific evidence or boundary.", "why": parts(why),
        "feature_tag": profile["feature"][0], "feature_title": profile["feature"][1], "feature_desc": profile["feature"][2], "feature_cta": "Discuss the scope", "feature_url": "https://www.citysuburbanheating.com/contact/",
        "other_services": parts([
            ("Furnace Repair & Installation", "For whole-home forced-air heating", "https://www.citysuburbanheating.com/services/furnace-repair-installation/"),
            ("Boiler Repair & Installation", "For steam and hot-water systems", "https://www.citysuburbanheating.com/services/boiler-repair-installation/"),
            ("Indoor Air Quality Services", "For filtration, humidity and ventilation questions", "https://www.citysuburbanheating.com/services/indoor-air-quality-testing-installation/"),
        ]),
        "pricing_heading": "What Drives the Price", "pricing_lede": "This is a scope-comparison guide, not a price book. It shows what should be identified before quotes are compared.",
        "pricing_caption": "Chicago permit data, 24 months to August 2026. Reported construction values describe whole projects, not retail equipment or repair prices.",
        "pricing_col_1": "Job", "pricing_col_2": "What moves the price", "pricing_col_3": "Permit", "pricing_rows": parts(profile["price"]), "pricing_note": profile["price_note"],
        "faqs": parts(profile["faqs"]), "cta_heading": profile["feature"][1], "cta_body": "Send the equipment label, controls, surrounding installation, and a short symptom timeline. The first step is confirming the responsible trade and useful next action.",
        "kw_primary": "||".join(profile["keywords"]), "kw_volume": profile["volume"], "kw_secondary": "||".join(profile["secondary"]),
    }


def guide_pack(profile):
    count, label = profile["permit"]
    service_title = profile["h1"]
    return parts([
        ("Chicago housing stock", "<p>Cook County Assessor data for the eight townships covering Chicago records <strong>439,398 assessed properties</strong>: 305,736 single-family and 133,662 multi-family. The same service can mean a basement system in a bungalow, shared equipment in a two-flat, or roof and association access in a condo building.</p><p><strong>335,769</strong> properties use warm-air furnaces and <strong>98,849</strong> use hot-water or steam heat. <strong>324,305</strong> have full basements. Access, distribution, shared flues, old piping, electrical capacity and decades of alterations can change scope before equipment brand does.</p>"),
        ("What actually needs a permit", "<p>Chicago issued <strong>62,810 permits of all types</strong> in the 24 months to August 2026. <strong>4,888</strong> mention HVAC work, while 7,993 carry a ventilation, refrigeration or heating trade contractor contact.</p><p>Repair, diagnosis and routine maintenance generally do not require a construction permit. New equipment, altered systems, exterior penetrations, fuel work and electrical work may. The proposal should name the responsible permit holder and any second trade.</p>"),
        ("Where we work", "<p>This content set publishes <strong>Chicago only</strong>. It uses one shared area document so the system does not create duplicate neighbourhood pages or imply unverified suburban registrations.</p><p>Within Chicago, condo rules, roof access, tenant or owner approval, shared utilities, working hours and parking can still change scheduling and scope.</p>"),
        (f"Evidence for {service_title.lower()}", f"<p>The city source classifies <strong>{count}</strong> {label}. That count is used only to explain the available evidence; it is not represented as City & Suburban’s work.</p><p>The sample is not used as a consumer price benchmark. The page instead identifies the equipment, access, controls, connections, responsible trade, inspection or testing, and permit status that belong in a written quote.</p><p>Scope flags in the source workbook remain visible in Sanity so an editor can verify adjacent, low-volume, confirmation-required, or out-of-scope services before publication.</p>"),
    ])


def main():
    if not SOURCE_WORKBOOK.exists():
        raise FileNotFoundError(SOURCE_WORKBOOK)
    source_book = openpyxl.load_workbook(SOURCE_WORKBOOK, read_only=True, data_only=True)
    listicle_rows = rows_as_dicts(source_book["Listicle Titles"], 4)
    listicle_by_id = {
        int(row["Service ID"]): row
        for row in listicle_rows
        if isinstance(row.get("Service ID"), (int, float))
    }
    review_rows = rows_as_dicts(source_book["Reviews"], 5)
    review_by_id = {str(row["Review ID"]).strip(): row for row in review_rows if row.get("Review ID")}
    base = json.loads(BASE_CONTENT.read_text(encoding="utf-8"))
    common_page = base["page"][0]
    equipment = []
    pages = []
    contexts = {}
    for service_id, profile in P.items():
        source = listicle_by_id[service_id]
        equipment.append(build_equipment(service_id, profile))
        review_ids = [value.strip() for value in str(source["Review IDs"]).split(",")]
        review_values = []
        contexts[str(service_id)] = {}
        for review_id in review_ids:
            review = review_by_id[review_id]
            if str(review.get("Status", "")).strip() != "Eligible":
                raise ValueError(f"Review {review_id} is not eligible")
            excerpt = profile["review_excerpts"][review_id]
            if len(excerpt.split()) > 14:
                raise ValueError(f"Review excerpt {review_id} exceeds 14 words")
            if normalized_text(excerpt) not in normalized_text(review.get("Review Text (verbatim)")):
                raise ValueError(f"Review excerpt {review_id} is not a contiguous verbatim fragment")
            review_values.append((excerpt, review["Author"], str(review["Date"]), review["Review URL (Google permalink)"], review_id))
            equipment_specific = service_id == 324 and review_id in {"R183", "R127"}
            contexts[str(service_id)][review_id] = (
                "The customer describes boiler service directly. This supports heating-system service process and is relevant to radiator or radiant systems supplied by a boiler; it does not claim work on the radiator itself."
                if equipment_specific else
                f"The customer describes {('response and communication' if len(excerpt.split()) > 6 else 'the service experience')}. The review is general company evidence and does not identify {profile['name'].lower()}."
            )
        title = f"{profile['h1']} in Chicago | City & Suburban"
        description = f"Chicago {profile['h1'].lower()} guidance from City & Suburban. Compare symptoms, equipment types, scope, permit questions, and quote drivers."
        if len(title) > 75:
            title = f"{profile['name']} in Chicago | City & Suburban"
        if len(description) > 170:
            description = description[:166].rstrip(" ,.") + "."
        count, label = profile["permit"]
        page = {key: value for key, value in common_page.items()}
        page.update({
            "equipment_slug": profile["slug"], "area_slug": "chicago", "service_id": service_id,
            "meta_title": title, "meta_description": description,
            "canonical_url": f"https://www.citysuburbanheating.com/services/{profile['slug']}/chicago/",
            "trust_cell_4_value": str(count), "trust_cell_4_label": label,
            "trust_cell_5_value": "Verify", "trust_cell_5_label": "Scope before publication",
            "trust_cards": parts([
                ("Seventy-four years, one city", "Founded in 1952 and still family owned. The source pack supports the company facts without adding certifications or affiliations."),
                ("Zero matched company permits is not zero service history", "Routine repair and maintenance usually do not require a construction permit. The city file is not used to claim City & Suburban job volume."),
                ("The service evidence is stated, not stretched", f"The source classification contains {count} {label}. Small or zero samples are not converted into a price claim, and the service scope flag remains visible for editorial review."),
            ]),
            "reviews": parts(review_values),
            "reviews_disclaimer": "Verbatim fragments of 14 words or fewer from the Google profile, each linked to the original review. Pulled 31 August 2026. General reviews are trust proof, not equipment-specific evidence.",
            "gallery": "", "working_photos": "",
            "form_subtitle": f"Describe the symptom, equipment type, controls, access, and when the problem began for {profile['name'].lower()}.",
            "form_note": "This page is a draft. Confirm the service scope shown in Sanity before publishing or scheduling from this content.",
            "form_action": "", "guides": guide_pack(profile),
            "faqs_local": "Which Chicago neighbourhoods do you cover?::This batch uses one Chicago service area and does not generate Lincoln Park or other neighbourhood-specific pages.||Does an older building change the job?::Often. Access, structure, shared systems, electrical capacity, piping, venting and prior alterations can change scope.||Do you work in condo buildings?::Verified services are subject to association rules for access, shutoffs, exterior work, roof work and working hours.",
        })
        pages.append(page)

    output = {"equip": equipment, "page": pages, "area": base["area"]}
    OUTPUT_CONTENT.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    OUTPUT_REVIEWS.write_text(json.dumps(contexts, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_CONTENT.relative_to(ROOT)} with {len(equipment)} services and {len(pages)} pages")
    print(f"Wrote {OUTPUT_REVIEWS.relative_to(ROOT)} with {sum(len(value) for value in contexts.values())} review contexts")


if __name__ == "__main__":
    main()
