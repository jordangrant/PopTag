/**
 * © Jordan Grant 2018
 */

import React, { Component } from 'react';
import {
    AppRegistry, StyleSheet, Text, View, TouchableOpacity, Dimensions, Keyboard,
    Image, Animated, AsyncStorage, CameraRoll, Platform, Linking, ImageBackground,
    PermissionsAndroid
} from 'react-native';
import { captureScreen } from "react-native-view-shot";
import RNShakeEvent from 'react-native-shake-event';
import Balloon from './Balloon';
import Question from './Question';
import Dialogue from './Dialogue';
import Contacts from 'react-native-contacts';
import Sound from 'react-native-sound';
import Toast, { DURATION } from 'react-native-easy-toast';
import { COMPANIES } from './xcompanies';

const width = Dimensions.get('window').width * 0.264;
const height = width * 0.5656;

const topR1 = (Platform.OS === 'ios' && Dimensions.get('window').height > 800) ? Dimensions.get('window').height * 0.24 : Dimensions.get('window').height * 0.211;
const topR2 = topR1 + 62;
const topR3 = topR1 + 138;
const topR4 = topR1 + 206;
const topR5 = topR1 + 277;
const leftC1 = 0;
const leftC2 = Dimensions.get('window').width / 2 - 62.5;
const leftC3 = Dimensions.get('window').width - 125;

console.disableYellowBox = true;

var woosh = new Sound('woosh.m4a', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
        console.log('failed to load the sound', error);
        return;
    }
});

var pop = new Sound('pop.m4a', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
        console.log('failed to load the sound', error);
        return;
    }
});

const GIFS = {
    image0: require('./assets/office.gif'),
    image1: require('./assets/coke.gif'),
    image2: require('./assets/cosmo.gif'),
    image3: require('./assets/baseball.gif'),
    image4: require('./assets/hilary.gif'),
    image5: require('./assets/peanuts.gif'),
    image6: require('./assets/chris.gif'),
}

export default class PopTag extends Component {
    constructor(props) {
        super(props);

        Sound.setCategory('Ambient');

        this.state = {
            balloons: [
                { id: 0, top: topR2, left: leftC1, popped: false },
                { id: 1, top: topR1, left: leftC2, popped: false },
                { id: 2, top: topR2, left: leftC3, popped: false },
                { id: 3, top: topR3, left: leftC2, popped: false },
                { id: 4, top: topR4, left: leftC1, popped: false },
                { id: 5, top: topR5, left: leftC2, popped: false },
                { id: 6, top: topR4, left: leftC3, popped: false },
            ],
            displayQuestion: false,
            displayGif: false,
            //background: ['#F4FA58', '#3A82D6', '#B8E986', '#50E3C2', 'pink'],
            background: '',
            bgColor: 0,
            gif: 0,
            dialogue: false,
            bottomHeight: 25,
            message: 'testestestest',
            custom: 0,
            loading: true
        };
    }

    componentWillMount() {
        AsyncStorage.getItem('balloons').then(b => {
            if (b !== null) {
                this.setState({ balloons: JSON.parse(b) });
            }
        })

        // AsyncStorage.getItem('bgColor').then(b => {
        //     if (b !== null) {
        //         this.setState({ bgColor: parseInt(b) });
        //     }
        // })

        AsyncStorage.getItem('gif').then(b => {
            if (b !== null) {
                this.setState({ gif: parseInt(b) });
            }
        })

        AsyncStorage.getItem('custom').then(custom => {
            if (custom !== null) {
                global.custom = JSON.parse(custom);
                this.setState({ custom: JSON.parse(custom)});
                this.setState({ loading: false });
            } else {
                AsyncStorage.setItem('custom', '0');
                global.custom = 0;
                this.setState({ custom: 0 });
                this.setState({ loading: false });
            }
        });

        AsyncStorage.getItem('palette').then(list => {
            if (list !== null) {
                global.palette = JSON.parse(list);
            } else {
                var freshList = JSON.stringify([])
                AsyncStorage.setItem('palette', freshList);
                global.palette = [];
            }
        });

        this.animatedValue = new Animated.Value(1);

        // RNShakeEvent.addEventListener('shake', () => {
        //     if (this.state.bgColor < 4) {
        //         this.setState({ bgColor: (this.state.bgColor + 1) });
        //         this.save();
        //         this.forceUpdate();
        //     }
        //     else {
        //         this.setState({ bgColor: 0 });
        //         this.save();
        //         this.forceUpdate();
        //     }
        // });

        this.forceUpdate();
    }

