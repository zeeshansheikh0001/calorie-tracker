"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import type { SupportedLocale } from "@/lib/i18n/translations";

type TermsSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type TermsContentData = {
  back: string;
  title: string;
  updated: string;
  sections: TermsSection[];
  contactLead: string;
  contactName: string;
  contactAddress: string;
  contactEmail: string;
  contactPhone: string;
};

const data: Record<SupportedLocale, TermsContentData> = {
  en: {
    back: "Back to Home",
    title: "Terms of Service",
    updated: "Last Updated: July 1, 2023",
    sections: [
      {
        title: "Introduction",
        paragraphs: [
          "These Terms of Service govern your use of Calorie Tracker applications and website.",
          "By using the service, you agree to these terms. If you disagree, please do not use the service.",
        ],
      },
      {
        title: "Use of the Service",
        bullets: [
          "Use the service only for lawful purposes.",
          "Do not violate applicable laws or regulations.",
          "Do not attempt to test or exploit platform vulnerabilities.",
          "Do not use unauthorized automation tools to access the service.",
          "Do not interfere with service operation or connected systems.",
        ],
      },
      {
        title: "Account Registration",
        paragraphs: [
          "You must provide accurate and current account information.",
          "You are responsible for keeping your password confidential.",
          "You must notify us promptly of unauthorized account use.",
        ],
      },
      {
        title: "Intellectual Property",
        paragraphs: [
          "All service content, features, and technology remain property of Calorie Tracker and licensors.",
          "Trademarks and brand assets may not be used without prior written consent.",
        ],
      },
      {
        title: "User Content",
        paragraphs: [
          "You are responsible for all content you submit to the service.",
          "By posting content, you grant us the right to process and display it as needed to provide the service.",
        ],
      },
      {
        title: "Health Disclaimer",
        paragraphs: [
          "The service is informational and not a substitute for professional medical advice.",
          "Always consult qualified healthcare professionals for diagnosis or treatment decisions.",
        ],
      },
      {
        title: "Limitation of Liability",
        bullets: [
          "We are not liable for indirect or consequential damages.",
          "We are not liable for loss caused by third-party content or conduct.",
          "We are not liable for losses from unauthorized access to transmissions or account data.",
        ],
      },
      {
        title: "Termination",
        paragraphs: [
          "We may suspend or terminate access if these terms are violated.",
          "You may stop using the service at any time and request account deletion.",
        ],
      },
      {
        title: "Changes to Terms",
        paragraphs: [
          "We may update these terms periodically and will post revisions on this page.",
          "Continued use after changes means acceptance of updated terms.",
        ],
      },
      {
        title: "Governing Law",
        paragraphs: [
          "These terms are governed by the laws of India.",
          "If any clause is unenforceable, remaining clauses continue to apply.",
        ],
      },
      { title: "Contact Us" },
    ],
    contactLead: "If you have questions about these terms, contact us:",
    contactName: "Calorie Tracker",
    contactAddress: "123 Health Street, Bengaluru, Karnataka 560001",
    contactEmail: "Email: legal@calorietracker.in",
    contactPhone: "Phone: +91 98765 43210",
  },
  ar: {
    back: "العودة للرئيسية",
    title: "شروط الخدمة",
    updated: "آخر تحديث: 1 يوليو 2023",
    sections: [
      { title: "مقدمة", paragraphs: ["تحكم هذه الشروط استخدامك لتطبيق وموقع Calorie Tracker.", "باستخدامك للخدمة فإنك توافق على هذه الشروط."] },
      { title: "استخدام الخدمة", bullets: ["استخدم الخدمة لأغراض قانونية فقط.", "لا تنتهك القوانين أو اللوائح المعمول بها.", "لا تحاول استغلال ثغرات النظام.", "لا تستخدم أدوات آلية غير مصرح بها.", "لا تعطل الخدمة أو الأنظمة المرتبطة بها."] },
      { title: "تسجيل الحساب", paragraphs: ["يجب تقديم معلومات دقيقة وحديثة.", "أنت مسؤول عن سرية كلمة المرور.", "يجب إبلاغنا فورًا عند أي استخدام غير مصرح به."] },
      { title: "الملكية الفكرية", paragraphs: ["تظل المحتويات والميزات والتقنيات ملكًا لـ Calorie Tracker.", "لا يجوز استخدام العلامات التجارية دون موافقة خطية مسبقة."] },
      { title: "محتوى المستخدم", paragraphs: ["أنت مسؤول عن المحتوى الذي تنشره.", "بنشر المحتوى تمنحنا حق معالجته وعرضه لتقديم الخدمة."] },
      { title: "إخلاء المسؤولية الصحية", paragraphs: ["الخدمة لأغراض معلوماتية وليست بديلًا عن الاستشارة الطبية.", "يجب الرجوع إلى المختصين الصحيين لاتخاذ القرارات العلاجية."] },
      { title: "حدود المسؤولية", bullets: ["لسنا مسؤولين عن الأضرار غير المباشرة.", "لسنا مسؤولين عن خسائر ناتجة عن محتوى أو سلوك طرف ثالث.", "لسنا مسؤولين عن خسائر بسبب وصول غير مصرح به للبيانات."] },
      { title: "إنهاء الخدمة", paragraphs: ["قد نعلق أو ننهي الوصول عند مخالفة الشروط.", "يمكنك التوقف عن الاستخدام وطلب حذف الحساب في أي وقت."] },
      { title: "تعديل الشروط", paragraphs: ["قد نقوم بتحديث الشروط ونشر النسخة الجديدة هنا.", "الاستمرار في الاستخدام يعني الموافقة على التحديثات."] },
      { title: "القانون الحاكم", paragraphs: ["تخضع هذه الشروط لقوانين الهند.", "إذا تعذر تنفيذ بند ما، تستمر البنود الأخرى."] },
      { title: "اتصل بنا" },
    ],
    contactLead: "إذا كان لديك أي استفسار حول هذه الشروط، تواصل معنا:",
    contactName: "Calorie Tracker",
    contactAddress: "123 Health Street, Bengaluru, Karnataka 560001",
    contactEmail: "البريد: legal@calorietracker.in",
    contactPhone: "الهاتف: +91 98765 43210",
  },
  es: {
    back: "Volver al inicio",
    title: "Terminos de servicio",
    updated: "Ultima actualizacion: 1 de julio de 2023",
    sections: [
      { title: "Introduccion", paragraphs: ["Estos terminos regulan el uso de Calorie Tracker.", "Si no estas de acuerdo, no uses el servicio."] },
      { title: "Uso del servicio", bullets: ["Usar solo con fines legales.", "No incumplir leyes aplicables.", "No intentar explotar vulnerabilidades.", "No usar automatizacion no autorizada.", "No interferir con la operacion del servicio."] },
      { title: "Registro de cuenta", paragraphs: ["Debes proporcionar informacion correcta y actual.", "Eres responsable de tu contrasena.", "Debes reportar usos no autorizados."] },
      { title: "Propiedad intelectual", paragraphs: ["El contenido y tecnologia pertenecen a Calorie Tracker y sus licenciantes.", "No se permite usar marcas sin consentimiento previo."] },
      { title: "Contenido del usuario", paragraphs: ["Eres responsable del contenido que envias.", "Al publicarlo, autorizas su procesamiento para operar el servicio."] },
      { title: "Aviso de salud", paragraphs: ["La informacion es educativa y no reemplaza consejo medico.", "Consulta siempre a profesionales de salud calificados."] },
      { title: "Limitacion de responsabilidad", bullets: ["No respondemos por danos indirectos o consecuenciales.", "No respondemos por conducta o contenido de terceros.", "No respondemos por perdidas por accesos no autorizados."] },
      { title: "Terminacion", paragraphs: ["Podemos suspender acceso por incumplimiento.", "Puedes dejar de usar el servicio y solicitar eliminacion."] },
      { title: "Cambios de terminos", paragraphs: ["Podemos actualizar estos terminos periodicamente.", "El uso continuo implica aceptacion de cambios."] },
      { title: "Ley aplicable", paragraphs: ["Estos terminos se rigen por leyes de India.", "Si una clausula no es valida, el resto sigue vigente."] },
      { title: "Contacto" },
    ],
    contactLead: "Si tienes preguntas sobre estos terminos, contactanos:",
    contactName: "Calorie Tracker",
    contactAddress: "123 Health Street, Bengaluru, Karnataka 560001",
    contactEmail: "Email: legal@calorietracker.in",
    contactPhone: "Telefono: +91 98765 43210",
  },
  fr: {
    back: "Retour a l'accueil",
    title: "Conditions d'utilisation",
    updated: "Derniere mise a jour: 1 juillet 2023",
    sections: [
      { title: "Introduction", paragraphs: ["Ces conditions regissent l'utilisation de Calorie Tracker.", "Si vous n'etes pas d'accord, n'utilisez pas le service."] },
      { title: "Utilisation du service", bullets: ["Utiliser le service uniquement de maniere legale.", "Respecter les lois applicables.", "Ne pas tenter d'exploiter des vulnerabilites.", "Ne pas utiliser d'automatisation non autorisee.", "Ne pas perturber le fonctionnement du service."] },
      { title: "Creation de compte", paragraphs: ["Vous devez fournir des informations exactes.", "Vous etes responsable de votre mot de passe.", "Signalez tout acces non autorise."] },
      { title: "Propriete intellectuelle", paragraphs: ["Le contenu et la technologie restent la propriete de Calorie Tracker.", "Les marques ne peuvent pas etre utilisees sans autorisation."] },
      { title: "Contenu utilisateur", paragraphs: ["Vous etes responsable du contenu que vous publiez.", "La publication autorise son traitement pour faire fonctionner le service."] },
      { title: "Avertissement sante", paragraphs: ["Le service est informatif et ne remplace pas un avis medical.", "Consultez des professionnels de sante qualifies."] },
      { title: "Limitation de responsabilite", bullets: ["Nous ne sommes pas responsables des dommages indirects.", "Nous ne sommes pas responsables du contenu de tiers.", "Nous ne sommes pas responsables des pertes dues a un acces non autorise."] },
      { title: "Resiliation", paragraphs: ["Nous pouvons suspendre l'acces en cas de violation.", "Vous pouvez arreter le service et demander la suppression du compte."] },
      { title: "Modifications des conditions", paragraphs: ["Ces conditions peuvent etre mises a jour periodiquement.", "L'utilisation continue vaut acceptation des changements."] },
      { title: "Droit applicable", paragraphs: ["Ces conditions sont regies par les lois de l'Inde.", "Si une clause est invalide, les autres restent en vigueur."] },
      { title: "Contact" },
    ],
    contactLead: "Pour toute question sur ces conditions, contactez-nous:",
    contactName: "Calorie Tracker",
    contactAddress: "123 Health Street, Bengaluru, Karnataka 560001",
    contactEmail: "Email: legal@calorietracker.in",
    contactPhone: "Telephone: +91 98765 43210",
  },
  de: {
    back: "Zurueck zur Startseite",
    title: "Nutzungsbedingungen",
    updated: "Zuletzt aktualisiert: 1. Juli 2023",
    sections: [
      { title: "Einleitung", paragraphs: ["Diese Bedingungen regeln die Nutzung von Calorie Tracker.", "Wenn du nicht zustimmst, nutze den Dienst bitte nicht."] },
      { title: "Nutzung des Dienstes", bullets: ["Nur fuer rechtmaessige Zwecke nutzen.", "Anwendbare Gesetze einhalten.", "Keine Sicherheitsluecken ausnutzen.", "Keine unautorisierte Automatisierung verwenden.", "Den Betrieb des Dienstes nicht stoeren."] },
      { title: "Kontoregistrierung", paragraphs: ["Du musst korrekte und aktuelle Daten angeben.", "Du bist fuer dein Passwort verantwortlich.", "Melde unautorisierte Kontoaktivitaeten sofort."] },
      { title: "Geistiges Eigentum", paragraphs: ["Inhalte und Technologie bleiben Eigentum von Calorie Tracker.", "Marken duerfen nicht ohne Zustimmung genutzt werden."] },
      { title: "Nutzerinhalte", paragraphs: ["Du bist fuer hochgeladene Inhalte verantwortlich.", "Mit der Veroeffentlichung erlaubst du die Verarbeitung fuer den Dienstbetrieb."] },
      { title: "Gesundheitshinweis", paragraphs: ["Der Dienst ersetzt keine professionelle medizinische Beratung.", "Hole medizinischen Rat von qualifizierten Fachpersonen ein."] },
      { title: "Haftungsbeschraenkung", bullets: ["Keine Haftung fuer indirekte oder Folgeschaeden.", "Keine Haftung fuer Inhalte oder Verhalten Dritter.", "Keine Haftung fuer Verluste durch unautorisierten Zugriff."] },
      { title: "Kuendigung", paragraphs: ["Bei Verstoessen koennen wir den Zugriff sperren.", "Du kannst die Nutzung jederzeit beenden und Loeschung anfordern."] },
      { title: "Aenderungen", paragraphs: ["Wir koennen diese Bedingungen regelmaessig aktualisieren.", "Fortgesetzte Nutzung bedeutet Zustimmung zu Aenderungen."] },
      { title: "Geltendes Recht", paragraphs: ["Es gilt das Recht Indiens.", "Sollte eine Klausel unwirksam sein, bleiben die anderen wirksam."] },
      { title: "Kontakt" },
    ],
    contactLead: "Bei Fragen zu diesen Bedingungen kontaktiere uns:",
    contactName: "Calorie Tracker",
    contactAddress: "123 Health Street, Bengaluru, Karnataka 560001",
    contactEmail: "E-Mail: legal@calorietracker.in",
    contactPhone: "Telefon: +91 98765 43210",
  },
};

export default function TermsContent() {
  const { locale } = useLanguage();
  const c = data[locale] || data.en;

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
                <p>{c.contactLead}</p>
                <p className="font-medium mt-2">{c.contactName}</p>
                <p>{c.contactAddress}</p>
                <p>{c.contactEmail}</p>
                <p>{c.contactPhone}</p>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
