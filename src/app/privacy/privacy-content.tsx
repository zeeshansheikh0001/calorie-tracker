"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import type { SupportedLocale } from "@/lib/i18n/translations";

type PrivacySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type PrivacyContentData = {
  back: string;
  title: string;
  updated: string;
  sections: PrivacySection[];
  analyticsTitle: string;
  analyticsParagraphs: string[];
  analyticsBullets: string[];
  analyticsOptOutPrefix: string;
  analyticsOptOutLabel: string;
  contactName: string;
  contactAddress: string;
  contactEmail: string;
  contactPhone: string;
};

const content: Record<SupportedLocale, PrivacyContentData> = {
  en: {
    back: "Back to Home",
    title: "Privacy Policy",
    updated: "Last Updated: July 1, 2023",
    sections: [
      {
        title: "Introduction",
        paragraphs: [
          "We respect your privacy and are committed to protecting your personal data.",
          "This policy explains what we collect, how we use it, and how we protect it when you use Calorie Tracker.",
        ],
      },
      {
        title: "Information We Collect",
        bullets: [
          "Personal information: name, email, and profile picture.",
          "Health information: age, height, weight, goals, and preferences.",
          "Usage information: food logs, calorie intake, and related data.",
          "Device information: IP address, browser, OS, and device type.",
          "Cookies and similar technologies for functionality and analytics.",
        ],
      },
      {
        title: "How We Use Your Information",
        bullets: [
          "To provide, maintain, and improve the service.",
          "To personalize recommendations and your app experience.",
          "To analyze usage patterns and optimize product quality.",
          "To communicate updates, support responses, and service notices.",
          "To ensure security, integrity, and legal compliance.",
        ],
      },
      {
        title: "Data Storage and Security",
        paragraphs: [
          "We apply technical and organizational safeguards to protect your information.",
          "No method is absolutely secure, so users should also maintain strong account security practices.",
        ],
      },
      {
        title: "Data Sharing and Disclosure",
        bullets: [
          "With service providers helping us run and improve the platform.",
          "When required to comply with legal obligations.",
          "During business transitions such as mergers or acquisitions.",
          "When you provide consent or request specific sharing.",
        ],
      },
      {
        title: "Your Rights",
        bullets: [
          "Access personal data we hold about you.",
          "Correct inaccurate or incomplete information.",
          "Delete personal information where applicable.",
          "Withdraw consent and object to processing.",
          "File a complaint with relevant regulatory authorities.",
        ],
      },
      {
        title: "Changes to This Privacy Policy",
        paragraphs: [
          "We may update this policy from time to time and post changes on this page.",
          "Continuing to use the service after updates means you accept the revised policy.",
        ],
      },
      {
        title: "Contact Us",
        paragraphs: ["If you have questions about this policy or data handling, contact us:"],
      },
    ],
    analyticsTitle: "Analytics and Cookies",
    analyticsParagraphs: [
      "We use analytics technologies to understand usage patterns and improve the service experience.",
      "These tools may collect website interaction data and device-level technical information.",
    ],
    analyticsBullets: [
      "Pages you visit and feature usage patterns",
      "Time spent in different sections",
      "Links and actions you interact with",
      "Technical and regional device context",
    ],
    analyticsOptOutPrefix: "You can opt out using the Google Analytics add-on:",
    analyticsOptOutLabel: "https://tools.google.com/dlpage/gaoptout",
    contactName: "Calorie Tracker",
    contactAddress: "123 Health Street, Bengaluru, Karnataka 560001",
    contactEmail: "Email: privacy@calorietracker.in",
    contactPhone: "Phone: +91 7275722307",
  },
  ar: {
    back: "العودة للرئيسية",
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: 1 يوليو 2023",
    sections: [
      { title: "مقدمة", paragraphs: ["نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.", "توضح هذه السياسة ما نجمعه وكيف نستخدمه ونحميه."] },
      { title: "المعلومات التي نجمعها", bullets: ["بيانات شخصية مثل الاسم والبريد والصورة.", "بيانات صحية مثل العمر والطول والوزن والأهداف.", "بيانات استخدام مثل سجلات الطعام والسعرات.", "بيانات الجهاز مثل IP والمتصفح ونوع الجهاز.", "ملفات تعريف ارتباط وتقنيات مشابهة."] },
      { title: "كيفية استخدام المعلومات", bullets: ["لتقديم الخدمة وتحسينها.", "لتخصيص التوصيات وتجربة التطبيق.", "لتحليل أنماط الاستخدام وتحسين الجودة.", "للتواصل حول التحديثات والدعم.", "لضمان الأمان والامتثال القانوني."] },
      { title: "تخزين البيانات وأمانها", paragraphs: ["نطبق إجراءات تقنية وتنظيمية لحماية البيانات.", "لا توجد وسيلة آمنة 100% لذا ننصح بممارسات أمان قوية للحساب."] },
      { title: "مشاركة البيانات والإفصاح", bullets: ["مع مزودي خدمة يساعدون على التشغيل والتحسين.", "عند الالتزام بمتطلبات قانونية.", "خلال معاملات مثل الاندماج أو الاستحواذ.", "بموافقتك أو بناءً على طلبك."] },
      { title: "حقوقك", bullets: ["الوصول لبياناتك الشخصية.", "تصحيح المعلومات غير الدقيقة.", "حذف البيانات عند انطباق ذلك.", "سحب الموافقة والاعتراض على المعالجة.", "تقديم شكوى للجهات المختصة."] },
      { title: "التغييرات على السياسة", paragraphs: ["قد نحدث هذه السياسة دوريًا وننشر التعديلات هنا.", "استمرارك في الاستخدام بعد التحديث يعني القبول."] },
      { title: "اتصل بنا", paragraphs: ["إذا كانت لديك أسئلة حول هذه السياسة، تواصل معنا:"] },
    ],
    analyticsTitle: "التحليلات وملفات تعريف الارتباط",
    analyticsParagraphs: ["نستخدم أدوات تحليل لفهم الاستخدام وتحسين التجربة.", "قد تجمع هذه الأدوات بيانات تفاعل الموقع وبيانات تقنية للجهاز."],
    analyticsBullets: ["الصفحات والميزات التي تستخدمها", "الوقت المقضي في الأقسام المختلفة", "الروابط والإجراءات التي تتفاعل معها", "بيانات تقنية وموقعية للجهاز"],
    analyticsOptOutPrefix: "يمكنك إيقاف التتبع عبر إضافة Google Analytics:",
    analyticsOptOutLabel: "https://tools.google.com/dlpage/gaoptout",
    contactName: "Calorie Tracker",
    contactAddress: "123 Health Street, Bengaluru, Karnataka 560001",
    contactEmail: "البريد: privacy@calorietracker.in",
    contactPhone: "الهاتف: +91 7275722307",
  },
  es: {
    back: "Volver al inicio",
    title: "Politica de privacidad",
    updated: "Ultima actualizacion: 1 de julio de 2023",
    sections: [
      { title: "Introduccion", paragraphs: ["Respetamos tu privacidad y protegemos tus datos personales.", "Esta politica explica que datos recogemos y como los usamos."] },
      { title: "Informacion que recopilamos", bullets: ["Datos personales: nombre, email, foto.", "Datos de salud: edad, peso, altura, metas.", "Datos de uso: registros de comida y calorias.", "Datos del dispositivo: IP, navegador, sistema.", "Cookies y tecnologias similares."] },
      { title: "Como usamos tu informacion", bullets: ["Para ofrecer y mejorar el servicio.", "Para personalizar recomendaciones.", "Para analizar uso y optimizar calidad.", "Para comunicar soporte y novedades.", "Para seguridad y cumplimiento legal."] },
      { title: "Almacenamiento y seguridad", paragraphs: ["Aplicamos medidas tecnicas y organizativas de proteccion.", "Ningun metodo es 100% seguro, por eso recomendamos buenas practicas de seguridad."] },
      { title: "Comparticion y divulgacion", bullets: ["Con proveedores que ayudan a operar la plataforma.", "Para cumplir obligaciones legales.", "En transacciones empresariales como fusiones.", "Con tu consentimiento o solicitud."] },
      { title: "Tus derechos", bullets: ["Acceder a tus datos personales.", "Corregir datos inexactos.", "Eliminar informacion cuando aplique.", "Retirar consentimiento y oponerte al tratamiento.", "Presentar reclamaciones ante autoridades competentes."] },
      { title: "Cambios a esta politica", paragraphs: ["Podemos actualizar esta politica periodicamente.", "El uso continuo tras cambios implica aceptacion."] },
      { title: "Contacto", paragraphs: ["Si tienes preguntas sobre esta politica, contactanos:"] },
    ],
    analyticsTitle: "Analitica y cookies",
    analyticsParagraphs: ["Usamos tecnologias de analitica para mejorar la experiencia.", "Estas herramientas pueden recopilar datos de interaccion y contexto tecnico del dispositivo."],
    analyticsBullets: ["Paginas y funciones visitadas", "Tiempo en cada seccion", "Enlaces y acciones seleccionadas", "Contexto tecnico y regional del dispositivo"],
    analyticsOptOutPrefix: "Puedes desactivar el seguimiento con:",
    analyticsOptOutLabel: "https://tools.google.com/dlpage/gaoptout",
    contactName: "Calorie Tracker",
    contactAddress: "123 Health Street, Bengaluru, Karnataka 560001",
    contactEmail: "Email: privacy@calorietracker.in",
    contactPhone: "Telefono: +91 7275722307",
  },
  fr: {
    back: "Retour a l'accueil",
    title: "Politique de confidentialite",
    updated: "Derniere mise a jour: 1 juillet 2023",
    sections: [
      { title: "Introduction", paragraphs: ["Nous respectons votre vie privee et protégeons vos donnees personnelles.", "Cette politique explique quelles donnees sont collectees et leur usage."] },
      { title: "Informations collectees", bullets: ["Infos personnelles: nom, email, photo.", "Infos sante: age, taille, poids, objectifs.", "Infos d'utilisation: journaux alimentaires et calories.", "Infos appareil: IP, navigateur, systeme.", "Cookies et technologies similaires."] },
      { title: "Utilisation des informations", bullets: ["Fournir et ameliorer le service.", "Personnaliser recommandations et experience.", "Analyser l'usage pour optimiser la qualite.", "Communiquer mises a jour et support.", "Assurer securite et conformite legale."] },
      { title: "Stockage et securite", paragraphs: ["Nous mettons en place des mesures techniques et organisationnelles.", "Aucun systeme n'est totalement infaillible, gardez de bonnes pratiques de securite."] },
      { title: "Partage et divulgation", bullets: ["Avec des prestataires operationnels.", "Pour respecter des obligations legales.", "En cas de fusion ou acquisition.", "Avec votre consentement ou demande."] },
      { title: "Vos droits", bullets: ["Acceder a vos donnees personnelles.", "Corriger des informations inexactes.", "Supprimer des donnees lorsque possible.", "Retirer consentement et vous opposer au traitement.", "Deposer une plainte aupres de l'autorite competente."] },
      { title: "Modification de la politique", paragraphs: ["Cette politique peut etre mise a jour periodiquement.", "La poursuite d'utilisation vaut acceptation des modifications."] },
      { title: "Contact", paragraphs: ["Pour toute question sur cette politique, contactez-nous:"] },
    ],
    analyticsTitle: "Analytique et cookies",
    analyticsParagraphs: ["Nous utilisons des outils analytiques pour ameliorer l'experience produit.", "Ces outils peuvent collecter des donnees d'interaction et de contexte technique."],
    analyticsBullets: ["Pages et fonctionnalites consultees", "Temps passe par section", "Liens et actions effectues", "Contexte technique et regional de l'appareil"],
    analyticsOptOutPrefix: "Vous pouvez desactiver le suivi via:",
    analyticsOptOutLabel: "https://tools.google.com/dlpage/gaoptout",
    contactName: "Calorie Tracker",
    contactAddress: "123 Health Street, Bengaluru, Karnataka 560001",
    contactEmail: "Email: privacy@calorietracker.in",
    contactPhone: "Telephone: +91 7275722307",
  },
  de: {
    back: "Zurueck zur Startseite",
    title: "Datenschutzrichtlinie",
    updated: "Zuletzt aktualisiert: 1. Juli 2023",
    sections: [
      { title: "Einleitung", paragraphs: ["Wir respektieren deine Privatsphaere und schuetzen personenbezogene Daten.", "Diese Richtlinie erklaert, welche Daten wir erfassen und wie wir sie nutzen."] },
      { title: "Welche Daten wir erfassen", bullets: ["Personendaten: Name, E-Mail, Profilbild.", "Gesundheitsdaten: Alter, Groesse, Gewicht, Ziele.", "Nutzungsdaten: Food-Logs und Kalorienangaben.", "Geraetedaten: IP, Browser, Betriebssystem.", "Cookies und aehnliche Technologien."] },
      { title: "Wie wir Informationen verwenden", bullets: ["Bereitstellung und Verbesserung des Dienstes.", "Personalisierung von Empfehlungen.", "Analyse von Nutzungsmustern.", "Kommunikation zu Support und Updates.", "Sicherheit und rechtliche Compliance."] },
      { title: "Datenspeicherung und Sicherheit", paragraphs: ["Wir nutzen technische und organisatorische Schutzmassnahmen.", "Kein Verfahren ist absolut sicher, daher empfehlen wir starke Kontosicherheit."] },
      { title: "Datenweitergabe", bullets: ["An Dienstleister zur Betriebsunterstuetzung.", "Zur Erfuellung gesetzlicher Pflichten.", "Bei Unternehmensvorgaengen wie Fusionen.", "Mit deiner Einwilligung oder auf deinen Wunsch."] },
      { title: "Deine Rechte", bullets: ["Zugriff auf deine personenbezogenen Daten.", "Korrektur unrichtiger Informationen.", "Loeschung von Daten, sofern anwendbar.", "Einwilligung widerrufen und Verarbeitung widersprechen.", "Beschwerde bei zustaendigen Behoerden einreichen."] },
      { title: "Aenderungen dieser Richtlinie", paragraphs: ["Diese Richtlinie kann periodisch aktualisiert werden.", "Fortgesetzte Nutzung bedeutet Zustimmung zu den Aenderungen."] },
      { title: "Kontakt", paragraphs: ["Bei Fragen zu dieser Richtlinie kontaktiere uns:"] },
    ],
    analyticsTitle: "Analytics und Cookies",
    analyticsParagraphs: ["Wir nutzen Analysewerkzeuge zur Verbesserung der Nutzungserfahrung.", "Diese koennen Interaktions- und technische Kontextdaten erfassen."],
    analyticsBullets: ["Besuchte Seiten und genutzte Funktionen", "Zeit in einzelnen Bereichen", "Angeklickte Links und Aktionen", "Technischer und regionaler Geraetekontext"],
    analyticsOptOutPrefix: "Opt-out ist ueber dieses Add-on moeglich:",
    analyticsOptOutLabel: "https://tools.google.com/dlpage/gaoptout",
    contactName: "Calorie Tracker",
    contactAddress: "123 Health Street, Bengaluru, Karnataka 560001",
    contactEmail: "E-Mail: privacy@calorietracker.in",
    contactPhone: "Telefon: +91 7275722307",
  },
};

