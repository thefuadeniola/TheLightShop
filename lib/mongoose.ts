import mongoose from 'mongoose'

let isConnected = false // tracking connection status

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if (!process.env.MONGODB_URI) return console.log('MONGODB_URI is no defined')

    if (isConnected) return console.log('=> using existiing database connection')

    try {
        await mongoose.connect(process.env.MONGODB_URI)

        isConnected = true

        console.log('MongoDB Connected')
    } catch (error) {
        console.log(error)
    }
}