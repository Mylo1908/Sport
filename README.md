# Sport 1.1 – Geräteillustrationen und Trainingsfortsetzung

Neu: elf eigene technische Neon-Line-Art-SVGs für alle 21 Übungen. Bildzuordnung: `src/exercise-images.ts`. Eigene Fotos haben Vorrang; „Eigenes Foto entfernen“ stellt die Standardzeichnung wieder her. Bei Ladefehler eines Fotos wird erst die Standardzeichnung versucht. Quellen/Freigaben: [ASSET_CREDITS.md](ASSET_CREDITS.md).

Aktive Entwürfe öffnen nach Neuladen direkt unter „Mein Training“. Pause wird erst nach erfolgreicher IndexedDB-Speicherung angezeigt. Datenbankname, Version und Stores bleiben unverändert; keine Migration und keine Löschung vorhandener Trainingsdaten/Fotos. Die neuen Zeichnungen werden vom Service Worker offline vorgehalten.

Geprüft: zehn automatisierte Tests und TypeScript-/Produktionsbuild. Darunter Wiederöffnen mit neuer Datenbankverbindung, Satzwerte ergänzen, Abschluss/Verlauf und Backup mit erhaltenen vorherigen Einheiten/Fotos. Illustrationen als Rastervorschau visuell geprüft. Echte iPhone-, Sperrbildschirm- und mobile Browsertests waren in der Arbeitsumgebung nicht verfügbar; diese werden nicht als bestanden behauptet.

Lokaler Start: Node.js 24, `npm ci`, `npm run dev`; dann http://localhost:5173/Sport/ . Prüfungen: `npm test`, `npm run build`. Veröffentlichung erfolgt über `.github/workflows/pages.yml`, Pages-Quelle „GitHub Actions“, ausschließlich in `Mylo1908/Sport`. `dist/` wird erzeugt, nicht als Quellcode eingecheckt.

Daten sind ausschließlich browserlokal. Regelmäßig unter Einstellungen JSON-Backups exportieren; keine automatische Gerätesynchronisierung. Private Trainingsprotokolle, Fotos, PDFs und Backups niemals in das öffentliche Repository aufnehmen. Der historische Trainingsimport erfolgt ausschließlich im eigenen Browser.

