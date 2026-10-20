# Sport 1.2 – Better Workout

Kostenloser, lokaler Trainingsbegleiter mit React, TypeScript, Vite, IndexedDB und GitHub Pages. Website: https://mylo1908.github.io/Sport/

## Bedienung

- **Wochenplan → Trainingsplan bearbeiten:** Übungen suchen/filtern, hinzufügen, austauschen, verschieben, entfernen; eigene Übungen erstellen; Tage benennen oder als Ruhetag festlegen; beliebige Satzanzahlen innerhalb eines technischen Sicherheitslimits von 100 Sätzen je Übung; je Satz freiwillige Wiederholungsziele und Aufwärmsatztyp. Speichern und Verwerfen sind getrennt.
- Der unveränderte Ausgangsplan bleibt in `src/plan.json` erhalten. Geplante Tage/Sätze/Muskelvolumen werden aus der eigenen Vorlage berechnet.
- **Mein Training:** Vorwerte ausdrücklich übernehmen (bleiben unbestätigt), Gewicht/Wiederholungen eintragen, Satz abschließen. Große +/- Tasten, pro Übung einstellbare Gewichtsschritte; optionale RIR-Eingabe. Warm-up-Sätze zählen nicht zum Arbeitssatzvolumen oder den Bestleistungen.
- **Übungen & Sätze ändern:** Änderungen nur für heute oder ausdrücklich zusätzlich für die zukünftige Tagesvorlage speichern. Erhaltene Sätze behalten ihre Werte über stabile Kennungen. Entfernte Sätze entfallen nur nach Speichern der Bearbeitung. Historische Einheiten werden nicht angepasst.
- **Einstellungen:** Automatik und Standard-Pausendauer; individuelle Pausen/Gewichtsschritte im Editor. Der Timer erlaubt Pause, Fortsetzen, Zurücksetzen, Überspringen und +/-15 Sekunden. Countdown basiert auf gespeichertem Endzeitpunkt. Kein garantierter Hintergrundalarm und keine angeforderten Benachrichtigungsrechte.
- Elf eigene Geräteillustrationen bleiben erhalten; eigene Fotos haben Vorrang. Quellen/Freigaben: [ASSET_CREDITS.md](ASSET_CREDITS.md).

## Datenerhaltung und Backup

**Vor der ersten Nutzung von 1.2 bitte in der bisherigen App ein JSON-Backup exportieren.** Auch danach regelmäßig sichern.

Datenbank `sport-local-v1`, Version 1, und vorhandene Stores bleiben unverändert. Kein Löschen, keine destruktive Migration. Der Benutzerplan verwendet den zusätzlichen Schlüssel `plans/user-v12`; der alte Standardplan bleibt unangetastet. Normales Speichern schreibt nie den mitgelieferten Standardplan über eine Benutzervorlage. Ohne Benutzerplan wird die Ausgangsvorlage verwendet und beim nächsten Speichervorgang gesichert. Vorhandene Einheiten, Fotos und Entwürfe bleiben lesbar. Neue Einheiten speichern Übungsmetadaten als Momentaufnahme. Benutzerübungen werden beim Entfernen aus einem Tag nicht aus dem Katalog gelöscht.

Backupformat 2 enthält Plan, vollständigen Katalog, Einheiten, Entwurf einschließlich Timer und alle Einstellungen/Fotos. Alte Backups (Format 1) und der historische Trainingsimport bleiben unterstützt. Jeder Import wird vor Änderungen vollständig validiert. Duplikate überschreiben keine vorhandenen Einheiten. Fotos/Entwurf/lokale Einstellungen haben Vorrang; eine mitgelieferte Vorlage ersetzt die aktuelle nur bei ausdrücklicher Auswahl. Der Import zeigt Vorschau und Bestätigung. Backups gehören nicht ins öffentliche Repository.

