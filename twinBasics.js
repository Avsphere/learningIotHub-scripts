require('dotenv').config()
const { Mqtt : Transport } = require('azure-iot-device-mqtt');
const { ModuleClient : Client } = require('azure-iot-device');
const { Message } = require('azure-iot-device');


const run = async() => {
  try {
    const client = Client.fromConnectionString(process.env.DEVICE_CONN_STRING, Transport);
    await client.open().then( _ => console.log('client opened') )

    const twin = await client.getTwin()

    twin.on('properties.desired', console.log.bind('properties.desired: ') );
    twin.on('properties.reported', console.log.bind('properties.reported: ') );

    const update = {
      animal : 'penguin',
      firmwareAnimalVersion : '1.2.3'
    }


    twin.properties.reported.update(update, err => err ? console.error(err) : console.log('no error') )



  } catch(err) {
    console.error('preUpstream failed : ', err)
  }
}

run()
