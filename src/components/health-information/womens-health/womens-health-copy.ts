import type { Lang } from "@/lib/i18n/translations";

export interface PregnancyStep {
  id: string;
  number: string;
  name: string;
  weeks: string;
  developmentTitle: string;
  developmentDesc: string;
  whoContact: string;
  clinicalChecklist: string[];
  selfCare: string;
  redFlags: string;
}

export interface BreastSelfAwarenessStep {
  stepName: string;
  desc: string;
}

export interface BreastAgeGuidance {
  ageRange: string;
  guidance: string;
}

export interface BreastAwarenessHotspot {
  id: "breast-awareness";
  title: string;
  summary: string;
  rule3Steps: BreastSelfAwarenessStep[];
  ageGuidance: BreastAgeGuidance[];
}

export interface CervicalScreeningHotspot {
  id: "cervical-screening";
  title: string;
  summary: string;
  examExplanation: string;
  nationalProgramNote: string;
  recommendedIntervals: string[];
  vaccinationNote: string;
  warningSigns: string;
}

export type ScreeningHotspot = BreastAwarenessHotspot | CervicalScreeningHotspot;

export interface WomensHealthCopy {
  title: string;
  subtitle: string;
  listenLabel: string;
  audioSummary: string;
  fetalDevelopmentTitle: string;
  clinicalChecklistTitle: string;
  selfCarePrefix: string;
  redFlagsPrefix: string;
  breastAwarenessRule3Title: string;
  ageGuidanceTitle: string;
  nationalProgramPrefix: string;
  recommendedIntervalsTitle: string;
  hpvVaccinationPrefix: string;
  promptConsultationPrefix: string;
  trackAriaLabel: string;
  /** Accessible names of the trimester and check pickers. */
  trimesterGroupLabel: string;
  checkGroupLabel: string;
  /** Heading above the WHO antenatal contacts for the selected trimester. */
  whoContactTitle: string;
  tabs: {
    pregnancy: string;
    screening: string;
  };
  pregnancyTrack: {
    title: string;
    intro: string;
    steps: PregnancyStep[];
  };
  screeningTrack: {
    title: string;
    intro: string;
    hotspots: [BreastAwarenessHotspot, CervicalScreeningHotspot];
  };
  emergencyNote: string;
  call112Label: string;
  credit: string;
}

