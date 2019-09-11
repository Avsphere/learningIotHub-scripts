//2019'ifying this example -- Aaron Perrine
require('dotenv').config()
const iothub = require('azure-iothub')
const registry = iothub.Registry.fromConnectionString(process.env.IOTHUB_CONNECTION_STRING)
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



const deepInspect = c => inspect(c, false, null, true) //because console.log is inspect with default depth of 2
const run = async() => {
    try {
        const sampleConfigurations = [ generateSampleConfiguration(0), generateSampleConfiguration(1) ]
        console.log('Generated two sample configurations with ids : ', sampleConfigurations.map(s => s.id) )

        await Promise.all([
            registry.addConfiguration(sampleConfigurations[0]),
            registry.addConfiguration(sampleConfigurations[1])
        ])
        

        const { responseBody : allConfigurations } = await registry.getConfigurations()
        console.log('All current device configurations', deepInspect(allConfigurations) )

        const configurationToUpdate = allConfigurations.find( c => c.id === sampleConfigurations[0].id )
        configurationToUpdate.metrics.queries['overheat'] = 'SELECT deviceId FROM devices WHERE properties.reported.chillerWaterSettings.temperature > .8';
        await registry.updateConfiguration(configurationToUpdate)
        
        const { responseBody : updatedConfig} = await registry.getConfiguration(configurationToUpdate.id)
        console.log(`Updated configuration from iotHub: `, deepInspect(updatedConfig) )
        
        
        await registry.removeConfiguration(sampleConfigurations[1].id) //leaving other sample incase one would like to view in iothub
        console.log(`Successfully removed sample configuration with id ${sampleConfigurations[1].id}`)

    } catch (err) {
        console.error('Error: ', err.message)
    }
}

run();