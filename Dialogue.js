import React, { Component } from 'react';
import {
    StyleSheet, View, Image, ImageBackground, Dimensions, TouchableOpacity,
    Animated, AsyncStorage, Text, TextInput, Keyboard
} from 'react-native';

export default class Dialogue extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            rand: 0
        };
    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(1);
        this.state.rand = Math.round(Math.random() * 25);
    }

    handlePressIn() {
        Animated.spring(this.animatedValue, {
            toValue: 1.5
        }).start();
    }

    handlePressOut() {
        Animated.spring(this.animatedValue, {
            toValue: 1,
            friction: 5,
            tension: 5
        }).start();
    }

    render() {

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }],
        };

        return (
            <TouchableOpacity activeOpacity={1} style={{ position: 'absolute', top: this.props.top, left: this.props.left }}
                onPressIn={this.handlePressIn.bind(this)}
                onPress={() => this.props.toggleDialogue()}
                onPressOut={this.handlePressOut.bind(this)}>

                <Animated.View style={animatedStyle}>
                    <View style={styles.container}>
                        <Text style={styles.mainText} numberOfLines={4}>Pop Tag is a glorified icebreaker. Just hand someone your
                        phone and let them answer a question!</Text>
                    </View>
                </Animated.View>
            </TouchableOpacity>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 13,
        width: Dimensions.get('window').width * 0.75,
        height: Dimensions.get('window').width * 0.75 * 0.52,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 15,
        marginBottom: Dimensions.get('window').height * 0
    },
    inputcontainer: {
        borderRadius: 7,
        backgroundColor: '#D8D8D8',
        width: Dimensions.get('window').width * 0.75 * 0.88888,
        height: Dimensions.get('window').width * 0.75 * 0.88888 * 0.19758,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mainText: {
        color: 'black',
        fontWeight: '500',
        fontSize: Dimensions.get('window').width*0.05,
        textAlign: 'center',
        marginVertical: 10
    },
    subtext: {
        color: '#4A4A4A',
        fontSize: 15,
        textAlign: 'center'
    }
});
