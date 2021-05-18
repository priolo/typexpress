## IONIC

### inserire l'icona da visualizzare nella notifica
`AndroidManifest.xml`
```xml
<meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@mipmap/push_icon_name" />
```
dovrebbe essere bianca su fondo trasparente
---

### vai alla console firebase
https://console.firebase.google.com

### crea o edita un progetto gia' esistente
- clicca sulla rotellina sul menu "panoramica del progetto" 
- clicca su "impostzioni progetto"
> Sei in pagina: **"Impostazioni progetto"**
> hai un **ID_PROGETTO**

### crea app android
- in "Le tue app"
- clicca su icona ANDROID
> popup **"Aggiungi Firebase alla tua app Android"**
- in "Nome pacchetto android" mettere "appId" nel file "capacitor.config.json"
- click su "Registra app"
- genera e scarica il file "google-services.json"
- sposta il file nella cartella di progetto "android/app"

### esecuzione app
- sposta al progetto IONIC
- collega il DEVICE via USB
- esegui comando ionic da terminale nella directory root del progetto:
`ionic capacitor run android -l --external`
> si apre l'IDE ANDROID STUDIO
- play sull'IDE ANDROID STUDIO
> l'app appare sul device

### invio notifica
- torna sul browser 
- pannello `https://console.firebase.google.com/`
- sezione di menu "Cloud Messaging"
- 

