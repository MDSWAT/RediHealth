"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { CreatePatientModal } from "./CreatePatientModal";

export function PanelOverview({ isAdmin, isRomania, databaseAvailable }: {
  isAdmin: boolean; isRomania: boolean; databaseAvailable: boolean;
}) {
  const { lang } = useLanguage();
  const [creating, setCreating] = useState(false);

  return <>
    <Button className="panel-create-patient" variant="action" disabled={!databaseAvailable} onClick={() => setCreating(true)}>
      <PlusIcon className="h-4 w-4" aria-hidden="true" />{crmTranslations[lang].createPatient}
    </Button>
    {creating && <CreatePatientModal isAdmin={isAdmin} isRomania={isRomania} onClose={() => setCreating(false)} />}
  </>;
}