Daten bleiben geräte- und browserlokal; keine automatische Synchronisierung. Browserdatenlöschung entfernt lokale Daten. Änderungen werden sofort gespeichert; vor dem Schließen möglichst auf „Lokal gespeichert“ warten. Speicherfehler werden angezeigt und ein Notfall-Backup angeboten.

## Entwicklung und Prüfung

Node.js 24. `npm ci`, `npm run dev` → http://localhost:5173/Sport/ . `npm test` und `npm run build`. GitHub Actions prüft Tests/Build und veröffentlicht ausschließlich das erzeugte `dist/`.

Automatisiert geprüft: Standardplan/individuelle Pläne, variable Sätze, Tagesänderungen versus Vorlage, unveränderte Historie, Vorwertübernahme ohne Bestätigung, Satzvalidierung, Warm-up-Ausschluss, RIR/alte Daten, Timer über Zeitstempel und Wiederaufnahme, Katalog/Foto-/Entwurferhaltung, alte und neue Backups sowie Ablehnung beschädigter Importe. Echte mobile Browser-, Sperrbildschirm- und Ende-zu-Ende-Klicktests waren in der Arbeitsumgebung nicht verfügbar und werden nicht als bestanden behauptet.

Ausschließlich `Mylo1908/Sport`; keine Änderungen an Layer und keine privaten Trainingsprotokolle im Quellcode.

## Version 1.3 – Progress & Analytics

Der Bereich Verlauf & Statistik bietet Übersicht, Übungsfortschritt, Muskelgruppen, persönliche Rekorde und Trainingshistorie. Globale Filter: 7/30/90 Tage, zwölf Monate, gesamter Zeitraum bis heute. Wochen-/Monats-/Jahresaggregation, Monatsvergleich, Jahresmonate und Kalender ergänzen die Auswertung. Der explizite Soll-Ist-Vergleich verwendet nur die aktuelle Kalenderwoche und die aktuelle Vorlage; es werden keine historischen Sollwerte erfunden.

Reine Funktionen in `src/analytics.ts` berechnen Statistiken aus gespeicherten abgeschlossenen Einheiten. Kein neues Datenbankfeld und keine Schema-/Backupänderung. Format 2 sowie frühere Importformate bleiben erhalten. Analyse wird anhand der Historie und des Katalogs memoisiert und nicht bei jeder Eingabe im laufenden Training neu aufgebaut.

**Zählregeln:** bestätigte Arbeitssätze mit vollständigem, endlichem, nichtnegativem Gewicht und positiver ganzer Wiederholungszahl. Warm-up, offene, übersprungene und unbekannte Sätze sind ausgeschlossen. Einträge mit 0 Wiederholungen erzeugen keine Kraftleistung. Gespeicherte Aktivitäten ohne Kraftsätze erscheinen weiterhin in der Historie und der Zahl aller gespeicherten Einheiten, separat von Krafttrainings. Historische Snapshots haben Vorrang; Katalog-Fallbacks sind gekennzeichnet. Verschiedene Übungsnamen/Geräte/Einseitigkeitsvarianten werden getrennt ausgewertet.

**Volumen:** Summe Gewicht × Wiederholungen, bezeichnet als „Volumenindex aus protokollierten Gewichten“. Keine automatisch umgerechnete Gesamtlast und kein physiologischer Belastungsvergleich verschiedener Maschinen. e1RM ist eine optionale mathematische Näherung nach Epley, nur für 1–10 Wiederholungen mit positivem Gewicht, bei einer Wiederholung das verwendete Gewicht. Mehr Gewicht bei weniger Wiederholungen wird nicht pauschal als Verbesserung dargestellt.

