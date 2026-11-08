import type { ComponentType, SVGProps } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { translations } from "@/lib/i18n/translations";
import {
  ActivityIcon,
  AppleIcon,
  BrainIcon,
  DropletIcon,
  HeartIcon,
  NoSmokingIcon,
  SearchIcon,
  ShieldIcon,
} from "@/components/ui/icons";

export type HealthTopicContent = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  keyFacts: string[];
  recommendations: { title: string; description: string }[];
  warningSigns: string[];
};

type HealthTopicDictionary = {
  labels: {
    allTopics: string;
    whyItMatters: string;
    practicalSteps: string;
    seekAdviceTitle: string;
    seekAdviceBody: string;
    relatedTopics: string;
    readMore: string;
    disclaimer: string;
  };
  topics: HealthTopicContent[];
};

const dictionaries: Record<Lang, HealthTopicDictionary> = {
  en: {
    labels: {
      allTopics:
        "All health topics",
      whyItMatters:
        "Why it matters",
      practicalSteps:
        "What you can do",
      seekAdviceTitle:
        "When to see a doctor",
      seekAdviceBody:
        "See a doctor if you notice any of these signs. In an emergency, call 112 straight away.",
      relatedTopics:
        "Other guides",
      readMore:
        "Read more",
      disclaimer:
        "This information is not a diagnosis. Talk to a doctor about your own health.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Heart health",
        description:
          "Everyday habits that keep your heart and blood pressure healthy.",
        intro:
          "Your heart pumps blood around your body every minute of the day. Looking after it lowers your risk of heart disease and stroke. Most of the habits that help are small.",
        keyFacts: [
          "High blood pressure and cholesterol quietly strain your arteries and make your heart work harder for years without signs.",
          "A healthy heart and normal blood pressure give you better stamina, steadier breathing and lower risk of stroke.",
          "Using less salt, walking briskly most days and checking your blood pressure regularly protect your heart.",
        ],
        recommendations: [
          {
            title: "Move most days",
            description:
              "Walk briskly or do any activity you like. Short walks count too.",
          },
          {
            title: "Eat for your heart",
            description:
              "Eat more vegetables, fruit and whole grains. Use less salt and eat fewer ready-made foods.",
          },
          {
            title: "Check your numbers",
            description:
              "Have your blood pressure and cholesterol checked. Problems are easier to treat when found early.",
          },
        ],
        warningSigns: [
          "Chest pain, pressure or tightness, especially if it spreads to your arm, neck or jaw.",
          "Sudden shortness of breath, or a fast or irregular heartbeat.",
          "Tiredness that does not go away, or swollen legs.",
        ],
      },
      {
        slug: "diabetes",
        title: "Diabetes",
        description:
          "What raises your risk and how to keep your blood sugar steady.",
        intro:
          "Diabetes affects how your body handles sugar in the blood. Type 2 diabetes is often linked to daily habits. You can often delay or prevent it, and with the right help you can live well with it.",
        keyFacts: [
          "In type 2 diabetes, sugar stays in the blood instead of entering your cells, and can quietly harm blood vessels for years.",
          "Keeping your blood sugar steady gives you even energy through the day and protects your eyes, kidneys, nerves and heart.",
          "Small daily habits like filling half your plate with vegetables and walking after meals lower your risk.",
        ],
        recommendations: [
          {
            title: "Balance your plate",
            description:
              "Fill half your plate with vegetables. Choose wholegrain bread, rice and pasta.",
          },
          {
            title: "Stay active",
            description:
              "Moving regularly helps your body use blood sugar better.",
          },
          {
            title: "Get checked",
            description:
              "If diabetes runs in your family or you have other risk factors, ask your doctor for a simple blood test.",
          },
        ],
        warningSigns: [
          "Being very thirsty or needing to pee more often than usual.",
          "Losing weight without trying, or feeling tired all the time.",
          "Blurred vision, or cuts that heal slowly.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Healthy eating",
        description:
          "Cheap, simple food choices that keep you healthy.",
        intro:
          "Eating well does not have to be hard or expensive. A few simple rules, followed most days, give your body what it needs.",
        keyFacts: [
          "Fiber from vegetables and whole grains keeps your blood sugar and blood pressure steady.",
          "Simple home-cooked food gives you steady energy through the day and prevents tiredness after meals.",
          "Seasonal vegetables, beans and lentils are cheap, and drinking water instead of sugary drinks helps straight away.",
        ],
        recommendations: [
          {
            title: "More vegetables and fruit",
            description:
              "Add vegetables or fruit to most meals. Fresh or frozen are both fine.",
          },
          {
            title: "Cook at home",
            description:
              "Choose whole grains and home-cooked meals over ready-made food when you can.",
          },
          {
            title: "Drink water",
            description:
              "Make water your main drink. Limit sugary drinks and fruit juice.",
          },
        ],
        warningSigns: [
          "Losing or gaining weight quickly without trying.",
          "Stomach problems that do not go away, or loss of appetite.",
          "Feeling faint, weak or very tired even though you eat.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Physical activity",
        description:
          "Easy ways to move more, whatever your fitness.",
        intro:
          "Moving more is one of the best things you can do for your body and mind. You do not need a gym. Everyday movement counts.",
        keyFacts: [
          "Movement gets your blood flowing, strengthens your heart and muscles, and helps your cells use blood sugar for energy.",
          "Moving regularly gives you steadier energy, deeper sleep at night, and better balance and mobility.",
          "You do not need a gym: stand up every hour and take a 15–30 minute walk on most days.",
        ],
        recommendations: [
          {
            title: "Start small",
            description:
              "Begin with short walks or something you enjoy. Do a little more each week.",
          },
          {
            title: "Move most days",
            description:
              "A little movement most days does more than a hard workout now and then.",
          },
          {
            title: "Build strength",
            description:
              "Do things that work your muscles, like carrying bags, gardening or squats.",
          },
        ],
        warningSigns: [
          "Chest pain, dizziness or unusual breathlessness when you are active.",
          "Joint pain or swelling that gets worse when you move.",
          "Feeling faint, or an irregular heartbeat, when you exercise.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Mental health",
        description:
          "Look after your mind and know when to ask for help.",
        intro:
          "Your mental health is part of your health. Everyone has good and bad times. Asking for help when you need it is normal.",
        keyFacts: [
          "Long-term stress keeps stress hormones high, tightening your muscles, raising your pulse and disturbing your sleep.",
          "Looking after your mind helps you sleep better, focus during the day and stay connected with the people around you.",
          "Slow breathing exercises, regular sleep hours and talking openly with someone you trust ease tension quickly.",
        ],
        recommendations: [
          {
            title: "Stay in touch",
            description:
              "Spend time with people you trust. Being close to others protects your mind.",
          },
          {
            title: "Look after the basics",
            description:
              "Sleep, moving your body and time outdoors all help you feel better.",
          },
          {
            title: "Ask for help",
            description:
              "If things feel too much, talk to someone you trust or to a doctor.",
          },
        ],
        warningSigns: [
          "Feeling low, worried or hopeless for weeks.",
          "Finding it hard to cope with daily life, work or the people close to you.",
          "Thoughts of hurting yourself. If this happens, get help straight away.",
        ],
      },
      {
        slug: "smoking",
        title: "Quitting smoking",
        description:
          "Why quitting is worth it and what makes it easier.",
        intro:
          "Stopping smoking is one of the best things you can do for your health. Your body starts to recover quickly. Most people try several times before they stop for good.",
        keyFacts: [
          "Within hours of your last cigarette, oxygen levels rise, blood vessels relax and your lungs begin clearing themselves.",
          "As your lungs and circulation recover, you breathe more easily on stairs, cough less and regain your sense of taste.",
          "Setting a quit date, waiting out 3-minute cravings and asking your doctor for support double your chances of stopping.",
        ],
        recommendations: [
          {
            title: "Pick a quit date",
            description:
              "Choose a day and tell people you trust. Plan what you will do when you want to smoke.",
          },
          {
            title: "Get help",
            description:
              "Stop-smoking services and approved aids make it more likely you stay smoke-free.",
          },
          {
            title: "Keep trying",
            description:
              "If you smoke again, do not give up. Learn from it and try again.",
          },
        ],
        warningSigns: [
          "A cough that will not go away, or a change in a cough you have had for a long time.",
          "Coughing up blood, or chest pain that does not go away.",
          "Getting more and more out of breath doing everyday things.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Health screening",
        description:
          "Tests that find health problems early, often before you feel ill.",
        intro:
          "Screening looks for early signs of illness before you notice anything wrong. Problems found early are often easier to treat.",
        keyFacts: [
          "Many conditions like high blood pressure, diabetes or early cancers start quietly in the body long before any pain appears.",
          "Even when you feel well every day, a routine check gives you peace of mind and catches changes while treatment is simple.",
          "Ask your family doctor which free check-ups and age-appropriate screening tests you can book this year.",
        ],
        recommendations: [
          {
            title: "Ask what you need",
            description:
              "Ask your doctor which checks are right for your age and history.",
          },
          {
            title: "Go to your checks",
            description:
              "Reply to screening invitations and keep up with your regular check-ups.",
          },
          {
            title: "Share your family history",
            description:
              "Tell your doctor about illnesses in your family. It helps decide which tests you need.",
          },
        ],
        warningSigns: [
          "A new lump, unusual bleeding, or a mole that changes shape or colour.",
          "Any new symptom that does not go away and has no clear cause.",
          "A screening result that asks you to come back. Do not wait.",
        ],
      },
      {
        slug: "womens-health",
        title: "Women's health",
        description:
          "Your health at every age, from periods to menopause.",
        intro:
          "Women's health needs change through life, from periods and pregnancy to menopause and after. Knowing what is normal for you helps you notice when something changes.",
        keyFacts: [
          "A woman's body goes through natural hormone shifts from menstruation and pregnancy to menopause, affecting bones, heart and mood.",
          "Knowing what is normal for your body helps you spot breast changes, unusual bleeding or persistent pelvic pain early.",
          "Regular cervical screening, monthly breast self-checks and routine pregnancy visits find problems early when they are easiest to treat.",
        ],
        recommendations: [
          {
            title: "Know your normal",
            description:
              "Notice your usual cycle and body, so changes stand out.",
          },
          {
            title: "Keep up with check-ups",
            description:
              "Go to the screenings and appointments recommended for your age.",
          },
          {
            title: "Get help early",
            description:
              "Talk to a doctor about any symptom that worries you.",
          },
        ],
        warningSigns: [
          "Unusual bleeding, between periods or after menopause.",
          "Strong or long-lasting pain in your lower belly or pelvis.",
          "A new change in your breast, such as a lump, a dent or a change in the skin.",
        ],
      },
    ],
  },
  ro: {
    labels: {
      allTopics:
        "Toate ghidurile de sănătate",
      whyItMatters:
        "De ce contează",
      practicalSteps:
        "Ce poți face",
      seekAdviceTitle:
        "Când mergi la medic",
      seekAdviceBody:
        "Mergi la medic dacă observi unul dintre semnele de mai jos. Dacă e o urgență, sună imediat la 112.",
      relatedTopics:
        "Alte ghiduri",
      readMore:
        "Citește mai mult",
      disclaimer:
        "Aceste informații nu sunt un diagnostic. Pentru sănătatea ta, vorbește cu medicul.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Sănătatea inimii",
        description:
          "Obiceiuri simple pentru o inimă sănătoasă și o tensiune bună.",
        intro:
          "Inima pompează sângele prin corp în fiecare minut. Dacă ai grijă de ea, scade riscul de boli de inimă și de accident vascular.",
        keyFacts: [
          "Tensiunea mare și colesterolul crescut apasă în tăcere pe pereții arterelor și obosesc inima fără să dea semne.",
          "O inimă puternică și o tensiune bună îți dau rezistență la efort, respirație ușoară și risc mai mic de accident vascular.",
          "Mai puțină sare în mâncare, mersul pe jos în fiecare zi și măsurarea regulată a tensiunii îți protejează inima.",
        ],
        recommendations: [
          {
            title: "Mișcă-te des",
            description:
              "Mergi pe jos în pas vioi cât de des poți.",
          },
          {
            title: "Mănâncă sănătos",
            description:
              "Pune în farfurie mai multe legume, fructe și cereale integrale.",
          },
          {
            title: "Fă-ți controalele",
            description:
              "Verifică regulat tensiunea și colesterolul.",
          },
        ],
        warningSigns: [
          "Durere sau apăsare în piept, mai ales dacă se întinde spre braț sau maxilar.",
          "Lipsă bruscă de aer sau bătăi neregulate ale inimii.",
          "Oboseală care nu trece sau picioare umflate.",
        ],
      },
      {
        slug: "diabetes",
        title: "Diabet",
        description:
          "Ce crește riscul și cum ții zahărul din sânge sub control.",
        intro:
          "Diabetul schimbă felul în care corpul folosește zahărul din sânge. Cu ajutorul potrivit, poate fi prevenit sau ținut sub control.",
        keyFacts: [
          "În diabetul de tip 2, zahărul rămâne în sânge în loc să intre în celule și poate afecta vasele de sânge ani de zile fără semne clare.",
          "Când ții zahărul din sânge în echilibru, ai energie constantă peste zi și îți protejezi ochii, rinichii, nervii și inima.",
          "Schimbările mici făcute zi de zi, cum ar fi jumătate de farfurie cu legume și o plimbare după masă, scad riscul.",
        ],
        recommendations: [
          {
            title: "Echilibrează farfuria",
            description:
              "Umple jumătate din farfurie cu legume. Alege pâine și cereale integrale.",
          },
          {
            title: "Mișcă-te",
            description:
              "Mișcarea regulată ajută corpul să folosească mai bine zahărul din sânge.",
          },
          {
            title: "Fă analize",
            description:
              "Dacă ai factori de risc, cere medicului o analiză de sânge.",
          },
        ],
        warningSigns: [
          "Sete mare sau urinat des.",
          "Slăbești fără să vrei sau ești mereu obosit.",
          "Vezi încețoșat sau rănile se vindecă greu.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Alimentație sănătoasă",
        description:
          "Mâncare sănătoasă și ieftină, pentru fiecare zi.",
        intro:
          "Ca să mănânci sănătos, nu ai nevoie de rețete grele sau scumpe. Câteva reguli simple, respectate zilnic, te ajută mult.",
        keyFacts: [
          "Fibrele din legume și cereale integrale țin zahărul din sânge și tensiunea în limite normale.",
          "Mâncarea gătită simplu îți dă energie peste zi și te ferește de oboseala de după masă.",
          "Legumele de sezon, fasolea și lintea sunt ieftine, iar apa în loc de sucuri dulci ajută imediat.",
        ],
        recommendations: [
          {
            title: "Mai multe legume și fructe",
            description:
              "Pune legume sau fructe la cele mai multe mese.",
          },
          {
            title: "Gătește acasă",
            description:
              "Alege cereale integrale și mâncare gătită acasă.",
          },
          {
            title: "Bea apă",
            description:
              "Bea mai ales apă și cât mai puține sucuri dulci.",
          },
        ],
        warningSigns: [
          "Te îngrași sau slăbești mult în scurt timp.",
          "Probleme cu digestia care nu trec sau lipsa poftei de mâncare.",
          "Slăbiciune, amețeală sau oboseală neobișnuită.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Activitate fizică",
        description:
          "Cum te miști mai mult, oricât de puțin te-ai mișcat până acum.",
        intro:
          "Mișcarea regulată face bine corpului și minții. Nu ai nevoie de sală. Contează și mersul pe jos.",
        keyFacts: [
          "Mișcarea pune sângele în circulație, întărește inima și mușchii și ajută celulele să folosească zahărul din sânge.",
          "Când te miști regulat, ai mai multă energie, dormi mai bine noaptea și îți păstrezi echilibrul și mobilitatea.",
          "Nu ai nevoie de sală: ridică-te de pe scaun la fiecare oră și mergi pe jos 15–30 de minute în majoritatea zilelor.",
        ],
        recommendations: [
          {
            title: "Începe ușor",
            description:
              "Pornește cu plimbări scurte. Mergi puțin mai mult în fiecare săptămână.",
          },
          {
            title: "Mișcă-te regulat",
            description:
              "Puțină mișcare în fiecare zi ajută mai mult decât un efort mare din când în când.",
          },
          {
            title: "Lucrează mușchii",
            description:
              "Cară sacoșe, lucrează în grădină sau fă genuflexiuni.",
          },
        ],
        warningSigns: [
          "Durere în piept, amețeală sau lipsă de aer când faci efort.",
          "Dureri de încheieturi care se agravează când te miști.",
          "Simți că leșini sau inima bate neregulat în timpul exercițiilor.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Echilibru emoțional",
        description:
          "Ai grijă de mintea ta și cere ajutor când ai nevoie.",
        intro:
          "Sănătatea minții face parte din sănătatea ta. E normal să ai și perioade grele.",
        keyFacts: [
          "Stresul prelungit ține corpul în încordare, grăbește bătăile inimii, strânge mușchii și tulbură somnul.",
          "Când ai grijă de echilibrul emoțional, dormi mai liniștit, te concentrezi mai ușor și faci față mai bine grijilor.",
          "Respirația rară și adâncă, programul regulat de somn și o discuție deschisă cu cineva apropiat liniștesc corpul.",
        ],
        recommendations: [
          {
            title: "Păstrează legătura",
            description:
              "Vorbește des cu oamenii în care ai încredere.",
          },
          {
            title: "Ai grijă de lucrurile de bază",
            description:
              "Somnul, mișcarea și timpul petrecut afară te ajută.",
          },
          {
            title: "Cere ajutor",
            description:
              "Vorbește cu cineva de încredere sau cu un medic.",
          },
        ],
        warningSigns: [
          "Tristețe, griji sau lipsă de speranță care țin mai multe săptămâni.",
          "Nu mai faci față la muncă, acasă sau în relațiile cu ceilalți.",
          "Dacă te gândești să îți faci rău, cere ajutor imediat.",
        ],
      },
      {
        slug: "smoking",
        title: "Renunțarea la fumat",
        description:
          "De ce merită să te lași și ce te ajută.",
        intro:
          "Când te lași de fumat, faci unul dintre cele mai bune lucruri pentru sănătatea ta. Corpul începe repede să se refacă.",
        keyFacts: [
          "Din primele ore după ultima țigară, nivelul de oxigen din sânge urcă, vasele se relaxează și plămânii încep să se curețe.",
          "Pe măsură ce corpul se reface, respiri mai ușor când urci scările, tușești mai puțin și îți revin gustul și mirosul.",
          "Dacă îți alegi o zi de oprire, lași să treacă cele 3 minute de poftă și ceri sprijinul medicului, îți dublezi șansele de reușită.",
        ],
        recommendations: [
          {
            title: "Alege o zi",
            description:
              "Alege ziua în care te lași. Gândește-te dinainte ce faci când ai poftă de țigară.",
          },
          {
            title: "Cere ajutor",
            description:
              "Programele de renunțare la fumat și tratamentele aprobate te ajută.",
          },
          {
            title: "Nu renunța",
            description:
              "Dacă ai fumat din nou, încearcă iar.",
          },
        ],
        warningSigns: [
          "Tuse care nu trece sau tuse obișnuită care se schimbă.",
          "Tuși cu sânge sau ai durere în piept care nu trece.",
          "Rămâi tot mai des fără aer la treburile de zi cu zi.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Screening preventiv",
        description:
          "Controale care găsesc bolile devreme, înainte să ai semne.",
        intro:
          "Screeningul caută primele semne ale unei boli, chiar dacă te simți bine.",
        keyFacts: [
          "Multe afecțiuni, cum ar fi tensiunea mare, diabetul sau unele forme de cancer, încep în tăcere în corp, cu mult înainte să doară.",
          "Chiar când te simți în putere zi de zi, un control de rutină îți dă liniște și descoperă schimbările când se tratează ușor.",
          "Cere medicului de familie analizele gratuite și controalele decontate de CNAS potrivite pentru vârsta ta.",
        ],
        recommendations: [
          {
            title: "Întreabă ce îți trebuie",
            description:
              "Întreabă medicul de familie ce controale sunt potrivite pentru tine.",
          },
          {
            title: "Mergi la controale",
            description:
              "Mergi când ești chemat la screening și la controalele obișnuite.",
          },
          {
            title: "Spune ce boli sunt în familie",
            description:
              "Spune-i medicului ce boli au avut părinții, frații sau bunicii.",
          },
        ],
        warningSigns: [
          "Un nodul nou, o sângerare neobișnuită sau o aluniță care își schimbă forma.",
          "Orice semn nou care nu trece și nu știi de unde vine.",
          "Un rezultat la screening după care trebuie să mai faci analize.",
        ],
      },
      {
        slug: "womens-health",
        title: "Sănătatea femeii",
        description:
          "Sănătatea ta la fiecare vârstă, de la menstruație la menopauză.",
        intro:
          "Nevoile tale de sănătate se schimbă de-a lungul vieții. Dacă știi ce e normal pentru tine, observi mai ușor când ceva se schimbă.",
        keyFacts: [
          "Corpul femeii trece prin etape firești, de la menstruație și sarcină până la menopauză, ghidate de hormoni care influențează oasele și inima.",
          "Când îți cunoști corpul, observi din timp orice schimbare la sâni, sângerare neobișnuită sau durere care nu trece.",
          "Testul Babeș-Papanicolau, autoexaminarea lunară a sânilor și controalele regulate în sarcină depistează problemele devreme.",
        ],
        recommendations: [
          {
            title: "Cunoaște-ți corpul",
            description:
              "Fii atentă la ciclul tău și la corpul tău, ca să observi schimbările.",
          },
          {
            title: "Mergi la controale",
            description:
              "Mergi la consultațiile și screeningurile recomandate pentru vârsta ta.",
          },
          {
            title: "Cere ajutor din timp",
            description:
              "Vorbește devreme cu medicul despre orice semn care te îngrijorează.",
          },
        ],
        warningSigns: [
          "Sângerări neobișnuite, între menstruații sau după menopauză.",
          "Durere puternică sau care nu trece în partea de jos a burții.",
          "O schimbare nouă la sân, de exemplu un nodul sau pielea schimbată.",
        ],
      },
    ],
  },
  sq: {
    labels: {
      allTopics:
        "Të gjitha temat e shëndetit",
      whyItMatters:
        "Pse ka rëndësi",
      practicalSteps:
        "Çfarë mund të bësh",
      seekAdviceTitle:
        "Kur të shkosh te mjeku",
      seekAdviceBody:
        "Shko te mjeku nëse vë re një nga këto shenja. Në rast urgjence, telefono menjëherë 112.",
      relatedTopics:
        "Tema të tjera",
      readMore:
        "Lexo më shumë",
      disclaimer:
        "Ky informacion nuk është diagnozë. Për shëndetin tënd, fol me mjekun.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Shëndeti i zemrës",
        description:
          "Zakone të thjeshta për një zemër të shëndetshme dhe tension normal.",
        intro:
          "Zemra pompon gjakun në trup çdo minutë. Kur kujdesesh për të, ulet rreziku i sëmundjeve të zemrës dhe i goditjes në tru.",
        keyFacts: [
          "Tensioni i lartë dhe kolesteroli i shtuar rëndojnë në heshtje muret e arterieve dhe e lodhin zemrën pa dhënë shenja.",
          "Një zemër e fortë dhe tension normal të japin më shumë qëndrueshmëri, frymëmarrje të lehtë dhe rrezik më të ulët për goditje në tru.",
          "Më pak kripë në ushqim, ecja e përditshme dhe matja e rregullt e tensionit e mbrojnë zemrën.",
        ],
        recommendations: [
          {
            title: "Lëviz shpesh",
            description:
              "Ec me hap të shpejtë sa më shpesh që mundesh.",
          },
          {
            title: "Ha shëndetshëm",
            description:
              "Ha më shumë perime, fruta dhe drithëra integrale.",
          },
          {
            title: "Kontrollo vlerat",
            description:
              "Mat rregullisht tensionin dhe kontrollo kolesterolin.",
          },
        ],
        warningSigns: [
          "Dhimbje ose shtrëngim në gjoks, sidomos nëse shtrihet në krah ose në nofull.",
          "Mungesë e papritur ajri ose rrahje të parregullta të zemrës.",
          "Lodhje që nuk kalon ose këmbë të ënjtura.",
        ],
      },
      {
        slug: "diabetes",
        title: "Diabeti",
        description:
          "Çfarë e rrit rrezikun dhe si ta mbash sheqerin në gjak nën kontroll.",
        intro:
          "Diabeti ndikon në mënyrën si trupi përdor sheqerin në gjak. Me ndihmën e duhur, mund të parandalohet ose të mbahet nën kontroll.",
        keyFacts: [
          "Te diabeti i tipit 2, sheqeri mbetet në gjak në vend që të hyjë në qeliza dhe mund të dëmtojë enët e gjakut për vite pa shenja të qarta.",
          "Kur e mban sheqerin në ekuilibër, ke energji të qëndrueshme gjatë ditës dhe mbron sytë, veshkat, nervat dhe zemrën.",
          "Ndryshimet e vogla çdo ditë, si gjysma e pjatës me perime dhe një shëtitje pas vaktit, e ulin rrezikun.",
        ],
        recommendations: [
          {
            title: "Balanco pjatën",
            description:
              "Mbush gjysmën e pjatës me perime dhe zgjidh drithëra integrale.",
          },
          {
            title: "Lëviz rregullisht",
            description:
              "Lëvizja e rregullt e ndihmon trupin të përdorë më mirë sheqerin.",
          },
          {
            title: "Bëj analizat",
            description:
              "Nëse ke faktorë rreziku, kërkoji mjekut një analizë gjaku.",
          },
        ],
        warningSigns: [
          "Etje e madhe ose urinim i shpeshtë.",
          "Humb peshë pa dashur ose je gjithmonë i lodhur.",
          "Shikim i turbullt ose plagë që shërohen ngadalë.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Ushqyerja e shëndetshme",
        description:
          "Ushqime të shëndetshme dhe të lira për çdo ditë.",
        intro:
          "Të hash mirë nuk është e vështirë as e shtrenjtë. Disa rregulla të thjeshta, çdo ditë, të ndihmojnë shumë.",
        keyFacts: [
          "Fibrat nga perimet dhe drithërat integrale mbajnë sheqerin në gjak dhe tensionin në kufij normalë.",
          "Ushqimi i gatuar thjesht të jep energji gjatë ditës dhe shmang lodhjen pas ngrënies.",
          "Perimet e stinës, fasulet dhe thjerrëzat janë të lira, ndërsa uji në vend të pijeve me sheqer ndihmon menjëherë.",
        ],
        recommendations: [
          {
            title: "Më shumë perime dhe fruta",
            description:
              "Shto perime ose fruta në shumicën e vakteve.",
          },
          {
            title: "Gatuaj në shtëpi",
            description:
              "Zgjidh drithëra integrale dhe ushqime të gatuara në shtëpi.",
          },
          {
            title: "Pi ujë",
            description:
              "Pi kryesisht ujë dhe sa më pak pije të ëmbla.",
          },
        ],
        warningSigns: [
          "Shton ose humb shumë peshë në pak kohë.",
          "Probleme me tretjen që nuk kalojnë ose s'ke oreks.",
          "Dobësi, marramendje ose lodhje e pazakontë.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Aktiviteti fizik",
        description:
          "Mënyra të thjeshta për të lëvizur më shumë.",
        intro:
          "Lëvizja e rregullt i bën mirë trupit dhe mendjes. Nuk të duhet palestër. Edhe ecja ka vlerë.",
        keyFacts: [
          "Lëvizja vë gjakun në qarkullim, forcon zemrën dhe muskujt dhe ndihmon qelizat të përdorin sheqerin në gjak.",
          "Kur lëviz rregullisht, ke më shumë energji, fle më mirë natën dhe ruan ekuilibrin dhe lëvizshmërinë.",
          "Nuk të duhet palestër: çohu nga karrigia çdo orë dhe ec 15–30 minuta në shumicën e ditëve.",
        ],
        recommendations: [
          {
            title: "Fillo ngadalë",
            description:
              "Nis me ecje të shkurtra dhe shto pak nga pak.",
          },
          {
            title: "Lëviz çdo ditë",
            description:
              "Pak lëvizje çdo ditë vlen më shumë se një përpjekje e madhe herë pas here.",
          },
          {
            title: "Forco muskujt",
            description:
              "Mbaj çanta, puno në kopsht ose bëj mbledhje këmbësh.",
          },
        ],
        warningSigns: [
          "Dhimbje gjoksi, marramendje ose mungesë e pazakontë ajri kur lëviz.",
          "Dhimbje kyçesh që përkeqësohen kur lëviz.",
          "Të vjen të fikët ose zemra rreh e parregullt gjatë ushtrimeve.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Ekuilibri emocional",
        description:
          "Kujdesu për mendjen dhe kërko ndihmë kur të duhet.",
        intro:
          "Shëndeti mendor është pjesë e shëndetit tënd. Është normale të kesh edhe periudha të vështira.",
        keyFacts: [
          "Stresi i zgjatur e mban trupin të tendosur, shpejton rrahjet e zemrës, shtrëngon muskujt dhe prish gjumin.",
          "Kur kujdesesh për ekuilibrin emocional, fle më qetë, përqendrohesh më lehtë dhe i përballon më mirë shqetësimet.",
          "Frymëmarrja e ngadaltë e e thellë, orari i rregullt i gjumit dhe një bisedë e hapur me dikë të afërt e qetësojnë trupin.",
        ],
        recommendations: [
          {
            title: "Mos u izolo",
            description:
              "Mbaj lidhje me njerëzit që u beson.",
          },
          {
            title: "Kujdesu për bazat",
            description:
              "Gjumi, lëvizja dhe koha jashtë të ndihmojnë.",
          },
          {
            title: "Kërko ndihmë",
            description:
              "Fol me dikë që i beson ose me mjekun.",
          },
        ],
        warningSigns: [
          "Trishtim, ankth ose mungesë shprese që zgjat disa javë.",
          "Nuk po ia del me jetën e përditshme, punën ose marrëdhëniet.",
          "Nëse mendon të lëndosh veten, kërko ndihmë menjëherë.",
        ],
      },
      {
        slug: "smoking",
        title: "Lënia e duhanit",
        description:
          "Pse ia vlen ta lësh duhanin dhe çfarë të ndihmon.",
        intro:
          "Lënia e duhanit është një nga gjërat më të mira që mund të bësh për shëndetin. Trupi fillon të rimëkëmbet shpejt.",
        keyFacts: [
          "Që në orët e para pas cigares së fundit, niveli i oksigjenit rritet, enët e gjakut çlirohen dhe mushkëritë nisin të pastrohen.",
          "Ndërsa trupi rimëkëmbet, merr frymë më lehtë në shkallë, kollitesh më pak dhe të kthehen shija e nuhatja.",
          "Nëse zgjedh një ditë për ta lënë, kalon 3 minutat e dëshirës dhe kërkon mbështetjen e mjekut, i dyfishon shanset për t'ia dalë.",
        ],
        recommendations: [
          {
            title: "Zgjidh një datë",
            description:
              "Vendos ditën kur e lë. Mendo që më parë çfarë do të bësh kur të vijë dëshira për cigare.",
          },
          {
            title: "Kërko ndihmë",
            description:
              "Programet për lënien e duhanit dhe mjetet e miratuara e bëjnë më të lehtë.",
          },
          {
            title: "Mos u dorëzo",
            description:
              "Nëse e ndez sërish, provo përsëri.",
          },
        ],
        warningSigns: [
          "Kollë që nuk kalon ose ndryshim i kollës së zakonshme.",
          "Kollë me gjak ose dhimbje gjoksi që nuk kalon.",
          "Të mungon ajri gjithnjë e më shumë në punët e përditshme.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Kontrollet parandaluese",
        description:
          "Kontrolle që zbulojnë problemet herët, para se të kesh shenja.",
        intro:
          "Kontrollet parandaluese kërkojnë shenjat e para të një sëmundjeje, edhe kur ndihesh mirë.",
        keyFacts: [
          "Shumë probleme, si tensioni i lartë, diabeti apo disa lloje kanceri, nisin në heshtje në trup shumë kohë para se të dhembin.",
          "Edhe kur ndihesh mirë çdo ditë, një kontroll i rregullt të jep qetësi dhe i kap ndryshimet kur mjekohen lehtë.",
          "Kërkoji mjekut të familjes analizat falas dhe kontrollet e rekomanduara për moshën tënde.",
        ],
        recommendations: [
          {
            title: "Pyet çfarë të duhet",
            description:
              "Pyet mjekun cilat kontrolle rekomandohen për ty.",
          },
          {
            title: "Shko në kontrolle",
            description:
              "Mos i humb ftesat për kontroll dhe analizat e zakonshme.",
          },
          {
            title: "Trego sëmundjet në familje",
            description:
              "Tregoji mjekut çfarë sëmundjesh kanë pasur prindërit, vëllezërit, motrat ose gjyshërit.",
          },
        ],
        warningSigns: [
          "Një gungë e re, gjakderdhje e pazakontë ose nishan që ndryshon formë.",
          "Çdo shenjë e re që nuk kalon dhe nuk e di nga vjen.",
          "Një rezultat kontrolli që kërkon analiza të tjera.",
        ],
      },
      {
        slug: "womens-health",
        title: "Shëndeti i gruas",
        description:
          "Shëndeti yt në çdo moshë, nga cikli te menopauza.",
        intro:
          "Nevojat e tua për shëndetin ndryshojnë gjatë jetës. Kur di çfarë është normale për ty, e vë re më lehtë një ndryshim.",
        keyFacts: [
          "Trupi i gruas kalon nëpër faza të natyrshme nga cikli dhe shtatzënia deri te menopauza, të udhëhequra nga hormonet që ndikojnë kockat dhe zemrën.",
          "Kur e njeh trupin tënd, vë re me kohë çdo ndryshim në gji, gjakderdhje të pazakontë ose dhimbje që nuk kalon.",
          "Pap-testi, vetëkontrolli mujor i gjirit dhe vizitat e rregullta në shtatzëni i zbulojnë problemet herët.",
        ],
        recommendations: [
          {
            title: "Njih trupin tënd",
            description:
              "Ki parasysh ciklin dhe trupin tënd, që të vësh re ndryshimet.",
          },
          {
            title: "Shko në kontrolle",
            description:
              "Shko në vizitat dhe kontrollet e rekomanduara për moshën tënde.",
          },
          {
            title: "Kërko ndihmë herët",
            description:
              "Fol me mjekun për çdo shenjë që të shqetëson.",
          },
        ],
        warningSigns: [
          "Gjakderdhje e pazakontë, mes cikleve ose pas menopauzës.",
          "Dhimbje e fortë ose që nuk kalon në fund të barkut.",
          "Ndryshim i ri në gji, si gungë ose ndryshim i lëkurës.",
        ],
      },
    ],
  },
  it: {
    labels: {
      allTopics:
        "Tutte le guide sulla salute",
      whyItMatters:
        "Perché è importante",
      practicalSteps:
        "Cosa puoi fare",
      seekAdviceTitle:
        "Quando andare dal medico",
      seekAdviceBody:
        "Vai dal medico se noti uno di questi segnali. In caso di emergenza, chiama subito il 112.",
      relatedTopics:
        "Altre guide",
      readMore:
        "Leggi di più",
      disclaimer:
        "Queste informazioni non sono una diagnosi. Per la tua salute, parla con il medico.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Salute del cuore",
        description:
          "Abitudini semplici per un cuore sano e una pressione nella norma.",
        intro:
          "Il cuore pompa il sangue in tutto il corpo, ogni minuto. Se te ne prendi cura, riduci il rischio di malattie del cuore e di ictus.",
        keyFacts: [
          "La pressione alta e il colesterolo elevato affaticano in silenzio le arterie e il cuore per anni senza dare sintomi.",
          "Un cuore forte e una pressione normale ti danno più resistenza allo sforzo, respiro migliore e minor rischio di ictus.",
          "Usare meno sale a tavola, camminare ogni giorno e misurare regolarmente la pressione proteggono il cuore.",
        ],
        recommendations: [
          {
            title: "Muoviti spesso",
            description:
              "Cammina a passo svelto ogni volta che puoi.",
          },
          {
            title: "Mangia meglio",
            description:
              "Mangia più verdura, frutta e cereali integrali.",
          },
          {
            title: "Controlla i valori",
            description:
              "Fatti controllare spesso pressione e colesterolo.",
          },
        ],
        warningSigns: [
          "Dolore o peso al petto, soprattutto se arriva al braccio o alla mandibola.",
          "Fiato corto all'improvviso o battito irregolare.",
          "Stanchezza che non passa o gambe gonfie.",
        ],
      },
      {
        slug: "diabetes",
        title: "Diabete",
        description:
          "Cosa aumenta il rischio e come tenere sotto controllo lo zucchero nel sangue.",
        intro:
          "Il diabete cambia il modo in cui il corpo usa lo zucchero nel sangue. Con l'aiuto giusto, si può prevenire o tenere sotto controllo.",
        keyFacts: [
          "Nel diabete di tipo 2 lo zucchero resta nel sangue invece di entrare nelle cellule e può danneggiare i vasi per anni senza sintomi chiari.",
          "Tenere in equilibrio lo zucchero nel sangue ti dà energia costante durante il giorno e protegge occhi, reni, nervi e cuore.",
          "Piccoli cambiamenti ogni giorno, come metà piatto di verdure e una passeggiata dopo i pasti, riducono il rischio.",
        ],
        recommendations: [
          {
            title: "Bilancia il piatto",
            description:
              "Riempi metà piatto di verdura e scegli cereali integrali.",
          },
          {
            title: "Resta attivo",
            description:
              "Muoverti con regolarità aiuta il corpo a usare meglio lo zucchero.",
          },
          {
            title: "Fai le analisi",
            description:
              "Se hai fattori di rischio, chiedi al medico un esame del sangue.",
          },
        ],
        warningSigns: [
          "Molta sete o bisogno di urinare spesso.",
          "Perdi peso senza motivo o sei sempre stanco.",
          "Vista annebbiata o ferite che guariscono lentamente.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Alimentazione sana",
        description:
          "Cibo sano ed economico, per tutti i giorni.",
        intro:
          "Mangiare bene non deve essere complicato o costoso. Poche regole semplici, ogni giorno, ti aiutano molto.",
        keyFacts: [
          "Le fibre di verdure e cereali integrali tengono stabili lo zucchero nel sangue e la pressione.",
          "Il cibo cucinato in modo semplice ti dà energia costante e ti evita la stanchezza dopo i pasti.",
          "Verdure di stagione, fagioli e lenticchie costano poco, e bere acqua al posto delle bibite zuccherate aiuta subito.",
        ],
        recommendations: [
          {
            title: "Più verdura e frutta",
            description:
              "Aggiungi verdura o frutta alla maggior parte dei pasti.",
          },
          {
            title: "Cucina a casa",
            description:
              "Preferisci cereali integrali e piatti cucinati a casa.",
          },
          {
            title: "Bevi acqua",
            description:
              "Bevi soprattutto acqua e poche bibite zuccherate.",
          },
        ],
        warningSigns: [
          "Aumento o perdita di peso in poco tempo.",
          "Problemi di digestione che non passano o poca fame.",
          "Debolezza, capogiri o stanchezza insolita.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Attività fisica",
        description:
          "Modi semplici per muoverti di più.",
        intro:
          "Muoverti con regolarità fa bene al corpo e alla mente. Non ti serve la palestra. Anche camminare conta.",
        keyFacts: [
          "Il movimento attiva la circolazione, rafforza il cuore e i muscoli e aiuta le cellule a usare lo zucchero nel sangue.",
          "Muoverti con regolarità ti dà più energia, un sonno migliore e più equilibrio e mobilità ogni giorno.",
          "Non serve la palestra: alzati dalla sedia ogni ora e cammina per 15–30 minuti nella maggior parte dei giorni.",
        ],
        recommendations: [
          {
            title: "Inizia piano",
            description:
              "Comincia con brevi camminate e aumenta poco alla volta.",
          },
          {
            title: "Muoviti con costanza",
            description:
              "Un po' di movimento ogni giorno conta più di un grande sforzo ogni tanto.",
          },
          {
            title: "Rinforza i muscoli",
            description:
              "Porta la spesa, lavora in giardino o fai qualche piegamento sulle gambe.",
          },
        ],
        warningSigns: [
          "Dolore al petto, capogiri o fiato corto insolito durante l'attività.",
          "Dolore alle articolazioni che peggiora quando ti muovi.",
          "Senso di svenimento o battito irregolare durante l'esercizio.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Equilibrio emotivo",
        description:
          "Prenditi cura della mente e chiedi aiuto quando serve.",
        intro:
          "La salute mentale fa parte della tua salute. È normale avere anche periodi difficili.",
        keyFacts: [
          "Lo stress prolungato mantiene il corpo in tensione, accelera il battito, irrigidisce i muscoli e disturba il sonno.",
          "Quando ti prendi cura dell'equilibrio emotivo dormi più sereno, ti concentri meglio e affronti con più calma le preoccupazioni.",
          "La respirazione lenta e profonda, orari di sonno regolari e parlare apertamente con una persona fidata calmano il corpo.",
        ],
        recommendations: [
          {
            title: "Resta in contatto",
            description:
              "Tieniti in contatto con le persone di cui ti fidi.",
          },
          {
            title: "Cura le basi",
            description:
              "Sonno, movimento e tempo all'aperto ti aiutano.",
          },
          {
            title: "Chiedi aiuto",
            description:
              "Parla con una persona di fiducia o con il medico.",
          },
        ],
        warningSigns: [
          "Umore basso, ansia o mancanza di speranza per settimane.",
          "Fai fatica nella vita di tutti i giorni, al lavoro o con gli altri.",
          "Se pensi di farti del male, chiedi aiuto subito.",
        ],
      },
      {
        slug: "smoking",
        title: "Smettere di fumare",
        description:
          "Perché conviene smettere e cosa ti aiuta.",
        intro:
          "Smettere di fumare è una delle cose migliori che puoi fare per la tua salute. Il corpo comincia presto a riprendersi.",
        keyFacts: [
          "Già nelle prime ore dopo l'ultima sigaretta l'ossigeno nel sangue sale, i vasi si rilassano e i polmoni iniziano a pulirsi.",
          "Man mano che il corpo recupera respiri meglio sulle scale, tossisci meno e ritrovi gusto e olfatto.",
          "Scegliere un giorno per smettere, superare i 3 minuti di voglia e chiedere il supporto del medico raddoppiano le probabilità di riuscita.",
        ],
        recommendations: [
          {
            title: "Scegli una data",
            description:
              "Scegli il giorno in cui smetti. Pensa prima a cosa fare quando hai voglia di fumare.",
          },
          {
            title: "Fatti aiutare",
            description:
              "I centri antifumo e i prodotti approvati ti rendono tutto più facile.",
          },
          {
            title: "Non arrenderti",
            description:
              "Se ricominci a fumare, riprova.",
          },
        ],
        warningSigns: [
          "Tosse che non passa o tosse abituale che cambia.",
          "Sangue quando tossisci o dolore al petto che non passa.",
          "Fiato sempre più corto nelle attività di tutti i giorni.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Screening preventivo",
        description:
          "Controlli che trovano i problemi presto, prima dei sintomi.",
        intro:
          "Lo screening cerca i primi segni di una malattia, anche quando ti senti bene.",
        keyFacts: [
          "Molte condizioni, come la pressione alta, il diabete o alcuni tumori, iniziano in silenzio nel corpo molto prima di dare dolore.",
          "Anche quando ti senti in forze ogni giorno, un controllo di routine ti dà tranquillità e individua i cambiamenti quando si curano facilmente.",
          "Chiedi al medico di famiglia gli esami gratuiti e gli screening consigliati per la tua età.",
        ],
        recommendations: [
          {
            title: "Chiedi cosa ti serve",
            description:
              "Chiedi al medico quali controlli sono consigliati per te.",
          },
          {
            title: "Vai ai controlli",
            description:
              "Non saltare gli inviti allo screening e i controlli di routine.",
          },
          {
            title: "Parla della tua famiglia",
            description:
              "Di' al medico quali malattie hanno avuto i tuoi genitori, fratelli o nonni.",
          },
        ],
        warningSigns: [
          "Un nodulo nuovo, un sanguinamento strano o un neo che cambia forma.",
          "Qualsiasi sintomo nuovo che non passa e non ha una causa chiara.",
          "Un risultato di screening che richiede altri esami.",
        ],
      },
      {
        slug: "womens-health",
        title: "Salute della donna",
        description:
          "La tua salute a ogni età, dal ciclo alla menopausa.",
        intro:
          "I tuoi bisogni di salute cambiano nel corso della vita. Se sai cosa è normale per te, noti prima quando qualcosa cambia.",
        keyFacts: [
          "Il corpo femminile attraversa fasi naturali dal ciclo e dalla gravidanza fino alla menopausa, guidate da ormoni che agiscono su ossa e cuore.",
          "Quando conosci il tuo corpo noti subito qualsiasi cambiamento al seno, sanguinamento insolito o dolore che non passa.",
          "Il Pap test, l'autoesame mensile del seno e le visite regolari in gravidanza individuano i problemi precocemente.",
        ],
        recommendations: [
          {
            title: "Conosci il tuo corpo",
            description:
              "Fai caso al tuo ciclo e al tuo corpo, così noti i cambiamenti.",
          },
          {
            title: "Fai i controlli",
            description:
              "Vai alle visite e agli screening consigliati per la tua età.",
          },
          {
            title: "Chiedi aiuto presto",
            description:
              "Parla con il medico di qualsiasi sintomo che ti preoccupa.",
          },
        ],
        warningSigns: [
          "Sanguinamenti insoliti, tra un ciclo e l'altro o dopo la menopausa.",
          "Dolore forte o che non passa al basso ventre.",
          "Un cambiamento nuovo al seno, come un nodulo o la pelle diversa.",
        ],
      },
    ],
  },
};

export function getHealthInformationDictionary(lang: Lang) {
  return dictionaries[lang] || dictionaries.en;
}

export function getHealthTopicBySlug(lang: Lang, slug: string) {
  return getHealthInformationDictionary(lang).topics.find((topic) => topic.slug === slug);
}

export const healthTopicSlugs = dictionaries.en.topics.map((topic) => topic.slug);

export interface TopicItem {
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
  image: string;
  keyFact?: string;
  recommendationTitle?: string;
  recommendationBody?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  readMinutes: number;
  audioMinutes: number;
}

export const HEALTH_TOPIC_CARD_SUMMARIES: Record<
  Lang,
  Record<string, { title: string; description: string }>
> = {
  ro: {
    "heart-health": {
      title: "Sănătatea inimii",
      description:
        "Obiceiuri simple pentru o tensiune bună și o inimă puternică.",
    },
    diabetes: {
      title: "Prevenția diabetului",
      description:
        "Primele semne și cum ții zahărul din sânge sub control.",
    },
    "healthy-eating": {
      title: "Alimentație sănătoasă",
      description:
        "Mese sățioase și ieftine, cu mai puțină sare și zahăr.",
    },
    "physical-activity": {
      title: "Activitate fizică",
      description:
        "Cum te miști mai mult în fiecare zi, la orice vârstă, fără sală.",
    },
    "mental-wellbeing": {
      title: "Echilibru emoțional",
      description:
        "Cum recunoști stresul și grijile care nu trec și unde primești ajutor gratuit.",
    },
    smoking: {
      title: "Renunțarea la fumat",
      description:
        "Cum te lași de fumat și cine te poate ajuta.",
    },
    "preventive-screening": {
      title: "Screening preventiv",
      description:
        "Controale gratuite care găsesc bolile devreme, înainte să te doară.",
    },
    "womens-health": {
      title: "Sănătatea femeii",
      description:
        "Sarcina, controlul la ginecolog și ce e normal la fiecare vârstă.",
    },
  },
  en: {
    "heart-health": {
      title: "Heart health",
      description:
        "Simple habits for healthy blood pressure and a strong heart.",
    },
    diabetes: {
      title: "Diabetes prevention",
      description:
        "Early signs, and how to keep your blood sugar steady.",
    },
    "healthy-eating": {
      title: "Healthy eating",
      description:
        "Cheap, filling meals with less salt and sugar.",
    },
    "physical-activity": {
      title: "Physical activity",
      description:
        "Ways to move more every day, at any age, without a gym.",
    },
    "mental-wellbeing": {
      title: "Mental health",
      description:
        "Spot stress and worry that will not go away, and find free help.",
    },
    smoking: {
      title: "Quitting smoking",
      description:
        "How to stop smoking and who can help you.",
    },
    "preventive-screening": {
      title: "Health screening",
      description:
        "Free check-ups that find illness early, before it hurts.",
    },
    "womens-health": {
      title: "Women's health",
      description:
        "Pregnancy, check-ups with a gynaecologist and what is normal at each age.",
    },
  },
  sq: {
    "heart-health": {
      title: "Shëndeti i zemrës",
      description:
        "Zakone të thjeshta për tension normal dhe një zemër të fortë.",
    },
    diabetes: {
      title: "Parandalimi i diabetit",
      description:
        "Shenjat e para dhe si ta mbash sheqerin në gjak nën kontroll.",
    },
    "healthy-eating": {
      title: "Ushqyerja e shëndetshme",
      description:
        "Vakte të lira që të ngopin, me më pak kripë dhe sheqer.",
    },
    "physical-activity": {
      title: "Aktiviteti fizik",
      description:
        "Si të lëvizësh më shumë çdo ditë, në çdo moshë, pa palestër.",
    },
    "mental-wellbeing": {
      title: "Ekuilibri emocional",
      description:
        "Njih stresin dhe ankthin që nuk kalojnë dhe gjej ndihmë falas.",
    },
    smoking: {
      title: "Lënia e duhanit",
      description:
        "Si ta lësh duhanin dhe kush mund të të ndihmojë.",
    },
    "preventive-screening": {
      title: "Kontrollet parandaluese",
      description:
        "Kontrolle falas që zbulojnë sëmundjet herët, para se të të dhembë diçka.",
    },
    "womens-health": {
      title: "Shëndeti i gruas",
      description:
        "Shtatzënia, kontrollet te gjinekologu dhe çfarë është normale në çdo moshë.",
    },
  },
  it: {
    "heart-health": {
      title: "Salute del cuore",
      description:
        "Abitudini semplici per una pressione nella norma e un cuore forte.",
    },
    diabetes: {
      title: "Prevenzione del diabete",
      description:
        "I primi segnali e come tenere sotto controllo lo zucchero nel sangue.",
    },
    "healthy-eating": {
      title: "Alimentazione sana",
      description:
        "Pasti economici che saziano, con meno sale e zucchero.",
    },
    "physical-activity": {
      title: "Attività fisica",
      description:
        "Come muoverti di più ogni giorno, a qualsiasi età, senza palestra.",
    },
    "mental-wellbeing": {
      title: "Equilibrio emotivo",
      description:
        "Riconosci stress e ansia che non passano e trova aiuto gratuito.",
    },
    smoking: {
      title: "Smettere di fumare",
      description:
        "Come smettere di fumare e chi può aiutarti.",
    },
    "preventive-screening": {
      title: "Screening preventivo",
      description:
        "Controlli gratuiti che trovano le malattie presto, prima che facciano male.",
    },
    "womens-health": {
      title: "Salute della donna",
      description:
        "Gravidanza, visite ginecologiche e cosa è normale a ogni età.",
    },
  },
};

export const HEALTH_TOPICS_BASE = [
  { slug: "heart-health", categorySlug: "inima", readMinutes: 3, audioMinutes: 2 },
  { slug: "diabetes", categorySlug: "diabet", readMinutes: 4, audioMinutes: 3 },
  { slug: "healthy-eating", categorySlug: "nutritie", readMinutes: 3, audioMinutes: 2 },
  { slug: "physical-activity", categorySlug: "miscare", readMinutes: 2, audioMinutes: 2 },
  { slug: "mental-wellbeing", categorySlug: "minte", readMinutes: 4, audioMinutes: 3 },
  { slug: "smoking", categorySlug: "fumat", readMinutes: 3, audioMinutes: 2 },
  { slug: "preventive-screening", categorySlug: "screening", readMinutes: 3, audioMinutes: 2 },
  { slug: "womens-health", categorySlug: "femei", readMinutes: 4, audioMinutes: 3 },
];

const TOPIC_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  "heart-health": HeartIcon,
  diabetes: DropletIcon,
  "healthy-eating": AppleIcon,
  "physical-activity": ActivityIcon,
  "mental-wellbeing": BrainIcon,
  smoking: NoSmokingIcon,
  "preventive-screening": SearchIcon,
  "womens-health": ShieldIcon,
};

const TOPIC_KEY_FACT_INDEX: Record<string, number> = {
  "heart-health": 0,
  diabetes: 0,
  "healthy-eating": 1,
  "physical-activity": 1,
  "mental-wellbeing": 1,
  smoking: 0,
  "preventive-screening": 0,
  "womens-health": 0,
};

export function getHealthTopicsList(lang: Lang = "ro"): TopicItem[] {
  const summaries = HEALTH_TOPIC_CARD_SUMMARIES[lang] || HEALTH_TOPIC_CARD_SUMMARIES.ro;
  const fullDict = getHealthInformationDictionary(lang);
  return HEALTH_TOPICS_BASE.map((base) => {
    const fullTopic = fullDict.topics.find((t) => t.slug === base.slug);
    const factIdx = TOPIC_KEY_FACT_INDEX[base.slug] ?? 0;
    const firstRec = fullTopic?.recommendations?.[0];
    return {
      ...base,
      title: summaries[base.slug]?.title ?? base.slug,
      description: summaries[base.slug]?.description ?? "",
      image: `/images/health-topics/${base.slug}.jpg`,
      keyFact: fullTopic?.keyFacts?.[factIdx] ?? fullTopic?.keyFacts?.[0] ?? "",
      recommendationTitle: firstRec?.title ?? "",
      recommendationBody: firstRec?.description ?? "",
      icon: TOPIC_ICONS[base.slug] ?? HeartIcon,
    };
  });
}

export const HEALTH_TOPICS_LIST: TopicItem[] = getHealthTopicsList("ro");

export function getHealthTopicGridDictionary(lang: Lang) {
  return (
    translations[lang]?.healthInfoPage?.topicGrid ??
    translations.ro.healthInfoPage.topicGrid!
  );
}
