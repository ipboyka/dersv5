#!/bin/bash
# BUILD — Kaynak dosyaları ders.html'e birleştirir
# Kullanım: bash build.sh
OUTPUT="ders.html"
cat _html_before.html > $OUTPUT
echo '    <script type="module">' >> $OUTPUT
for f in src/01-firebase.js src/02-core.js src/03-sidebar.js src/04-playlist-modal.js src/05-countdown.js src/06-calendar.js src/07-lessons.js src/08-notes-init.js src/09-auth.js src/10-notes-ui.js src/11-exams.js src/12-panels.js src/13-planner.js src/14-tasks.js src/15-playlist-cards.js src/16-side-panel.js src/17-analytics.js src/18-settings.js src/19-export.js src/20-profile.js src/21-stats.js src/22-calendar-colors.js; do
    cat "$f" >> $OUTPUT
done
echo '    </script>' >> $OUTPUT
cat _html_after.html >> $OUTPUT
echo "✓ $OUTPUT ($(wc -l < $OUTPUT) satır)"
