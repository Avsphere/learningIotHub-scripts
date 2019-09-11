require('dotenv').config()
const { hubConnectionString } = process.env

const { EventHubClient, EventPosition } = require('@azure/event-hubs');


const recieveAndPrint = client => partitionId => client.receive(
    partitionId,
    m => console.log(`PartitionId : ${partitionId}`, m.body),
    console.error,
    { eventPosition : EventPosition.fromEnqueuedTime(Date.now()) }
)

const printAllMessageBodies = client => partitionId => client.receive(
    partitionId,
    m => console.log(`PartitionId : ${partitionId}`, m.body),
    console.error
)



const run = async() => {
    const client = await EventHubClient.createFromIotHubConnectionString(hubConnectionString);
    const partitionIds = await client.getPartitionIds()
    
    partitionIds.map(recieveAndPrint(client))
}

run()