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
