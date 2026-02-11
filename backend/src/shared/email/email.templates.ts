interface JortEntry {
    type?: string | null;
    titleFr: string;
    titleAr?: string | null;
    ministry?: string | null;
    jortNumber?: string | null;
    date?: Date | null;
    recordId?: string | null;
}

interface ImpactResult {
    score: number;
    categories: string[];
}

interface CheckReport {
    controlTitle: string;
    status: string;
    checkDate: Date;
    findings?: string;
    correctiveActions?: string;
    checkerName: string;
}

export const emailTemplates = {
    newRegulationAlert: (entry: JortEntry, impact: ImpactResult) => {
        const severityColor = impact.score > 70 ? '#ef4444' : '#f59e0b';
        const severityLabel = impact.score > 70 ? 'CRITIQUE' : 'IMPORTANT';
        const dateStr = entry.date ? new Date(entry.date).toLocaleDateString('fr-FR') : 'Date inconnue';

        // Correct link construction
        const link = entry.recordId
            ? `https://www.pist.tn/record/${entry.recordId}?ln=fr`
            : '#';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Alerte JORT: ${entry.titleFr}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: ${severityColor}; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Nouvelle Réglementation ${severityLabel}</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Impact détecté sur vos activités</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
            <div style="margin-bottom: 20px;">
                <span style="background-color: #e4e4e7; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${entry.type || 'TEXTE OFFICIEL'}</span>
                <span style="color: #71717a; font-size: 14px; margin-left: 10px;">${dateStr}</span>
            </div>

            <h2 style="margin-top: 0; font-size: 18px; color: #18181b;">${entry.titleFr}</h2>
            
            ${entry.ministry ? `<p style="color: #52525b; font-style: italic; margin-bottom: 20px;">Source : ${entry.ministry}</p>` : ''}

            <!-- Impact Box -->
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 15px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 10px; font-size: 16px; color: #166534;">Domaines Impactés</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${impact.categories.map(cat =>
            `<span style="background-color: #ffffff; border: 1px solid #86efac; color: #15803d; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;">${cat}</span>`
        ).join('')}
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${link}" style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">Voir le texte complet</a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f4f4f5; padding: 20px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #e4e4e7;">
            <p style="margin: 0;">Cet email a été envoyé automatiquement par votre plateforme de conformité Comply.</p>
            <p style="margin: 5px 0 0;">Ne pas répondre à cet email.</p>
        </div>
    </div>
</body>
</html>
        `;
    },

    checkResult: (data: CheckReport) => {
        const color = data.status === 'PASSED' ? '#16a34a' : '#dc2626';
        const statusText = data.status === 'PASSED' ? 'CONFORME' : 'NON-CONFORME';

        return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
            <h2 style="margin:0;">Résultat de Contrôle</h2>
            <p style="margin:5px 0 0;">${statusText}</p>
        </div>
        <div style="padding: 20px;">
            <h3 style="color: #374151;">${data.controlTitle}</h3>
            <p><strong>Date:</strong> ${new Date(data.checkDate).toLocaleDateString()}</p>
            <p><strong>Vérifié par:</strong> ${data.checkerName}</p>
            
            ${data.findings ? `
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <strong style="color: #991b1b;">Constats:</strong>
                <p style="margin: 5px 0 0; color: #7f1d1d;">${data.findings}</p>
            </div>` : ''}

            ${data.correctiveActions ? `
            <div style="background-color: #fff7ed; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <strong style="color: #9a3412;">Actions Correctives:</strong>
                <p style="margin: 5px 0 0; color: #7c2d12;">${data.correctiveActions}</p>
            </div>` : ''}
        </div>
    </div>
</body>
</html>`;
    }
};
