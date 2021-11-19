import { tsConstructorType } from '@babel/types';
import React, {Component} from 'react';
import {View, Button,  StyleSheet, Text, Alert, Platform} from 'react-native';
import {BleManager, Characteristic} from 'react-native-ble-plx';



export default class App extends Component {
    constructor(){
        super()
        this.manager = new BleManager()
        this.state = {info: "", value: {}}
        //"0000ffe0-0000-1000-8000-00805f9b34fb"
        this.prefixUUID = "0000ffe"
        this.suffixUUID = "-0000-1000-8000-00805f9b34fb"
        this.sensors = {
            0: "height"
        }
    }


    serviceUUID() {
        return this.prefixUUID + "0" + this.suffixUUID
    }

    notifyUUID() {
        return this.prefixUUID  + "1" + this.suffixUUID
    }

    writeUUID() {
        return this.prefixUUID + "1" + this.suffixUUID
    } 

    info(message) {
        this.setState({info: message})
    }

    error(message) {
        this.setState({info: "ERROR: " + message})
    }

    updateValue(key, value){
        this.setState({values: {...this.state.values, [key]: value}})
    }


    UNSAFE_componentWillMount(){
        console.log("mounted")
        const subscription = this.manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                this.scanAndConnect();
                subscription.remove();
            }
        }, true);
    }

    scanAndConnect() {
        this.manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                // Handle error (scanning will be stopped automatically)
                return
            }

            console.log(device.name)

            // Check if it is a device you are looking for based on advertisement data
            // or other criteria.
            if (device.name === 'WHEALTH') {
                // Stop scanning as it's not necessary if you are scanning for one device.
                this.manager.stopDeviceScan();
                console.log(`Found ${device.name}`)
                this.setState({
                    device: device
                })
                // Proceed with connection.
                device.connect()
                    .then((device) => {
                        //console.log(device)
                        console.log("Discovering characteristics")
                        return device.discoverAllServicesAndCharacteristics()
                    })
                    .then((device) => {
                        // sericeUUID + characteristicUUID + base64 encoding
                        // var i = 1;
                        // function myLoop(){
                        //     setTimeout(function(){
                        //         console.log('send characteristic')
                        //         device.writeCharacteristicWithoutResponseForService(
                        //             '0000ffe0-0000-1000-8000-00805f9b34fb', 
                        //             '0000ffe1-0000-1000-8000-00805f9b34fb',
                        //             'IENBUFNUT05FREVTSUdO'
                        //             )
                        //         i++
                        //         if(i < 10){
                        //             myLoop();
                        //         }
                        //     },3000)
                        // }
                        // myLoop();

                        device.writeCharacteristicWithoutResponseForService(
                            '0000ffe0-0000-1000-8000-00805f9b34fb', 
                            '0000ffe1-0000-1000-8000-00805f9b34fb',
                            'MQ=='
                        )
                        console.log("SetupNotifications")
                        return this.setupNotifications(device)
                    })
                    .then((result) => {
                        // Do work on device with services and characteristics
                        //console.log(this.manager.characteristicsForService("00001800-0000-1000-8000-00805f9b34fb"))
                        console.log("connected")
                        console.log("ID del dispositivo: ", device.id)
                        console.log("Nombre del dispositivo: ", device.name)
                        console.log("RRSI del dispositivo: ", device.rssi)
                        console.log("MTU del dispositivo: ", device.mtu)
                        console.log("UUID: ", device.serviceUUIDs)
                        
                    })
                    .catch((error) => {
                        // Handle errors
                        console.log(error)
                    });
            }
        });
    }
    async readData(device) {
        const services = await device.services();
        console.log("Services:",services);
        const characteristics = await services[1].characteristics();
        console.log("Characteristics:",characteristics);
        characteristics[0].monitor((err, update) => {
          if (err) {
            console.log(`characteristic error: ${err}`);
            console.log(JSON.stringify(err));
          } else {
            console.log("Is Characteristics Readable:",update.isReadable);
    
            const heartRateData = update.value;
            console.log(heartRateData);
          }
        });
      }

    async setupNotifications(device) {
        console.log("1111111111")
          const service = this.serviceUUID()
          const characteristicW = this.writeUUID()
          const characteristicN = this.notifyUUID()
          let response;
            //             '0000ffe0-0000-1000-8000-00805f9b34fb', 
            //             '0000ffe1-0000-1000-8000-00805f9b34fb',
        
          device.monitorCharacteristicForService('0000ffe0-0000-1000-8000-00805f9b34fb', '0000ffe1-0000-1000-8000-00805f9b34fb', (error, characteristic) => {
            if (error) {
              this.error(error.message)
              console.error(error.message)
              return
            }else{
                response = characteristic.value
            }
            console.log(response)
            this.updateValue(characteristic.uuid, characteristic.value)
          }

          )
        console.log("22222222222")
    }

      render() {
        return (
          <View style={styles.container}>
            
            <Text>{this.state.info}</Text>
          </View>
        )
      }

  }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})