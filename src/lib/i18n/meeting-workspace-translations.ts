import type { Lang } from "./translations";

type MeetingWorkspaceCopy = {
  back: string; heading: string; loading: string; video: string; callHelp: string;
  show: string; hide: string; workspace: string; notes: string; transcript: string;
  notesHelp: string; transcriptHelp: string; notesPlaceholder: string; transcriptPlaceholder: string;
  start: string; stop: string; record: string; stopRecording: string; transcribing: string;
  listening: string; recording: string; idle: string; invite: string; sending: string;
  save: string; saving: string; saved: string; unsaved: string; invited: string;
  saveError: string; inviteError: string; loadError: string;
};

export const meetingWorkspaceTranslations: Record<Lang, MeetingWorkspaceCopy> = {
  en: {
    back: "Back to patient", heading: "Video consultation", loading: "Loading meeting...",
    video: "Consultation video", callHelp: "Camera, microphone and call controls are inside the video.",
    show: "Show notes & transcript", hide: "Hide notes & transcript", workspace: "Consultation record",
    notes: "Clinical notes", transcript: "Transcript",
    notesHelp: "Private staff notes saved to the patient follow-up, not to the video chat.",
    transcriptHelp: "Transcription uses this device's microphone, not the call audio. Obtain consent before starting.",
    notesPlaceholder: "Clinical observations, decisions and next steps...",
    transcriptPlaceholder: "Start transcription or type the consultation transcript...",
    start: "Start transcription", stop: "Stop transcription", record: "Record and transcribe",
    stopRecording: "Stop recording", transcribing: "Transcribing...", listening: "Listening",
    recording: "Recording", idle: "Not recording", invite: "Invite patient", sending: "Sending...",
    save: "Save record", saving: "Saving...", saved: "Record saved", unsaved: "Unsaved changes",
    invited: "Invitation sent to the patient.", saveError: "Could not save the meeting record.",
    inviteError: "Could not send the meeting invitation.", loadError: "Could not load this meeting.",
  },
  ro: {
    back: "Înapoi la pacient", heading: "Consultație video", loading: "Se încarcă întâlnirea...",
    video: "Apelul consultației", callHelp: "Camera, microfonul și comenzile apelului sunt în zona video.",
    show: "Arată notițele și transcrierea", hide: "Ascunde notițele și transcrierea", workspace: "Fișa consultației",
    notes: "Notițe clinice", transcript: "Transcriere",
    notesHelp: "Notițe private ale personalului, salvate la vizita pacientului, nu în chatul video.",
    transcriptHelp: "Transcrierea folosește microfonul dispozitivului, nu sunetul apelului. Obține consimțământul înainte de a începe.",
    notesPlaceholder: "Observații clinice, decizii și pașii următori...",
    transcriptPlaceholder: "Pornește transcrierea sau introdu textul consultației...",
    start: "Pornește transcrierea", stop: "Oprește transcrierea", record: "Înregistrează și transcrie",
    stopRecording: "Oprește înregistrarea", transcribing: "Se transcrie...", listening: "Se ascultă",
    recording: "Se înregistrează", idle: "Nu se înregistrează", invite: "Invită pacientul", sending: "Se trimite...",
    save: "Salvează fișa", saving: "Se salvează...", saved: "Fișa a fost salvată", unsaved: "Modificări nesalvate",
    invited: "Invitația a fost trimisă pacientului.", saveError: "Fișa întâlnirii nu a putut fi salvată.",
    inviteError: "Invitația nu a putut fi trimisă.", loadError: "Întâlnirea nu a putut fi încărcată.",
  },
  sq: {
    back: "Kthehu te pacienti", heading: "Konsultë video", loading: "Duke ngarkuar takimin...",
    video: "Video e konsultës", callHelp: "Kamera, mikrofoni dhe komandat e thirrjes janë brenda videos.",
    show: "Shfaq shënimet dhe transkriptin", hide: "Fshih shënimet dhe transkriptin", workspace: "Regjistri i konsultës",
    notes: "Shënime klinike", transcript: "Transkripti",
    notesHelp: "Shënime private të stafit, të ruajtura te ndjekja e pacientit, jo në bisedën video.",
    transcriptHelp: "Transkriptimi përdor mikrofonin e pajisjes, jo audion e thirrjes. Merrni pëlqimin përpara fillimit.",
    notesPlaceholder: "Vëzhgime klinike, vendime dhe hapat e ardhshëm...",
    transcriptPlaceholder: "Filloni transkriptimin ose shkruani transkriptin e konsultës...",
    start: "Fillo transkriptimin", stop: "Ndalo transkriptimin", record: "Regjistro dhe transkripto",
    stopRecording: "Ndalo regjistrimin", transcribing: "Duke transkriptuar...", listening: "Duke dëgjuar",
    recording: "Duke regjistruar", idle: "Nuk po regjistron", invite: "Fto pacientin", sending: "Duke dërguar...",
    save: "Ruaj regjistrin", saving: "Duke ruajtur...", saved: "Regjistri u ruajt", unsaved: "Ndryshime të paruajtura",
    invited: "Ftesa iu dërgua pacientit.", saveError: "Regjistri i takimit nuk mund të ruhej.",
    inviteError: "Ftesa nuk mund të dërgohej.", loadError: "Takimi nuk mund të ngarkohej.",
  },
  it: {
    back: "Torna al paziente", heading: "Consultazione video", loading: "Caricamento incontro...",
    video: "Video della consultazione", callHelp: "Camera, microfono e controlli della chiamata si trovano nel video.",
    show: "Mostra note e trascrizione", hide: "Nascondi note e trascrizione", workspace: "Registro della consultazione",
    notes: "Note cliniche", transcript: "Trascrizione",
    notesHelp: "Note private del personale salvate nella visita del paziente, non nella chat video.",
    transcriptHelp: "La trascrizione usa il microfono del dispositivo, non l'audio della chiamata. Ottenere il consenso prima di iniziare.",
    notesPlaceholder: "Osservazioni cliniche, decisioni e prossimi passi...",
    transcriptPlaceholder: "Avvia la trascrizione o scrivi il testo della consultazione...",
    start: "Avvia trascrizione", stop: "Ferma trascrizione", record: "Registra e trascrivi",
    stopRecording: "Ferma registrazione", transcribing: "Trascrizione in corso...", listening: "In ascolto",
    recording: "Registrazione in corso", idle: "Non in registrazione", invite: "Invita paziente", sending: "Invio...",
    save: "Salva registro", saving: "Salvataggio...", saved: "Registro salvato", unsaved: "Modifiche non salvate",
    invited: "Invito inviato al paziente.", saveError: "Impossibile salvare il registro dell'incontro.",
    inviteError: "Impossibile inviare l'invito.", loadError: "Impossibile caricare l'incontro.",
  },
};
