# TYPEXPRESS

## DESCRIPTION

Allow the creation of a NodeJs server
Simply with a basic JSON configuration

## WHY?



## INSTALLATION

istalla "typexpress" nel progetto
`npm typexpress`

## DEV

compila nella cartella `/dist` e rimane in "watch" per nuove modifiche
`npm run build-watch`

## QUICK START

- Voglio un semplice server http  
... diciamo con un route `/myroute`

[sandbox](https://codesandbox.io/s/http-router-1-z203w?file=/src/index.js)

```js
const {RootService} = require("typexpress")

RootService.Start({
	class: "http",
	port: 8080,
	children: [
		{
			class: "http-router",
			path: "/myroute",
			routers: [{
				verb: "get",
				method: (req, res, next) => {
					res.json({response: "hello world"})
				}
			}]
		},
	]
})
```

https://z203w.sse.codesandbox.io/myroute

---

- No aspetta!  
Voglio un semplice server http statico  
che punta alla cartella: `/public_static`  
con la rotta: `/pub`  

[sandbox](https://codesandbox.io/s/http-static-1-sj9bz?file=/src/index.js)

```js
const {RootService} = require("typexpress")
const path = require("path")

RootService.Start([
	{
		class: "http",
		port: 8080,
		children: [
			{
				class: "http-static",
				// local directory in file-system
				dir: path.join(__dirname, "../public_static"),
				// path of routing
				path: "/pub"
			}
		]
	}
])
```

https://sj9bz.sse.codesandbox.io/

---

- ... e con visualizzazione dei file nella rotta `/index`

[sandbox](https://codesandbox.io/s/http-static-index-682xm?file=/src/index.js)

https://682xm.sse.codesandbox.io/index

---

- Ma mettiamo che nella cartella static  
ho una form html  
e voglio mandare delle informazioni?

[sandbox](https://codesandbox.io/s/http-form-1-cc08y?file=/src/index.js)

```js
const {RootService} = require("typexpress")
const path = require("path")

RootService.Start([
	{
		class: "http",
		port: 8080,
		children: [
			{
				class: "http-static",
				dir: path.join(__dirname, "../public"),
				path: "/"
			},
			{
				class: "http-router",
				path: "/greet",
				routers: [{
					verb: "post",
					method: async (req, res, next) => {
						res.send(`<p>Hallo ${req.body.name}!</p>`)
					}
				}]
			},
			
		]
	}
])
```

https://cc08y.sse.codesandbox.io/

---

- BELLO... ma, andiamo, non posso creare pagine HTML cosi !!!   
Mi serve un... "Template Engine"

- Ok ok automaticamente c'e' il supporto a [handlebars](https://github.com/express-handlebars/express-handlebars)  
*(supporto da migliorare ed estendere)*

[sandbox](https://codesandbox.io/s/http-form-handlebars-z2o31?file=/src/index.js:130-153)

---

- Aspetta! Aspetta! Ma io di solito faccio app in REACT con CRA!
- allora puoi creare un entrypoint per SPA

[sandbox](https://codesandbox.io/s/http-static-spa-tbq4l)

```js
const {RootService} = require("typexpress")
const path = require("path")

RootService.Start({
	class: "http",
	port: 8080,
	children: [
		{
			class: "http-static",
			dir: path.join(__dirname, "../build"),
			path: "/cra",
			spaFile: "index.html",
		}
	]
})
```

https://tbq4l.sse.codesandbox.io/cra

---

- Si vabbe' pero' i dati poi dove li memorizzo?
- Mbeh usi [Typeorm](https://typeorm.io/#/) e li metti in un DB... che ne so... facciamo sqlite!?

```js
RootService.Start({
	class: "http",
	port: 5001,
	template: "handlebars",
	children: [
		{
			class: "http-static",
			dir: path.join(__dirname, "../../client/build"),
			path: "/dir",
		},
		{
			class: "http-router",
			path: "/api",
			routers: [{ 
				path: "/faicose", 
				verb: "get", 
				method: (req, res, next) => res.json({ response: "ecco!" }) 
			}]
		},
		{
			class: "typeorm",
			typeorm: {
				"type": "sqlite",
				"database": path.join(__dirname, "../../db/database.sqlite"),
				"synchronize": true,
				"logging": true,
				children: [ { 	
					name: "item", class: "typeorm/repo", 
					model: {
						name: "Item",
						columns: {
							id: { type: Number, primary: true, generated: true },
							name: { type: String }
						}
					},
				}]
			}
		}
	]
})
```

Ci sono due librerie principali per l'ORM
- [Sequelize](https://sequelize.org/)
- [Typeorm](https://typeorm.io/)  

Per il momento c'e' solo il supporto a Typeorm (il nome "Typexpress" viene da li)

### Mi hai annoiato con sti elenchi puntati! Dimmi riguardo le sessioni.
;-( mbeh quelli li gestisci con con JWT



## Ciclo vita events
Chiamata PRIMA della creazione dei PROPRI CHILDREN
[sostituire con]: onCreate
protected async onInit(): Promise<void> { }

Chiamata DOPO la creazione dei PROPRI CHILDREN
[sostituire con]: onCreateAfter
protected async onInitAfter(): Promise<void> { }

[da fare]: chiamato per prima di inizializzare il nodo (e i children)
protected async onInitBefore(): Promise<void> { }

[da fare]: chiamato per inizializzare il nodo (e i children)
protected async onInit(): Promise<void> { }

Chiamato dopo il comando STOP e prima della rimozione del nodo dall'albero
protected async onDestroy(): Promise<void> { }




## Features

### Tree structure
I nodi sono strutturati ad albero per cui è sempre possibile recuperare un NODE tramite il suo "path"

### State
ogni node ha uno stato interno
(?history)

### Dispatch
i nodi hanno un set di ACTIONs che possono essere chiamate tramite la loro path
questi messaggi vengono recapitati dal Bus

### Events
un nodo puo' rimanere in ascolto su un altro nodo sugli eventi che genera quest'ultimo


## roadmap

### auto-npm install
se un service ha necessità di un  pacchetto npm deve essere possibile istallarlo in automatico

### Portals
permettono di creare servizi che possono far comunicare nodi in diverse posizioni sulla rete
per creare facilmente microservizi
