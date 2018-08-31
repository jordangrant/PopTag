/**
 * © Jordan Grant 2018
 */

import React, { Component } from 'react';
import {
    AppRegistry, StyleSheet, Text, View, TouchableOpacity, Dimensions,
    Image, Animated, AsyncStorage
} from 'react-native';
import { createStackNavigator } from 'react-navigation';
import Balloon from './Balloon';
import Question from './Question';

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
const balloonDimensions = 125;

class PopTag extends Component {
    constructor(props) {
        super(props);
        this.state = {
            balloons: [
                {id:0, top:topR2, left:leftC1, popped:false},
                {id:1, top:topR1, left:leftC2, popped:false},
                {id:2, top:topR2, left:leftC3, popped:false},
                {id:3, top:topR3, left:leftC2, popped:false},
                {id:4, top:topR4, left:leftC1, popped:false},
                {id:5, top:topR5, left:leftC2, popped:false},
                {id:6, top:topR4, left:leftC3, popped:false},
            ],
            displayQuestion:false,
            currentQuestion:null
        };
    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(1);
        global.count = 0;
    }

    componentDidMount() {
        AsyncStorage.setItem('count', '0');
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

    popBalloon(id){
        const tempBalloons = this.state.balloons;
        const balloon = tempBalloons.filter(b => b.id === id)[0];
        const index = tempBalloons.indexOf(balloon);
        balloon.popped = true;
        tempBalloons[index] = balloon;
        this.setState({balloons:tempBalloons});

        if(tempBalloons.filter(b => b.popped).length === tempBalloons.length){
            var balloons = this.state.balloons.map(b => {
                b.popped = false;
                return b;
            });
            this.setState({balloons:balloons});
        }
        this.setState({displayQuestion: true});
    }

    submitAnswer() {
        this.setState({displayQuestion: false});
    }

    renderBalloons(){
        return this.state.balloons.map(b =>
            <Balloon key={b.id} top={b.top} left={b.left} id={b.id} popped={b.popped} pop={this.popBalloon.bind(this)}/>
        );
    }

    renderQuestion(){
        return <Question submit={this.submitAnswer.bind(this)}/>
    }

    render() {

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }]
        }

        return (
            <View style={styles.container}>

                <TouchableOpacity style={styles.headerBounding} activeOpacity={1}
                    onPressIn={this.handlePressIn.bind(this)}
                    onPressOut={this.handlePressOut.bind(this)}>
                    <Animated.View style={[styles.cell, animatedStyle]}>
                        <Image style={styles.header} source={{ uri: 'ptlogored' }} />
                    </Animated.View>
                </TouchableOpacity>


                {this.state.displayQuestion ? this.renderQuestion() : this.renderBalloons()}


                <TouchableOpacity activeOpacity={0.9} style={styles.button1}>
                    <Image style={styles.whatisthis} source={{ uri: 'whatisthis' }} />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.9} style={styles.button2}>
                    <Image style={styles.lockerbutton} source={{ uri: 'lockerbutton' }} />
                </TouchableOpacity>
            </View>
        );
    }
}

export default createStackNavigator({
    Home: PopTag,
    //Locker: Locker,
},
    {
        initialRouteName: 'Home',
    });

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4FA58',
    },
    button1: {
        position: 'absolute',
        bottom: 25,
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
        bottom: 25,
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
    lockerbutton: {
        width: width * 0.67,
        height: width * 0.67 * 0.266
    }
});

AppRegistry.registerComponent('PopTag', () => PopTag);
