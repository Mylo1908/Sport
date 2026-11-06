# Sport 1.4.1 – Qualitätsaudit

Erstanalyse 20.10.2026, Nachprüfung 06.11.2026. Ausgangspunkt: [Sport 1.4](https://github.com/Mylo1908/Sport/commit/c61c159033804d0f52927997588745bfe25410a9). Veröffentlichung: [Sport](https://mylo1908.github.io/Sport/) und [GitHub Actions](https://github.com/Mylo1908/Sport/actions/workflows/pages.yml). `release.json` im veröffentlichten Build nennt Version und Commit.

## Befunde und Korrekturen

| Priorität | Befund | Korrektur und Wirkung |
|---|---|---|
| P1 | Eine ältere Speicherbestätigung konnte neuere Bearbeitungen zurücksetzen. Ein fehlgeschlagener Speichervorgang konnte eine Wiederholung blockieren. | Momentaufnahmen werden in Reihenfolge gespeichert. Ein später Rücklauf darf aktuelle Werte nicht ersetzen. Fehler lassen sich erneut speichern; ein fehlgeschlagener Abschluss behält den Entwurf. |
| P1 | Chromium lud nach dem Offline-Neuladen die Startseite, traf wegen `Vary: Origin` aber nicht auf gespeicherte JS-/CSS-Dateien. | Der Service Worker nutzt den eigenen Cache und eine Positivliste öffentlicher Builddateien; für diese Dateien darf die Header-Variante keine Rolle spielen. |
| P1 | Zwei Tabs konnten vom selben alten Stand aus schreiben. Bei schnellem Wiederöffnen konnte die vorige Sperre noch bestehen. | Mit Web Locks bearbeitet jeweils ein Tab. Ein wartender Tab lädt erst nach Freigabe die dann aktuellen Daten. |
| P1 | Die Wochenübersicht konnte unvollständige Sätze als absolvierte Arbeit zählen. Stabile Satzkennungen konnten versehentlich Werte einer anderen Übung zuordnen. | Auswertung nutzt vollständig absolvierte Arbeitssätze. Doppelte Kennungen werden geprüft; Vorwerte und Satzübernahmen achten auf Übung und bekannte Variante. |
| P1 | Der Cloud-Status zeigte Offline-Eingaben verspätet. Beschädigtes JSON in einem Konflikt konnte dessen Ansicht abbrechen. | Offline- und Vormerkstatus reagieren direkt. Ungültiges JSON bleibt als Text vergleichbar. Die Konfliktentscheidung behält beide Versionen im Archiv. |
| P1 | Vier npm-Befunde in der Produktions-Abhängigkeitskette um gRPC; zusätzlich ein kritischer Archiv-Befund im Entwicklungswerkzeug. | gRPC gezielt auf eine gepatchte Version gebracht; Firebase CLI für Emulatoren aktualisiert. Der Produktionsaudit meldete am 06.11. keine Befunde. |
| P2 | Beim Backup-Import blieben leere Profilfelder unbefüllt. Journal- und Profilzahlen hatten unterschiedliche Regeln; eine Fehlermeldung veränderte den zugänglichen Feldnamen. | Fehlende Profilwerte aus Backup ergänzt. Gemeinsame Zahleneingabe mit Komma, Grenzen, festem Feldnamen und zugeordnetem Fehlertext. Vorhandene Werte bleiben erhalten. |
| P2 | Lokale Eingaben schrieben unveränderte Sitzungen und Fotos erneut. | Unveränderte Datenbereiche werden bei Entwurfseingaben ausgelassen. Schreibfehler brechen die Transaktion ab, statt Teilergebnisse zu übernehmen. |
| P2 | Geräte waren teils mechanisch unplausibel und auf kleinen Karten schwer erkennbar. | Elf SVGs neu konstruiert, vergrößerbarer Dialog, eigene Fotos weiterhin zuerst. Details im [Illustrationsaudit](SPORT_ILLUSTRATION_AUDIT.md). |
| P2 | Kleine Schrift, niedriger Kontrast und enge Elemente erschwerten Bedienung und Reflow. | Mobile Eingaben ab 16 px, flexible Abstände, sichtbarer Fokus, beschriftete Navigation, Skiplink und besserer Kontrast. Manuelles Vergrößern bleibt möglich. |
| P3 | Wiederholte Motivations- und Marketingtexte. | Durch sachliche Überschriften, Status und hilfreiche Hinweise ersetzt. Dunkle Gestaltung und Akzentfarben erhalten. |

## Testnachweis

| Prüfung | Ergebnis / Grenze |
|---|---|
| TypeScript, Vite, Service Worker | Build lokal bestanden. Der separate Testbuild verwendet synthetische Daten und einen Cloud-Ersatz; er wird nicht mit Pages veröffentlicht. |
| `npm test` | 57 bestanden: Speichern, Rückläufe, Abbruch, Vorwerte, Backup/Import, Plan, Timer, Journal, Auswertung, SVG-Zuordnung und Cloud-Logik. |
| Firebase Emulatoren | 2 von 2 bestanden. Authentifizierung und Firestore-Regeln: Besitzer, fremde und anonyme Nutzer, Admin-GET, verweigerte Schreib- und Listenoperationen, Revisionen und Konflikte. Details im CI-Lauf. |
| Playwright | 30 von 30 bestanden, je 15 mit Chromium und WebKit. Offline-Neuladen und Fortsetzen, Tabwechsel, Backup/Import, Gerätebilder und die automatisierten Barrierefreiheitsprüfungen sind grün. |
| Abhängigkeiten | `npm audit --omit=dev`: 0 Befunde beim abschließenden lokalen Produktionsaudit. Die Entwicklungswerkzeuge sind gesondert zu betrachten. |
| Live-Konto / Admin | Im produktiven Vorlauf waren vorhandener Login, erneute Anmeldung, serverseitiger Admin-Zugriff und das Speichern sowie Wiederladen einer harmlosen Einstellung bestätigt. Der Ausgangswert wurde zurückgesetzt. Live-Nachweis zum Release: siehe Abschluss und veröffentlichter Workflow. |

Im [abschließenden Prüfbranch-Lauf](https://github.com/Mylo1908/Sport/actions/runs/42263665241) bestanden alle 89 Tests; Build und Produktionsaudit waren ebenfalls erfolgreich.

Der erste Browserlauf am 20.10. bestand 21 von 30 Tests, darunter sämtliche Layoutbreiten. Neun Fehlschläge betrafen Wiederöffnen/Tabwechsel, verlorene Revisionen im synthetischen Server, den Feldnamen bei Fehlern und Kontrast. Die Reparatur behält die Tests als Freigabekriterium. Im Folgelauf blieben drei Fehlschläge: der Chromium-Cachetreffer und zwei Textfeld-Lokatoren. Die Spur zeigte die gespeicherten Notizen in beiden Browsern. Der Tabtest prüft den zugänglichen Textfeldnamen direkt. Browserprotokolle und Screenshots enthalten ausschließlich künstliche Daten.

Der CI-Lauf nutzt Chromium und WebKit aus dem [offiziellen Playwright-Image](https://playwright.dev/docs/ci) passend zur Paketversion 1.64.1. So entfällt die nachträgliche Installation der Browser und Systempakete im Job.

Die Browserprüfungen decken Trainingseingabe, Satzkorrektur und RIR, Timer, Offline-Neuladen, Abschluss und Backup-Import ab. Dazu kommen dauerhafte und tagesbezogene Planänderungen, eigene Übungen und Aufwärmsätze, Journaldaten und Dezimaleingaben, Fotos, Cloud-Konflikt und Tabwechsel. Repräsentative Aufnahmen bei 390 und 1280 px wurden auch visuell geprüft. Die kurze Mobilnavigation verhindert Wortumbrüche; die Trainingsaktionen teilen sich den Platz einer Zeile. Die Layoutbreiten sind 320, 375, 390, 430, 768, 1024 und 1280 px. 640 px prüfen den Reflow bei der halben Breite eines 1280-px-Viewports. Das ist kein Test von nativem Browserzoom, echter iPhone-Tastatur oder installiertem iOS-Home-Screen. axe deckt ausgewählte automatisierbare Kriterien ab; keine vollständige WCAG-Konformitätsaussage.

## Daten und Zugriff

- IndexedDB-Schema, Konten, Besitzer- und Admin-UID sowie bestehende Cloud-Sicherheitsregeln bleiben bestehen. Die App speichert Fotos nur lokal und im Backup. Es wird keine Migration ausgelöst.
- Frühere JSON-Backups bleiben unterstützt. Im Import haben bestehende Daten Vorrang. Ein vorhandener Entwurf wird nicht durch einen Import ersetzt; nur eine ausdrückliche Auswahl ersetzt die Planvorlage. Unterschiedliche Varianten werden nicht als vergleichbare Leistung behandelt.
- Firebase-Clientkonfiguration ist öffentlich und erteilt keine Zugriffsrechte. Authentifizierung und Firestore prüfen den Zugriff; der Admin-Bereich verlangt zusätzlich einen serverseitigen Check. Keine öffentliche Registrierung und kein zusätzlicher Admin.
- Konflikte und Fehlschläge zeigen Status an, statt Daten still zu überschreiben. Die Erstübernahme von Daten des Originalgeräts bleibt ein separater Schritt nach lokalem Backup und ausdrücklicher Auswahl.
- Keine produktiven Trainingsdaten wurden bearbeitet, kopiert oder ins Repository geschrieben. Keine Änderung an `Mylo1908/Layer`, Firebase-Tarif, Abrechnung oder Zahlungsdaten.

## Leistung und verbleibende Arbeit

Lokaler Build: rund 902 kB JavaScript (272 kB gzip) und 28 kB CSS (7 kB gzip). Die SVG-Summe sank von 177.248 auf 164.814 Byte. Verwendete Gerätebilder laden verzögert. Der Service Worker versieht den Cache mit einem Inhaltsfingerabdruck; geänderte Quellen bekommen eine neue Cache-Version.

Ein synthetischer Node-24-Lauf am 20.10. mit je zwölf Sätzen pro Einheit ergab bei 1.000 / 5.000 Einheiten rund 39 / 159 ms für den Analyseindex und 70 / 252 ms für die Cloud-Kanonisierung. Das sind lokale Einzelmessungen ohne Browser-Rendering. Keine Lighthouse- oder Mobil-Leistungszahl. Die vollständige Kanonisierung und der große Firebase-Anteil bleiben Ansatzpunkte.

| Priorität | Offen und Auswirkung | Nächster Schritt |
|---|---|---|
| P2 | Echte iOS- und Android-Abnahme, insbesondere PWA, Tastatur, VoiceOver/TalkBack und Hintergrundwechsel. Es stand kein physisches Gerät zur Verfügung. | Mit Testentwurf auf den Zielgeräten prüfen. |
| P2 | Produktionsbundle und große Historien; auf schwachen Geräten kann Start oder Abgleich länger dauern. | Firebase/Analysen bedarfsgerecht laden, Kanonisierung nach Datensatz ändern und erneut messen. |
| P2 | 15 npm-Befunde in Entwicklungswerkzeugen (1 hoch, 14 mittel, 0 kritisch; Stand 06.11.). Sie sind im Produktionsbundle nicht enthalten; ein erzwungenes Downgrade der CLI wäre kein sauberer Fix. | Gepatchte CLI/Unterabhängigkeiten übernehmen, sobald kompatibel; Emulatoren erneut prüfen. |
| P2 | Originalgeräte-Übernahme und realer Gerätewechsel mit privaten Daten sind nicht abgenommen. | Nur nach Backup und ausdrücklicher Auswahl durch den Eigentümer; keine automatische Übernahme. |
| P3 | Gerätezeichnungen bilden Typen schematisch ab; Aufsätze und Details unterscheiden sich je Studio. | Eigenes Foto nutzen oder gezielte Variante nach belegtem Modell ergänzen. |

Weitere konkrete Maßnahmen stehen in der [Roadmap](SPORT_ROADMAP.md).