    componentDidMount() {
        // this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
        //     this._keyboardDidShow();
        // });
        // this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        //     this._keyboardDidHide();
        // });
    }

    componentWillUnmount() {
        //RNShakeEvent.removeEventListener('shake');
        // this.keyboardDidShowListener.remove();
        // this.keyboardDidHideListener.remove();
    }

    async save() {
        await AsyncStorage.setItem('balloons', JSON.stringify(this.state.balloons));
        await AsyncStorage.setItem('gif', JSON.stringify(this.state.gif));
        await AsyncStorage.setItem('custom', JSON.stringify(this.state.custom));
        //await AsyncStorage.setItem('bgColor', JSON.stringify(this.state.bgColor));
        console.log('balloons:' + JSON.stringify(this.state.balloons));
    }

    handlePressIn() {
        if (Platform.OS === 'ios') {
            Animated.spring(this.animatedValue, {
                toValue: 1.5
            }).start()
        }
        else {
            Animated.spring(this.animatedValue, {
                toValue: 1.1
            }).start()
        }
    }

    handlePressOut() {
        Animated.spring(this.animatedValue, {
            toValue: 1,
            friction: 5,
            tension: 5
        }).start()
    }

    playWoosh() {
        woosh.play((success) => {
            if (success) {
                console.log('successfully finished playing');
            } else {
                console.log('playback failed due to audio decoding errors');
            }
        });
    }

    playPop() {
        pop.play((success) => {
            if (success) {
                console.log('successfully finished playing');
            } else {
                console.log('playback failed due to audio decoding errors');
            }
        });
    }

    dismissGif() {
        if (this.state.gif < 6) {
            this.setState({ gif: (this.state.gif + 1) });
            this.save();
        }
        else {
            this.setState({ gif: 0 });
            this.save();
        }

        this.setState({ displayGif: false })
    }

    navigateToInstagram() {
        if (Platform.OS === 'ios') {
            Linking.openURL('instagram://user?username=poptagtv')
            setTimeout(() => Linking.openURL('https://instagram.com/poptagtv'), 10);
        }
        else {
            Linking.openURL('https://instagram.com/poptagtv')
        }
    }

    changeCustom(custom) {
        global.custom = custom;
        this.setState({ custom: custom });
        this.toggleDialogue();
        this.save();
    }

    popBalloon(id) {
        const tempBalloons = this.state.balloons;
        const balloon = tempBalloons.filter(b => b.id === id)[0];
        const index = tempBalloons.indexOf(balloon);
        balloon.popped = true;
        tempBalloons[index] = balloon;
        this.setState({ balloons: tempBalloons });

        if (tempBalloons.filter(b => b.popped).length === tempBalloons.length) {
            this.resetBalloons();
        }

        this.setState({ displayQuestion: true });
        this.save();
    }

    resetBalloons() {
        var balloons = this.state.balloons.map(b => {
            b.popped = false;
            return b;
        });
        this.setState({ displayGif: true });
        this.setState({ balloons: balloons });
    }

