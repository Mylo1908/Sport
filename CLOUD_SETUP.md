# Sport 1.4 – Freischaltung noch ausstehend

## Tatsächlicher Stand
Die Firebase-Konsole ist erreichbar und im Google-Konto angemeldet. Beim ersten Projekt verlangt Firebase die Annahme seiner Nutzungsbedingungen. Diese wurden durch Work nicht akzeptiert. Es wurde kein Projekt erstellt, kein Tarif eingerichtet, kein Konto angelegt und keine Zahlung/Abrechnung aktiviert. Die bestehende Live-Version 1.3.2 bleibt deshalb erhalten.

Der vorbereitete Code liegt im Entwicklungszweig; `src/firebase-config.ts` ist ausdrücklich deaktiviert. Die UID-Platzhalter in den Rules dürfen nicht produktiv verwendet werden. Vor Veröffentlichung alle nachstehenden Prüfpunkte erledigen.

## Einmalige Einrichtung im Firebase-Konto
1. Eigentümer akzeptiert ausdrücklich die Firebase-Nutzungsbedingungen in https://console.firebase.google.com/ und erstellt ein Projekt „Sport Private“. Google Analytics und Gemini/AI nicht aktivieren. Nur Spark; keinerlei Billing-Konto, Zahlungsmethode oder Blaze verknüpfen.
2. Cloud Firestore: Standard Edition, kostenlose Standarddatenbank, EU-Standort möglichst europe-west3 (Frankfurt), Produktionsmodus. Vor einer anderen Region entscheiden, da der Standort nicht nachträglich geändert werden kann. Wenn Abrechnung verlangt wird: stoppen.
3. Authentication > Sign-in method: E-Mail/Passwort aktivieren, keine öffentliche Registrierung in der Sport-UI. Unter Settings > Authorized domains `mylo1908.github.io` hinzufügen.
4. Den ersten Account kontrolliert über Authentication > Users hinzufügen. Eigentümer gibt E-Mail und Passwort selbst in der Konsole ein; keine Passwörter an Work oder GitHub übermitteln. Anschließend UID aus der Nutzerliste auslesen.
5. Unter Projekteinstellungen eine Web-App „Sport“ registrieren, kein Firebase Hosting hinzufügen. Ausschließlich öffentliche Web-Konfiguration in `src/firebase-config.ts` eintragen, UID als ownerUid und adminUid setzen.
6. In `firestore.rules` REPLACE_OWNER_UID und REPLACE_ADMIN_UID durch diese UID ersetzen. Rules prüfen und veröffentlichen, BEVOR App-Cloud freigeschaltet wird. Es gibt keinen schreibbaren Administratorstatus und keine Rules-Freigabe für andere UIDs. Auch ein Fremdaccount, der sich über die Firebase-API registriert, hat keinerlei Datenzugriff.
7. `npm ci`, `npm test`, `npm run test:cloud` und `npm run build` ausführen. Rules-Tests ersetzen nur im Test die UID durch synthetische Identitäten; es werden weder echte Daten noch produktive Zugangsdaten benötigt.
8. Im echten Spark-Projekt mit autorisiertem und fremdem Testaccount sowie ohne Login Zugriffe prüfen. Erst nach erfolgreicher Prüfung `enabled:true` setzen, Cloud-Branch auf main übernehmen, Pages-Deployment verifizieren.
9. Zwei echte Geräte mit demselben Account testen. Private Altdaten erst auf dem ursprünglichen Browser nach Backup und Bestätigung übernehmen.

## Sicherheits- und Datenmodell
- `users/{uid}/{sessions|journal|plans|exercises|drafts|settings}/{stableId}`: pro Objekt eigenes Dokument; keine Historie als riesiges Dokument.
- Dokumente enthalten `revision`, kanonisches JSON `payload` (max. 250.000 Zeichen) und vom Server gesetztes `updatedAt`. Firestore-Regeln begrenzen Felder, Größe, UID und aufsteigende Revision. Vollständige inhaltliche Validierung geschieht zusätzlich vor lokalem Übernehmen; Rules können JSON-Stringinhalte nicht interpretieren. Der autorisierte Eigentümer kann seine eigenen Daten verändern, aber keine anderen Nutzerpfade freischalten.
- Schreibvorgänge laufen in Firestore-Transaktionen mit erwarteter Revision. Abweichungen erhalten beide Versionen als Konflikt. Explizite Auswahl archiviert beide Versionen lokal; Backup enthält `cloudRecovery`. Dieses Wiederherstellungsarchiv wird bewusst nicht als fremde Sync-Metadaten importiert.
- Nur geänderte Dokumente werden geschrieben. Initiale vollständige Leseabfrage, danach Abfragen ab letztem Serverzeitstempel, einschließlich gleicher Zeitstempel. Polling maximal einmal pro Minute bei sichtbarer App, zusätzlich fokussierte Wiederverbindung und 5 Sekunden nach Eingabe. Kein permanenter Echtzeitlistener.
- Lokaler Zustand plus bestätigte Cloud-Basis bleiben dauerhaft in IndexedDB. Aus der Differenz entstehen nach Neustart erneut die ausstehenden Änderungen; keine nur flüchtige Offlinewarteschlange.
- Bisheriger Speicher `sport-local-v1` bleibt unverändert. Jeder UID zugeordnet: getrennte Datenbank `sport-account-v1-{uid}`. Ohne angemeldeten freigeschalteten Account wird bei aktivierter Cloud keine App mit privaten Daten angezeigt.
- Firebase Auth verwendet dauerhafte browserlokale Sitzung. Die Anwendung stellt Authentifizierungsstatus wieder her, bevor sie Kontodaten zeigt. Logout blendet die private App aus. Lokaler IndexedDB-Speicher ist weiterhin unverschlüsselt: wie zuvor kein Schutz gegen Personen mit Zugriff auf Browserprofil/Entwicklertools.
- Admin unter `#/admin`: Zugang durch serverseitig erlaubten GET auf `users/{uid}/admin/access`; das Dokument muss nicht existieren. Andere Nutzer, andere Pfade und Schreibaktionen auf Admin sind verboten. Keine zukünftige Nutzerverwaltung vorgetäuscht.
- Gerätefotos bleiben lokal und in Backups. Profil enthält keine automatisch übernommenen persönlichen Werte.
- Backups 1–3 bleiben importierbar, aktuelles Exportformat bleibt 3 mit optionalem validiertem Profil. Kontozuordnung und Sync-Metadaten werden nicht aus beliebigen Backups übernommen.

## Noch erforderliche Abnahmen
- Reale Firebase-Konfiguration, Spark-Status und veröffentlichte produktive Rules.
- Autorisierter Login, Fremdaccount, Logout, erneuter Browserstart und Offline-Sitzung.
- Zwei Geräte: neue/alte Daten, aktiver Entwurf, Offlinebearbeitung, Wiederverbindung und gleichzeitiger Journalkonflikt.
- Migration echter Daten ausschließlich auf Originalgerät mit Backup/Bestätigung.
- iOS Safari und Android Chrome einschließlich Offline-Neustart.
- Projektweite Firestore-Quoten bleiben ausschließlich in Firebase sichtbar; App zeigt nur lokale Nutzdatenmenge und Zugriffe des letzten Sync-Laufs, keine erfundene Serverabrechnung.

## Offizielle Grundlagen
- https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- https://firebase.google.com/docs/auth/web/password-auth
- https://firebase.google.com/docs/auth/web/auth-state-persistence
- https://firebase.google.com/docs/firestore/manage-data/transactions
- https://firebase.google.com/docs/rules/unit-tests
