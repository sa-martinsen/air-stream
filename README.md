# air-stream

## constructor

Creates a new stream

```js
import { stream } from "air-stream"

const newStream = stream( (emt, { over/*, hook, sweep*/ }) => {
  
    emt( "msg" );
    
    over.add( ( { dissolve, ...args } ) => {
      
        if(dissolve) {
            //when disconnect
        }
        
        else {
            //when feedback
            console.log( args );
        }
        
    } );
    
} );
```

## at

subscribes to stream

```js
const controller = source.at( data => {
    console.log(data);
});
```

,where "controller" is a feedback function

call the controller without arguments to unsubscribe from the stream

```js
controller();
```

and with arguments to feedback 

```js
controller( { action: "touch" } );
```

## map

Modifies the source stream message to message


```js
source.map( data => data+1 );
```

##cut

Applies the transformation function to the data and emits the modified version if it is not undefined

```js
source.cut( ({ counter }) => counter );
```

## filter

Modifies the source stream by selecting messages from it according to the condition


```js
source.filter( data => data > 1 );
```

## combine \[static\]

Combines several threads into one


```js
import { combine } from "air-stream"

combine( [ source1/*[, ...]*/ ], (...events) => events );
```

## withLatest

Combines several streams into one, but only triggers events from the source


```js
source.withLatest( [ source1, source2 ],  (...events) => events );
```

## withHandler

The general method of changing the stream


```js
source.withHandler( (emt, data) => {
    if(data > 5) {
        emt(data);
    }
    else if(data < 10) {
        emt(data);
        emt(data + 1);
    }
} );
```

## controller

Modifies the feedback 

```js
source.controller( ({ dissolve, ...data }, emt, /*lastmsg*/) => {
    if(data.count > 0) {
        //feed to source controller
        return data;
    }
    else {
        //emit to stream
        emt( data );
    }
} );
```

Modifies the feedback for additional stream
```js
source.controller( additionalSource, ({ dissolve, ...data }, emt, /*lastmsg*/) => {
    if(data.count > 0) {
        //feed to additional source controller
        return data;
    }
    else {
        //emit to stream
        emt( data );
    }
} );
```

for the main source, the call remains unchanged

## distinct
Compares each message with the last and emits it if it differs

- equals - {Function} (optional) - function for comparing values

```js
source.distinct( (prev, cur) => {
    return prev !== cur;
} );
```

## log

Logs messages from the stream
- adapter {Function} ( optional ) - formatting output

```js
source.log( (evt/*, src*/) => evt )
```

returns unchanged stream