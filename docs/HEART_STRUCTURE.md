# V0.3 mechanical heart — construction reference

An independent experiment on `codex/v03-mechanical-heart`. The preceding brain
prototype is retained at `experiments/brain-v02/index.html` and `src/artwork/exhibit.mjs`.

The heart is an asymmetric pump: a dominant tapered left ventricle ends in a
left-offset apex; a shorter right pumping chamber and two unequal atrial housings
join the upper base. Three ascending vessel fittings, an arched aortic manifold,
and a posterior return circuit distinguish the silhouette from a brain or ♥.
Shape reference: https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy

Parts, grouped by assembly:

- Stand: four feet, four collars, cast plinth, bronze lip, steel instrument deck,
  corner bolts, engraved plate, plate bolts, engraving rail, spindle and stylus.
- Chamber: lower seating ring, glass segments, four stanchions, four caps,
  upper sealing ring, crown and thin inset glass cap.
- Steam supply: boiler, boiler feet and end plates, regulator, pressure gauge,
  feed couplings, copper supply line, rear return line, condenser, two exhaust
  stems and two nozzle bodies. All exhaust origin coordinates are recorded.
- Heart: tapered ventricular casting, shorter right casting, unequal atrial
  housings, vessel necks, collars, aortic elbow, pulmonary outlet, rear return
  interfaces, silver ribs, dark service bridge, violet calculation core.
- Drive: eccentric disk, hub, crank pin, two connecting rods, piston barrels,
  movable pistons, ventricular slide frames and bearings.
- Valves: three small service shutters, visible hinge barrels, hinge pins and
  hard stops; shutters rotate individually while the whole exhibit turns.
- Offerings: telegraph key and lever, paper printer and ribbon, memory drum,
  supports and strip, paired pen rails and carriages, drawing desk, palm sensor,
  flower spindle, six hinged gear-flower petals.

Four views share these world coordinates. Front shows the service shutters and
nameplate; right side shows the smaller ventricle and input drive; rear shows the
condenser, aortic return and eccentric; rear three-quarter shows the assembled
transmission. A slide never becomes a CSS scale. Scene orbit and pumping phase
are independent inputs to the Anatomy group poses.

One mechanical state owns pressure, phased chamber travel, crank angle, valve
angles, light and finite vent pulses. UI offerings retain the v1 storage key;
mechanical events run one at a time, without erasing previously completed results.

No acceptance is claimed here: geometry, motion, browser workflows, screenshots
and measured performance are recorded after the experiment is built.
