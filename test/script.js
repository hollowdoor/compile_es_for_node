let thing = 'my thing';
console.log(thing);
async function doThing(){
    let word = await new Promise((resolve, reject)=>{
        resolve('hurray');
    });

    console.log('yowza ', word)
}

doThing();