    async requestExternalStoragePermission(uri) {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission',
                    message: 'PopTag saves your responses to camera roll',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                CameraRoll.saveToCameraRoll(uri)
                    .then((newUri) => {
                        if (typeof newUri !== 'undefined') {
                            this.refs.toast.show('Saved to Camera Roll');
                        }
                    });
            } else {
                console.log("Camera Roll permission denied")
            }
        } catch (err) {
            console.error('Failed to request permission ', err);
            return null;
        }
    };

    submitAnswer() {
        if (Platform.OS === 'android') {
            Keyboard.dismiss();

            setTimeout(() =>
                captureScreen({
                    format: "jpg",
                    quality: 1
                })
                    .then(uri => {
                        this.requestExternalStoragePermission(uri);
                    })
                    .then(() => {
                        //this.setState({ displayQuestion: false });
                    }), 500);
        }
        else {
            captureScreen({
                format: "jpg",
                quality: 1
            })
                .then(uri => {
                    CameraRoll.saveToCameraRoll(uri)
                        .then((newUri) => {
                            if (typeof newUri !== 'undefined') {
                                this.refs.toast.show('Saved to Camera Roll');
                            }
                        });
                })
            //this.setState({ displayQuestion: false });
        }
    }

    endQuestion() {
        this.setState({ displayQuestion: false })
    }

    successToast() {
        //this.refs.toast.show('Mission Accomplished ✅');
    }

    addContact() {
        var newPerson = {
            //familyName: "Attrac",
            //givenName: "Friedrich",
        }

        if (Platform.OS === 'ios') {
            Contacts.checkPermission((err, permission) => {
                if (err) throw err;

                //Contacts.PERMISSION_AUTHORIZED || Contacts.PERMISSION_UNDEFINED || Contacts.PERMISSION_DENIED

                if (permission === 'undefined') {
                    Contacts.requestPermission((err, permission) => {
                        if (permission === 'authorized') {
                            Contacts.openContactForm(newPerson, (err) => {
                                if (err) throw err;
                                // form is open
                            })
                        }
                    })
                }
                else if (permission === 'denied') {
                    Linking.openURL('app-settings:PopTag');
                }
                else {
                    Contacts.openContactForm(newPerson, (err) => {
                        if (err) throw err;
                        // form is open
                    })
                }
            })
        }
        else {
            Contacts.openContactForm(newPerson, (err) => {
                if (err) throw err;
                // form is open
            })
        }

    }

    toggleDialogue() {
        if (this.state.displayQuestion == false) {
            this.setState({ dialogue: !this.state.dialogue });
        }
        else {
            this.endQuestion();
        }
    }

    _keyboardDidShow() {
        this.setState({ bottomHeight: Dimensions.get('window').height * 0.4 });
    }

    _keyboardDidHide() {
        this.setState({ bottomHeight: 25 });
    }

    renderBalloons() {
        return this.state.balloons.map(b =>
            <Balloon key={b.id} top={b.top} left={b.left} id={b.id} popped={b.popped} pop={this.popBalloon.bind(this)}
                playPop={() => this.playPop()} playWoosh={() => this.playWoosh()} custom={this.state.custom} />
        );
    }

    renderQuestion() {
        return <Question submit={this.submitAnswer.bind(this)} endQuestion={() => this.endQuestion()} />
    }

    renderDialogue() {
        return <Dialogue changeCustom={(b) => this.changeCustom(b)}
        toggleDialogue={this.toggleDialogue.bind(this)} success={() => this.successToast()} />
    }

    renderGif() {
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => this.dismissGif()}>
                <Image source={GIFS['image' + this.state.gif]} />
            </TouchableOpacity>
        )
    }

    render() {

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }]
        }

        return (
            <View style={styles.base}>
            {this.state.loading == true ?
                <View/>
                :
                <View style={[styles.container, { backgroundColor: COMPANIES.find(item => item.id === this.state.custom).bgcolor }]}>

                    <TouchableOpacity style={styles.headerBounding} activeOpacity={1}
                        onPressIn={this.handlePressIn.bind(this)}
                        onPress={this.state.displayQuestion == true ? () => this.endQuestion() : this.state.dialogue == true ? () => this.toggleDialogue() : null}
                        onPressOut={this.handlePressOut.bind(this)}>
                        <Animated.View style={[animatedStyle, { width: Dimensions.get('window').width * 0.7, height: Dimensions.get('window').width * 0.7 * 0.2461538462 }]}>
                            <Image style={[styles.header, { tintColor:  COMPANIES.find(item => item.id === this.state.custom).wordmarkoverlay !== 'null' ? COMPANIES.find(item => item.id === this.state.custom).wordmarkoverlay : null }]} resizeMode={'contain'}
                            source={{ uri: COMPANIES.find(item => item.id === this.state.custom).wordmark !== 'null' ? COMPANIES.find(item => item.id === this.state.custom).wordmark : 'ptlogored' }} />
                        </Animated.View>
                    </TouchableOpacity>

                    {this.state.dialogue ? this.renderDialogue() : this.state.displayQuestion ? this.renderQuestion() :
                        this.state.displayGif ? this.renderGif() : this.renderBalloons()}


                    {this.state.dialogue == false ?
                        <TouchableOpacity activeOpacity={1} style={[styles.button1, { bottom: this.state.bottomHeight }]} onPress={() => this.addContact()}>
                            <Image style={styles.contacts} source={{ uri: 'addressbookicon' }} />
                        </TouchableOpacity>
                        : null}

                    {this.state.dialogue == false ?
                        <TouchableOpacity activeOpacity={1} style={[styles.button2, { bottom: this.state.bottomHeight }]} onPress={() => this.toggleDialogue()}>
                            <Image style={styles.ibutton} source={{ uri: 'palette' }} />
                        </TouchableOpacity>
                        : null}

                    {this.state.dialogue == false ?
                        <TouchableOpacity activeOpacity={1} style={[styles.button3, { bottom: this.state.bottomHeight }]} onPress={() => this.navigateToInstagram()}>
                            <Image style={styles.instagrambutton} source={{ uri: 'instagramicon' }} />
                        </TouchableOpacity>
                        : null}

                </View>
                }

                <Toast
                    ref="toast"
                    style={{ backgroundColor: 'black' }}
                    position='bottom'
                    positionValue={Dimensions.get('window').height / 4.5}
                    fadeInDuration={200}
                    fadeOutDuration={1600}
                    opacity={0.4}
                    textStyle={{ color: 'white' }}
                />
                
            </View>
        );
    }
}


