/**
 * JORT Impact Assessment Engine
 * Maps regulatory content to compliance categories and controls
 */

// Keyword rules to map content to categories
const IMPACT_RULES = [
    {
        category: 'Droit du travail',
        controls: ['RH-001', 'RH-002', 'RH-005'],
        keywords: ['salarié', 'employeur', 'contrat de travail', 'convention collective', 'cnss', 'retraite', 'sécurité sociale', 'congé', 'licenciement', 'salaire', 'grille des salaires']
    },
    {
        category: 'Fiscalité',
        controls: ['FIN-001', 'FIN-003'],
        keywords: ['impôt', 'taxe', 'tva', 'déclaration fiscale', 'retenue à la source', 'finance', 'budget de l\'état', 'droit de consommation', 'douane']
    },
    {
        category: 'HSE (Hygiène Sécurité Environnement)',
        controls: ['HSE-001', 'HSE-004', 'HSE-010'],
        keywords: ['environnement', 'pollution', 'déchet', 'sécurité au travail', 'accident de travail', 'protection de la nature', 'substance dangereuse', 'incendie']
    },
    {
        category: 'Droit des sociétés',
        controls: ['CORP-001', 'CORP-002'],
        keywords: ['société anonyme', 'sarl', 'registre de commerce', 'statuts', 'augmentation de capital', 'assemblée générale', 'actions', 'parts sociales']
    },
    {
        category: 'Protection des données',
        controls: ['IT-005', 'IT-006'],
        keywords: ['données personnelles', 'inpdpp', 'traitement de données', 'vie privée', 'cybersécurité', 'informatique']
    }
];

export interface ImpactAssessment {
    categories: string[];
    affectedControls: string[];
    score: number; // Relevance score (0-100)
}

/**
 * Assess the impact of a JORT entry based on its content
 */
export function assessImpact(titleFr: string, titleAr?: string, ministry?: string): ImpactAssessment {
    const textToAnalyze = `${titleFr} ${titleAr || ''} ${ministry || ''}`.toLowerCase();

    const categories = new Set<string>();
    const affectedControls = new Set<string>();
    let matchCount = 0;

    for (const rule of IMPACT_RULES) {
        let ruleMatched = false;
        for (const keyword of rule.keywords) {
            if (textToAnalyze.includes(keyword.toLowerCase())) {
                categories.add(rule.category);
                rule.controls.forEach(c => affectedControls.add(c));
                matchCount++;
                ruleMatched = true;
            }
        }
    }

    // Heuristics for score
    // Type-based boost
    let baseScore = 0;
    if (titleFr.toLowerCase().includes('loi')) baseScore += 50;
    if (titleFr.toLowerCase().includes('décret')) baseScore += 30;
    if (titleFr.toLowerCase().includes('arrêté')) baseScore += 20;

    // Ministry boost (Affaires Sociales is usually high impact for HR)
    if (ministry?.toLowerCase().includes('social')) baseScore += 20;
    if (ministry?.toLowerCase().includes('finance')) baseScore += 20;

    // Keyword matches boost
    const keywordScore = Math.min(matchCount * 15, 50);

    return {
        categories: Array.from(categories),
        affectedControls: Array.from(affectedControls),
        score: Math.min(baseScore + keywordScore, 100)
    };
}
