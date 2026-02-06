import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== TIER 1 REGULATIONS ====================
// These are the 8 most critical regulations for Tunisian textile/industrial SMEs

export const tier1Regulations = [
    {
        code: 'BSCI-2021',
        titleFr: 'Audit Social BSCI (Business Social Compliance Initiative)',
        titleAr: 'تدقيق الامتثال الاجتماعي BSCI',
        authority: 'BSCI_AMFORI',
        category: 'BRAND_AUDIT',
        descriptionFr: `L'audit BSCI évalue les conditions de travail dans la chaîne d'approvisionnement. 
Obligatoire pour les fournisseurs des grandes marques européennes (Carrefour, H&M, Decathlon, etc.).
Couvre: heures de travail, salaires, sécurité, travail des enfants, discrimination.
Score minimum requis: C (acceptable) pour maintenir les contrats.`,
        descriptionAr: 'تقييم ظروف العمل في سلسلة التوريد. إلزامي للموردين للعلامات التجارية الأوروبية الكبرى.',
        effectiveDate: new Date('2021-01-01'),
        sourceUrl: 'https://www.amfori.org/content/amfori-bsci',
    },
    {
        code: 'DEC-75-503',
        titleFr: 'Sécurité Incendie - Protection Civile',
        titleAr: 'السلامة من الحرائق - الحماية المدنية',
        authority: 'PROTECTION_CIVILE',
        category: 'HSE',
        descriptionFr: `Décret 75-503 du 28 juillet 1975 relatif à la prévention des incendies.
Obligations: Plan d'évacuation, extincteurs (1 par 200m²), issues de secours, exercices annuels.
Visite obligatoire de la Protection Civile tous les 2 ans.
Sanctions: Fermeture administrative, amendes 500-5000 TND.`,
        descriptionAr: 'مرسوم 75-503 المتعلق بالوقاية من الحرائق. الالتزامات: خطة الإخلاء، طفايات الحريق، مخارج الطوارئ.',
        effectiveDate: new Date('1975-07-28'),
        sourceUrl: 'https://www.protection-civile.tn/',
    },
    {
        code: 'DEC-2000-1985',
        titleFr: 'Sécurité Électrique - Installations et Équipements',
        titleAr: 'السلامة الكهربائية - التركيبات والمعدات',
        authority: 'ANPE',
        category: 'HSE',
        descriptionFr: `Décret 2000-1985 relatif à la sécurité des installations électriques.
Contrôle technique obligatoire annuel par organisme agréé (APAVE, Bureau Veritas).
Vérification: tableaux électriques, mise à la terre, protection différentielle.
Rapport de conformité à conserver 5 ans.`,
        descriptionAr: 'مرسوم 2000-1985 المتعلق بسلامة التركيبات الكهربائية. فحص تقني سنوي إلزامي.',
        effectiveDate: new Date('2000-09-12'),
        sourceUrl: 'http://www.anpe.nat.tn/',
    },
    {
        code: 'CNSS-LOI-60-30',
        titleFr: 'Déclarations CNSS - Cotisations Sociales',
        titleAr: 'تصريحات الصندوق الوطني للضمان الاجتماعي',
        authority: 'CNSS',
        category: 'SOCIAL',
        descriptionFr: `Loi 60-30 du 14 décembre 1960 relative à la sécurité sociale.
Déclaration mensuelle des salaires et cotisations (avant le 28 du mois suivant).
Taux: 25.75% (employeur: 16.57%, employé: 9.18%).
Pénalités de retard: 1% par mois de retard.
Attestation de régularité requise pour marchés publics.`,
        descriptionAr: 'قانون 60-30 المتعلق بالضمان الاجتماعي. تصريح شهري بالأجور والاشتراكات.',
        effectiveDate: new Date('1960-12-14'),
        sourceUrl: 'https://www.cnss.tn/',
    },
    {
        code: 'TVA-CGI-2016',
        titleFr: 'Déclarations TVA - Obligations Fiscales',
        titleAr: 'تصريحات الأداء على القيمة المضافة',
        authority: 'DGI',
        category: 'FISCAL',
        descriptionFr: `Code Général des Impôts - Taxe sur la Valeur Ajoutée.
Déclaration mensuelle (CA > 100.000 TND) ou trimestrielle.
Taux: 19% (standard), 13% (produits spécifiques), 7% (produits de base).
Délai: avant le 28 du mois suivant.
Acomptes provisionnels obligatoires.`,
        descriptionAr: 'قانون الضرائب العام - الأداء على القيمة المضافة. تصريح شهري أو ثلاثي.',
        effectiveDate: new Date('2016-01-01'),
        sourceUrl: 'https://www.finances.gov.tn/',
    },
    {
        code: 'MT-LOI-94-28',
        titleFr: 'Médecine du Travail - Suivi Médical',
        titleAr: 'طب الشغل - المتابعة الطبية',
        authority: 'CNAM',
        category: 'HSE',
        descriptionFr: `Loi 94-28 du 21 février 1994 relative à la médecine du travail.
Visite médicale d'embauche obligatoire.
Visite périodique annuelle pour tous les salariés.
Postes à risques: visites semestrielles.
Médecin du travail agréé obligatoire (>50 employés: médecin à temps plein).`,
        descriptionAr: 'قانون 94-28 المتعلق بطب الشغل. فحص طبي عند التوظيف وفحص دوري سنوي.',
        effectiveDate: new Date('1994-02-21'),
        sourceUrl: 'https://www.cnam.nat.tn/',
    },
    {
        code: 'ANGED-DEC-2005',
        titleFr: 'Gestion des Déchets Dangereux - ANGED',
        titleAr: 'إدارة النفايات الخطرة',
        authority: 'ANGED',
        category: 'ENVIRONMENTAL',
        descriptionFr: `Décret 2005-3395 relatif à la gestion des déchets dangereux.
Bordereau de suivi des déchets (BSD) obligatoire.
Stockage temporaire max 1 an sur site.
Collecte par opérateurs agréés uniquement.
Registre des déchets à tenir (quantités, types, destinations).`,
        descriptionAr: 'مرسوم 2005-3395 المتعلق بإدارة النفايات الخطرة. بوردرو متابعة النفايات إلزامي.',
        effectiveDate: new Date('2005-12-01'),
        sourceUrl: 'https://www.anged.nat.tn/',
    },
    {
        code: 'CT-LOI-66-27',
        titleFr: 'Contrats de Travail - Code du Travail',
        titleAr: 'عقود العمل - مجلة الشغل',
        authority: 'INSPECTION_TRAVAIL',
        category: 'SOCIAL',
        descriptionFr: `Code du Travail - Loi 66-27 du 30 avril 1966.
Contrat écrit obligatoire pour CDD et temps partiel.
Période d'essai max: 6 mois (cadres), 9 mois (autres).
Registre du personnel obligatoire.
Affichage obligatoire: horaires, règlement intérieur, convention collective.`,
        descriptionAr: 'مجلة الشغل - قانون 66-27. عقد كتابي إلزامي للعقود المحددة المدة.',
        effectiveDate: new Date('1966-04-30'),
        sourceUrl: 'http://www.emploi.gov.tn/',
    },
    {
        id: 'f1e2d3c4-b5a6-4078-9012-34567890abcd',
        code: 'OFFSHORE-REG',
        titleFr: 'Régime Totalement Exportateur (Offshore)',
        titleAr: 'نظام المصدر كلياً (Offshore)',
        authority: 'DOUANE_FISCALITE',
        category: 'FISCAL',
        descriptionFr: 'Réglementations spécifiques aux entreprises sous le régime totalement exportateur (Suspension TVA, Admission Temporaire).',
        descriptionAr: 'التشريعات الخاصة بالشركات تحت نظام التصدير الكلي (توقيف الأداء، القبول المؤقت).',
        effectiveDate: new Date('2024-01-01'),
        sourceUrl: 'https://www.douane.gov.tn/',
    },
];

// ==================== SEED FUNCTION ====================

export async function seedRegulations() {
    console.log('🌱 Seeding Tier 1 Regulations...');

    for (const reg of tier1Regulations) {
        await prisma.regulation.upsert({
            where: { code: reg.code },
            update: reg,
            create: reg,
        });
        console.log(`  ✅ Synced: ${reg.code} - ${reg.titleFr}`);
    }

    console.log('✨ Regulations seeding complete!');
}
