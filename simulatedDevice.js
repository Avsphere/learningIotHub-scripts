require('dotenv').config()
const { Mqtt } = require('azure-iot-device-mqtt');
const { ModuleClient : Client } = require('azure-iot-device');
const { Message } = require('azure-iot-device');

const { deviceConnectionString } = process.env
const client = Client.fromConnectionString(deviceConnectionString, Mqtt);

const sendEvent = message => new Promise( (resolve, reject) => {
    client.sendEvent(message, (err) => {
        if ( err ) reject(err);
        resolve(true)
    })
})


const sendMessage = () => {
    const temperature = Math.random().toFixed(3)
    const humidity = Math.random().toFixed(3)
    const message = new Message(
        JSON.stringify({ temperature, humidity })
    );
    
    message.properties.add('temperatureAlert', (temperature > .5 ) ? 'true' : 'false'); 
    console.log( 'Sending message: ' + message.getData() );
    return sendEvent(message)
}

const run = async() => {
    try {
        setInterval( () => {
            sendMessage()
            .then( _ => console.log('Send Success') )            
            .catch( console.error.bind(null, 'message failed to send') )
        }, 3000);
    } catch ( err ) { 
        console.error('run : ', err)
    }
}

run()