**Rekorde:** Gewichtsmaximum, Wiederholungen bei gleichem Gewicht, Einheitsvolumen und geeignete e1RM. Chronologisch und pro Variante berechnet. Erstwerte und Gleichstände sind getrennt; erneute Importe erzeugen keine doppelt gespeicherten Rekorde. Die Kennzahl „Neue Rekordwerte“ zählt Kategorien, nicht die Zahl der Übungen. Berichte sind nach Abschluss sofort und später über die Historie abrufbar; Indexveränderungen zum Vortraining werden nur bei gleichen Varianten und gleicher Satzanzahl verglichen. Zeitstempel liefern ausschließlich „vergangene Zeit“, einschließlich Unterbrechungen; keine Behauptung gemessener aktiver Trainingszeit.

**Progression:** vollständiges letztes vergleichbares Training, passende Satzanzahl, vollständige aktuelle Zielbereiche, einheitliches Satzgewicht und ausdrücklich eingestellte Gewichtsschrittweite sind nötig. Sind alle oberen Grenzen erreicht, wird ein kleiner optionaler Gewichtsversuch vorgeschlagen; sonst zunächst Wiederholungsfortschritt. Dokumentiertes RIR 0 führt zum Halten. Fehlende Vergleichbarkeit ergibt eine begründete Nichtempfehlung. Keine automatischen Änderungen; ausdrückliche Übernahme ändert nur noch unbekannte Arbeitssätze und bestätigt diese nicht. Die manuelle Vorwertübernahme bleibt bestehen.

**Diagramme:** responsive eigene SVGs ohne zusätzliche Abhängigkeit; Daten per Tippen, Hover, Tastatur oder Datenpunkt-Tasten anzeigen. Jede Grafik enthält eine paginierte Tabelle sämtlicher zugrundeliegender Werte. Längere Reihen werden im Diagramm ausdrücklich als Maximum oder Summe je Gruppe gebündelt (mobil maximal 24, sonst 120 Punkte); Tabellen behalten die Einzelwerte. Historie und Rekorde sind paginiert.

Vor dem Update bitte ein aktuelles JSON-Backup in der bisherigen App erstellen. Automatisierte Referenz-/Regressionsprüfungen umfassen Volumen 280, e1RM 40, Warm-up-Ausschluss, Zeitraum-/Jahresgrenzen, mehrere Einheiten am selben Tag, Snapshots/Fallbacks, Rekorde/Gleichstände/Duplikate, Progressionsbedingungen, unveränderte Daten und wiederaufrufbare Berichte. Echte Browser-, Smartphone- und Sperrbildschirmtests stehen weiterhin aus; CSS/Produktionsbuild und Berechnungen sind geprüft.

## Version 1.3.1 – Mobile Workout

Aktive Trainings verwenden große vertikale Satzkarten: direkt editierbares Gewicht sowie Wiederholungen mit mindestens 48 px großen +/- Tasten, explizite Satzbestätigung, kompakte erledigte Zeilen und getrennte „Weitere Optionen“ für Status, RIR und manuellen Timer. Komma und Punkt werden als Dezimaltrennzeichen akzeptiert; Wiederholungen sind ganzzahlig. Das Öffnen einer erledigten Zeile ändert den Status nicht. Korrekturen starten keinen zweiten automatischen Timer. Erledigt wird erst nach bestätigtem IndexedDB-Schreibvorgang angezeigt. Der nächste unbekannte Satz wird hervorgehoben, ohne automatischen Scrollsprung.

Neue Einheiten erhalten gültige vergangene Satzwerte automatisch als **unbestätigte Vorschläge**, getrennt nach stabiler Übungs-ID, Satztyp und Position. Zusätzliche neue Sätze nach einer Workout-Bearbeitung werden nur bei eindeutigem Vorwert vorbelegt. Bereits existierende Sätze, geladene Entwürfe, bearbeitete Werte und erledigte Sätze werden niemals automatisch neu befüllt. Fehlende Positionen bleiben leer. Es gibt keine Extrapolation von Satz 2 auf Satz 3. Letztwerte stehen an jeder Satzkarte; die Kennzeichnung „Aus letztem Training“ erscheint bei frisch eingesetzten Vorschlägen. Nach Neuladen bleiben die Werte gespeichert und die Vergleichszeile verfügbar; Herkunftsmarkierungen sind nur UI-Zustand und benötigen kein neues Backupfeld. Manuelle Vorwertübernahme bleibt als Zusatzoption erhalten.

