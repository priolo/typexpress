## HttpService
Permette di creare un **server http**
nei sui `children` contiene tipicamenti nodi `HttpRouterService`
dove è possibile implementare per esempio delle API REST.


## CONFIGURAZIONE

```typescript
type HttpServiceConf = { 

	/** il nome della CLASSE */
	class: "http", 

	/** la porta su cui il server rimane in scolto */
	port?: number,

	/* il render da utilizzare (solo "handlebars") */
	render: { name: "handlebars"},

	/* opzioni di express
	https://expressjs.com/en/4x/api.html#app.set
	*/
	options: ...,

	https?: {
		/* il file del certificato pubblico */
		pubcert: string,
		/* il certificato */
		cert: string,
		/* il file della chiave privata */
		privkey: string,
		/* la chiave privata */
		key: "key.pem"
	},

	children: { ... },

})
```