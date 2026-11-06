# Sport 1.4.1 – Geräteillustrationen

Alle elf Zeichnungen wurden vor und nach der Überarbeitung gerendert und angesehen. Die konstruktive Prüfung und Recherche erfolgten am 20.10.2026; die elf Endgrafiken wurden am 06.11.2026 nochmals als gerenderte Übersicht betrachtet. Der dunkle Hintergrund (#090D17), schmale grüne Hauptlinien, graue Nebenlinien und die räumliche Perspektive bleiben erhalten.

## Befunde und Korrekturen

Die korrigierten Konstruktionen sind als Gerätetypen plausibel. Maße, verdeckte Seilübersetzungen und genaue Einstellbereiche sind schematisch. Die Zeichnungen dienen der Geräteerkennung und bilden keine konkreten Studiomodelle oder Übungsanleitungen ab.

| Gerät | Zuordnung | Vorher | Korrektur | Referenz |
|---|---|---|---|---|
| [Smith-Maschine mit Schrägbank](../public/exercises/smith-incline.svg) | Schrägbankdrücken | Bank und Hantelführung wirkten unabhängig; Anschläge waren kaum erkennbar. | Zwei Führungsschienen mit Schlitten, Fangpositionen, Sicherheitsanschlägen und mittig unterstützter Schrägbank. | R1, R8 |
| [Pec Deck / Pectoral Fly](../public/exercises/pec-deck.svg) | Butterfly | Eine durchgehende Querstange ließ den Drehmechanismus unklar. | Getrennte Armhebel mit vertikalen Drehachsen, verbundene Griffe, Sitz und Rückenpolster. | R2 |
| [Doppel-Kabelzug](../public/exercises/cable-tower.svg) | Pushdowns am Seil, Einarmige Katanas, Rope Hammer Curls, Einarmige Bayesian Curls, Kabel-Crunches | Seilenden, Rollenposition und Gewichtsübertragung waren nur angedeutet. | Zwei Gewichtsblöcke, Führungsstangen, verstellbare Umlenkrollen und Seilwege bis zu den Griffen. | R3 |
| [Scheibenbeladener Pullover](../public/exercises/pullover.svg) | Pullover | Hohe Rollen und unverbundene Polster erinnerten an einen Kabelturm. | Schulterdrehpunkte, zusammenhängender Überkopfhebel, Ellenbogenrolle, Gegenarm und Oberschenkelauflage. | R4 |
| [Brustgestützte Rudermaschine](../public/exercises/row-machine.svg) | Enges Rudern, Breites Rudern | Griff- und Polsterpositionen waren schwer als Ruderstation zu lesen. | Sitz hinter Bruststütze, getrennte Hebel, enge und breite Griffe sowie Fußstützen. | R5 |
| [45-Grad-Schlittenbeinpresse](../public/exercises/leg-press.svg) | Beinpresse, Wadenheben | Fußplattform und beweglicher Schlitten waren nicht eindeutig getrennt. | Fester Sitz, parallele Schienen, geführter Schlitten, quer zur Bahn stehende Fußplatte und Scheibenaufnahme. | R6 |
| [Sitzender Beinstrecker](../public/exercises/leg-extension.svg) | Beinstrecken | Drehpunkt lag zu hoch; Sitz und Unterschenkelrolle wirkten unverbunden. | Knieachse an Sitzvorderkante, abwärts gerichteter Hebel, Unterschenkelrolle und Haltegriffe. | R7 |
| [Liegender Beinbeuger](../public/exercises/lying-leg-curl.svg) | Liegende Beinbeuger-Curls | Liegefläche, Knieachse und Fersenpolster wirkten wenig zusammenhängend. | Zweiteilige Liegefläche mit Hüftwinkel, Knieachse am Polsterende und Hebel mit Fersenrolle. | R9 |
| [Kurzhanteln und verstellbare Bank](../public/exercises/dumbbells-bench.svg) | Seitheben sitzend, Schulterdrücken sitzend, Schwere Shrugs, Einarmiges Rear-Delt-Rudern, Hammer-/Bizeps-Curls im Wechsel | Polster und Hanteln wirkten teilweise mit dem Rahmen verschmolzen. | Getrennte Polster, Drehpunkt, Stützstrebe, Einstellrastung und zwei vollständige Hanteln neben der Bank. | R8, R10 |
| [Gerade Langhantel](../public/exercises/barbell.svg) | Rumänisches Kreuzheben | Eckige Klemmteile und schwebende Enden waren missverständlich. | Durchgehende Griffstange, Rändelungsbereiche, Aufnahmeschäfte und symmetrische Scheiben mit Sicherungsringen. | R11 |
| [Tiefer Kabelzug mit Fußmanschette](../public/exercises/cable-ankle.svg) | Einbeinige Adduktion | Kaum vom gewöhnlichen Kabelturm zu unterscheiden. | Einzelsäule, bodennahe Rolle, verbundenes Seil, D-Ring und separate offene Manschette. | R3 |

## Vollständige Zuordnung

Die zentrale Zuordnung in `src/exercise-images.ts` umfasst alle 21 Übungen. Gleiche Gerätetypen teilen sich eine Zeichnung. Die Kabelzeichnung zeigt Einhandgriffe; Seil, Katana und andere Aufsätze sind Varianten desselben Turms. Für ein konkretes Gerät kann ein eigenes Foto genutzt werden.

| Übungs-ID | Übung | SVG |
|---|---|---|
| `incline_smith_press` | Schrägbankdrücken | `smith-incline.svg` |
| `pec_deck` | Butterfly | `pec-deck.svg` |
| `seated_lateral_raise` | Seitheben sitzend | `dumbbells-bench.svg` |
| `seated_shoulder_press` | Schulterdrücken sitzend | `dumbbells-bench.svg` |
| `rope_pushdown` | Pushdowns am Seil | `cable-tower.svg` |
| `single_arm_katana` | Einarmige Katanas | `cable-tower.svg` |
| `pullover_machine` | Pullover | `pullover.svg` |
| `close_grip_row` | Enges Rudern | `row-machine.svg` |
| `heavy_shrugs` | Schwere Shrugs | `dumbbells-bench.svg` |
| `rope_hammer_curls` | Rope Hammer Curls | `cable-tower.svg` |
| `single_arm_bayesian_curls` | Einarmige Bayesian Curls | `cable-tower.svg` |
| `single_arm_rear_delt_row` | Einarmiges Rear-Delt-Rudern | `dumbbells-bench.svg` |
| `leg_press` | Beinpresse | `leg-press.svg` |
| `leg_extension` | Beinstrecken | `leg-extension.svg` |
| `romanian_deadlift` | Rumänisches Kreuzheben | `barbell.svg` |
| `lying_leg_curl` | Liegende Beinbeuger-Curls | `lying-leg-curl.svg` |
| `single_leg_adduction` | Einbeinige Adduktion | `cable-ankle.svg` |
| `calf_raise_leg_press` | Wadenheben | `leg-press.svg` |
| `cable_crunches` | Kabel-Crunches | `cable-tower.svg` |
| `wide_grip_row` | Breites Rudern | `row-machine.svg` |
| `alternating_hammer_curls` | Hammer-/Bizeps-Curls im Wechsel | `dumbbells-bench.svg` |

## Darstellung, Reproduzierbarkeit und Rechte

- Einheitliches 460 × 360 Seitenverhältnis; keine externen Bildreferenzen, Skripte, Rasterbilder, Logos, Personen oder sichtbaren Beschriftungen.
- 164.814 Byte SVG gesamt statt 177.248 Byte (rund 7 % kleiner). Die Darstellungen wurden im Originalformat sowie als Übersicht geprüft; Browserprüfungen stehen im [QA-Audit](SPORT_FULL_QA_AUDIT.md).
- Ein eigenes Foto hat Vorrang. Beim Entfernen erscheint die Standardgrafik erneut. Bei Ladefehlern bleibt ein verständlicher Fallback. Im Training kann die Illustration vergrößert und per Escape geschlossen werden.
- Reproduzierbar mit `python3 scripts/draw-equipment.py` ohne Zusatzbibliotheken. Eigenständig für Sport App erstellt, OpenAI Codex, CC0-1.0. Tatsächliche Quelle jeder Grafik: ihre Datei in diesem Repository; siehe [ASSET_CREDITS.md](../ASSET_CREDITS.md).
- Die Herstellerseiten dienten nur der sachlichen Orientierung zu Gerätetyp und Bauteilen. Herstellerbilder wurden weder kopiert noch veröffentlicht. Die Herkunft des ursprünglichen Stilreferenzbildes ist nicht nachgewiesen.

- R1: Life Fitness / Hammer Strength, [Smith Machine](https://www.lifefitness.com/en-us/catalog/strength-training/benches/smith-machine).
- R2: Life Fitness / Hammer Strength, [Axiom Pectoral Fly / Rear Deltoid](https://shop.lifefitness.com/products/axiom-series-pectoral-fly-rear-deltoid).
- R3: Life Fitness / Hammer Strength, [Dual Adjustable Pulley](https://www.lifefitness.com/en-eu/catalog/strength-training/cable-machines-functional-trainers/life-fitness-dual-adjustable-pulley-with-progressive-stabilization).
- R4: Life Fitness / Hammer Strength, [Plate Loaded Pullover](https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-pullover).
- R5: Life Fitness / Hammer Strength, [Axiom Seated Row](https://www.lifefitness.com/de-de/produkte/strength-training/steckgewichten/axiom-series-seated-row).
- R6: Life Fitness / Hammer Strength, [Plate Loaded Linear Leg Press](https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-linear-leg-press).
- R7: Life Fitness / Hammer Strength, [Select Leg Extension](https://www.lifefitness.com/en-eu/catalog/strength-training/selectorized/hammer-strength-select-leg-extension).
- R8: Life Fitness / Hammer Strength, [Verstellbare Trainingsbänke](https://www.lifefitness.com/en-us/catalog/strength-training/benches).
- R9: Life Fitness / Hammer Strength, [Select Leg Curl](https://www.lifefitness.com/en-eu/catalog/strength-training/selectorized/hammer-strength-select-leg-curl).
- R10: Life Fitness / Hammer Strength, [Kurzhanteln](https://www.lifefitness.com/en-us/catalog/accessories/dumbbells-fixed-barbells).
- R11: Life Fitness / Hammer Strength, [Langhanteln und Scheiben](https://www.lifefitness.com/en-us/catalog/accessories/barbells-plates).
