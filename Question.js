import React, { Component } from 'react';
import {
    StyleSheet, View, Image, ImageBackground, Dimensions, TouchableOpacity,
    Animated, AsyncStorage, Text, TextInput, Keyboard
} from 'react-native';
import { QUESTIONS } from './entries';
export default class Question extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            text: '',
            rand: 0};
    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(1);
        this.state.rand = Math.round(Math.random()*24);
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
            <TouchableOpacity activeOpacity={1} 
                onPressIn={this.handlePressIn.bind(this)}
                onPress={Keyboard.dismiss}
                onPressOut={this.handlePressOut.bind(this)}>

                <Animated.View style={animatedStyle}>
                    <View style={styles.container}>
                        <Text style={styles.mainText} numberOfLines={4}>{QUESTIONS.find(item => item.id === this.state.rand).question}</Text>

                        <View style={styles.inputcontainer}>
                            <TextInput
                            style={{height: 40, textAlign: 'center'}}
                            autoFocus={true}
                            numberOfLines={1}
                            placeholder={'Type something…'}
                            onChangeText={(text) => this.setState({text})}
                            value={this.state.text}
                            onSubmitEditing={() => this.props.submit()}
                            enablesReturnKeyAutomatically={true}
                            returnKeyType={'send'}
                            />
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.8 * 0.52,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 20,
        marginBottom: Dimensions.get('window').height * 0.3
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
        fontSize: Dimensions.get('window').width*0.04,
        textAlign: 'center',
        marginVertical: 10
    },
    subtext: {
        color: '#4A4A4A',
        fontSize: 15,
        textAlign: 'center'
    }
});
