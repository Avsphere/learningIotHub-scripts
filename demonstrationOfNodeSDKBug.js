//incorrect promise adapt

// await Promise.all([
//     registry.addConfiguration(generateSampleConfiguration(0)),
//     registry.addConfiguration(generateSampleConfiguration(1))
// ])
// .catch( err => console.error('Adding configurations failed!', err ) )
// await Promise.all( sampleConfigurations.map(registry.addConfiguration) )
// .catch( err => console.error('Adding configurations failed!', err ) )