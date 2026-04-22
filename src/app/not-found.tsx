"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import { useLanguage } from "@/lib/i18n/provider";

function NotFoundContent() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="text-4xl font-bold mb-4">{t("notFound.title")}</h1>
      <p className="text-xl mb-8">{t("notFound.description")}</p>
      <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        {t("notFound.returnHome")}
      </Link>
    </div>
  );
}

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div>{t("common.loading")}</div>}>
      <NotFoundContent />
    </Suspense>
  );
} 