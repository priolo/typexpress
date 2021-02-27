# TYPEXPRESS

## DESCRIPTION

Allow the creation of a NodeJs server
Simply with a basic JSON configuration


## INSTALLATION

istalla "typexpress" nel progetto
`npm typexpress`



## DEV

compila nella cartella `/dist` e rimane in "watch" per nuove modifiche
`npm run build-watch`



## QUICK START

### Crea subito il tuo server http

`src/start.js`
```js
import path from "path"
import { ConfActions } from "typexpress/dist/core/node/NodeConf";
import { RootService } from "typexpress/dist/core/RootService"

RootService.Start( {
	class: "http",
	port: 5001,
	children: [
		{
			class: "http-static",
			dir: path.join(__dirname, "../public"),
			path: "/",
		},						
	]
})
```

`public/index.html`
```js
<!DOCTYPE html>
<html lang="en">
  	<head>
		<meta charset="utf-8">
		<title>Typexpress</title>
	</head>
	<body>
		Ciao Word!
	</body>
</html>
```

fa partire un server http
ed espone a in "public" 
la cartella "../public" 
alla quale si accede dall'url "/"


### Mettiamo che vuoi mandare delle informazioni
E che ci vuole

Fai la pagina con il FORM:

`public/index.html`
```js
<!DOCTYPE html>
<html lang="en">
	<body>
		<form action="/hello" method="POST">
			<label for="fname">Write your name:</label><br>
			<input type="text" id="name" name="name" value="John"><br><br>
			<input type="submit" value="Submit">
		</form>
	</body>
</html>
```

... e il server con l'API "/hello" sulla chiamta POST

`src/start.js`
```js
RootService.Start({
	class: "http",
	port: 5001,
	children: [
		{
			class: "http-static",
			dir: path.join(__dirname, "../public"),
			path: "/",
			//spaFile: "index.html",
		},	
		{
			class: "http-router",
			path: "/hello",
			routers: [
				{ path: "/", verb: "post", method: (req, res, next) => {
					res.send(`<p>hey ${req.body.name}</p>`)
				}},
			],
		}
	]
})
```

### BELLO... ma, andiamo, non posso creare pagine HTML cosi !!! Mi serve un... "Template Engine" !
ok ok automaticamente c'e' il supporto a handlebars

`src/start.js`
```js
RootService.Start({
	class: "http",
	port: 5001,
	template: "handlebars",
	children: [
		{
			class: "http-static",
			dir: path.join(__dirname, "../public"),
			path: "/",
		},
		{
			class: "http-router",
			path: "/random",
			routers: [
				{
					path: "/", verb: "post", method: (req, res, next) => {
						
						res.render("hi", { name: req.body.name })
					}
				},
			],
		},
	]
})
```

`views/hi.hbs`
```
Hello  {{name}}
```
`layout/main.hbs`
```html
<!DOCTYPE html>
<html lang="en">
	<body>
		{{body}}
	</body>
</html>
```

### E se voglio una directory navigabile?
c'e'! Mettiamo che vuoi rendere navigabile "dir"

`src/start.js`
```js
RootService.Start({
	class: "http",
	port: 5001,
	template: "handlebars",
	children: [
		{
			class: "http-static",
			dir: path.join(__dirname, "../dir"),
			path: "/dir",
			index: true,
		}
	]
})
```

### Aspetta! Ma io di solito faccio app in REACT con CRA!
Puoi creare un entrypoint per SPA

`src/start.js`
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
			index: true,
		}
	]
})
```

### He si... ma poi per le API?
E ci metti anche quelle nella giostra

`src/start.js`
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
			index: true,
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
	]
})
```

### E il DB? Dove sta?
-.- eccolo:

`src/start.js`
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
			index: true,
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
