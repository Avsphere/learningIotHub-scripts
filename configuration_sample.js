//2019'ifying this example -- Aaron Perrine
require('dotenv').config()
const { Registry } = require('azure-iothub')
const registry = Registry.fromConnectionString(process.env.IOTHUB_CONNECTION_STRING)
const { inspect } = require('util')

//placing in a function to easily generate multiple configurations for testing
const generateSampleConfiguration = modelNumber => ({
    id : `chiller${modelNumber}x`,
    content : {
        deviceContent : {
            'properties.desired.chiller-water' : {
                temperature : Math.random(),
                pressure : Math.random()
            }
        }
    },
    metrics : {
        queries : {
            waterSettingsPending: `SELECT deviceId FROM devices WHERE properties.reported.chillerWaterSettings.status=\'pending\'`
        }
    },
    targetCondition : `properties.reported.chillerProperties.model=\'${modelNumber}x\'`,
    priority : 20
})



const deepInspect = c => inspect(c, false, null, true) //because console.log has default depth of 2

const run = async() => {
    try {
        const sampleConfigurations = [ generateSampleConfiguration(0), generateSampleConfiguration(1) ]
        console.log('Generated two sample configurations with ids : ', sampleConfigurations.map(s => s.id) )

        //add device configurations to iothub
        await Promise.all([
            registry.addConfiguration(sampleConfigurations[0]),
            registry.addConfiguration(sampleConfigurations[1])
        ])
        
        //pull down the configurations we just added from the iothub
        const { responseBody : allConfigurations } = await registry.getConfigurations()
        console.log('All current device configurations', deepInspect(allConfigurations) )

        //select one of the configurations pulled down to update
        const configurationToUpdate = allConfigurations.find( c => c.id === sampleConfigurations[0].id )
        configurationToUpdate.metrics.queries['overheat'] = 'SELECT deviceId FROM devices WHERE properties.reported.chillerWaterSettings.temperature > .8';
        //make the actual update call
        await registry.updateConfiguration(configurationToUpdate)
        
        const { responseBody : updatedConfig} = await registry.getConfiguration(configurationToUpdate.id)
        console.log(`Updated configuration from iotHub: `, deepInspect(updatedConfig) )
        
        //remove one of the configurations -- leaving other sample incase one would like to view in iothub
        await registry.removeConfiguration(sampleConfigurations[1].id) 
        console.log(`Successfully removed sample configuration with id ${sampleConfigurations[1].id}`)

    } catch (err) {
        console.error('Error: ', err.message)
    }
}

run();