import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MILESTONES = [500, 5000];

function buildEmailHtml(stats, milestone) {
  const { total, humans, bots, avgScore, levels, topRegions, meetingSpotPct, documentedPct } = stats;
  const levelRows = Object.entries(levels).map(([level, count]) => {
    const pct = humans > 0 ? Math.round(count / humans * 100) : 0;
    return `<tr><td style="padding:8px 12px;border-bottom:1px solid #e8e2d6;font-size:14px;color:#1c1c1a;">${level}</td><td style="padding:8px 12px;border-bottom:1px solid #e8e2d6;text-align:right;font-size:14px;font-weight:600;color:#1c1c1a;">${count} (${pct}%)</td></tr>`;
  }).join('');

  const regionRows = topRegions.map(([region, count]) => 
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #e8e2d6;font-size:14px;color:#1c1c1a;text-transform:capitalize;">${region}</td><td style="padding:8px 12px;border-bottom:1px solid #e8e2d6;text-align:right;font-size:14px;font-weight:600;color:#1c1c1a;">${count}</td></tr>`
  ).join('');

  const socialBlurb = `🎉 RallyPack just hit ${milestone} readiness quiz results!\n\n📊 Average readiness score: ${avgScore}/100\n✅ ${levels['A Solid Foundation'] || 0} people have a solid emergency foundation\n⚠️ ${levels['Gaps That Put You at Risk'] || 0} have critical preparedness gaps\n📍 Top concern: ${topRegions[0] ? topRegions[0][0] : 'Various'}\n📋 Only ${documentedPct}% have a documented emergency plan\n\nHow prepared are YOU? Take the free quiz: https://rallypack.base44.com/ReadinessQuiz`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RallyPack Milestone: ${milestone} Quiz Results</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Inter,DM Sans,Arial,sans-serif;color:#1c1c1a;line-height:1.6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #d8d2c6;max-width:600px;">

<tr><td style="background-color:#1c1c1a;padding:32px 40px;text-align:center;">
<h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">RallyPack</h1>
<p style="margin:4px 0 0;font-size:12px;color:#ffffff;opacity:0.6;text-transform:uppercase;letter-spacing:2px;">Readiness Quiz Milestone</p>
</td></tr>

<tr><td style="padding:32px 40px;">
<p style="margin:0 0 8px;font-size:13px;color:#d64a2e;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🎉 Milestone Reached</p>
<h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:28px;font-weight:700;color:#1c1c1a;">${milestone} Quiz Results!</h2>
<p style="margin:0 0 24px;font-size:15px;color:#1c1c1a;">Your community has taken <strong>${humans} readiness quizzes</strong> on RallyPack. Here's a summary of how prepared people are — ready to share on social media.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr>
<td style="width:50%;padding:16px;background-color:#fef3e7;border:1px solid #f0dcc6;text-align:center;">
<p style="margin:0;font-size:32px;font-weight:700;color:#d64a2e;font-family:Georgia,serif;">${avgScore}</p>
<p style="margin:4px 0 0;font-size:12px;color:#6b6b66;text-transform:uppercase;letter-spacing:1px;">Avg Score / 100</p>
</td>
<td style="width:50%;padding:16px;background-color:#f0f4f8;border:1px solid #d6e0ec;text-align:center;">
<p style="margin:0;font-size:32px;font-weight:700;color:#2c4a6e;font-family:Georgia,serif;">${humans}</p>
<p style="margin:4px 0 0;font-size:12px;color:#6b6b66;text-transform:uppercase;letter-spacing:1px;">Human Responses</p>
</td>
</tr>
</table>

<h3 style="margin:0 0 8px;font-family:Georgia,serif;font-size:16px;font-weight:600;color:#1c1c1a;">Readiness Levels</h3>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #e8e2d6;">
<tr><td style="padding:8px 12px;background-color:#f5f0e8;font-size:12px;font-weight:600;color:#6b6b66;text-transform:uppercase;letter-spacing:1px;">Level</td><td style="padding:8px 12px;background-color:#f5f0e8;font-size:12px;font-weight:600;color:#6b6b66;text-transform:uppercase;letter-spacing:1px;text-align:right;">Count</td></tr>
${levelRows}
</table>

<h3 style="margin:0 0 8px;font-family:Georgia,serif;font-size:16px;font-weight:600;color:#1c1c1a;">Top Regions</h3>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #e8e2d6;">
<tr><td style="padding:8px 12px;background-color:#f5f0e8;font-size:12px;font-weight:600;color:#6b6b66;text-transform:uppercase;letter-spacing:1px;">Region</td><td style="padding:8px 12px;background-color:#f5f0e8;font-size:12px;font-weight:600;color:#6b6b66;text-transform:uppercase;letter-spacing:1px;text-align:right;">Quizzes</td></tr>
${regionRows}
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="padding:16px 20px;background-color:#1c1c1a;">
<p style="margin:0 0 8px;font-size:12px;color:#d64a2e;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📋 Copy-paste for social media</p>
<p style="margin:0;font-size:14px;color:#ffffff;white-space:pre-line;font-family:Inter,sans-serif;line-height:1.5;">${socialBlurb}</p>
</td></tr>
</table>

<p style="margin:0;font-size:13px;color:#6b6b66;">${bots > 0 ? `${bots} bot/crawler submissions excluded from these stats.` : ''} You'll receive another summary at the ${milestone === 500 ? '5,000' : 'next major'} milestone.</p>
</td></tr>

<tr><td style="background-color:#1c1c1a;padding:20px 40px;text-align:center;">
<p style="margin:0;font-size:11px;color:#ffffff;opacity:0.5;">&copy; 2026 RallyPack &middot; MIT License &middot; GDPR &amp; CCPA Compliant</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const AUTOMATION_SECRET = Deno.env.get("AUTOMATION_SECRET");
    const body = await req.json().catch(() => ({}));
    const isAutomation = AUTOMATION_SECRET && body.automation_secret === AUTOMATION_SECRET;

    if (!isAutomation) {
      const user = await base44.auth.me();
      if (user?.role !== "admin") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const allResults = await base44.asServiceRole.entities.QuizResult.list('-created_date', 100000);
    const total = allResults.length;
    const humans = allResults.filter(r => !r.is_bot);
    const bots = total - humans.length;

    const levels = {};
    humans.forEach(r => { if (r.score_level) levels[r.score_level] = (levels[r.score_level] || 0) + 1; });

    const regions = {};
    humans.forEach(r => { if (r.region) { regions[r.region] = (regions[r.region] || 0) + 1; } });

    const avgScore = humans.length > 0
      ? Math.round(humans.reduce((s, r) => s + (r.score || 0), 0) / humans.length)
      : 0;

    const meetingSpot = humans.filter(r => r.meeting_spot && /yes/i.test(r.meeting_spot)).length;
    const documented = humans.filter(r => r.plan_documented && /yes/i.test(r.plan_documented)).length;

    const stats = {
      total,
      humans: humans.length,
      bots,
      avgScore,
      levels,
      topRegions: Object.entries(regions).sort((a, b) => b[1] - a[1]).slice(0, 5),
      meetingSpotPct: humans.length > 0 ? Math.round(meetingSpot / humans.length * 100) : 0,
      documentedPct: humans.length > 0 ? Math.round(documented / humans.length * 100) : 0,
    };

    // Get admin emails
    const users = await base44.asServiceRole.entities.User.list();
    const adminEmails = users.filter(u => u.role === "admin").map(u => u.email).filter(Boolean);

    if (adminEmails.length === 0) {
      return Response.json({ error: "No admin emails found" }, { status: 500 });
    }

    const milestonesHit = [];

    for (const milestone of MILESTONES) {
      if (total < milestone) continue;

      const markerTitle = `QUIZ_MILESTONE_${milestone}`;
      const existing = await base44.asServiceRole.entities.Notification.filter({ title: markerTitle });
      if (existing.length > 0) continue;

      const html = buildEmailHtml(stats, milestone);
      const subject = `🎉 RallyPack Milestone: ${milestone} Quiz Results — Preparedness Summary`;

      for (const email of adminEmails) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject,
          body: html,
        });
      }

      await base44.asServiceRole.entities.Notification.create({
        title: markerTitle,
        message: `Milestone ${milestone} reached. ${humans.length} human responses, avg score ${avgScore}.`,
        type: "success",
      });

      milestonesHit.push(milestone);
    }

    return Response.json({
      total,
      humans: humans.length,
      bots,
      milestones_hit: milestonesHit,
      next_milestone: MILESTONES.find(m => m > total) || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});