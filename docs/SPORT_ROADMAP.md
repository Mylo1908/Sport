# Sport – Roadmap nach dem Qualitätsaudit

Stand: 06.11.2026. Die Vorschläge bauen auf den vorhandenen Plänen, Satzwerten, Journalen und Backups auf. P1 = zuerst, P2 = danach, P3 = optional. Aufwand in groben Entwicklungstagen, ohne Zusage eines Zeitplans. Kernfunktionen sollen im kostenlosen Firebase-Rahmen nutzbar bleiben.

| Priorität | Vorschlag | Konkreter Nutzen | Voraussetzung / Aufwand |
|---|---|---|---|
| P1 | Praxistest auf iPhone und Android | Tastatur, Safe Areas, PWA, Sperren und Fortsetzen mit realem Gerät absichern. | Je ein echtes Gerät; 1 Tag. |
| P1 | Kompakter Fokus auf den nächsten Satz | Aktuellen Satz, Vorwert, große Schritt-Tasten und Timer zusammen anzeigen; weniger Scrollen. | Bestehende Satzkarten; 2–3 Tage. |
| P1 | Abgleichstatus je Datensatz | Bei Offline-Änderungen und Konflikten verständlich zeigen, was auf welchem Gerät gespeichert ist. | Vorhandene Revisionen und Konfliktarchiv; 2–3 Tage. |
| P1 | Wiederherstellung vorab prüfen | Vor Import die Zahl neuer, bestehender und kollidierender Daten zeigen; Probeimport mit Ergebnisliste. | Backup-Validator und Duplikaterkennung; 2–3 Tage. |
| P2 | Satzkorrektur rückgängig machen | Versehentlich bestätigten Satz oder Notizänderung unkompliziert zurücknehmen. | Gezielte Undo-Historie pro Entwurf; 1–2 Tage. |
| P2 | CSV-Export und geprüfter Fremdimport | Trainingstabellen öffnen und vorhandene Logs übernehmen, inklusive Gerätezuordnung und Vorschau. | JSON bleibt verlustfreies Backup; CSV-Schema und Deduplizierung; 2–4 Tage. |
| P2 | Eigene Favoriten und Studio-Gerätevarianten | Oft genutzte Übungen schneller wählen, Fortschritte verschiedener Geräte getrennt vergleichen. | Bestehender Katalog und historische Snapshots; 2–3 Tage. |
| P2 | Scheibenrechner und Aufwärmstufen | Ein eingetragenes Hantelgewicht auf vorhandene Scheiben verteilen, optionale Warm-up-Sätze vorbereiten. | Hantelgewicht, verfügbares Inventar, manuelle Bestätigung; 2–3 Tage. |
| P2 | Planstände speichern und vergleichen | Programme duplizieren und zwischen Phasen wechseln, während alte Trainings nachvollziehbar bleiben. | Versions-IDs, ausdrücklich ausgewählte aktive Vorlage; 3–5 Tage. |
| P2 | Übungsdetails mit Rücksprung zum Rekord | In wenigen Schritten einen Wert, die Originaleinheit und die vergleichbare Variante sehen. | Bestehender Analyseindex, Zeitraumfilter; 2–3 Tage. |
| P2 | Progressionsregeln verständlich einstellen | Schrittweite, Mindestzahl vergleichbarer Einheiten und Zielbereich je Übung; Vorschläge begründen. | Stabile Varianten und bestätigte Sätze; 3–5 Tage. |
| P2 | Datenmenge und Erststart entlasten | Cloud-Datensätze nur bei Änderung neu berechnen, Verlauf seitenweise anzeigen, Firebase und Statistik später laden. | Messbarer Vergleich mit langer Historie, Offline-Cache-Tests; 3–5 Tage. |
| P3 | Supersätze mit getrennten Werten | Zwei Übungen in sinnvoller Folge protokollieren, ohne Satzstatus und Statistiken zu vermischen. | Gruppenkennungen im Entwurf und kompatibler Import; 3–5 Tage. |
| P3 | Journaltrend und Aktivitätsimport | Schlaf, Aktivität und Training nebeneinander sehen; fehlende Werte sichtbar lassen. | Manuelle Werte oder freiwilliger Dateiimport; 3–5 Tage. Native Gesundheitsanbindung separat prüfen. |
| P3 | Gezieltes Teilen mit Freunden | Einzelnen Trainingsbericht oder Plan nach Vorschau freiwillig freigeben. | Neues Berechtigungsmodell, Entzug, Tests gegen Fremdzugriff und ausdrückliche Freigabe; deutlich größer als eine normale Funktion. |

## Vergleich mit vorhandenen Apps

Gezielt ausgewählte Funktionen aus Anbieterquellen; daraus folgen Vorschläge für Sport, keine Übernahme fremder Pläne oder Assets.

- [Strong](https://www.strong.app/): CSV, Warm-up-Rechner und Supersätze sind Anhaltspunkte für lokal umsetzbare Eingabehilfen.
- [Hevy](https://www.hevyapp.com/features/gym-performance/): Übungsbezogene Kennzahlen und der Sprung zur Ursprungseinheit sprechen für einen kurzen Weg vom Rekord in den Verlauf.
- [Alpha Progression](https://alphaprogression.com/en): Gewichts- und Wiederholungsvorschläge anhand bisheriger Leistung. Für Sport zuerst transparente lokale Regeln ausbauen.
- [GymRun](https://play.google.com/store/apps/details?hl=de&id=com.imperon.android.gymapp): Der Anbieter stellt anpassbare Trainingsprotokollierung und Geräteintegration heraus. Für Sport zuerst die Bedienung auf kleinen Anzeigen verbessern.
- [Fitbod](https://help.fitbod.me/hc/en-us/articles/360006269014-Muscle-Recovery): Einbeziehung außerhalb der App erfasster Aktivitäten. Bei Sport genügt zunächst ein freiwilliges Journal mit klarer Quellenangabe.
- [Boostcamp](https://www.boostcamp.app/features): Strukturierte Programme und Protokollierung. Der passende kleine Schritt ist die Verwaltung eigener Planstände.

## Empfohlene Reihenfolge

1. **1.5 – Alltag:** reale Mobilabnahme, kompakte Satzeingabe, verständliche Abgleich- und Importvorschau, weniger Datenarbeit bei langen Verläufen.
2. **1.6 – Auswertung:** eindeutige Varianten, Rekorddetails, Planstände, nachvollziehbare Progressionsregeln und optional Scheibenrechner.
3. **1.7 – Journal:** Aktivitätsimport und Trends mit Quellenangabe. Gesundheitsdaten nur nach ausdrücklicher Freigabe; keine medizinischen Schlüsse aus unvollständigen Einträgen.
4. **2.0 – Teilen:** erst bei Bedarf und nach eigener Berechtigungsprüfung; private Daten sind der Standard. Keine öffentliche Registrierung im aktuellen System.
