import { LearningSession, GoalSettings, UserProfile } from '../types';

/**
 * Generates and downloads a clean, beautifully formatted Markdown learning log
 */
export function exportToMarkdown(
  sessions: LearningSession[],
  profile: UserProfile,
  settings: GoalSettings
): void {
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const masteredCount = sessions.filter(s => s.mastered).length;
  const uniqueDates = Array.from(new Set(sessions.map(s => s.date)));

  let md = `# Technical Learning Log — ${profile.name || 'Developer'}\n\n`;
  md += `> **Cadence Summary**: ${sessions.length} sessions logged • ${totalHours} hours total • ${masteredCount} concepts mastered • ${uniqueDates.length} active practice days\n\n`;
  md += `**Curriculum Tracks**: ${settings.activeTracks.join(', ')}\n\n`;
  md += `**Daily Target**: ${settings.dailyGoalMinutes} mins/day • **Weekly Cadence**: ${settings.weeklyGoalDays} days/week\n\n`;
  md += `---\n\n`;

  // Sort sessions newest to oldest
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  // Group by date
  const byDate: Record<string, LearningSession[]> = {};
  sorted.forEach(s => {
    byDate[s.date] = byDate[s.date] || [];
    byDate[s.date].push(s);
  });

  for (const [dateStr, daySessions] of Object.entries(byDate)) {
    const dayTotal = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    md += `### 📅 ${dateStr} (${dayTotal} mins)\n\n`;

    daySessions.forEach(s => {
      const masteredBadge = s.mastered ? ' ⭐ *(Mastered)*' : '';
      md += `#### ${s.title}${masteredBadge}\n`;
      md += `- **Track**: \`${s.category}\`\n`;
      md += `- **Duration**: ${s.durationMinutes} minutes\n`;
      if (s.notes) {
        md += `- **Takeaways**: ${s.notes}\n`;
      }
      if (s.codeSnippet) {
        md += `\n\`\`\`\n${s.codeSnippet.trim()}\n\`\`\`\n`;
      }
      md += `\n`;
    });
    md += `---\n\n`;
  }

  md += `*Exported from StreakTracker on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}*\n`;

  // Trigger download
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `streaktracker-learning-log-${new Date().toISOString().slice(0, 10)}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads an RFC 4180-compliant CSV spreadsheet
 */
export function exportToCSV(sessions: LearningSession[]): void {
  const headers = ['ID', 'Date', 'Category', 'Title', 'Duration_Minutes', 'Mastered', 'Notes', 'Code_Snippet'];
  
  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = sessions.map(s => [
    escapeCell(s.id),
    escapeCell(s.date),
    escapeCell(s.category),
    escapeCell(s.title),
    s.durationMinutes,
    s.mastered ? 'YES' : 'NO',
    escapeCell(s.notes),
    escapeCell(s.codeSnippet || '')
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `streaktracker-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
