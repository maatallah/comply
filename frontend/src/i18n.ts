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
        },
        // Obligations
        obligations: {
            title: 'Mes Obligations',
            category: 'Catégorie',
            frequency: 'Fréquence',
            riskLevel: 'Niveau de risque',
            status: 'Statut',
            noData: 'Aucune obligation trouvée',
        },
        // Deadlines
        deadlines: {
            title: 'Échéances',
            dueDate: 'Date d\'échéance',
            markComplete: 'Marquer terminé',
            pending: 'En attente',
            completed: 'Terminé',
            overdue: 'En retard',
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
        },
        obligations: {
            title: 'التزاماتي',
            category: 'الفئة',
            frequency: 'التكرار',
            riskLevel: 'مستوى المخاطر',
            status: 'الحالة',
            noData: 'لا توجد التزامات',
        },
        deadlines: {
            title: 'المواعيد النهائية',
            dueDate: 'تاريخ الاستحقاق',
            markComplete: 'وضع علامة مكتمل',
            pending: 'قيد الانتظار',
            completed: 'مكتمل',
            overdue: 'متأخر',
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
