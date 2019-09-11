
require('dotenv').config()
const { Mqtt } = require('azure-iot-device-mqtt');
const { Client : DeviceClient } = require('azure-iot-device');
const { Client : HubClient } = require('azure-iothub');
const { promisify } = require('util')




const initInvokeRandomMethod = client => async(deviceId) => {
    const methodParams = {
        methodName : 'randomMethod',
        payload : Math.random(),
        responseTimeoutInSeconds : 10
    }
    const invokeMethod = promisify(client.invokeDeviceMethod.bind(client, deviceId, methodParams))
    const response = await invokeMethod();
    console.log('recieved response: ', response)
}



const invokeLoop = async() => {
    try {
        
        const deviceId = 'dummyDevice_anteater'
        const client = HubClient.fromConnectionString(process.env.IOTHUB_CONNECTION_STRING, Mqtt)

        const invokeMethod = initInvokeRandomMethod(client)

        setInterval( () => {
            invokeMethod(deviceId)
        }, 3000)

  
    } catch(err) {
      console.error('preUpstream failed : ', err)
    }
  }

const onRandomMethod = async(request, response) => {
    try {
        const { payload, methodName } = request;
        console.log('onRandomMethod : ', payload, methodName)
        await response.send(200, `Beep boop bop ${Math.random()}`)
    } catch( err) {
        console.error('onRandomMethod', err)
    }
}


const onMethodHandler = async() => {
    try {
        const client = DeviceClient.fromConnectionString(process.env.DEVICE_CONN_STRING, Mqtt)
        await client.open().then( _ => console.log('On device method is listening!') )

        client.onDeviceMethod('randomMethod', onRandomMethod)
  
    } catch(err) {
      console.error('preUpstream failed : ', err)
    }
  }
  



const run = async() => {
    try {
        onMethodHandler();
        invokeLoop()
    } catch (err) {
        console.error('top level device method', err)
    }
}

run()