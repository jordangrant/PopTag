/**
 * © Jordan Grant 2018
 */

import React, { Component } from 'react';
import {
    AppRegistry, StyleSheet, Text, View, TouchableOpacity, Dimensions, Keyboard,
    Image, Animated, AsyncStorage, CameraRoll, Platform, Linking, ImageBackground
} from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { captureScreen } from "react-native-view-shot";
import RNShakeEvent from 'react-native-shake-event';
import Balloon from './Balloon';
import Question from './Question';
import Dialogue from './Dialogue';

const width = Dimensions.get('window').width * 0.43733;
const height = width * 0.34146;

const topR1 = Dimensions.get('window').height * 0.2166;
const topR2 = topR1 + 62;
const topR3 = topR1 + 138;
const topR4 = topR1 + 206;
const topR5 = topR1 + 277;
const leftC1 = 0;
const leftC2 = Dimensions.get('window').width / 2 - 62.5;
const leftC3 = Dimensions.get('window').width - 125;

export default class PopTag extends Component {
    constructor(props) {
        super(props);
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
            background: ['#F4FA58', '#4A90E2', '#B8E986', 'black'],
            bgColor: 0,
            dialogue: false,
            bottomHeight: 25
        };
    }

    componentWillMount() {
        AsyncStorage.getItem('balloons').then(b => {
            if (b !== null) {
                this.setState({ balloons: JSON.parse(b) });
            }
        })

        AsyncStorage.getItem('bgColor').then(b => {
            if (b !== null) {
                this.setState({ bgColor: parseInt(b) });
            }
        })

        this.animatedValue = new Animated.Value(1);

        RNShakeEvent.addEventListener('shake', () => {
            if (this.state.bgColor < 3) {
                this.setState({ bgColor: (this.state.bgColor + 1) });
                this.save();
                this.forceUpdate();
            }
            else {
                this.setState({ bgColor: 0 });
                this.save();
                this.forceUpdate();
            }
        });

        this.forceUpdate();
    }

    componentDidMount () {
        // this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
        //     this._keyboardDidShow();
        // });
        // this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        //     this._keyboardDidHide();
        // });
      }

    componentWillUnmount() {
        RNShakeEvent.removeEventListener('shake');
        // this.keyboardDidShowListener.remove();
        // this.keyboardDidHideListener.remove();
    }

    async save() {
        await AsyncStorage.setItem('balloons', JSON.stringify(this.state.balloons));
        await AsyncStorage.setItem('bgColor', JSON.stringify(this.state.bgColor));
        console.log('balloons:' + JSON.stringify(this.state.balloons));
    }

    handlePressIn() {
        Animated.spring(this.animatedValue, {
            toValue: 1.5
        }).start()
    }

    handlePressOut() {
        Animated.spring(this.animatedValue, {
            toValue: 1,
            friction: 5,
            tension: 5
        }).start()
    }

    navigateToInstagram() {
        if (Platform.OS === 'ios') {
            Linking.openURL('instagram://user?username=poptagtv')
            setTimeout(() => Linking.openURL('https://instagram.com/poptagtv'), 10);
        }
        else {
            Linking.openURL('https://instagram.com/poptagtv' + newName)
        }
    }

    popBalloon(id) {
        const tempBalloons = this.state.balloons;
        const balloon = tempBalloons.filter(b => b.id === id)[0];
        const index = tempBalloons.indexOf(balloon);
        balloon.popped = true;
        tempBalloons[index] = balloon;
        this.setState({ balloons: tempBalloons });

        if (tempBalloons.filter(b => b.popped).length === tempBalloons.length) {
            var balloons = this.state.balloons.map(b => {
                b.popped = false;
                return b;
            });
            this.setState({ balloons: balloons });
        }

        this.setState({ displayQuestion: true });
        this.save();
    }

    submitAnswer() {
        captureScreen({
            format: "jpg",
            quality: 1
        })
            .then(uri => {
                CameraRoll.saveToCameraRoll(uri)
            });

        this.setState({ displayQuestion: false });
    }

    toggleDialogue() {
        this.setState({ dialogue: !this.state.dialogue });
    }

    _keyboardDidShow() {
        this.setState({ bottomHeight: Dimensions.get('window').height * 0.4 });
    }

    _keyboardDidHide() {
        this.setState({ bottomHeight: 25 });
    }

    renderBalloons() {
        return this.state.balloons.map(b =>
            <Balloon key={b.id} top={b.top} left={b.left} id={b.id} popped={b.popped} pop={this.popBalloon.bind(this)} />
        );
    }

    renderQuestion() {
        return <Question submit={this.submitAnswer.bind(this)} />
    }

    renderDialogue() {
        return <Dialogue toggleDialogue={this.toggleDialogue.bind(this)} />
    }

    render() {

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }]
        }

        return (
            <View style={styles.base}>
                {this.state.bgColor < 3
                    ?
                    <View style={[styles.container, { backgroundColor: this.state.background[this.state.bgColor] }]}>

                        <TouchableOpacity style={styles.headerBounding} activeOpacity={1}
                            onPressIn={this.handlePressIn.bind(this)}
                            onPressOut={this.handlePressOut.bind(this)}>
                            <Animated.View style={animatedStyle}>
                                <Image style={styles.header} source={{ uri: 'ptlogored' }} />
                            </Animated.View>
                        </TouchableOpacity>

                        {this.state.dialogue ? this.renderDialogue() :
                            this.state.displayQuestion ? this.renderQuestion() : this.renderBalloons()}

                        <TouchableOpacity activeOpacity={0.9} style={[styles.button1, {bottom: this.state.bottomHeight}]} onPress={() => this.toggleDialogue()}>
                            <Image style={styles.whatisthis} source={{ uri: 'whatisthis' }} />
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.9} style={[styles.button2, {bottom: this.state.bottomHeight}]} onPress={() => this.navigateToInstagram()}>
                            <Image style={styles.instagrambutton} source={{ uri: 'poptagtv' }} />
                        </TouchableOpacity>
                    </View>
                    :
                    <Image source={{ uri: 'monroe' }} style={styles.woman}>

                        <TouchableOpacity style={styles.headerBounding} activeOpacity={1}
                            onPressIn={this.handlePressIn.bind(this)}
                            onPressOut={this.handlePressOut.bind(this)}>
                            <Animated.View style={animatedStyle}>
                                <Image style={styles.header} source={{ uri: 'ptlogored' }} />
                            </Animated.View>
                        </TouchableOpacity>


                        {this.state.dialogue ? this.renderDialogue() :
                            this.state.displayQuestion ? this.renderQuestion() : this.renderBalloons()}


                        <TouchableOpacity activeOpacity={0.9} style={[styles.button1, {bottom: this.state.bottomHeight}]} onPress={() => this.toggleDialogue()}>
                            <Image style={styles.whatisthis} source={{ uri: 'whatisthis' }} />
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.9} style={[styles.button2, {bottom: this.state.bottomHeight}]} onPress={() => this.navigateToInstagram()}>
                            <Image style={styles.instagrambutton} source={{ uri: 'poptagtv' }} />
                        </TouchableOpacity>
                    </Image>
                }
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
        left: 16,
        borderRadius: 8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        backgroundColor: '#FD3B00',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        width: width,
        height: height,
    },
    button2: {
        position: 'absolute',
        right: 16,
        borderRadius: 8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        width: width,
        height: height,
    },
    header: {
        width: Dimensions.get('window').width * 0.7,
        height: Dimensions.get('window').width * 0.7 * 0.2461538462
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
    whatisthis: {
        width: width * 0.8,
        height: width * 0.8 * 0.13
    },
    instagrambutton: {
        width: width * 0.89634,
        height: width * 0.89634 * 0.14966
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
