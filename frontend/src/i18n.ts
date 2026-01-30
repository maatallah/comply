import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// French translations (default)
const fr = {
    translation: {
        // Navigation
        nav: {
            dashboard: 'Tableau de bord',
            obligations: 'Obligations',
            controls: 'Contrôles',
            deadlines: 'Échéances',
            settings: 'Paramètres',
            logout: 'Déconnexion',
        },
        // Auth
        auth: {
            login: 'Connexion',
            email: 'Adresse email',
            password: 'Mot de passe',
            submit: 'Se connecter',
            error: 'Email ou mot de passe incorrect',
        },
        // Dashboard
        dashboard: {
            welcome: 'Bienvenue',
            totalObligations: 'Obligations totales',
            dueSoon: 'Échéances proches',
            overdue: 'En retard',
            compliant: 'Conforme',
            byCategory: 'Par catégorie',
        },
        // Obligations
        obligations: {
            title: 'Mes Obligations',
            obligation: 'Obligation',
            regulation: 'Réglementation',
            category: 'Catégorie',
            frequency: 'Fréquence',
            riskLevel: 'Niveau de risque',
            status: 'Statut',
            noData: 'Aucune obligation trouvée',
            filterAll: 'Tous',
        },
        // Controls
        controls: {
            title: 'Contrôles',
            control: 'Contrôle',
            type: 'Type',
            noData: 'Aucun contrôle défini',
            noDataHint: 'Les contrôles seront ajoutés pour vos obligations',
        },
        // Deadlines
        deadlines: {
            title: 'Échéances',
            dueDate: 'Date d\'échéance',
            markComplete: 'Marquer terminé',
            recurring: 'Récurrent',
            yes: 'Oui',
            no: 'Non',
            action: 'Action',
            noData: 'Aucune échéance planifiée',
            noDataHint: 'Les échéances seront créées pour vos obligations',
        },
        // Status
        status: {
            pending: 'En attente',
            completed: 'Terminé',
            overdue: 'En retard',
        },
        // Frequencies
        frequency: {
            CONTINUOUS: 'Continu',
            MONTHLY: 'Mensuel',
            QUARTERLY: 'Trimestriel',
            ANNUAL: 'Annuel',
            BIENNIAL: 'Biennal',
            TRIENNIAL: 'Triennal',
        },
        // Categories
        category: {
            HSE: 'Hygiène & Sécurité',
            FISCAL: 'Fiscal',
            SOCIAL: 'Social',
            ENVIRONMENTAL: 'Environnemental',
            BRAND_AUDIT: 'Audit de Marque',
            QUALITY: 'Qualité',
        },
        // Risk Levels
        risk: {
            LOW: 'Faible',
            MEDIUM: 'Moyen',
            HIGH: 'Élevé',
            CRITICAL: 'Critique',
        },
        // Control Types
        controlType: {
            DOCUMENT: 'Document',
            CERTIFICATION: 'Certification',
            INSPECTION: 'Inspection',
            TRAINING: 'Formation',
            DECLARATION: 'Déclaration',
            AUDIT: 'Audit',
        },
        // Common
        common: {
            loading: 'Chargement...',
            error: 'Erreur',
            save: 'Enregistrer',
            cancel: 'Annuler',
            delete: 'Supprimer',
            search: 'Rechercher',
            filter: 'Filtrer',
        },
    },
};

// Arabic translations
const ar = {
    translation: {
        nav: {
            dashboard: 'لوحة التحكم',
            obligations: 'الالتزامات',
            controls: 'الضوابط',
            deadlines: 'المواعيد النهائية',
            settings: 'الإعدادات',
            logout: 'تسجيل الخروج',
        },
        auth: {
            login: 'تسجيل الدخول',
            email: 'البريد الإلكتروني',
            password: 'كلمة المرور',
            submit: 'دخول',
            error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        },
        dashboard: {
            welcome: 'مرحباً',
            totalObligations: 'إجمالي الالتزامات',
            dueSoon: 'قريبة الاستحقاق',
            overdue: 'متأخرة',
            compliant: 'ملتزم',
            byCategory: 'حسب الفئة',
        },
        obligations: {
            title: 'التزاماتي',
            obligation: 'الالتزام',
            regulation: 'التشريع',
            category: 'الفئة',
            frequency: 'التكرار',
            riskLevel: 'مستوى المخاطر',
            status: 'الحالة',
            noData: 'لا توجد التزامات',
            filterAll: 'الكل',
        },
        controls: {
            title: 'الضوابط',
            control: 'الضابط',
            type: 'النوع',
            noData: 'لا توجد ضوابط محددة',
            noDataHint: 'سيتم إضافة الضوابط لالتزاماتك',
        },
        deadlines: {
            title: 'المواعيد النهائية',
            dueDate: 'تاريخ الاستحقاق',
            markComplete: 'وضع علامة مكتمل',
            recurring: 'متكرر',
            yes: 'نعم',
            no: 'لا',
            action: 'الإجراء',
            noData: 'لا توجد مواعيد نهائية مخططة',
            noDataHint: 'سيتم إنشاء المواعيد النهائية لالتزاماتك',
        },
        status: {
            pending: 'قيد الانتظار',
            completed: 'مكتمل',
            overdue: 'متأخر',
        },
        frequency: {
            CONTINUOUS: 'مستمر',
            MONTHLY: 'شهري',
            QUARTERLY: 'ربع سنوي',
            ANNUAL: 'سنوي',
            BIENNIAL: 'كل سنتين',
            TRIENNIAL: 'كل ثلاث سنوات',
        },
        category: {
            HSE: 'الصحة والسلامة',
            FISCAL: 'ضريبي',
            SOCIAL: 'اجتماعي',
            ENVIRONMENTAL: 'بيئي',
            BRAND_AUDIT: 'تدقيق العلامة التجارية',
            QUALITY: 'الجودة',
        },
        risk: {
            LOW: 'منخفض',
            MEDIUM: 'متوسط',
            HIGH: 'مرتفع',
            CRITICAL: 'حرج',
        },
        controlType: {
            DOCUMENT: 'وثيقة',
            CERTIFICATION: 'شهادة',
            INSPECTION: 'تفتيش',
            TRAINING: 'تدريب',
            DECLARATION: 'تصريح',
            AUDIT: 'تدقيق',
        },
        common: {
            loading: 'جاري التحميل...',
            error: 'خطأ',
            save: 'حفظ',
            cancel: 'إلغاء',
            delete: 'حذف',
            search: 'بحث',
            filter: 'تصفية',
        },
    },
};

i18n.use(initReactI18next).init({
    resources: { fr, ar },
    lng: 'fr', // Default language
    fallbackLng: 'fr',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
