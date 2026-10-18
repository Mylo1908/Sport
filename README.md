# SPORT 1.0

Eigenständige deutschsprachige React-/TypeScript-/Vite-App. Von Layer unabhängig.

## Lokal starten

Node.js 24 LTS verwenden. Im entpackten Ordner:

```sh
npm ci
npm run dev
```

Adresse: http://localhost:5173/Sport/

```sh
npm test
npm run build
npm run preview
```

`dist/` enthält bereits den geprüften Produktionsbuild. Für Offlinebetrieb/PWA sind HTTPS oder localhost erforderlich. Die Dateien nicht per Doppelklick als file:// öffnen.

## Veröffentlichung: ausschließlich Mylo1908/Sport

1. Auf GitHub ein **neues öffentliches Repository `Mylo1908/Sport`** ohne README erstellen. Keine Dateien oder Einstellungen von Layer ändern.
2. Den Inhalt dieses Projektordners (einschließlich `.github/workflows/pages.yml`, ohne node_modules und dist) auf den Branch `main` übertragen. Alternativ mit Git:

```sh
git init -b main
git add .
git commit -m "Create independent Sport training app"
git remote add origin https://github.com/Mylo1908/Sport.git
git push -u origin main
```

3. Nur in Sport: Settings → Pages → Build and deployment → Source: **GitHub Actions**. Den Workflow `Build, test and deploy Sport` ausführen oder den nächsten Push abwarten.
4. Nach erfolgreichem Deployment ist die vorgesehene Adresse https://mylo1908.github.io/Sport/ . Erst danach auf iPhone und Desktop prüfen: Training starten, Satzwerte eingeben, pausieren, neu laden, fortsetzen, abschließen, Backup exportieren/importieren und anschließend offline öffnen.

Der Workflow führt Tests und Build aus und veröffentlicht ausschließlich `dist/`. Die Pfade im Build und Service Worker sind auf `/Sport/` eingestellt.

## Funktionen

- Dashboard, Trainingsmodus, Wochenplan, Kalender, Verlauf/Bestleistungen, Einstellungen.
- Sieben Tage, 21 eindeutige Übungen und 66 geplante Arbeitssätze aus dem vorgegebenen Plan.
- Warm-up, Satzstatus, kg und Wiederholungen, Schritte, Laufstrecke, Basketball, Schlaf und Notizen.
- Erledigt, übersprungen, nicht absolviert und unbekannt sind getrennt. Ist-Auswertungen zählen nur gespeicherte, erledigte Sätze mit vollständigen Zahlen.
- Zwischenspeicherung bei jeder Änderung, Pause und Wiederaufnahme; abschließende Prüfung mit Korrekturmöglichkeit.
- Neutrale Geräteplatzhalter und eigene lokale JPG-/PNG-/WebP-Fotos bis 3 MB je Übung.
- IndexedDB-Stores für Plan, Übungen, Einheiten, Entwurf und Einstellungen. Explizite Meldung bei Speicherfehlern.
- Validierter JSON-Import mit Vorschau/Bestätigung, atomarer Speicherung und Duplikatprüfung. Vorhandene Einheiten/Fotos/Entwürfe haben Vorrang.
- PWA-Manifest und beim Build erzeugter Service Worker mit vollständiger Assetliste und versioniertem Offlinecache.

## Private Daten und Backup

Der öffentliche Ausgangsplan enthält keine persönlichen Trainingswerte. Die mitgelieferte private historische JSON-Datei gehört **nicht in dieses Projekt und nicht auf GitHub**. Auch die ursprüngliche PDF und das Vorbereitungs-ZIP dürfen nicht ins öffentliche Repository.

Zum privaten Import: Die historische JSON-Datei aus dem ursprünglichen Vorbereitungs-ZIP auf dem eigenen Gerät entpacken, in der App unter Einstellungen auswählen und den Import bestätigen. Der Import bleibt ausschließlich in IndexedDB dieses Browsers.

Das JSON-Backup enthält Einheiten, den aktiven Entwurf und eigene Fotos/Einstellungen. Der unveränderliche Ausgangsplan ist Bestandteil der App. Backups enthalten persönliche Daten und sollten privat aufbewahrt werden. Duplikate werden anhand ID oder Kombination Datum/Startzeit/Trainingstyp erkannt; Konflikte überschreiben keine vorhandenen Einheiten. Trainingseinheiten zur selben Minute desselben Typs werden beim Import vorsichtshalber als Duplikat behandelt.

Keine geräteübergreifende Synchronisierung. Browserdatenlöschung entfernt lokale Trainingsdaten. Regelmäßig exportieren. Installation und Speicherverfügbarkeit hängen vom Browser ab; für Safari und installierte Apps können getrennte Datenbestände bestehen.

## Prüfstand und Grenzen

- TypeScript-Prüfung und Produktionsbuild erfolgreich.
- Sieben automatisierte Tests erfolgreich: Plan-/Muskelzahlen, leere Entwürfe, Satzstatus, Backupvalidierung, Duplikate, historischer Import, vorherige Leistungen und IndexedDB-Persistenz (simuliertes IndexedDB mit fake-indexeddb).
- Private Originaldatei zusätzlich außerhalb des Projektverzeichnisses auf Importkompatibilität geprüft; sie ist weder Testfixture noch öffentliches Asset.
- Öffentliche Quelldateien und Build auf private Einträge kontrolliert.
- Mobiles Layout per CSS vorbereitet. Ein echter Browser-/iPhone-Test, tatsächlicher Offline-Neustart und Live-Deployment wurden in dieser Umgebung **nicht durchgeführt**, da kein zulässiges Browser-Testwerkzeug und kein Repository-Erstellungs-/Pages-Werkzeug verfügbar waren.
- Die GitHub-Verbindung lieferte für Sport und Layer HTTP 404. Repository-Verfügbarkeit und Rechte sind damit nicht abschließend feststellbar. Die vorhandenen GitHub-Werkzeuge bieten keine Repository-Erstellung oder Pages-Konfiguration an. Deshalb wurde das ausdrücklich erlaubte ZIP-Fallback geliefert. **Es wurde kein GitHub-Repository erstellt und keine Website veröffentlicht.**

Ein Planeditor und weitergehende Analysen sind nicht Teil dieser ersten Version.