Keine Datenbank-/Backupänderung. `src/mobile-workout.ts` kapselt neue Vorwert- und Zahlenlogik; `src/MobileSetCard.tsx` die Darstellung. Bestehende Analytics, Pläne, Fotos und Timer bleiben erhalten. Automatisierte Prüfungen decken passende/falsche/fehlende Vorwerte, Warm-up- und Satzpositionen, variable Satzzahlen, unveränderte Entwürfe, Dezimal-/Ganzzahlbedienung, Bestätigung/Korrektur, Timer, Wiederöffnen und Backup ab.

Die CSS-Abstände/Spalten sind für 320–390 px ausgelegt. Ein tatsächlicher Browserlauf der lokalen schmalen Testansichten konnte nicht ausgeführt werden: der separate Cloud-Browser erreicht den lokalen Entwicklungsserver nicht (`ERR_CONNECTION_REFUSED`). Reale iPhone-, Tastatur-/Sperrbildschirm- und 320/390-px-Browsertests werden deshalb nicht als bestanden behauptet.

## Sport 1.3.2 – Tagesjournal und mobile Eingaben
„Mein Tag“ ist über das Dashboard und das aktive Training erreichbar. Die fünf Hauptnavigationseinträge bleiben erhalten. Tagesdaten werden pro lokalem Datum getrennt von Trainingseinheiten im bestehenden IndexedDB-Store settings unter daily-journal-v1 gespeichert; Datenbankversion und bestehende Stores bleiben unverändert. Backupformat 3 enthält das Journal, Formate 1 und 2 bleiben importierbar. Bei Importkonflikten bleiben vorhandene Journaltage vollständig erhalten; die Vorschau weist darauf hin.

Die Codeanalyse reproduziert leere Übungskarten bei einem aktiven Entwurf ohne Sätze (z. B. Ruhetag). Der bestehende Entwurf wird beim Starten eines anderen Tages bewusst fortgesetzt. Eine Erklärung und ausdrückliches Hinzufügen eines Trainingstages verhindern eine stille leere Ansicht. Das beweist nicht, dass dieser Fall die Ursache auf dem Gerät des Nutzers war. Unbekannte Übungs-IDs zeigen nun Diagnoseangaben und erhalten ihre Sätze. Der Service Worker verwendet inhaltsabhängige Cacheversionen; ein wartendes Update wird nach Schließen aller Sport-Tabs aktiv.

### Manuelle mobile Abnahme
Echte iOS-/Android-Geräte sind in der Arbeitsumgebung nicht verfügbar; lokale Browser-Automation ebenfalls nicht installiert. Build- und Datentests ersetzen diese Prüfung nicht.
1. Bei 320/375/390/430 px Push/Pull/Legs/Upper/Lower öffnen, alle Karten und Sätze bis zum Ende erreichen; Ruhetag-Entwurf und eigene Übung prüfen.
2. iOS Safari / Android Chrome: Schritte, Gewicht (78,5), Laufstrecke und Schlaf fokussieren, Tastatur schließen. Kein Fokuszoom; manuelles Pinch-Zoom weiterhin möglich.
3. Satzwerte eingeben, bestätigen, pausieren, sperren, Browser schließen/öffnen und fortsetzen; Journal öffnen und zurückkehren.
4. Journal an Ruhetag erfassen, mehrere Aktivitäten ergänzen, Datum wechseln und zurückkehren, neu laden. Kalenderpunkt und unveränderte Werte prüfen.
5. Backup exportieren, auf separatem Testprofil importieren; Journal, Trainingshistorie, Fotos, Timer und Plan vergleichen. Import desselben Backups erzeugt keine doppelten Tage.
