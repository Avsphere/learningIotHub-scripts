require('dotenv').config()
const { Mqtt } = require('azure-iot-device-mqtt');
const { ModuleClient : Client } = require('azure-iot-device');
const { Message } = require('azure-iot-device');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path')
const app = require('express')()
const PORT = 3000
const { deviceConnectionString } = process.env
const client = Client.fromConnectionString(deviceConnectionString, Mqtt);

app.use(bodyParser.json({ limit : '10mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Not sure where I want to go with this, putting it on pause 9/11


const sendEvent = data => new Promise( (resolve, reject) => {
    client.sendEvent(JSON.stringify(new Message(data)), (err) => {
        if ( err ) reject(err);
        resolve(true)
    })
})

app.get('/', async(req, res) => {
  res.send({
    temperature : Math.random()*1000,
    humidity : Math.random()*100,
    numbers : Array(10).fill(0).map( _ => Math.random() )
  })

})

app.listen(PORT, console.log(`Listening on ${PORT}`) )



const run = async() => {
  try {
    const client = Client.fromConnectionString(process.env.DEVICE_CONN_STRING, Transport);
    await client.open().then( _ => console.log('client opened') )

    const twin = await client.getTwin()

    twin.on('properties.desired', d => console.log('on desired', d) ); 
    twin.on('properties.reported', d => console.log('on desired', d) );

    const update = {
      animal : 'penguin',
      firmwareAnimalVersion : Math.random().toString()
    }


    twin.properties.reported.update(update, err => err ? console.error(err) : console.log('no error') )



  } catch(err) {
    console.error('preUpstream failed : ', err)
  }
}

run()



module.exports = app;