export const WOMENS_HEALTH_COPY: Record<Lang, WomensHealthCopy> = {
  ro: {
    title: "Sarcina și controalele pentru femei",
    subtitle:
      "Ce se întâmplă în fiecare trimestru de sarcină și ce controale faci la sâni și la colul uterin.",
    listenLabel: "Ascultă textul",
    audioSummary:
      "Sarcina pe trimestre, cu cele 8 vizite recomandate de Organizația Mondială a Sănătății. Și controalele pentru sâni și colul uterin.",
    fetalDevelopmentTitle: "Cum crește copilul",
    clinicalChecklistTitle: "Analize și controale",
    selfCarePrefix: "Ce poți face tu:",
    redFlagsPrefix: "Semne de alarmă:",
    breastAwarenessRule3Title: "Cum îți verifici sânii",
    ageGuidanceTitle: "Ce controale faci, după vârstă",
    nationalProgramPrefix: "Program național gratuit:",
    recommendedIntervalsTitle: "Cât de des",
    hpvVaccinationPrefix: "Vaccinarea HPV:",
    promptConsultationPrefix: "Mergi repede la ginecolog dacă ai:",
    trackAriaLabel: "Sarcină și screening",
    trimesterGroupLabel: "Alege trimestrul",
    checkGroupLabel: "Alege controlul",
    whoContactTitle: "Vizite la medic recomandate de OMS",
    tabs: {
      pregnancy: "Sarcina pe trimestre",
      screening: "Controale preventive",
    },
    pregnancyTrack: {
      title: "Sarcina pe trimestre",
      intro:
        "Controalele din sarcină te ajută pe tine și pe copil. Organizația Mondială a Sănătății recomandă 8 vizite la medic.",
      steps: [
        {
          id: "trimester-1",
          number: "01",
          name: "Trimestrul 1",
          weeks: "Săptămânile 1–12",
          developmentTitle: "Se formează organele și începe să bată inima",
          developmentDesc:
            "În primele 12 săptămâni se formează creierul, măduva spinării și celelalte organe. Inima începe să bată pe la săptămâna 5 sau 6. La sfârșitul trimestrului, embrionul are cam 6 centimetri.",
          whoContact:
            "Vizita 1 (înainte de săptămâna 12). Medicul confirmă sarcina, vede de câte săptămâni ești și face planul de îngrijire.",
          clinicalChecklist: [
            "Ecografie, ca să vezi dacă sarcina evoluează bine și de câte săptămâni este.",
            "Analize de sânge, grupa de sânge și Rh (ca să previi problemele de incompatibilitate Rh).",
            "Teste pentru hepatita B, sifilis, HIV și pentru imunitatea la rubeolă.",
            "Analiza de urină și urocultură, pentru infecțiile urinare care nu dau semne.",
          ],
          selfCare:
            "Ia zilnic 400 micrograme de acid folic. Previne malformațiile creierului și ale coloanei. Bea multă apă, nu fuma, nu bea alcool și plimbă-te ușor.",
          redFlags:
            "Durere puternică jos în burtă sau pe o parte (poate fi sarcină în afara uterului). Sângerare vaginală abundentă. Vărsături repetate care nu te lasă să bei apă.",
        },
        {
          id: "trimester-2",
          number: "02",
          name: "Trimestrul 2",
          weeks: "Săptămânile 13–27",
          developmentTitle: "Copilul crește repede și începe să se miște",
          developmentDesc:
            "Oasele se întăresc, fața prinde contur și copilul începe să audă sunete. Între săptămânile 18 și 20 simți primele mișcări.",
          whoContact:
            "Vizitele 2 și 3 (săptămânile 20 și 26). Medicul verifică cum crește copilul, îți ia tensiunea și urmărește diabetul de sarcină.",
          clinicalChecklist: [
            "Ecografia morfologică (săptămânile 20–22), care verifică organele copilului.",
            "Tensiunea și greutatea la fiecare vizită, ca să se vadă din timp preeclampsia (tensiune mare în sarcină).",
            "Testul de toleranță la glucoză (OGTT, săptămânile 24–28), pentru diabetul de sarcină.",
            "Proteinele din urină, la fiecare control.",
          ],
          selfCare:
            "Mănâncă alimente cu fier și calciu. Dormi pe partea stângă, ca sângele să ajungă mai bine la placentă. Fă exerciții ușoare de respirație.",
          redFlags:
            "Fața, mâinile sau picioarele se umflă brusc și ai durere mare de cap sau vezi încețoșat (semne de preeclampsie). Îți curge lichid din vagin. Ai contracții dureroase, regulate.",
        },
        {
          id: "trimester-3",
          number: "03",
          name: "Trimestrul 3",
          weeks: "Săptămânile 28–40",
          developmentTitle: "Copilul se pregătește de naștere",
          developmentDesc:
            "Copilul pune grăsime sub piele și plămânii se maturizează. De obicei se întoarce cu capul în jos, gata de naștere.",
          whoContact:
            "Vizitele 4–8 (săptămânile 30, 34, 36, 38 și 40). Medicul verifică poziția copilului și cum te simți. Vorbiți despre naștere.",
          clinicalChecklist: [
            "Ecografie pentru creșterea copilului și cantitatea de lichid amniotic.",
            "Încă o hemoleucogramă, pentru anemia din sarcină.",
            "Testul pentru streptococul de grup B (probă din vagin și rect, săptămânile 35–37).",
            "Numără zilnic mișcările copilului după masă. Pregătește bagajul pentru maternitate.",
          ],
          selfCare:
            "Odihnește-te. Vorbește cu medicul sau moașa despre naștere. Mergi la cursuri pentru naștere și află despre alăptare.",
          redFlags:
            "Copilul se mișcă mult mai puțin sau deloc. Sângerare roșie aprinsă. Ți se rupe apa (lichid clar sau verzui). Contracții dureroase la mai puțin de 5 minute una de alta.",
        },
      ],
    },
    screeningTrack: {
      title: "Controale pentru sâni și colul uterin",
      intro:
        "O problemă găsită devreme se tratează mai ușor. Învață să-ți cunoști corpul și află când faci controalele.",
      hotspots: [
        {
          id: "breast-awareness",
          title: "Verificarea sânilor",
          summary:
            "Când știi cum arată și cum se simt sânii tăi, observi mai repede orice schimbare.",
          rule3Steps: [
            {
              stepName: "Privește",
              desc: "Uită-te la sâni în oglindă, cu brațele jos și apoi ridicate. Caută schimbări de formă, piele adâncită, mamelon tras înăuntru sau altă culoare.",
            },
            {
              stepName: "Simte",
              desc: "O dată pe lună, la 3–5 zile după menstruație, pipăie sânii cu vârful a trei degete. Fă cercuri mici pe tot sânul și la subraț.",
            },
            {
              stepName: "Mergi la medic",
              desc: "Dacă simți un nod tare sau o zonă îngroșată, ori îți curge ceva din mamelon, mergi repede la medicul de familie sau la ginecolog.",
            },
          ],
          ageGuidance: [
            {
              ageRange: "Sub 40 de ani",
              guidance:
                "Consult la sâni o dată pe an, la ginecolog sau la medicul de familie. Ecografie, dacă ai sânii denși sau dacă îți recomandă medicul.",
            },
            {
              ageRange: "50–69 de ani",
              guidance:
                "Mamografie la ambii sâni o dată la 2 ani, după ghidurile europene.",
            },
          ],
        },
        {
          id: "cervical-screening",
          title: "Testul pentru colul uterin și HPV",
          summary:
            "Peste 90% din cazurile de cancer de col uterin pot fi prevenite. Ajută vaccinul HPV și controalele regulate.",
          examExplanation:
            "Testul Babeș-Papanicolau e rapid și nu doare. Medicul ia câteva celule de pe colul uterin.",
          nationalProgramNote:
            "În România, femeile de la 24/25 până la 64 de ani fac testul gratuit, cu bilet de trimitere de la medicul de familie.",
          recommendedIntervals: [
            "Între 25 și 29 de ani: testul Babeș-Papanicolau o dată la 3 ani, dacă nu ai simptome.",
            "Între 30 și 64 de ani: testul HPV (tipurile cu risc mare de cancer) o dată la 5 ani.",
          ],
          vaccinationNote:
            "În România, vaccinul HPV e gratuit pentru fete și băieți între 11 și 18 ani. Îl ceri la medicul de familie.",
          warningSigns:
            "sângerare după sex, sângerare între menstruații sau orice sângerare după menopauză.",
        },
      ],
    },
    emergencyNote:
      "Durerea puternică jos în burtă, sângerarea abundentă sau febra mare cer ajutor de urgență. Sună la 112.",
    call112Label: "Sună la 112",
    credit:
      "Surse: Organizația Mondială a Sănătății și ghidurile europene de screening pentru cancerul de col uterin și de sân.",
  },
  en: {
    title: "Pregnancy and checkups for women",
    subtitle:
      "What happens in each trimester of pregnancy, and which breast and cervical checks to have.",
    listenLabel: "Listen to this page",
    audioSummary:
      "Pregnancy by trimester, with the 8 visits the World Health Organization advises. And checks for the breasts and the cervix.",
    fetalDevelopmentTitle: "How your baby grows",
    clinicalChecklistTitle: "Tests and checks",
    selfCarePrefix: "What you can do:",
    redFlagsPrefix: "Warning signs:",
    breastAwarenessRule3Title: "How to check your breasts",
    ageGuidanceTitle: "Which checks, by age",
    nationalProgramPrefix: "Free national programme:",
    recommendedIntervalsTitle: "How often",
    hpvVaccinationPrefix: "HPV vaccination:",
    promptConsultationPrefix: "See a gynecologist soon if you have:",
    trackAriaLabel: "Pregnancy and screening",
    trimesterGroupLabel: "Choose a trimester",
    checkGroupLabel: "Choose a check",
    whoContactTitle: "Doctor visits advised by the WHO",
    tabs: {
      pregnancy: "Pregnancy by trimester",
      screening: "Preventive checks",
    },
    pregnancyTrack: {
      title: "Pregnancy, trimester by trimester",
      intro:
        "Checkups in pregnancy protect you and your baby. The World Health Organization advises 8 visits to a doctor.",
      steps: [
        {
          id: "trimester-1",
          number: "01",
          name: "Trimester 1",
          weeks: "Weeks 1 to 12",
          developmentTitle: "The organs form and the heart starts beating",
          developmentDesc:
            "In the first 12 weeks, the brain, spinal cord and other organs form. The heart starts beating around week 5 or 6. By the end of the trimester, the embryo is about 6 centimeters long.",
          whoContact:
            "Visit 1 (before week 12). The doctor confirms the pregnancy, works out how many weeks you are and plans your care.",
          clinicalChecklist: [
            "An ultrasound to check the pregnancy is going well, where it is and how many weeks it is.",
            "Blood tests, blood group and Rh factor (to prevent Rh incompatibility problems).",
            "Tests for hepatitis B, syphilis, HIV and immunity to rubella.",
            "Urine test and urine culture, for urine infections that cause no symptoms.",
          ],
          selfCare:
            "Take 400 micrograms of folic acid every day. It prevents defects of the brain and spine. Drink plenty of water, don't smoke or drink alcohol, and take gentle walks.",
          redFlags:
            "Strong pain low in the belly or on one side (it may be a pregnancy outside the womb). Heavy bleeding from the vagina. Vomiting so often you cannot keep water down.",
        },
        {
          id: "trimester-2",
          number: "02",
          name: "Trimester 2",
          weeks: "Weeks 13 to 27",
          developmentTitle: "The baby grows fast and starts to move",
          developmentDesc:
            "The bones get stronger, the face takes shape and the baby starts to hear sounds. Between weeks 18 and 20, you usually feel the first movements.",
          whoContact:
            "Visits 2 and 3 (weeks 20 and 26). The doctor checks how the baby is growing, takes your blood pressure and checks for pregnancy diabetes.",
          clinicalChecklist: [
            "The anomaly scan (weeks 20 to 22), which checks the baby's organs.",
            "Blood pressure and weight at every visit, to spot preeclampsia (high blood pressure in pregnancy) early.",
            "Glucose tolerance test (OGTT, weeks 24 to 28), for pregnancy diabetes.",
            "Protein in your urine, at every checkup.",
          ],
          selfCare:
            "Eat foods with iron and calcium. Sleep on your left side so more blood reaches the placenta. Do gentle breathing exercises.",
          redFlags:
            "Your face, hands or ankles swell suddenly and you have a bad headache or blurred vision (signs of preeclampsia). Fluid leaks from your vagina. You have regular, painful contractions.",
        },
        {
          id: "trimester-3",
          number: "03",
          name: "Trimester 3",
          weeks: "Weeks 28 to 40",
          developmentTitle: "The baby gets ready for birth",
          developmentDesc:
            "The baby puts on weight and fat under the skin, and the lungs mature. Usually the baby turns head down, ready for birth.",
          whoContact:
            "Visits 4 to 8 (weeks 30, 34, 36, 38 and 40). The doctor checks the baby's position and how you feel. You talk about the birth.",
          clinicalChecklist: [
            "An ultrasound for the baby's growth and the amount of amniotic fluid.",
            "Another blood count, to check for anemia in pregnancy.",
            "Test for group B strep (swab from the vagina and rectum, weeks 35 to 37).",
            "Count the baby's movements every day after meals. Pack your bag for the hospital.",
          ],
          selfCare:
            "Rest well. Talk to your midwife or doctor about the birth. Go to antenatal classes and learn about breastfeeding.",
          redFlags:
            "The baby moves much less or stops moving. Bright red bleeding from the vagina. Your waters break (clear or green fluid). Painful contractions less than 5 minutes apart.",
        },
      ],
    },
    screeningTrack: {
      title: "Breast and cervical checks",
      intro:
        "A problem found early is easier to treat. Get to know your body and find out when to have checks.",
      hotspots: [
        {
          id: "breast-awareness",
          title: "Checking your breasts",
          summary:
            "When you know how your breasts normally look and feel, you notice changes sooner.",
          rule3Steps: [
            {
              stepName: "Look",
              desc: "Look at your breasts in a mirror, arms down and then raised. Check for a change in shape, dimpled skin, a nipple pulled in or a new color.",
            },
            {
              stepName: "Feel",
              desc: "Once a month, 3 to 5 days after your period, feel your breasts with the pads of three fingers. Make small circles over the whole breast and the armpit.",
            },
            {
              stepName: "See a doctor",
              desc: "If you feel a hard lump or a thick area, or fluid comes out of your nipple, see your family doctor or gynecologist soon.",
            },
          ],
          ageGuidance: [
            {
              ageRange: "Under 40",
              guidance:
                "A breast exam once a year at your gynecologist or family doctor. An ultrasound if you have dense breasts or your doctor advises it.",
            },
            {
              ageRange: "Ages 50 to 69",
              guidance:
                "A mammogram of both breasts every 2 years, as European guidelines advise.",
            },
          ],
        },
        {
          id: "cervical-screening",
          title: "Cervical test and HPV",
          summary:
            "More than 90% of cervical cancer can be prevented. The HPV vaccine and regular checks help.",
          examExplanation:
            "The Pap test takes about 3 minutes and usually does not hurt. The doctor takes a few cells from the cervix.",
          nationalProgramNote:
            "In Romania, women aged 24 or 25 to 64 can have the test free, with a referral from their family doctor.",
          recommendedIntervals: [
            "Ages 25 to 29: a Pap test every 3 years, if you have no symptoms.",
            "Ages 30 to 64: an HPV test (high-risk types) every 5 years.",
          ],
          vaccinationNote:
            "In Romania, the HPV vaccine is free for girls and boys aged 11 to 18. Ask your family doctor.",
          warningSigns:
            "bleeding after sex, bleeding between periods or any bleeding after menopause.",
        },
      ],
    },
    emergencyNote:
      "Strong pain low in the belly, heavy bleeding or a high fever need urgent care. Call 112.",
    call112Label: "Call 112",
    credit:
      "Sources: World Health Organization and European screening guidelines for cervical and breast cancer.",
  },
  sq: {
    title: "Shtatzënia dhe kontrollet për gratë",
    subtitle:
      "Çfarë ndodh në çdo tremujor të shtatzënisë dhe cilat kontrolle të bësh për gjirin dhe qafën e mitrës.",
    listenLabel: "Dëgjo tekstin",
    audioSummary:
      "Shtatzënia sipas tremujorëve, me 8 vizitat që këshillon Organizata Botërore e Shëndetësisë. Dhe kontrollet për gjirin dhe qafën e mitrës.",
    fetalDevelopmentTitle: "Si rritet foshnja",
    clinicalChecklistTitle: "Analizat dhe kontrollet",
    selfCarePrefix: "Çfarë mund të bësh:",
    redFlagsPrefix: "Shenja alarmi:",
    breastAwarenessRule3Title: "Si t'i kontrollosh gjinjtë",
    ageGuidanceTitle: "Cilat kontrolle, sipas moshës",
    nationalProgramPrefix: "Program kombëtar falas:",
    recommendedIntervalsTitle: "Sa shpesh",
    hpvVaccinationPrefix: "Vaksinimi kundër HPV:",
    promptConsultationPrefix: "Shko shpejt te gjinekologu nëse ke:",
    trackAriaLabel: "Shtatzënia dhe depistimi",
    trimesterGroupLabel: "Zgjidh tremujorin",
    checkGroupLabel: "Zgjidh kontrollin",
    whoContactTitle: "Vizitat te mjeku sipas OBSH-së",
    tabs: {
      pregnancy: "Shtatzënia sipas tremujorëve",
      screening: "Kontrollet parandaluese",
    },
    pregnancyTrack: {
      title: "Shtatzënia sipas tremujorëve",
      intro:
        "Kontrollet gjatë shtatzënisë mbrojnë ty dhe foshnjën. Organizata Botërore e Shëndetësisë këshillon 8 vizita te mjeku.",
      steps: [
        {
          id: "trimester-1",
          number: "01",
          name: "Tremujori 1",
          weeks: "Javët 1 deri 12",
          developmentTitle: "Formohen organet dhe zemra fillon të rrahë",
          developmentDesc:
            "Në 12 javët e para formohen truri, palca kurrizore dhe organet e tjera. Zemra fillon të rrahë rreth javës 5 ose 6. Në fund të tremujorit, embrioni është rreth 6 centimetra.",
          whoContact:
            "Vizita 1 (para javës 12). Mjeku konfirmon shtatzëninë, sheh sa javë je dhe bën planin e kujdesit.",
          clinicalChecklist: [
            "Ekografi, për të parë nëse shtatzënia po ecën mirë dhe sa javë është.",
            "Analizat e gjakut, grupi i gjakut dhe faktori Rh (për të parandaluar problemet me Rh).",
            "Testet për hepatitin B, sifilizin, HIV-in dhe imunitetin ndaj rubeolës.",
            "Analiza e urinës dhe urokultura, për infeksionet urinare pa simptoma.",
          ],
          selfCare:
            "Merr çdo ditë 400 mikrogramë acid folik. Parandalon defektet e trurit dhe të shtyllës kurrizore. Pi shumë ujë, mos pi duhan as alkool dhe ec qetësisht.",
          redFlags:
            "Dhimbje e fortë në fund të barkut ose në njërën anë (mund të jetë shtatzëni jashtë mitrës). Gjakderdhje e madhe nga vagina. Të vjella të shpeshta që nuk të lënë të pish ujë.",
        },
        {
          id: "trimester-2",
          number: "02",
          name: "Tremujori 2",
          weeks: "Javët 13 deri 27",
          developmentTitle: "Foshnja rritet shpejt dhe fillon të lëvizë",
          developmentDesc:
            "Kockat forcohen, fytyra merr formë dhe foshnja fillon të dëgjojë tinguj. Midis javës 18 dhe 20 ndien lëvizjet e para.",
          whoContact:
            "Vizitat 2 dhe 3 (javët 20 dhe 26). Mjeku sheh si rritet foshnja, të mat tensionin dhe kontrollon për diabet shtatzënie.",
          clinicalChecklist: [
            "Ekografia morfologjike (javët 20 deri 22), që kontrollon organet e foshnjës.",
            "Tensioni dhe pesha në çdo vizitë, për të zbuluar herët preeklampsinë (tension i lartë në shtatzëni).",
            "Testi i ngarkesës me glukozë (OGTT, javët 24 deri 28), për diabetin e shtatzënisë.",
            "Proteinat në urinë, në çdo kontroll.",
          ],
          selfCare:
            "Ha ushqime me hekur dhe kalcium. Fli në anën e majtë, që gjaku të shkojë më mirë te placenta. Bëj ushtrime të lehta frymëmarrjeje.",
          redFlags:
            "Fytyra, duart ose këmbët fryhen papritur dhe ke dhimbje të fortë koke ose sheh turbull (shenja të preeklampsisë). Të rrjedh lëng nga vagina. Ke kontraksione të rregullta me dhimbje.",
        },
        {
          id: "trimester-3",
          number: "03",
          name: "Tremujori 3",
          weeks: "Javët 28 deri 40",
          developmentTitle: "Foshnja përgatitet për lindjen",
          developmentDesc:
            "Foshnja shton peshë dhe dhjamë nën lëkurë, dhe mushkëritë piqen. Zakonisht kthehet me kokë poshtë, gati për lindjen.",
          whoContact:
            "Vizitat 4 deri 8 (javët 30, 34, 36, 38 dhe 40). Mjeku kontrollon pozicionin e foshnjës dhe si ndihesh. Flisni për lindjen.",
          clinicalChecklist: [
            "Ekografi për rritjen e foshnjës dhe sasinë e lëngut amniotik.",
            "Analiza e gjakut sërish, për aneminë e shtatzënisë.",
            "Testi për streptokokun e grupit B (tampon nga vagina dhe rektumi, javët 35 deri 37).",
            "Numëro çdo ditë lëvizjet e foshnjës pas ngrënies. Përgatit çantën për maternitetin.",
          ],
          selfCare:
            "Pusho mjaftueshëm. Fol me mjekun ose maminë për lindjen. Ndiq kurset për lindjen dhe mëso për ushqyerjen me gji.",
          redFlags:
            "Foshnja lëviz shumë më pak ose ndalon. Gjakderdhje e kuqe e ndezur. Të plasin ujërat. Kontraksione me dhimbje më pak se 5 minuta larg njëra-tjetrës.",
        },
      ],
    },
    screeningTrack: {
      title: "Kontrollet e gjirit dhe të qafës së mitrës",
      intro:
        "Një problem i gjetur herët trajtohet më lehtë. Mëso ta njohësh trupin tënd dhe kur t'i bësh kontrollet.",
      hotspots: [
        {
          id: "breast-awareness",
          title: "Kontrolli i gjinjve",
          summary:
            "Kur e di si duken dhe si ndihen gjinjtë e tu, i vë re më shpejt ndryshimet.",
          rule3Steps: [
            {
              stepName: "Shiko",
              desc: "Shiko gjinjtë në pasqyrë, me krahët poshtë dhe pastaj lart. Kërko ndryshime në formë, lëkurë të tërhequr, thithë të futur brenda ose ngjyrë tjetër.",
            },
            {
              stepName: "Prek",
              desc: "Një herë në muaj, 3 deri 5 ditë pas menstruacioneve, prek gjinjtë me majat e tre gishtave. Bëj rrathë të vegjël në gjithë gjirin dhe nën sqetull.",
            },
            {
              stepName: "Shko te mjeku",
              desc: "Nëse ndien një gungë të fortë ose një vend të trashur, ose të rrjedh diçka nga thitha, shko shpejt te mjeku i familjes ose te gjinekologu.",
            },
          ],
          ageGuidance: [
            {
              ageRange: "Nën 40 vjeç",
              guidance:
                "Kontroll i gjirit një herë në vit te gjinekologu ose mjeku i familjes. Ekografi nëse ke gji të dendur ose nëse ta këshillon mjeku.",
            },
            {
              ageRange: "50 deri 69 vjeç",
              guidance:
                "Mamografi e të dy gjinjve çdo 2 vjet, sipas udhëzimeve evropiane.",
            },
          ],
        },
        {
          id: "cervical-screening",
          title: "Testi i qafës së mitrës dhe HPV",
          summary:
            "Mbi 90% e rasteve të kancerit të qafës së mitrës mund të parandalohen. Ndihmojnë vaksina HPV dhe kontrollet e rregullta.",
          examExplanation:
            "Testi Papanikolau është i shpejtë dhe nuk dhemb. Mjeku merr pak qeliza nga qafa e mitrës.",
          nationalProgramNote:
            "Gratë 25 deri 64 vjeç e bëjnë testin falas, me rekomandim nga mjeku i familjes.",
          recommendedIntervals: [
            "25 deri 29 vjeç: testi Papanikolau çdo 3 vjet, nëse nuk ke simptoma.",
            "30 deri 64 vjeç: testi HPV çdo 5 vjet.",
          ],
          vaccinationNote:
            "Vaksina HPV mbron nga llojet kryesore të virusit. Fëmijët dhe adoleshentët e marrin falas në qendrën shëndetësore.",
          warningSigns:
            "gjakderdhje pas marrëdhënies seksuale, midis menstruacioneve ose çdo gjakderdhje pas menopauzës.",
        },
      ],
    },
    emergencyNote:
      "Dhimbja e fortë në fund të barkut, gjakderdhja e madhe ose temperatura e lartë kërkojnë ndihmë urgjente. Telefono 112.",
    call112Label: "Telefono 112",
    credit:
      "Burimet: Organizata Botërore e Shëndetësisë dhe udhëzimet evropiane për depistimin e kancerit të qafës së mitrës dhe të gjirit.",
  },
  it: {
    title: "Gravidanza e controlli per le donne",
    subtitle:
      "Cosa succede in ogni trimestre di gravidanza e quali controlli fare per seno e collo dell'utero.",
    listenLabel: "Ascolta il testo",
    audioSummary:
      "La gravidanza trimestre per trimestre, con le 8 visite consigliate dall'Organizzazione Mondiale della Sanità. E i controlli per seno e collo dell'utero.",
    fetalDevelopmentTitle: "Come cresce il bambino",
    clinicalChecklistTitle: "Esami e controlli",
    selfCarePrefix: "Cosa puoi fare tu:",
    redFlagsPrefix: "Segnali di allarme:",
    breastAwarenessRule3Title: "Come controllare il seno",
    ageGuidanceTitle: "Quali controlli, in base all'età",
    nationalProgramPrefix: "Programma nazionale gratuito:",
    recommendedIntervalsTitle: "Ogni quanto",
    hpvVaccinationPrefix: "Vaccinazione HPV:",
    promptConsultationPrefix: "Vai presto dal ginecologo se hai:",
    trackAriaLabel: "Gravidanza e screening",
    trimesterGroupLabel: "Scegli il trimestre",
    checkGroupLabel: "Scegli il controllo",
    whoContactTitle: "Visite consigliate dall'OMS",
    tabs: {
      pregnancy: "Gravidanza per trimestri",
      screening: "Controlli preventivi",
    },
    pregnancyTrack: {
      title: "Gravidanza per trimestri",
      intro:
        "I controlli in gravidanza proteggono te e il bambino. L'Organizzazione Mondiale della Sanità consiglia 8 visite.",
      steps: [
        {
          id: "trimester-1",
          number: "01",
          name: "Primo trimestre",
          weeks: "Settimane 1-12",
          developmentTitle: "Si formano gli organi e il cuore inizia a battere",
          developmentDesc:
            "Nelle prime 12 settimane si formano cervello, midollo spinale e gli altri organi. Il cuore inizia a battere verso la settimana 5 o 6. Alla fine del trimestre l'embrione misura circa 6 centimetri.",
          whoContact:
            "Visita 1 (prima della settimana 12). Il medico conferma la gravidanza, calcola di quante settimane sei e organizza le cure.",
          clinicalChecklist: [
            "Ecografia, per vedere se la gravidanza procede bene e di quante settimane è.",
            "Esami del sangue, gruppo sanguigno e fattore Rh (per prevenire problemi di incompatibilità Rh).",
            "Test per epatite B, sifilide, HIV e immunità alla rosolia.",
            "Esame delle urine e urinocoltura, per infezioni urinarie senza sintomi.",
          ],
          selfCare:
            "Prendi ogni giorno 400 microgrammi di acido folico. Previene malformazioni del cervello e della colonna. Bevi molta acqua, niente fumo né alcol, e fai passeggiate tranquille.",
          redFlags:
            "Dolore forte al basso ventre o su un solo lato (può essere una gravidanza fuori dall'utero). Sanguinamento vaginale abbondante. Vomito continuo che non ti fa tenere l'acqua.",
        },
        {
          id: "trimester-2",
          number: "02",
          name: "Secondo trimestre",
          weeks: "Settimane 13-27",
          developmentTitle: "Il bambino cresce in fretta e inizia a muoversi",
          developmentDesc:
            "Le ossa si rafforzano, il viso prende forma e il bambino inizia a sentire i suoni. Tra la settimana 18 e la 20 senti i primi movimenti.",
          whoContact:
            "Visite 2 e 3 (settimane 20 e 26). Il medico controlla la crescita del bambino, ti misura la pressione e controlla il diabete in gravidanza.",
          clinicalChecklist: [
            "Ecografia morfologica (settimane 20-22), che controlla gli organi del bambino.",
            "Pressione e peso a ogni visita, per scoprire presto la preeclampsia (pressione alta in gravidanza).",
            "Curva da carico di glucosio (OGTT, settimane 24-28), per il diabete in gravidanza.",
            "Proteine nelle urine, a ogni controllo.",
          ],
          selfCare:
            "Mangia cibi con ferro e calcio. Dormi sul fianco sinistro, così arriva più sangue alla placenta. Fai esercizi di respirazione leggeri.",
          redFlags:
            "Viso, mani o caviglie si gonfiano all'improvviso e hai forte mal di testa o vedi male (segni di preeclampsia). Perdi liquido dalla vagina. Hai contrazioni regolari e dolorose.",
        },
        {
          id: "trimester-3",
          number: "03",
          name: "Terzo trimestre",
          weeks: "Settimane 28-40",
          developmentTitle: "Il bambino si prepara alla nascita",
          developmentDesc:
            "Il bambino prende peso e grasso sotto la pelle, e i polmoni maturano. Di solito si gira a testa in giù, pronto per il parto.",
          whoContact:
            "Visite da 4 a 8 (settimane 30, 34, 36, 38 e 40). Il medico controlla la posizione del bambino e come stai. Parlate del parto.",
          clinicalChecklist: [
            "Ecografia per la crescita del bambino e la quantità di liquido amniotico.",
            "Di nuovo l'emocromo, per l'anemia in gravidanza.",
            "Tampone vaginale e rettale per lo streptococco di gruppo B (settimane 35-37).",
            "Conta ogni giorno i movimenti del bambino dopo i pasti. Prepara la borsa per il parto.",
          ],
          selfCare:
            "Riposa bene. Parla del parto con l'ostetrica o il medico. Segui un corso preparto e informati sull'allattamento.",
          redFlags:
            "Il bambino si muove molto meno o non si muove più. Sangue rosso vivo dalla vagina. Ti si rompono le acque (liquido chiaro o colorato). Contrazioni dolorose a meno di 5 minuti l'una dall'altra.",
        },
      ],
    },
    screeningTrack: {
      title: "Controlli per seno e collo dell'utero",
      intro:
        "Un problema trovato presto si cura meglio. Impara a conoscere il tuo corpo e quando fare i controlli.",
      hotspots: [
        {
          id: "breast-awareness",
          title: "Controllare il seno",
          summary:
            "Se sai com'è di solito il tuo seno, ti accorgi prima dei cambiamenti.",
          rule3Steps: [
            {
              stepName: "Guarda",
              desc: "Guarda il seno allo specchio, con le braccia giù e poi alzate. Cerca cambi di forma, pelle con fossette, capezzolo rientrato o un colore diverso.",
            },
            {
              stepName: "Tocca",
              desc: "Una volta al mese, 3-5 giorni dopo il ciclo, tocca il seno con i polpastrelli di tre dita. Fai piccoli cerchi su tutto il seno e sotto l'ascella.",
            },
            {
              stepName: "Vai dal medico",
              desc: "Se senti un nodulo duro o una zona più spessa, o esce liquido dal capezzolo, vai presto dal medico di famiglia o dal ginecologo.",
            },
          ],
          ageGuidance: [
            {
              ageRange: "Meno di 40 anni",
              guidance:
                "Una visita al seno all'anno dal ginecologo o dal medico di famiglia. Ecografia se hai un seno denso o se te la consiglia il medico.",
            },
            {
              ageRange: "Da 50 a 69 anni",
              guidance:
                "Mammografia a entrambi i seni ogni 2 anni, come dicono le linee guida europee.",
            },
          ],
        },
        {
          id: "cervical-screening",
          title: "Test per il collo dell'utero e HPV",
          summary:
            "Oltre il 90% dei tumori del collo dell'utero si può prevenire. Aiutano il vaccino HPV e i controlli regolari.",
          examExplanation:
            "Il Pap test dura pochi minuti e non fa male. Il medico prende alcune cellule dal collo dell'utero.",
          nationalProgramNote:
            "Le donne tra 25 e 64 anni possono fare il test gratis, tramite il medico di famiglia.",
          recommendedIntervals: [
            "Tra 25 e 29 anni: Pap test ogni 3 anni, se non hai sintomi.",
            "Tra 30 e 64 anni: test HPV (tipi ad alto rischio) ogni 5 anni.",
          ],
          vaccinationNote:
            "Il vaccino HPV protegge dai tipi di virus più pericolosi. Per gli adolescenti è gratis nei servizi sanitari.",
          warningSigns:
            "sangue dopo i rapporti, tra un ciclo e l'altro o qualsiasi perdita di sangue dopo la menopausa.",
        },
      ],
    },
    emergencyNote:
      "Forte dolore al basso ventre, emorragie abbondanti o febbre alta richiedono cure urgenti. Chiama il 112.",
    call112Label: "Chiama il 112",
    credit:
      "Fonti: Organizzazione Mondiale della Sanità e linee guida europee per lo screening dei tumori del collo dell'utero e del seno.",
  },
};
