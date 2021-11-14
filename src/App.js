import { tsConstructorType } from '@babel/types';
import React, {Component} from 'react';
import {View, Button,  StyleSheet, Text, Alert, Platform} from 'react-native';
import {BleManager} from 'react-native-ble-plx';

const manager = new BleManager();

export default class App extends Component {
    constructor(){
        super()
        this.manager = new BleManager()
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
                        console.log(device)
                        return device.discoverAllServicesAndCharacteristics()
                    })
                    .then((device) => {
                        console.log(device)
                    })
                    .then((result) => {
                        // Do work on device with services and characteristics
                        //console.log(this.manager.characteristicsForService("00001800-0000-1000-8000-00805f9b34fb"))
                        console.log(result)
                        console.log("connected")
                    })
                    .catch((error) => {
                        // Handle errors
                        console.log(error)
                    });
            }
        });
    }

      render() {
        return (
          <View style={styles.container}>
            <Text>HI</Text>
           
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