const styles = StyleSheet.create({
    base: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button1: {
        position: 'absolute',
        left: 26,
        borderRadius: 8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        width: width,
        height: height,
    },
    button2: {
        position: 'absolute',
        borderRadius: 8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        backgroundColor: '#FD3B00',
        alignSelf: 'center',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        width: width,
        height: height,
    },
    button3: {
        position: 'absolute',
        right: 26,
        borderRadius: 8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        width: width,
        height: height,
    },
    header: {
        //width: Dimensions.get('window').width * 0.7, height: Dimensions.get('window').width * 0.7 * 0.2461538462
        flex: 1 , width: undefined, height: undefined,
    },
    headerBounding: {
        position: 'absolute',
        alignSelf: 'center',
        top: 40,
    },
    boundingbox: {
        height: Dimensions.get('window').height * 0.68,
        width: Dimensions.get('window').width,
        backgroundColor: 'black',
        marginTop: 30,
    },
    contacts: {
        width: width * 0.303,
        height: width * 0.303 * 1.0778947368,
        tintColor: 'white'
    },
    instagrambutton: {
        width: width * 0.303 * 1.0778947368,
        height: width * 0.303 * 1.0778947368,
        tintColor: 'white'
    },
    ibutton: {
        width: width * 0.303 * 1.0778947368,
        height: width * 0.303 * 1.0778947368,
        tintColor: 'white'
    },
    woman: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    }
});

AppRegistry.registerComponent('PopTag', () => PopTag);