export default function PrivacyContent() {
  const { locale } = useLanguage();
  const c = content[locale] || content.en;

  return (
    <div className="min-h-screen py-12 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link href="/" className="inline-block mb-8">
        <Button variant="ghost" className="group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {c.back}
        </Button>
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold mb-8">{c.title}</h1>
      <p className="text-muted-foreground mb-4">{c.updated}</p>

      <div className="space-y-8 text-foreground/90">
        {c.sections.map((section, index) => (
          <section key={index}>
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            {section.paragraphs?.map((p, pIndex) => (
              <p key={pIndex} className={pIndex === 0 ? "" : "mt-2"}>
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="list-disc pl-5 space-y-2 mt-2">
                {section.bullets.map((bullet, bIndex) => (
                  <li key={bIndex}>{bullet}</li>
                ))}
              </ul>
            )}
            {section.title === c.sections[c.sections.length - 1].title && (
              <div className="mt-2">
                <p className="font-medium">{c.contactName}</p>
                <p>{c.contactAddress}</p>
                <p>{c.contactEmail}</p>
                <p>{c.contactPhone}</p>
              </div>
            )}
          </section>
        ))}

        <section className="space-y-3 mt-6">
          <h2 className="text-xl font-semibold">{c.analyticsTitle}</h2>
          {c.analyticsParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
            {c.analyticsBullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <p>
            {c.analyticsOptOutPrefix}{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {c.analyticsOptOutLabel}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
