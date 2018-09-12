import React, { Component } from 'react';
import {
    StyleSheet, View, Image, ImageBackground, Dimensions, TouchableOpacity,
    Animated, AsyncStorage, Text, TextInput, Keyboard, Platform
} from 'react-native';
import { QUESTIONS } from './entries';
export default class Question extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            rand: 0,
        };
    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(1);
        this.state.rand = Math.round(Math.random() * 689);
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
                onLongPress={() => this.props.backOut()}
                onPressOut={this.handlePressOut.bind(this)}>

                <Animated.View style={animatedStyle}>
                    <View style={this.state.text !== '' ? styles.container2 : styles.container}>
                        <Text style={styles.mainText} numberOfLines={4}>{QUESTIONS.find(item => item.id === this.state.rand).question}</Text>

                        <View style={styles.inputcontainer}>
                            <TextInput
                                style={[styles.subtext, { width: Dimensions.get('window').width * 0.75 * 0.88, textAlign: 'center' }]}
                                autoFocus={true}
                                placeholder={'Type something…'}
                                placeholderTextColor={'rgba(74,74,74,0.5)'}
                                onChangeText={(text) => this.setState({ text })}
                                value={this.state.text}
                                //onSubmitEditing={() => this.props.submit()}
                                enablesReturnKeyAutomatically={true}
                                returnKeyType={'done'}
                                blurOnSubmit={true}
                                multiline={true}
                                numberOfLines={2}
                                spellCheck={false}
                                underlineColorAndroid={'transparent'}
                            />
                        </View>
                    </View>

                    {this.state.text !== '' ? 
                    <TouchableOpacity style={styles.blue} activeOpacity={1} onPress={() => this.props.submit()}>
                            <Text style={styles.send}>Send</Text>
                    </TouchableOpacity>
                    : null}

                </Animated.View>
            </TouchableOpacity>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.88 * 0.52,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 20,
        marginBottom: Dimensions.get('window').height * 0.23
    },
    container2: {
        borderTopLeftRadius: 13,
        borderTopRightRadius: 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.88 * 0.52,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 20,
        marginBottom: Dimensions.get('window').height * 0.23
    },
    blue: {
        position: 'absolute',
        top: Dimensions.get('window').width * 0.88 * 0.52 - (Dimensions.get('window').width * 0.88 * 0.15 * 0.13),
        borderBottomLeftRadius: 13,
        borderBottomRightRadius: 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.88 * 0.15,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    inputcontainer: {
        borderRadius: 7,
        backgroundColor: '#D8D8D8',
        width: Dimensions.get('window').width * 0.75 * 0.88888,
        height: Dimensions.get('window').width * 0.88 * 0.88888 * 0.19758,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 1
    },
    mainText: {
        color: 'black',
        fontWeight: '500',
        fontSize: Dimensions.get('window').width * 0.04,
        textAlign: 'center',
        marginVertical: 10
    },
    subtext: {
        color: '#4A4A4A',
        fontSize: Dimensions.get('window').width * 0.043,
        textAlign: 'center',
    },
    send: {
        color: 'white',
        fontWeight: '800',
        fontSize: Dimensions.get('window').width * 0.04,
        textAlign: 'center',
    }
});
