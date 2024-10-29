## NodeState
La classe NodeState è una classe astratta che estende la classe Node. È responsabile di mantenere uno stato (state), modificarlo, notificare i cambiamenti e eseguire azioni (actions).

### Costruttore
```typescript
constructor(name?: string, state?: any)
```
name (opzionale): Il nome del nodo.
state (opzionale): Lo stato iniziale del nodo.
Il costruttore inizializza lo stato del nodo unendo lo stato predefinito (stateDefault) con lo stato fornito.


### Proprietà

- **stateDefault**:  
Restituisce lo stato predefinito del nodo. Questo viene unito con lo stato di istanza nel costruttore.
```typescript
get stateDefault() {
  return {
    name: <string>null,
    children: <any[]>null,
  }
}
```

- **state**:  
Restituisce lo stato attuale del nodo.
```typescript
get state() {
  return this._state
}
```


### Metodi

- **setState(state: any): void**:  
Modifica lo stato del nodo unendo il nuovo stato con quello attuale. Se lo stato cambia, chiama il metodo onChangeState.
```typescript
public setState(state: any): void {
  if (this._state == state) return
  const old = this._state
  this._state = { ...this._state, ...state }
  this.onChangeState(old)
}
```

- **onChangeState(old: any)**:  
void: Metodo astratto chiamato quando lo stato cambia. Deve essere implementato dalle classi derivate.
```typescript
protected onChangeState(old: any): void { }
```

- **dispatch(action: IAction): any**:  
Esegue un'azione (action) utilizzando la mappa di dispatch (dispatchMap). Se l'azione è asincrona, restituisce una Promise.
```typescript
dispatch(action: IAction): any {
  log(`${this.name}:${action.type}`, LOG_TYPE.DEBUG, action.payload)

  const fnc = this.dispatchMap[action.type]

  try {
    if (fnc.constructor.name === "AsyncFunction") {
      return new Promise(async (res, rej) => {
        try {
          const ret = await fnc(this.state, action.payload, action.sender)
          res(ret)
        } catch (e) {
          rej(e)
        }
      })
    } else {
      return fnc(this.state, action.payload, action.sender)
    }
  } catch (error) {
    // Gestione errori
  }
}
```

- **dispatchMap**:  
Restituisce una mappa di possibili azioni (actions) che possono essere eseguite su questo nodo. Deve essere sovrascritto dalle classi derivate.
```typescript
protected get dispatchMap(): DispatchMap {
  return {}
}
```

### Tipi

- **NodeStateConf**:  
Tipo che rappresenta una configurazione parziale dello stato predefinito del nodo.
```typescript
export type NodeStateConf = Partial<NodeState['stateDefault']>
```

- **DispatchMap**:  
Tipo che rappresenta una mappa di funzioni di dispatch.
```typescript
type DispatchMap = { [key: string]: Dispatch }
```

- **Dispatch**:  
Tipo che rappresenta una funzione di dispatch.
```typescript
type Dispatch = (state: any, payload: any, sender: string) => any
```


### Esempio di Utilizzo

Ecco un esempio di come estendere e utilizzare la classe NodeState:

```typescript
const node = new class extends NodeState {
  protected _state = {
    value1: "init value1",
    value2: "init value2"
  }
}

node.setState({ value2: "modify value2" })
console.log(node.state) // { value1: "init value1", value2: "modify value2" }
```

In questo esempio, la classe anonima estende NodeState e definisce uno stato iniziale. Successivamente, modifica lo stato utilizzando setState e stampa lo stato attuale.