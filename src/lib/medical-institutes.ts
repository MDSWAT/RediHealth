import type { ComponentType, SVGProps } from "react";
import {
  ClipboardCheckIcon,
  HandHelpingIcon,
  HeartIcon,
  ShieldIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type MedicalInstitute = {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  hours: string;
  Icon: IconComponent;
  lat: number;
  lng: number;
};

export const medicalInstitutes: MedicalInstitute[] = [
  {
    id: "spitalul-universitar-bucuresti",
    name: "Spitalul Universitar de Urgență București",
    category: "Hospital",
    address: "Splaiul Independenței 169, București",
    phone: "021 318 05 23",
    hours: "Open 24 hours",
    Icon: HeartIcon,
    lat: 44.4347,
    lng: 26.0524,
  },
  {
    id: "spitalul-floreasca",
    name: "Spitalul Clinic de Urgență București",
    category: "Urgent care",
    address: "Calea Floreasca 8, București",
    phone: "021 599 23 00",
    hours: "Open 24 hours",
    Icon: HandHelpingIcon,
    lat: 44.4617,
    lng: 26.0992,
  },
  {
    id: "spitalul-colentina",
    name: "Spitalul Clinic Colentina",
    category: "Clinic",
    address: "Șoseaua Ștefan cel Mare 19-21, București",
    phone: "021 317 32 45",
    hours: "Open 24 hours",
    Icon: StethoscopeIcon,
    lat: 44.4500,
    lng: 26.1014,
  },
  {
    id: "medlife-victoriei",
    name: "MedLife Victoriei",
    category: "GP practice",
    address: "Calea Victoriei 222, București",
    phone: "021 9646",
    hours: "Mon–Fri, 7:00 – 21:00",
    Icon: ClipboardCheckIcon,
    lat: 44.4524,
    lng: 26.0880,
  },
  {
    id: "farmacia-tei-barbu-vacarescu",
    name: "Farmacia Tei Barbu Văcărescu",
    category: "Pharmacy",
    address: "Strada Barbu Văcărescu 154-158, București",
    phone: "021 796 69 99",
    hours: "Mon–Sun, 8:00 – 22:00",
    Icon: ShieldIcon,
    lat: 44.4750,
    lng: 26.1043,
  },
  {
    id: "spitalul-odontologie-bucuresti",
    name: "Spitalul Clinic de Chirurgie Oro-Maxilo-Facială",
    category: "Dental",
    address: "Calea Plevnei 17-21, București",
    phone: "021 315 55 56",
    hours: "Open 24 hours",
    Icon: HeartIcon,
    lat: 44.4323,
    lng: 26.0831,
  },
];
