import type { Lang } from "./translations";

type PatientDesignCopy = {
  photos: string; view: string; close: string; previous: string; next: string;
  zoom: string; fit: string; download: string; unavailable: string;
  photoHint: string; record: string;
};

export const patientDesignTranslations: Record<Lang, PatientDesignCopy> = {
  en: { photos: "Photos and documents", view: "View image", close: "Close preview", previous: "Previous image", next: "Next image", zoom: "Zoom in", fit: "Fit to screen", download: "Download", unavailable: "This image could not be displayed.", photoHint: "Open an image to see the full detail. Originals are shown without cropping.", record: "Patient record" },
  ro: { photos: "Poze și documente", view: "Vezi imaginea", close: "Închide previzualizarea", previous: "Imaginea anterioară", next: "Imaginea următoare", zoom: "Mărește", fit: "Potrivește pe ecran", download: "Descarcă", unavailable: "Imaginea nu a putut fi afișată.", photoHint: "Deschide o imagine pentru a vedea detaliile. Originalele sunt afișate fără decupare.", record: "Dosarul pacientului" },
  sq: { photos: "Foto dhe dokumente", view: "Shiko imazhin", close: "Mbyll pamjen", previous: "Imazhi i mëparshëm", next: "Imazhi tjetër", zoom: "Zmadho", fit: "Përshtat në ekran", download: "Shkarko", unavailable: "Ky imazh nuk mund të shfaqet.", photoHint: "Hap një imazh për të parë hollësitë. Origjinalet shfaqen pa prerje.", record: "Dosja e pacientit" },
  it: { photos: "Foto e documenti", view: "Visualizza immagine", close: "Chiudi anteprima", previous: "Immagine precedente", next: "Immagine successiva", zoom: "Ingrandisci", fit: "Adatta allo schermo", download: "Scarica", unavailable: "Impossibile visualizzare questa immagine.", photoHint: "Apri un'immagine per vedere i dettagli. Gli originali vengono mostrati senza ritagli.", record: "Cartella del paziente" },
  hr: { photos: "Fotografije i dokumenti", view: "Prikaži sliku", close: "Zatvori pregled", previous: "Prethodna slika", next: "Sljedeća slika", zoom: "Povećaj", fit: "Prilagodi zaslonu", download: "Preuzmi", unavailable: "Ova se slika ne može prikazati.", photoHint: "Otvori sliku za prikaz detalja. Izvornici se prikazuju bez obrezivanja.", record: "Karton pacijenta" },
  rom: { photos: "Tasvirya thaj lila", view: "Dikh o tasviri", close: "Phand o dikhiben", previous: "Angluno tasviri", next: "Avutno tasviri", zoom: "Barar", fit: "Tho pe ekrano", download: "Ulyar", unavailable: "Kado tasviri na shaj te sikavel pes.", photoHint: "Putar ekh tasviri te dikhes le detalyura. Le originalura sikaven pes bi chhinimasko.", record: "E pacientesko dosaro" },
  ru: { photos: "Фотографии и документы", view: "Открыть изображение", close: "Закрыть просмотр", previous: "Предыдущее изображение", next: "Следующее изображение", zoom: "Увеличить", fit: "По размеру экрана", download: "Скачать", unavailable: "Не удалось показать изображение.", photoHint: "Откройте изображение, чтобы рассмотреть детали. Оригиналы отображаются без обрезки.", record: "Карта пациента" },
};
