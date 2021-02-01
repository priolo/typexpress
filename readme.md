# TYPEXPRESS

## DESCRIPTION

L'intento è di avviare un server NodeJs  
settando solamente un file JSON di configurazione.  
Questo server poi permetterà di centralizzare le risorse


## DA FARE

- la creazione del nodo potrebbe essere demandata al parent 
  che in base alle sue "conoscenze" si occupa di scegliere l'istanza giusta, se non ci riesce chiede "aiuto" al parent e cosi' via
- gli errori devono essere memorizzati all'interno del nodo come alert. 
  Quindi non devono "interrompere il servizio".
  Se è un errore irreversibile deve cambiare lo state.status in ERROR
  Verificare se è opporturo mandare un messaggio ai parent
- il nodo deve essere responsabile di prelevare il figlio tramite il nome e servirlo a "pathfinder"
- http-cookies
- gestione dei listener e degli events su un nodo
- i nodi dovrebbero mandare un messaggio ai parent del cambio di state.status
- mettere la proprietà "basePath" nel nodeo RootService dal quale calcolare tutte le path dei figli
## INSTALLATION




http.port
	posta dove il server rimane in ascolto

http.static
	path: string, la path della directory accessibile
	isIndex?: boolean, indica se è possibile vedere i file della directory tramite browser
	option?: serveStatic.ServeStaticOptions le opzioni di "serve-index"

typeorm
	config di typeorm

models
	path

