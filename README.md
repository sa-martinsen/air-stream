# air-stream

## Constructor

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

## map

Modifies the source stream message to message


```js
source.map( data => data+1 );
```

## filter

Modifies the source stream by selecting messages from it according to the condition


```js
source.filter( data => data > 1 );
```

## combine

Combines several threads into one


```js
source.combine( [ source1, source1 ], (...events) => events );
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
